from pydantic import BaseModel, ConfigDict


class TransactionIn(BaseModel):
    """Mirrors the frontend `Transaction` type (src/store/useAppStore.ts).
    extra="allow" so an unexpected/future field from the client doesn't 422 —
    matches the previous raw-dict endpoint's tolerance of extra keys."""
    model_config = ConfigDict(extra="allow")

    date: str
    desc: str
    amount: float
    type: str
    category: str
    confidence: float | None = None
    isRecurring: bool | None = None
    mode: str | None = None
    ignored: bool | None = None
    essentiality: str | None = None


class RecomputeRequest(BaseModel):
    transactions: list[TransactionIn] = []


class SuggestionRequest(BaseModel):
    email: str = ""
    concern: str = ""
    challengeToken: str = ""
    answer: int = -1
