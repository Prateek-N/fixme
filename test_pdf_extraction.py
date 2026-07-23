import unittest
from unittest.mock import patch, MagicMock

import pdf_extraction
from pdf_extraction import extract_transactions_from_pdf, MAX_PAGES


class FakePage:
    def __init__(self, on_process=None):
        self._on_process = on_process

    def extract_tables(self):
        if self._on_process:
            self._on_process()
        return []

    def extract_text(self):
        return ""


class FakePdf:
    def __init__(self, pages):
        self.pages = pages

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class PageCapTests(unittest.TestCase):
    def test_pages_beyond_cap_are_not_processed(self):
        processed = []
        n_pages = MAX_PAGES + 50
        pages = [FakePage(on_process=lambda i=i: processed.append(i)) for i in range(n_pages)]
        fake_pdf = FakePdf(pages)

        with patch.object(pdf_extraction, "pdfplumber") as mock_pdfplumber:
            mock_pdfplumber.open.return_value = fake_pdf
            diagnostics: dict = {}
            extract_transactions_from_pdf(b"fake-pdf-bytes", diagnostics=diagnostics)

        self.assertEqual(len(processed), MAX_PAGES)
        self.assertEqual(diagnostics["pages"], n_pages)
        self.assertTrue(
            any(f"only the first {MAX_PAGES}" in w for w in diagnostics["warnings"])
        )

    def test_statement_under_cap_is_fully_processed_with_no_warning(self):
        processed = []
        n_pages = 10
        pages = [FakePage(on_process=lambda i=i: processed.append(i)) for i in range(n_pages)]
        fake_pdf = FakePdf(pages)

        with patch.object(pdf_extraction, "pdfplumber") as mock_pdfplumber:
            mock_pdfplumber.open.return_value = fake_pdf
            diagnostics: dict = {}
            extract_transactions_from_pdf(b"fake-pdf-bytes", diagnostics=diagnostics)

        self.assertEqual(len(processed), n_pages)
        self.assertEqual(diagnostics["pages"], n_pages)
        self.assertFalse(any("only the first" in w for w in diagnostics["warnings"]))


if __name__ == "__main__":
    unittest.main()
