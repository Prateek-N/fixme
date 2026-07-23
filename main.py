import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("fixmyfinance")

try:
    from fastapi import FastAPI
    from fastapi.staticfiles import StaticFiles
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except Exception:
    FastAPI = None
    StaticFiles = None
    CORSMiddleware = None
    uvicorn = None

try:
    app = FastAPI(title="FixMyFinance API") if FastAPI is not None else None
except Exception:
    app = None

if app is not None and CORSMiddleware is not None and StaticFiles is not None:
    _cors_env = os.environ.get("ALLOWED_ORIGINS", "")
    _allowed_origins = (
        [o.strip() for o in _cors_env.split(",") if o.strip()]
        if _cors_env
        else ["http://localhost:5173", "http://127.0.0.1:5173"]
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_allowed_origins,
        allow_credentials=True,
        allow_methods=["POST", "GET"],
        allow_headers=["Content-Type"],
    )

    # Absolute path anchored to this file, not the process cwd — a relative
    # "public" path only resolved correctly when launched from the repo root
    # (e.g. `uvicorn main:app`), and broke entirely under Vercel's Python
    # runtime, which runs with a different working directory and doesn't
    # ship public/ into the function bundle at all (Vercel serves the built
    # frontend separately, straight from dist/ — see vercel.json).
    _public_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
    if os.path.isdir(_public_dir):
        app.mount("/app", StaticFiles(directory=_public_dir, html=True), name="public")

# ─────────────────────────────────────────────
# Routes — each domain (parse / recompute / feedback) is an APIRouter in its
# own module; this file only wires them into the app. See routes_parse.py,
# routes_recompute.py, routes_feedback.py for the actual handlers, and
# pdf_extraction.py / insights_engine.py / behavior_engine.py / health_scoring.py
# / category_rules.py / merchant_utils.py / table_parsing.py / bank_detection.py
# / rate_limiter.py / captcha_store.py for the business logic they call into.
# ─────────────────────────────────────────────
from routes_parse import router as _parse_router
from routes_recompute import router as _recompute_router
from routes_feedback import router as _feedback_router

if app is not None:
    for _router in (_parse_router, _recompute_router, _feedback_router):
        if _router is not None:
            app.include_router(_router)

# Re-exported for test_diagnosis.py / test_extract.py, which import these
# directly from main for historical reasons.
from insights_engine import compute_insights  # noqa: F401
from pdf_extraction import extract_transactions_from_pdf  # noqa: F401
from merchant_utils import normalize_desc_for_key, transaction_dedupe_key  # noqa: F401


if __name__ == "__main__":
    if uvicorn is not None:
        uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
