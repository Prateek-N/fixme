import json
import os
import tempfile
import threading
import unittest

from routes_feedback import _append_suggestion


class AppendSuggestionConcurrencyTests(unittest.TestCase):
    def test_concurrent_appends_do_not_lose_entries(self):
        # Regression test for the read-modify-write race flagged in the
        # architecture audit: without locking, two threads reading the same
        # `existing` list before either writes back would silently drop one
        # entry. N threads appending once each should always yield N entries.
        #
        # Thread targets are wrapped to capture exceptions: a bare
        # threading.Thread swallows exceptions raised in its target (they
        # print to stderr but never reach join()), which is exactly how a
        # real bug here previously went unnoticed — on Windows, os.open()
        # with O_CREAT|O_EXCL against an existing file can raise
        # PermissionError instead of FileExistsError, and the lock's retry
        # loop wasn't catching it, silently dropping that thread's entry.
        errors: list[BaseException] = []

        def run(entry: dict) -> None:
            try:
                _append_suggestion(suggestions_file, entry)
            except BaseException as e:  # noqa: BLE001
                errors.append(e)

        with tempfile.TemporaryDirectory() as tmpdir:
            suggestions_file = os.path.join(tmpdir, "suggestions.json")
            n = 25
            threads = [
                threading.Thread(
                    target=run,
                    args=({"email": f"user{i}@example.com", "concern": f"concern {i}"},),
                )
                for i in range(n)
            ]
            for t in threads:
                t.start()
            for t in threads:
                t.join()

            self.assertEqual(errors, [])

            with open(suggestions_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.assertEqual(len(data), n)
            emails = {entry["email"] for entry in data}
            self.assertEqual(len(emails), n)

    def test_lock_file_is_cleaned_up(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            suggestions_file = os.path.join(tmpdir, "suggestions.json")
            _append_suggestion(suggestions_file, {"email": "a@b.com", "concern": "x"})
            self.assertFalse(os.path.exists(suggestions_file + ".lock"))


if __name__ == "__main__":
    unittest.main()
