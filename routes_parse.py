import asyncio
import logging

try:
    from fastapi import APIRouter, UploadFile, File, Request
    from fastapi.responses import StreamingResponse, JSONResponse
except Exception:
    APIRouter = None

from bank_detection import detect_bank_from_text
from insights_engine import build_empty_diagnosis_payload, compute_insights
from pdf_extraction import extract_transactions_from_pdf
from rate_limiter import is_rate_limited
from sse_events import sse, progress_event, insight_event, error_event, done_event

logger = logging.getLogger("fixmyfinance")

router = APIRouter() if APIRouter is not None else None

if router is not None:
    @router.post("/api/parse")
    async def parse_statement(request: Request, file: UploadFile = File(...)):
        client_ip = request.client.host if request.client else "unknown"
        if is_rate_limited(client_ip):
            logger.warning("Rate limit hit for ip=%s", client_ip)
            return JSONResponse(status_code=429, content={"error": "Too many requests. Please wait a moment before trying again."})

        MAX_SIZE = 20 * 1024 * 1024  # 20 MB
        content = await file.read()

        if len(content) > MAX_SIZE:
            logger.warning("Rejected oversized upload from %s: %d bytes", client_ip, len(content))
            return JSONResponse(status_code=413, content={"error": "File too large. Maximum size is 20 MB."})

        if not (file.content_type == "application/pdf" or (file.filename or "").lower().endswith(".pdf")):
            logger.warning("Rejected non-PDF upload from %s: content_type=%s", client_ip, file.content_type)
            return JSONResponse(status_code=415, content={"error": "Only PDF files are supported."})

        logger.info("Parse request: file=%s size=%d ip=%s", file.filename, len(content), client_ip)

        async def generate():
            yield sse(progress_event(10, "Reading your statement…"))
            await asyncio.sleep(0.6)

            yield sse(progress_event(30, "Detecting format…"))
            await asyncio.sleep(0.4)

            diagnostics: dict = {}
            try:
                transactions = await asyncio.to_thread(extract_transactions_from_pdf, content, diagnostics=diagnostics)
            except Exception as e:
                logger.error("PDF extraction failed for %s: %s", file.filename, e)
                yield sse(error_event(f"Could not read PDF: {e}"))
                return

            yield sse(progress_event(55, f"Found {len(transactions)} transactions"))
            await asyncio.sleep(0.5)
            if len(transactions) == 0:
                logger.warning("Zero transactions extracted from %s", file.filename)
                yield sse(insight_event("!", "We could not extract enough reliable transactions to score this statement."))
                await asyncio.sleep(0.5)
                yield sse(done_event(build_empty_diagnosis_payload(0, parsing_diagnostics=diagnostics), []))
                return

            cats: dict[str, int] = {}
            for t in transactions:
                cats[t["category"]] = cats.get(t["category"], 0) + 1

            for cat, count in sorted(cats.items(), key=lambda x: x[1], reverse=True)[:3]:
                yield sse(insight_event("🔍", f"{count} {cat} transactions"))
                await asyncio.sleep(0.7)

            yield sse(progress_event(80, "Building a trustworthy health check..."))
            await asyncio.sleep(0.5)

            data = await asyncio.to_thread(compute_insights, transactions, parsing_diagnostics=diagnostics)

            # Content-based bank detection takes priority; filename is fallback
            content_bank = diagnostics.get("detectedBank")
            if content_bank:
                data["period"]["bankName"] = content_bank
                logger.info("Bank detected from content: %s", content_bank)
            else:
                fname = file.filename or ""
                fname_lower = fname.lower()
                bank_from_fname = detect_bank_from_text(fname_lower)
                if bank_from_fname:
                    data["period"]["bankName"] = bank_from_fname

            if data.get("dataQuality", {}).get("inferredIncome"):
                yield sse(insight_event("i", "Income was estimated because this looks like an expense-only statement."))
                await asyncio.sleep(0.3)

            logger.info("Parse complete: file=%s txns=%d score=%s", file.filename, len(transactions), data.get("score", {}).get("value"))
            yield sse(progress_event(100, "Done!"))
            await asyncio.sleep(0.3)

            yield sse(done_event(data, transactions))

        return StreamingResponse(generate(), media_type="text/event-stream")
