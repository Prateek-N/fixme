import json

# Typed constructors for the /api/parse SSE event stream — previously every
# `yield sse({...})` call hand-built its own dict inline, so the event shape
# depended on every call site staying consistent by hand.


def sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def progress_event(pct: int, message: str) -> dict:
    return {"type": "progress", "pct": pct, "message": message}


def insight_event(icon: str, text: str) -> dict:
    return {"type": "insight", "icon": icon, "text": text}


def error_event(error: str) -> dict:
    return {"type": "error", "error": error}


def done_event(data: dict, transactions: list[dict]) -> dict:
    return {"type": "done", "data": data, "transactions": transactions}
