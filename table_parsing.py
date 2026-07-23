import re
from datetime import datetime

from category_rules import categorize, INCOME_KEYWORDS


def _ensure_parsing_diagnostics(diagnostics: dict | None) -> dict | None:
    if diagnostics is None:
        return None
    diagnostics.setdefault("pages", 0)
    diagnostics.setdefault("tablesDetected", 0)
    diagnostics.setdefault("tablesParsed", 0)
    diagnostics.setdefault("modeCounts", {"Card": 0, "Bank": 0, "Text": 0})
    diagnostics.setdefault("dedupeDropped", 0)
    diagnostics.setdefault("rejectedRows", {"missing_date": 0, "missing_amount": 0, "non_positive_amount": 0})
    diagnostics.setdefault("warnings", [])
    return diagnostics


def _diag_inc_rejected(diagnostics: dict | None, reason: str) -> None:
    diagnostics = _ensure_parsing_diagnostics(diagnostics)
    if diagnostics is None:
        return
    rejected = diagnostics.get("rejectedRows")
    if isinstance(rejected, dict) and reason in rejected:
        rejected[reason] = int(rejected.get(reason, 0)) + 1


def clean_amount(val) -> float:
    if not val:
        return 0.0
    s = str(val).replace(",", "").replace("Rs.", "").replace("INR", "").strip()
    s = re.sub(r"\s*(Dr|Cr)\s*$", "", s, flags=re.IGNORECASE)
    s = re.sub(r"[^\d.]", "", s)
    try:
        return float(s) if s else 0.0
    except ValueError:
        return 0.0


def is_credit_amount(val: str) -> bool:
    if not val:
        return False
    return bool(re.search(r"\bCr\b", str(val), re.IGNORECASE))


def is_date(val) -> bool:
    if not val or not isinstance(val, str):
        return False
    return bool(re.search(r"\d{1,2}[/\-.]\d{2}[/\-.]\d{2,4}", val.strip()))


def normalize_date(d: str) -> str:
    d = d.strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d/%m/%y", "%Y-%m-%d"):
        try:
            return datetime.strptime(d, fmt).strftime("%d %b %Y")
        except ValueError:
            pass
    return d


def _build_transaction(date_cell: str, desc: str, amount: float, txn_type: str, category: str, mode: str) -> dict:
    """Shared 6-key transaction dict shape — previously built independently
    (but identically) by both parse_credit_card_table() and parse_savings_bank_table()."""
    return {
        "date": normalize_date(date_cell),
        "desc": desc,
        "amount": round(amount, 2),
        "type": txn_type,
        "category": category,
        "mode": mode,
    }


def parse_credit_card_table(table: list, diagnostics: dict | None = None) -> list[dict]:
    """
    Handles: DATE | TRANSACTION DETAILS | MERCHANT CATEGORY | AMOUNT (Rs.)
    This is the Axis Bank / HDFC CC format.
    """
    transactions = []
    header = [str(c or "").upper().strip() for c in table[0]]

    date_idx = next((i for i, h in enumerate(header) if "DATE" in h), -1)
    desc_idx = next((i for i, h in enumerate(header) if "DETAIL" in h or "NARRATION" in h or "DESCRIPTION" in h or "PARTICULARS" in h), -1)
    cat_idx  = next((i for i, h in enumerate(header) if "CATEGORY" in h or "MERCHANT" in h), -1)
    amt_idx  = next((i for i, h in enumerate(header) if "AMOUNT" in h or "RS." in h or "INR" in h), -1)

    if date_idx == -1 or desc_idx == -1 or amt_idx == -1:
        return []

    for row in table[1:]:
        if not row or len(row) <= max(date_idx, desc_idx, amt_idx):
            continue
        date_cell = str(row[date_idx] or "").strip()
        if not is_date(date_cell):
            _diag_inc_rejected(diagnostics, "missing_date")
            continue
        desc = str(row[desc_idx] or "").replace("\n", " ").strip()
        if not desc or len(desc) < 2:
            continue
        mc = str(row[cat_idx] or "").strip() if cat_idx != -1 else ""
        amt_raw = str(row[amt_idx] or "").strip()
        if not amt_raw:
            _diag_inc_rejected(diagnostics, "missing_amount")
            continue

        amount = clean_amount(amt_raw)
        if amount <= 0:
            _diag_inc_rejected(diagnostics, "non_positive_amount")
            continue

        is_income = is_credit_amount(amt_raw)
        txn_type = "credit" if is_income else "debit"
        category = "Income" if is_income else categorize(desc, mc)

        transactions.append(_build_transaction(date_cell, desc, amount, txn_type, category, "Card"))

    return transactions


def parse_savings_bank_table(table: list, diagnostics: dict | None = None) -> list[dict]:
    """
    Handles: DATE | NARRATION | DEBIT | CREDIT | BALANCE
    Standard savings/current account format.
    """
    transactions = []
    header = [str(c or "").upper().strip() for c in table[0]]

    date_idx   = next((i for i, h in enumerate(header) if "DATE" in h and "VALUE" not in h), -1)
    desc_idx   = next((i for i, h in enumerate(header) if "NARRATION" in h or "DESCRIPTION" in h or "PARTICULARS" in h or "DETAIL" in h), -1)
    debit_idx  = next((i for i, h in enumerate(header) if "DEBIT" in h or "WITHDRAWAL" in h or "DR" == h), -1)
    credit_idx = next((i for i, h in enumerate(header) if "CREDIT" in h or "DEPOSIT" in h or "CR" == h), -1)

    if date_idx == -1 or desc_idx == -1:
        return []
    if debit_idx == -1 and credit_idx == -1:
        return []

    for row in table[1:]:
        if not row:
            continue
        date_cell = str(row[date_idx] if date_idx < len(row) else "").strip()
        if not is_date(date_cell):
            _diag_inc_rejected(diagnostics, "missing_date")
            continue
        desc = str(row[desc_idx] if desc_idx < len(row) else "").replace("\n", " ").strip()
        if not desc or len(desc) < 2:
            continue

        dr_amt = clean_amount(row[debit_idx]) if debit_idx != -1 and debit_idx < len(row) else 0.0
        cr_amt = clean_amount(row[credit_idx]) if credit_idx != -1 and credit_idx < len(row) else 0.0

        if dr_amt > 0:
            transactions.append(_build_transaction(date_cell, desc, dr_amt, "debit", categorize(desc), "Bank"))
        elif cr_amt > 0:
            # Shares INCOME_KEYWORDS with categorize()'s own salary/income check
            # (category_rules.py) — previously two independently-drifted lists.
            category = "Income" if any(k in desc.upper() for k in INCOME_KEYWORDS) else categorize(desc)
            transactions.append(_build_transaction(date_cell, desc, cr_amt, "credit", category, "Bank"))
        else:
            _diag_inc_rejected(diagnostics, "missing_amount")

    return transactions


def detect_and_parse_table(table: list, diagnostics: dict | None = None) -> list[dict]:
    """Auto-detect table format and route to the right parser."""
    if not table or len(table) < 2:
        return []
    header = [str(c or "").upper().strip() for c in table[0]]
    header_str = " ".join(header)

    if ("AMOUNT" in header_str or "RS." in header_str) and (
        "DEBIT" not in header_str and "CREDIT" not in header_str
    ):
        result = parse_credit_card_table(table, diagnostics=diagnostics)
        if result:
            return result

    result = parse_savings_bank_table(table, diagnostics=diagnostics)
    if result:
        return result

    return []
