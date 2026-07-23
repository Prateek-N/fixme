import collections
import time


class RateLimiter:
    """In-memory sliding-window rate limiter. Swapping the backing store
    (e.g. Redis, so limits are enforced correctly across multiple worker
    processes) means changing only this class — routes just call
    is_rate_limited(), unaware of how the count is stored."""

    def __init__(self, max_requests: int, window_seconds: float):
        self._store: dict[str, collections.deque] = {}
        self._max_requests = max_requests
        self._window_seconds = window_seconds

    def is_limited(self, client_ip: str) -> bool:
        now = time.monotonic()
        timestamps = self._store.setdefault(client_ip, collections.deque())
        while timestamps and now - timestamps[0] > self._window_seconds:
            timestamps.popleft()
        if len(timestamps) >= self._max_requests:
            return True
        timestamps.append(now)
        return False


# Default process-local limiter: max 5 parse requests per IP per 60 seconds.
# Process-local storage still means the limit isn't shared across multiple
# workers (see architecture audit) — that's a config-time swap of this
# instance for a Redis-backed RateLimiter, not a code change at call sites.
_default_limiter = RateLimiter(max_requests=5, window_seconds=60)


def is_rate_limited(client_ip: str) -> bool:
    return _default_limiter.is_limited(client_ip)
