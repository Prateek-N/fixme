import os
import time


class FileLock:
    """Portable cross-process mutex using atomic exclusive file creation
    (os.O_CREAT | os.O_EXCL is atomic on both Windows and POSIX) — no
    third-party dependency needed. Guards suggestions.json's read-modify-write
    so two concurrent submissions can't silently drop one of them."""

    def __init__(self, lock_path: str, timeout: float = 5.0, poll_interval: float = 0.05):
        self.lock_path = lock_path
        self.timeout = timeout
        self.poll_interval = poll_interval
        self._fd: int | None = None

    def __enter__(self) -> "FileLock":
        start = time.monotonic()
        while True:
            try:
                self._fd = os.open(self.lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                return self
            except (FileExistsError, PermissionError):
                # On Windows, O_CREAT|O_EXCL against an already-existing file
                # can surface as PermissionError instead of FileExistsError
                # during the race window — both mean "someone else holds it".
                if time.monotonic() - start > self.timeout:
                    raise TimeoutError(f"Timed out waiting for lock: {self.lock_path}")
                time.sleep(self.poll_interval)

    def __exit__(self, *exc_info) -> None:
        if self._fd is not None:
            os.close(self._fd)
            self._fd = None
        try:
            os.remove(self.lock_path)
        except FileNotFoundError:
            pass
