import unittest

from table_parsing import (
    parse_credit_card_table,
    parse_savings_bank_table,
    detect_and_parse_table,
)


class CreditCardTableTests(unittest.TestCase):
    def setUp(self):
        self.header = ["DATE", "TRANSACTION DETAILS", "MERCHANT CATEGORY", "AMOUNT (Rs.)"]

    def test_parses_debit_row(self):
        table = [
            self.header,
            ["01/04/2026", "ZOMATO,NEW DELHI", "RESTAURANTS", "450.00"],
        ]
        result = parse_credit_card_table(table)
        self.assertEqual(len(result), 1)
        txn = result[0]
        self.assertEqual(txn["type"], "debit")
        self.assertEqual(txn["category"], "Food")
        self.assertEqual(txn["amount"], 450.00)
        self.assertEqual(txn["mode"], "Card")

    def test_credit_marker_forces_income(self):
        table = [
            self.header,
            ["02/04/2026", "REFUND FROM MERCHANT", "MISC", "199.00 Cr"],
        ]
        result = parse_credit_card_table(table)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["type"], "credit")
        self.assertEqual(result[0]["category"], "Income")

    def test_missing_date_row_is_skipped(self):
        table = [
            self.header,
            ["not-a-date", "ZOMATO", "RESTAURANTS", "100.00"],
        ]
        diagnostics = {"rejectedRows": {"missing_date": 0, "missing_amount": 0, "non_positive_amount": 0}}
        result = parse_credit_card_table(table, diagnostics=diagnostics)
        self.assertEqual(result, [])
        self.assertEqual(diagnostics["rejectedRows"]["missing_date"], 1)

    def test_non_positive_amount_is_rejected(self):
        table = [
            self.header,
            ["01/04/2026", "REVERSED CHARGE", "MISC", "0.00"],
        ]
        diagnostics = {"rejectedRows": {"missing_date": 0, "missing_amount": 0, "non_positive_amount": 0}}
        result = parse_credit_card_table(table, diagnostics=diagnostics)
        self.assertEqual(result, [])
        self.assertEqual(diagnostics["rejectedRows"]["non_positive_amount"], 1)

    def test_missing_required_columns_returns_empty(self):
        table = [["FOO", "BAR"], ["x", "y"]]
        self.assertEqual(parse_credit_card_table(table), [])


class SavingsBankTableTests(unittest.TestCase):
    def setUp(self):
        self.header = ["DATE", "NARRATION", "DEBIT", "CREDIT", "BALANCE"]

    def test_parses_debit_row(self):
        table = [
            self.header,
            ["01/04/2026", "UBER TRIP", "350.00", "", "10000.00"],
        ]
        result = parse_savings_bank_table(table)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["type"], "debit")
        self.assertEqual(result[0]["category"], "Transport")
        self.assertEqual(result[0]["mode"], "Bank")

    def test_salary_credit_is_income(self):
        table = [
            self.header,
            ["01/04/2026", "SALARY CREDIT ACME CORP", "", "50000.00", "60000.00"],
        ]
        result = parse_savings_bank_table(table)
        self.assertEqual(result[0]["type"], "credit")
        self.assertEqual(result[0]["category"], "Income")

    def test_neft_credit_is_income(self):
        # Regression guard for the merged INCOME_KEYWORDS list (category_rules.py) —
        # this used to only be "Income" via the savings-parser's own separate list.
        table = [
            self.header,
            ["01/04/2026", "NEFT CR FROM JOHN DOE", "", "5000.00", "15000.00"],
        ]
        result = parse_savings_bank_table(table)
        self.assertEqual(result[0]["category"], "Income")

    def test_non_income_credit_falls_back_to_categorize(self):
        table = [
            self.header,
            ["01/04/2026", "ZOMATO REFUND ADJUSTMENT XYZ", "", "200.00", "5200.00"],
        ]
        result = parse_savings_bank_table(table)
        # "REFUND" is caught by categorize()'s own income check, independent of INCOME_KEYWORDS
        self.assertEqual(result[0]["category"], "Income")

    def test_row_with_no_amount_is_rejected(self):
        table = [
            self.header,
            ["01/04/2026", "ZERO AMOUNT ROW", "", "", "5200.00"],
        ]
        diagnostics = {"rejectedRows": {"missing_date": 0, "missing_amount": 0, "non_positive_amount": 0}}
        result = parse_savings_bank_table(table, diagnostics=diagnostics)
        self.assertEqual(result, [])
        self.assertEqual(diagnostics["rejectedRows"]["missing_amount"], 1)

    def test_missing_required_columns_returns_empty(self):
        table = [["DATE", "NARRATION"], ["01/04/2026", "x"]]
        self.assertEqual(parse_savings_bank_table(table), [])


class DetectAndParseTableTests(unittest.TestCase):
    def test_routes_credit_card_header_to_credit_card_parser(self):
        table = [
            ["DATE", "TRANSACTION DETAILS", "MERCHANT CATEGORY", "AMOUNT (Rs.)"],
            ["01/04/2026", "ZOMATO", "RESTAURANTS", "450.00"],
        ]
        result = detect_and_parse_table(table)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["mode"], "Card")

    def test_routes_bank_header_to_savings_parser(self):
        table = [
            ["DATE", "NARRATION", "DEBIT", "CREDIT", "BALANCE"],
            ["01/04/2026", "UBER TRIP", "350.00", "", "10000.00"],
        ]
        result = detect_and_parse_table(table)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["mode"], "Bank")

    def test_empty_or_short_table_returns_empty(self):
        self.assertEqual(detect_and_parse_table([]), [])
        self.assertEqual(detect_and_parse_table([["DATE"]]), [])


if __name__ == "__main__":
    unittest.main()
