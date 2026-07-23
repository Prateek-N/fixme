import unittest

from rate_limiter import RateLimiter


class RateLimiterTests(unittest.TestCase):
    def test_allows_requests_under_the_limit(self):
        limiter = RateLimiter(max_requests=3, window_seconds=60)
        self.assertFalse(limiter.is_limited("1.2.3.4"))
        self.assertFalse(limiter.is_limited("1.2.3.4"))
        self.assertFalse(limiter.is_limited("1.2.3.4"))

    def test_blocks_once_limit_is_reached(self):
        limiter = RateLimiter(max_requests=2, window_seconds=60)
        self.assertFalse(limiter.is_limited("1.2.3.4"))
        self.assertFalse(limiter.is_limited("1.2.3.4"))
        self.assertTrue(limiter.is_limited("1.2.3.4"))

    def test_limits_are_tracked_independently_per_ip(self):
        limiter = RateLimiter(max_requests=1, window_seconds=60)
        self.assertFalse(limiter.is_limited("1.1.1.1"))
        self.assertTrue(limiter.is_limited("1.1.1.1"))
        self.assertFalse(limiter.is_limited("2.2.2.2"))


if __name__ == "__main__":
    unittest.main()
