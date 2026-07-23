import unittest

from bank_detection import detect_bank_from_text


class BankDetectionTests(unittest.TestCase):
    def test_detects_known_banks(self):
        cases = {
            "Statement of Axis Bank account": "Axis Bank",
            "HDFC BANK Credit Card Statement": "HDFC Bank",
            "State Bank of India": "State Bank of India",
            "your sbi account summary": "State Bank of India",
            "ICICI Bank Limited": "ICICI Bank",
            "Kotak Mahindra Bank": "Kotak Bank",
            "YES BANK statement": "Yes Bank",
            "IndusInd Bank Ltd": "IndusInd Bank",
            "IDFC First Bank": "IDFC First Bank",
            "Punjab National Bank": "Punjab National Bank",
            "pnb account": "Punjab National Bank",
            "Bank of Baroda": "Bank of Baroda",
            "Canara Bank": "Canara Bank",
            "Union Bank of India": "Union Bank",
            "Federal Bank": "Federal Bank",
            "RBL Bank": "RBL Bank",
            "Standard Chartered Bank": "Standard Chartered",
            "Citibank statement": "Citibank",
            "American Express card": "American Express",
            "Your Amex bill": "American Express",
        }
        for text, expected in cases.items():
            with self.subTest(text=text):
                self.assertEqual(detect_bank_from_text(text), expected)

    def test_case_insensitive(self):
        self.assertEqual(detect_bank_from_text("AXIS BANK STATEMENT"), "Axis Bank")
        self.assertEqual(detect_bank_from_text("axis bank statement"), "Axis Bank")

    def test_unrecognized_text_returns_none(self):
        self.assertIsNone(detect_bank_from_text("Some generic financial document"))

    def test_empty_text_returns_none(self):
        self.assertIsNone(detect_bank_from_text(""))

    def test_first_matching_pattern_wins(self):
        # Axis pattern is checked before HDFC in _BANK_PATTERNS; a statement
        # naming both should resolve to whichever appears first in the list.
        text = "Formerly HDFC, now consolidated under Axis Bank Ltd"
        self.assertEqual(detect_bank_from_text(text), "Axis Bank")


if __name__ == "__main__":
    unittest.main()
