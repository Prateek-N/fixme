import asyncio

try:
    from fastapi import APIRouter
except Exception:
    APIRouter = None

from api_models import RecomputeRequest
from insights_engine import compute_insights

router = APIRouter() if APIRouter is not None else None

if router is not None:
    @router.post("/api/recompute")
    async def recompute_statement(payload: RecomputeRequest):
        transactions = [t.model_dump() for t in payload.transactions]
        return await asyncio.to_thread(compute_insights, transactions)
