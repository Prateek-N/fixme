import random
import secrets
import time

_CHALLENGE_TTL = 600  # 10 minutes


class CaptchaStore:
    """In-memory CAPTCHA challenge store. Routes only depend on issue()/
    verify_and_consume() — swapping the storage backend (e.g. Redis, for
    correctness under multiple workers) means changing only this class."""

    def __init__(self, ttl: int = _CHALLENGE_TTL):
        self._challenges: dict[str, tuple[int, int, float]] = {}
        self._ttl = ttl

    def _sweep_expired(self, now: float) -> None:
        expired = [t for t, (_, _, exp) in list(self._challenges.items()) if now > exp]
        for t in expired:
            self._challenges.pop(t, None)

    def issue(self) -> dict:
        now = time.monotonic()
        self._sweep_expired(now)
        num1 = random.randint(2, 9)
        num2 = random.randint(2, 8)
        token = secrets.token_urlsafe(16)
        self._challenges[token] = (num1, num2, now + self._ttl)
        return {"token": token, "num1": num1, "num2": num2}

    def verify_and_consume(self, token: str, answer: int) -> tuple[bool, str | None]:
        challenge = self._challenges.pop(token, None)
        if challenge is None:
            return False, "CAPTCHA challenge expired or invalid. Please refresh and try again."
        num1, num2, expires = challenge
        if time.monotonic() > expires:
            return False, "CAPTCHA challenge expired. Please refresh and try again."
        if num1 + num2 != answer:
            return False, "CAPTCHA answer incorrect. Please try again."
        return True, None
