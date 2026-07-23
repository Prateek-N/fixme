import io
import re

import pdfplumber

from bank_detection import detect_bank_from_text
from category_rules import categorize
from merchant_utils import transaction_dedupe_key
from table_parsing import (
    clean_amount,
    normalize_date,
    detect_and_parse_table,
    _ensure_parsing_diagnostics,
    _diag_inc_rejected,
)


# No real bank statement runs anywhere near this many pages — it's a bound
# on worst-case processing time/memory for a maliciously large upload, not a
# limit that affects normal statements. Pages beyond the cap are skipped, not
# rejected: the statement is still analyzed on a best-effort basis, and a
# diagnostics warning says so rather than silently truncating.
MAX_PAGES = 300


def extract_transactions_from_pdf(content: bytes, diagnostics: dict | None = None) -> list[dict]:
    transactions = []
    seen = set()
    diagnostics = _ensure_parsing_diagnostics(diagnostics)
    text_fallback_pages = 0

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        total_pages = len(pdf.pages)
        pages_to_process = pdf.pages[:MAX_PAGES]
        if diagnostics is not None:
            diagnostics["pages"] = total_pages
            first_text = (pdf.pages[0].extract_text() or "") if pdf.pages else ""
            detected_bank = detect_bank_from_text(first_text)
            if detected_bank:
                diagnostics["detectedBank"] = detected_bank
            if total_pages > MAX_PAGES:
                warnings = diagnostics.get("warnings")
                if isinstance(warnings, list):
                    warnings.append(
                        f"Statement has {total_pages} pages; only the first {MAX_PAGES} were processed."
                    )
        for page in pages_to_process:
            tables = page.extract_tables()
            if diagnostics is not None:
                diagnostics["tablesDetected"] = int(diagnostics.get("tablesDetected", 0)) + len(tables)
            found_on_page = []

            for table in tables:
                parsed = detect_and_parse_table(table, diagnostics=diagnostics)
                found_on_page.extend(parsed)
                if diagnostics is not None and parsed:
                    diagnostics["tablesParsed"] = int(diagnostics.get("tablesParsed", 0)) + 1

            if not found_on_page:
                text_fallback_pages += 1
                text = page.extract_text() or ""
                lines = text.split("\n")
                tx_re = re.compile(
                    r"(\d{1,2}[/\-.]\d{2}[/\-.]\d{2,4})\s+(.+?)\s+([\d,]+\.\d{2})"
                )
                for line in lines:
                    m = tx_re.search(line)
                    if not m:
                        continue
                    date_str, desc, amt_str = m.group(1), m.group(2).strip(), m.group(3)
                    if len(desc) < 3:
                        continue
                    amount = clean_amount(amt_str)
                    if amount <= 0:
                        _diag_inc_rejected(diagnostics, "non_positive_amount")
                        continue
                    is_income = ("CR" in line.upper() or "SALARY" in desc.upper())
                    found_on_page.append({
                        "date": normalize_date(date_str),
                        "desc": desc,
                        "amount": round(amount, 2),
                        "type": "credit" if is_income else "debit",
                        "category": "Income" if is_income else categorize(desc),
                        "mode": "Text",
                    })

            for txn in found_on_page:
                if diagnostics is not None:
                    mode_counts = diagnostics.get("modeCounts")
                    if isinstance(mode_counts, dict):
                        mode = txn.get("mode", "Text")
                        mode_counts[mode] = int(mode_counts.get(mode, 0)) + 1

                key = transaction_dedupe_key(txn)
                if key not in seen:
                    seen.add(key)
                    transactions.append(txn)
                elif diagnostics is not None:
                    diagnostics["dedupeDropped"] = int(diagnostics.get("dedupeDropped", 0)) + 1

        if diagnostics is not None and text_fallback_pages > 0:
            warnings = diagnostics.get("warnings")
            if isinstance(warnings, list):
                warnings.append(f"Text fallback was used on {text_fallback_pages} page(s) (no tables parsed).")

    return transactions
