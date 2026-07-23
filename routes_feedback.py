import asyncio
import html
import json
import logging
import os
from datetime import datetime

try:
    from fastapi import APIRouter
except Exception:
    APIRouter = None

from api_models import SuggestionRequest
from captcha_store import CaptchaStore
from file_lock import FileLock

logger = logging.getLogger("fixmyfinance")

router = APIRouter() if APIRouter is not None else None
_captcha_store = CaptchaStore()


def _build_suggestion_email_html(email: str, concern: str, received_at: datetime) -> str:
    # Escape user-supplied fields before HTML interpolation — previously raw
    # f-string interpolation, so a concern/email containing "<" or "&" would
    # be injected verbatim into the admin's inbox.
    safe_email = html.escape(email)
    safe_concern = html.escape(concern).replace("\n", "<br/>")
    return f"""
                <h3>New FixMyFinance Feedback</h3>
                <p><strong>From:</strong> {safe_email}</p>
                <p><strong>Concern/Suggestion:</strong></p>
                <blockquote style="border-left: 4px solid #2F2FE4; padding-left: 12px; font-style: italic; background: #f8f9fc; padding: 10px;">
                    {safe_concern}
                </blockquote>
                <p style="font-size: 11px; color: #666; margin-top: 15px;">Received locally on device at {received_at.strftime("%d %b %Y %H:%M")}</p>
                """


# Keeps the file from growing without bound. Oldest entries roll off first —
# this is a local on-device log for a low-traffic feedback form, not a
# system of record, so silently dropping the oldest few once the cap is hit
# is an acceptable trade for a bounded file size.
MAX_SUGGESTIONS = 500


def _append_suggestion(suggestions_file: str, suggestion_entry: dict) -> None:
    """Locked read-modify-write — previously unlocked, so two concurrent
    submissions could each read the same `existing` list and one write
    would silently clobber the other's entry."""
    lock_path = suggestions_file + ".lock"
    with FileLock(lock_path):
        existing: list = []
        if os.path.exists(suggestions_file):
            try:
                with open(suggestions_file, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            except Exception:
                existing = []
        existing.append(suggestion_entry)
        if len(existing) > MAX_SUGGESTIONS:
            existing = existing[-MAX_SUGGESTIONS:]
        tmp = suggestions_file + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2)
        os.replace(tmp, suggestions_file)

if router is not None:
    @router.get("/api/challenge")
    async def get_challenge():
        return _captcha_store.issue()

    @router.post("/api/suggest")
    async def capture_suggestion(payload: SuggestionRequest):
        email = payload.email.strip()
        concern = payload.concern.strip()
        token = payload.challengeToken
        answer = payload.answer

        # 1. Server-side CAPTCHA verification
        ok, error = _captcha_store.verify_and_consume(token, answer)
        if not ok:
            return {"success": False, "error": error}

        if not email or not concern:
            return {"success": False, "error": "Email and Concern fields cannot be blank."}

        if len(email) > 254:
            return {"success": False, "error": "Email address is too long."}
        if len(concern) > 2000:
            return {"success": False, "error": "Concern text must be 2,000 characters or fewer."}

        # 2. Log Suggestion Locally
        suggestion_entry = {
            "timestamp": datetime.now().isoformat(),
            "email": email,
            "concern": concern,
        }

        suggestions_file = os.environ.get("SUGGESTIONS_FILE", "suggestions.json")
        try:
            await asyncio.to_thread(_append_suggestion, suggestions_file, suggestion_entry)
        except Exception as e:
            logger.warning("Could not write to %s: %s", suggestions_file, e)

        # 3. Optional Resend Integration
        api_key = os.environ.get("RESEND_API_KEY")
        if api_key:
            import urllib.request
            import urllib.parse
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            email_payload = {
                "from": "FixMyFinance <onboarding@resend.dev>",
                "to": [os.environ.get("ADMIN_EMAIL", "admin@fixmyfinance.app")],
                "subject": "New Suggestion Received",
                "html": _build_suggestion_email_html(email, concern, datetime.now()),
            }
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(email_payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )

                def _send_resend_request() -> None:
                    # 10s timeout: previously unbounded, so an unreachable Resend API
                    # could stall this request indefinitely.
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        resp.read()

                await asyncio.to_thread(_send_resend_request)
            except Exception as e:
                logger.warning("Resend email failed: %s", e)

        return {"success": True, "message": "Suggestion captured successfully."}
