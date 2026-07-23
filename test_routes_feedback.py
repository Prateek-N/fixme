import json
import os
import tempfile
import unittest
from datetime import datetime
from unittest.mock import patch

import routes_feedback
from routes_feedback import _build_suggestion_email_html, _append_suggestion


class SuggestionEmailHtmlTests(unittest.TestCase):
    def test_plain_input_renders_expected_fields(self):
        html_body = _build_suggestion_email_html(
            "user@example.com", "This is fine.", datetime(2026, 7, 11, 9, 30)
        )
        self.assertIn("user@example.com", html_body)
        self.assertIn("This is fine.", html_body)
        self.assertIn("11 Jul 2026 09:30", html_body)

    def test_html_in_email_is_escaped(self):
        # Regression test for the HTML-injection finding: previously an
        # unescaped f-string interpolation let a crafted email/concern inject
        # arbitrary markup into the admin's inbox.
        html_body = _build_suggestion_email_html(
            '<script>alert(1)</script>', "concern", datetime(2026, 1, 1)
        )
        self.assertNotIn("<script>alert(1)</script>", html_body)
        self.assertIn("&lt;script&gt;", html_body)

    def test_html_in_concern_is_escaped(self):
        html_body = _build_suggestion_email_html(
            "a@b.com", '<img src=x onerror=alert(1)>', datetime(2026, 1, 1)
        )
        self.assertNotIn("<img src=x onerror=alert(1)>", html_body)
        self.assertIn("&lt;img", html_body)

    def test_newlines_in_concern_become_br_tags(self):
        html_body = _build_suggestion_email_html(
            "a@b.com", "line one\nline two", datetime(2026, 1, 1)
        )
        self.assertIn("line one<br/>line two", html_body)


class SuggestionsCapTests(unittest.TestCase):
    def test_oldest_entries_roll_off_past_the_cap(self):
        # Patch the cap down so this test doesn't need hundreds of real
        # locked file writes to exercise the rollover path.
        with patch.object(routes_feedback, "MAX_SUGGESTIONS", 5):
            with tempfile.TemporaryDirectory() as tmpdir:
                suggestions_file = os.path.join(tmpdir, "suggestions.json")
                for i in range(8):
                    _append_suggestion(suggestions_file, {"email": f"user{i}@example.com", "concern": "x"})

                with open(suggestions_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                self.assertEqual(len(data), 5)
                # The oldest 3 (user0..user2) should have rolled off; the
                # most recent entry should be the last one appended.
                emails = [entry["email"] for entry in data]
                self.assertNotIn("user0@example.com", emails)
                self.assertNotIn("user2@example.com", emails)
                self.assertEqual(emails[-1], "user7@example.com")

    def test_under_cap_keeps_everything(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            suggestions_file = os.path.join(tmpdir, "suggestions.json")
            for i in range(5):
                _append_suggestion(suggestions_file, {"email": f"user{i}@example.com", "concern": "x"})

            with open(suggestions_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.assertEqual(len(data), 5)


if __name__ == "__main__":
    unittest.main()
