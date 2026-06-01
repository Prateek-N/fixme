import unittest

from main import compute_insights


def txn(date, desc, amount, txn_type, category, mode="Test"):
    return {
        "date": date,
        "desc": desc,
        "amount": amount,
        "type": txn_type,
        "category": category,
        "mode": mode,
    }


class DiagnosisTests(unittest.TestCase):
    def test_bank_statement_uses_real_income(self):
        data = compute_insights([
            txn("01 Apr 2026", "Salary", 100000, "credit", "Income"),
            txn("02 Apr 2026", "Rent", 25000, "debit", "Bills"),
            txn("03 Apr 2026", "Groceries", 8000, "debit", "Food"),
            txn("04 Apr 2026", "Uber", 2500, "debit", "Transport"),
            txn("05 Apr 2026", "Cinema", 1500, "debit", "Entertainment"),
        ])
        self.assertFalse(data["dataQuality"]["inferredIncome"])
        self.assertIn(data["score"]["confidence"], ("high", "medium"))
        self.assertIsNotNone(data["emergency"]["months"])

    def test_credit_card_statement_marks_income_as_estimated(self):
        data = compute_insights([
            txn("01 Apr 2026", "Restaurant", 3000, "debit", "Food"),
            txn("02 Apr 2026", "Airline", 18000, "debit", "Transport"),
            txn("03 Apr 2026", "Amazon", 9000, "debit", "Shopping"),
            txn("04 Apr 2026", "Movie", 1200, "debit", "Entertainment"),
        ])
        self.assertTrue(data["dataQuality"]["inferredIncome"])
        self.assertGreater(len(data["assumptions"]), 0)
        self.assertIsNone(data["emergency"]["months"])

    def test_zero_transactions_returns_empty_state(self):
        data = compute_insights([])
        self.assertTrue(data["dataQuality"]["emptyState"])
        self.assertEqual(data["score"]["confidence"], "low")

    def test_subscription_pressure_can_appear_without_big_discretionary_leak(self):
        data = compute_insights([
            txn("01 Apr 2026", "Salary", 80000, "credit", "Income"),
            txn("02 Apr 2026", "Netflix", 649, "debit", "Entertainment"),
            txn("03 Apr 2026", "Spotify", 119, "debit", "Entertainment"),
            txn("04 Apr 2026", "Prime Video", 1499, "debit", "Entertainment"),
            txn("05 Apr 2026", "Electricity", 1800, "debit", "Bills"),
            txn("06 Apr 2026", "Groceries", 5000, "debit", "Food"),
            txn("07 Apr 2026", "Fuel", 2500, "debit", "Transport"),
        ])
        labels = [driver["label"] for driver in data["drivers"]]
        self.assertIn("Recurring charges", labels)

    def test_other_category_is_not_forced_into_biggest_leak(self):
        data = compute_insights([
            txn("01 Apr 2026", "Salary", 70000, "credit", "Income"),
            txn("02 Apr 2026", "Unknown Vendor A", 15000, "debit", "Other"),
            txn("03 Apr 2026", "Unknown Vendor B", 12000, "debit", "Other"),
            txn("04 Apr 2026", "Water Bill", 2200, "debit", "Bills"),
            txn("05 Apr 2026", "Groceries", 4000, "debit", "Food"),
        ])
        if data["biggestLeak"] is not None:
            self.assertNotEqual(data["biggestLeak"]["category"], "Other")

    def test_compute_insights_includes_parsing_diagnostics(self):
        data = compute_insights([
            txn("01 Apr 2026", "Salary", 90000, "credit", "Income"),
            txn("02 Apr 2026", "Rent", 25000, "debit", "Bills"),
            txn("03 Apr 2026", "Groceries", 6000, "debit", "Food"),
            txn("04 Apr 2026", "Uber", 1200, "debit", "Transport"),
        ])
        self.assertIn("parsingDiagnostics", data)
        self.assertIsInstance(data["parsingDiagnostics"], dict)

    def test_desc_normalization_for_key_is_deterministic(self):
        from main import normalize_desc_for_key
        self.assertEqual(normalize_desc_for_key("  Swiggy--order   #123 "), "SWIGGY ORDER 123")
        self.assertEqual(normalize_desc_for_key("SWIGGY ORDER 123"), "SWIGGY ORDER 123")

    def test_dedupe_key_matches_for_cosmetic_desc_differences(self):
        from main import transaction_dedupe_key
        t1 = txn("01 Apr 2026", "Swiggy--order   #123", 499.00, "debit", "Food", mode="Text")
        t2 = txn("01 Apr 2026", "SWIGGY ORDER 123", 499.00, "debit", "Food", mode="Text")
        self.assertEqual(transaction_dedupe_key(t1), transaction_dedupe_key(t2))

    def test_dedupe_key_differs_for_distinct_merchants_same_amount(self):
        from main import transaction_dedupe_key
        t1 = txn("01 Apr 2026", "Swiggy order 123", 499.00, "debit", "Food", mode="Text")
        t2 = txn("01 Apr 2026", "Zomato order 456", 499.00, "debit", "Food", mode="Text")
        self.assertNotEqual(transaction_dedupe_key(t1), transaction_dedupe_key(t2))

    def test_confidence_downgrades_from_diagnostics_signals(self):
        transactions = [
            txn("01 Apr 2026", f"Purchase {i}", 100 + i, "debit", "Shopping", mode="Text")
            for i in range(20)
        ]
        diagnostics = {
            "pages": 2,
            "tablesDetected": 0,
            "tablesParsed": 0,
            "modeCounts": {"Text": 20, "Card": 0, "Bank": 0},
            "dedupeDropped": 8,
            "rejectedRows": {"missing_date": 0, "missing_amount": 5, "non_positive_amount": 0},
            "warnings": ["Text fallback was used."],
        }
        data = compute_insights(transactions, parsing_diagnostics=diagnostics)
        self.assertEqual(data["dataQuality"]["parsingConfidence"], "low")


if __name__ == "__main__":
    unittest.main()
