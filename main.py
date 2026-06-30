import io
import re
import asyncio
import json
import time
import collections
import os
import logging
import secrets
import random

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("fixmyfinance")
import pandas as pd
import pdfplumber
from datetime import datetime

# Simple in-memory rate limiter: max 5 parse requests per IP per 60 seconds
_rate_limit_store: dict[str, collections.deque] = {}
_RATE_LIMIT_MAX = 5
_RATE_LIMIT_WINDOW = 60

def _is_rate_limited(client_ip: str) -> bool:
    now = time.monotonic()
    timestamps = _rate_limit_store.setdefault(client_ip, collections.deque())
    while timestamps and now - timestamps[0] > _RATE_LIMIT_WINDOW:
        timestamps.popleft()
    if len(timestamps) >= _RATE_LIMIT_MAX:
        return True
    timestamps.append(now)
    return False

try:
    from fastapi import FastAPI, UploadFile, File, Request
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import StreamingResponse
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except Exception:
    FastAPI = None
    UploadFile = None
    File = None
    StaticFiles = None
    StreamingResponse = None
    CORSMiddleware = None
    uvicorn = None

try:
    app = FastAPI(title="FixMyFinance API") if FastAPI is not None else None
except Exception:
    app = None

if app is not None and CORSMiddleware is not None and StaticFiles is not None:
    _cors_env = os.environ.get("ALLOWED_ORIGINS", "")
    _allowed_origins = (
        [o.strip() for o in _cors_env.split(",") if o.strip()]
        if _cors_env
        else ["http://localhost:5173", "http://127.0.0.1:5173"]
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_allowed_origins,
        allow_credentials=True,
        allow_methods=["POST", "GET"],
        allow_headers=["Content-Type"],
    )

    app.mount("/app", StaticFiles(directory="public", html=True), name="public")

# ─────────────────────────────────────────────
# CATEGORIZATION ENGINE
# ─────────────────────────────────────────────
CATEGORY_RULES = {
    "Food": [
        "ZOMATO", "SWIGGY", "BISTRO", "RESTAURANT", "CAFE", "BAKERY",
        "MCDONALDS", "KFC", "DOMINOS", "STARBUCKS", "BLINKIT", "ZEPTO",
        "INSTAMART", "BIGBASKET", "HARE KRISHNA", "PIZZA", "BURGER", "DINE",
        "FOOD", "EATERY", "DHABA",
    ],
    "Shopping": [
        "AMAZON", "FLIPKART", "MYNTRA", "AJIO", "DMART", "RELIANCE",
        "SHOPPERS", "LIFESTYLE", "H&M", "ZARA", "SODHIS", "MARKET",
        "DEPT STORE", "MISC STORE", "SUPER MARKET", "GENERAL STORE",
    ],
    "Transport": [
        "UBER", "OLA", "RAPIDO", "METRO", "IRCTC", "MAKEMYTRIP", "MAKE MY TRIP",
        "FLIGHT", "BUS", "PETROL", "INDIANOIL", "HPCL", "BPCL", "FASTAG",
        "RAILWAYS", "INDIGO", "VISTARA", "AIRINDIA", "GOAIR", "TRANSPORT",
        "TRAVEL",
    ],
    "Bills": [
        "BESCOM", "ELECTRICITY", "AIRTEL", "JIO", "VODAFONE", "VI",
        "ACT", "HATHWAY", "WATER", "LIC", "INSURANCE", "CRED",
        "EMI", "LOAN", "RENT", "SOCIETY", "MAINTENANCE",
    ],
    "Entertainment": [
        "NETFLIX", "AMAZON PRIME", "DISNEY", "HOTSTAR", "SPOTIFY",
        "BOOKMYSHOW", "PVR", "INOX", "STEAM", "CULT", "PRIME VIDEO",
    ],
    "Education": [
        "UDEMY", "COURSERA", "EDUCATION", "SCHOOL", "COLLEGE", "TUITION",
        "INSTITUTE", "GOATFUNDED", "TRADING",
    ],
}

MERCHANT_CATEGORY_MAP = {
    "RESTAURANTS": "Food",
    "DEPT STORES": "Shopping",
    "MISC STORE": "Shopping",
    "TRANSPORT": "Transport",
    "TRAVEL": "Transport",
    "EDUCATION": "Education",
    "ENTERTAINMENT": "Entertainment",
    "UTILITIES": "Bills",
    "INSURANCE": "Bills",
    "GROCERY": "Food",
}

# Canonical merchant name → known alias variants
MERCHANT_ALIASES: dict[str, list[str]] = {
    "AMAZON":     ["AMZN", "AMAZON PAY", "AMAZON INDIA", "AMAZON SELLER", "AMZ"],
    "SWIGGY":     ["BUNDL TECHNOLOGIES", "SWIGGY INSTAMART"],
    "ZOMATO":     ["ZOMATO FOOD", "ZOMATO DELIVERY"],
    "BLINKIT":    ["GROFERS", "BLINKIT DELIVERY"],
    "NETFLIX":    ["NETFLIX.COM", "NETFLIX SUBSCRIPTION"],
    "UBER":       ["UBER INDIA", "UBER EATS", "UBER TRIP"],
    "OLA":        ["OLA CABS", "ANI TECHNOLOGIES"],
    "IRCTC":      ["IRCTC ETICKETING", "INDIAN RAILWAYS"],
    "FLIPKART":   ["FK FASHION", "FLIPKART INTERNET"],
    "BIGBASKET":  ["BB DAILY", "BIGBASKET.COM"],
    "SPOTIFY":    ["SPOTIFY AB", "SPOTIFY INDIA"],
    "HOTSTAR":    ["DISNEY HOTSTAR", "DISNEY+ HOTSTAR", "STAR INDIA"],
    "AIRTEL":     ["AIRTEL PAYMENTS", "BHARTI AIRTEL"],
    "JIO":        ["RELIANCE JIO", "JIO PLATFORMS"],
    "MAKEMYTRIP": ["MAKE MY TRIP", "MMT"],
}

_ALIAS_LOOKUP: dict[str, str] = {
    alias.upper(): canonical
    for canonical, aliases in MERCHANT_ALIASES.items()
    for alias in aliases
}

_KNOWN_MERCHANTS = {
    "ZOMATO", "SWIGGY", "BLINKIT", "ZEPTO", "BIGBASKET", "NETFLIX",
    "SPOTIFY", "UBER", "OLA", "AMAZON", "FLIPKART", "MYNTRA", "AJIO",
    "IRCTC", "MAKEMYTRIP", "BOOKMYSHOW", "PVR", "INOX", "STARBUCKS",
    "DOMINOS", "MCDONALDS", "KFC", "HOTSTAR", "DISNEY", "AIRTEL", "JIO",
    "RAPIDO", "DMART", "CRED", "CULT",
}


def normalize_merchant(desc: str) -> str:
    """Resolve known alias variants to their canonical name."""
    desc_up = desc.upper().strip()
    for alias, canonical in _ALIAS_LOOKUP.items():
        if alias in desc_up:
            return canonical
    return desc


def extract_merchant_key(desc: str) -> str:
    """Return a stable merchant identifier for grouping purposes."""
    desc_up = desc.upper().strip()
    for alias, canonical in _ALIAS_LOOKUP.items():
        if alias in desc_up:
            return canonical
    for merchant in _KNOWN_MERCHANTS:
        if merchant in desc_up:
            return merchant
    words = re.split(r"[\s/\-_@|]+", desc_up)
    significant = [w for w in words if len(w) > 3 and not re.match(r"^\d", w)]
    return significant[0] if significant else desc_up[:15]


def normalize_desc_for_key(desc: str) -> str:
    desc_up = str(desc or "").upper()
    desc_up = re.sub(r"[^A-Z0-9]+", " ", desc_up)
    desc_up = re.sub(r"\s+", " ", desc_up).strip()
    return desc_up


def transaction_dedupe_key(txn: dict) -> str:
    date = str(txn.get("date") or "").strip()
    txn_type = str(txn.get("type") or "").strip()
    amount = round(float(txn.get("amount") or 0.0), 2)
    desc = str(txn.get("desc") or "")
    merchant_key = extract_merchant_key(desc).upper()
    desc_norm = normalize_desc_for_key(desc)
    desc_norm_prefix = desc_norm[:20]
    return f"{date}|{txn_type}|{amount:.2f}|{merchant_key}|{desc_norm_prefix}"


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


def categorize(desc: str, merchant_category: str = "") -> str:
    mc = merchant_category.strip().upper()
    desc_up = normalize_merchant(desc).upper()

    transfer_keywords = [
        "UPI", "NEFT", "IMPS", "RTGS", "TRANSFER", "CC PAYMENT",
        "CREDIT CARD PAYMENT", "CARD PAYMENT", "PAYMENT TO", "SELF",
    ]
    if any(keyword in desc_up for keyword in transfer_keywords):
        return "Transfer"
    if any(keyword in desc_up for keyword in ["REFUND", "REVERSAL", "CASHBACK"]):
        return "Income"
    if any(keyword in desc_up for keyword in ["SALARY", "PAYROLL", "PAYMENT RECEIVED"]):
        return "Income"

    if mc in MERCHANT_CATEGORY_MAP:
        return MERCHANT_CATEGORY_MAP[mc]
    for key, cat in MERCHANT_CATEGORY_MAP.items():
        if key in mc:
            return cat
    # Normalize before keyword matching so aliases like "AMZN" hit "AMAZON" rules
    for cat, keywords in CATEGORY_RULES.items():
        if any(kw in desc_up for kw in keywords):
            return cat
    return "Other"


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


# ─────────────────────────────────────────────
# PDF PARSERS
# ─────────────────────────────────────────────

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

        transactions.append({
            "date": normalize_date(date_cell),
            "desc": desc,
            "amount": round(amount, 2),
            "type": txn_type,
            "category": category,
            "mode": "Card",
        })

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
            transactions.append({
                "date": normalize_date(date_cell),
                "desc": desc,
                "amount": round(dr_amt, 2),
                "type": "debit",
                "category": categorize(desc),
                "mode": "Bank",
            })
        elif cr_amt > 0:
            category = "Income" if any(k in desc.upper() for k in ["SALARY", "NEFT", "IMPS", "CREDIT", "REVERSAL"]) else categorize(desc)
            transactions.append({
                "date": normalize_date(date_cell),
                "desc": desc,
                "amount": round(cr_amt, 2),
                "type": "credit",
                "category": category,
                "mode": "Bank",
            })
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


_BANK_PATTERNS: list[tuple[str, str]] = [
    (r"axis\s*bank", "Axis Bank"),
    (r"hdfc\s*bank", "HDFC Bank"),
    (r"state\s*bank\s*of\s*india|sbi\b", "State Bank of India"),
    (r"icici\s*bank", "ICICI Bank"),
    (r"kotak\s*(mahindra)?\s*bank", "Kotak Bank"),
    (r"yes\s*bank", "Yes Bank"),
    (r"indusind\s*bank", "IndusInd Bank"),
    (r"idfc\s*(first)?\s*bank", "IDFC First Bank"),
    (r"punjab\s*national\s*bank|pnb\b", "Punjab National Bank"),
    (r"bank\s*of\s*baroda\b", "Bank of Baroda"),
    (r"canara\s*bank", "Canara Bank"),
    (r"union\s*bank", "Union Bank"),
    (r"federal\s*bank", "Federal Bank"),
    (r"rbl\s*bank", "RBL Bank"),
    (r"standard\s*chartered", "Standard Chartered"),
    (r"citibank|citi\s*bank", "Citibank"),
    (r"american\s*express|amex", "American Express"),
]

def detect_bank_from_text(text: str) -> str | None:
    lower = text.lower()
    for pattern, name in _BANK_PATTERNS:
        if re.search(pattern, lower):
            return name
    return None


def extract_transactions_from_pdf(content: bytes, diagnostics: dict | None = None) -> list[dict]:
    transactions = []
    seen = set()
    diagnostics = _ensure_parsing_diagnostics(diagnostics)
    text_fallback_pages = 0

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        if diagnostics is not None:
            diagnostics["pages"] = len(pdf.pages)
            first_text = (pdf.pages[0].extract_text() or "") if pdf.pages else ""
            detected_bank = detect_bank_from_text(first_text)
            if detected_bank:
                diagnostics["detectedBank"] = detected_bank
        for page in pdf.pages:
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


# ─────────────────────────────────────────────
# BEHAVIOR INTELLIGENCE ENGINE
# ─────────────────────────────────────────────

def _parse_txn_dates(date_series: pd.Series) -> pd.Series:
    """Parse normalized "dd Mon yyyy" strings into datetime objects."""
    def _parse(d: str):
        for fmt in ("%d %b %Y", "%d/%m/%Y", "%d-%m-%Y"):
            try:
                return datetime.strptime(str(d).strip(), fmt)
            except ValueError:
                pass
        return None
    return date_series.apply(_parse)


def detect_high_frequency_merchants(expense_df: pd.DataFrame) -> list[dict]:
    """Flag merchants visited an unusually high number of times."""
    if expense_df.empty:
        return []

    df = expense_df.copy()
    df["merchant_key"] = df["desc"].apply(extract_merchant_key)
    threshold = max(5, len(df) * 0.05)

    stats = (
        df.groupby("merchant_key")["amount"]
        .agg(["count", "sum"])
        .reset_index()
        .rename(columns={"count": "n", "sum": "total"})
    )
    stats = stats[stats["n"] >= threshold].sort_values("n", ascending=False)

    insights = []
    for _, row in stats.head(3).iterrows():
        name = row["merchant_key"].title()
        avg = round(row["total"] / row["n"])
        insights.append({
            "type": "behavior",
            "title": f"High-frequency: {name}",
            "message": (
                f"You transacted with {name} {int(row['n'])} times — "
                f"₹{int(row['total']):,} total (avg ₹{avg:,}/order). "
                f"Small frequent orders are the hardest spending to notice."
            ),
            "impact": f"₹{int(row['total']):,} total",
            "confidence": "high",
            "icon": "🔄",
        })

    return insights


def detect_spend_clustering(expense_df: pd.DataFrame) -> list[dict]:
    """Detect multiple orders from the same merchant on the same day."""
    if expense_df.empty:
        return []

    df = expense_df.copy()
    df["merchant_key"] = df["desc"].apply(extract_merchant_key)

    clusters = (
        df.groupby(["date", "merchant_key"])
        .agg(count=("amount", "count"), total=("amount", "sum"))
        .reset_index()
    )
    clusters = clusters[clusters["count"] >= 2].sort_values("count", ascending=False)

    insights = []
    seen_merchants: set[str] = set()
    for _, row in clusters.head(3).iterrows():
        merchant = row["merchant_key"]
        if merchant in seen_merchants:
            continue
        seen_merchants.add(merchant)
        insights.append({
            "type": "behavior",
            "title": "Same-day spending cluster",
            "message": (
                f"{int(row['count'])} orders from {merchant.title()} on {row['date']} — "
                f"₹{int(row['total']):,}. Impulse or convenience pattern detected."
            ),
            "impact": f"₹{int(row['total']):,} in one day",
            "confidence": "high",
            "icon": "📦",
        })

    return insights


def detect_weekend_spending(expense_df: pd.DataFrame) -> list[dict]:
    """Flag if daily spend on weekends significantly exceeds weekdays."""
    if expense_df.empty:
        return []

    df = expense_df.copy()
    df["parsed_date"] = _parse_txn_dates(df["date"])
    df = df.dropna(subset=["parsed_date"])
    if df.empty:
        return []

    df["is_weekend"] = df["parsed_date"].apply(lambda d: d.weekday() >= 5)
    weekend_spend  = float(df[df["is_weekend"]]["amount"].sum())
    weekday_spend  = float(df[~df["is_weekend"]]["amount"].sum())
    weekend_days   = max(df[df["is_weekend"]]["parsed_date"].nunique(), 1)
    weekday_days   = max(df[~df["is_weekend"]]["parsed_date"].nunique(), 1)

    daily_weekend = weekend_spend / weekend_days
    daily_weekday = weekday_spend / weekday_days

    if daily_weekend > daily_weekday * 1.5 and weekend_spend > 500:
        ratio = round(daily_weekend / max(daily_weekday, 1), 1)
        return [{
            "type": "behavior",
            "title": "Weekend spending spike",
            "message": (
                f"You spend {ratio}× more per day on weekends "
                f"(₹{int(daily_weekend):,}/day vs ₹{int(daily_weekday):,}/day on weekdays). "
                f"Weekend leisure is quietly compounding your costs."
            ),
            "impact": f"₹{int(weekend_spend):,} on weekends",
            "confidence": "medium",
            "icon": "📅",
        }]

    return []


def detect_spending_spikes(expense_df: pd.DataFrame, total_expense: float) -> list[dict]:
    """Highlight transactions that are anomalously large relative to the rest."""
    if expense_df.empty or len(expense_df) < 3:
        return []

    avg = float(expense_df["amount"].mean())
    spikes = expense_df[
        (expense_df["amount"] > avg * 5) &
        (expense_df["amount"] > total_expense * 0.10)
    ].sort_values("amount", ascending=False)

    insights = []
    for _, row in spikes.head(2).iterrows():
        pct = round((row["amount"] / total_expense) * 100) if total_expense > 0 else 0
        insights.append({
            "type": "spike",
            "title": "Unusual large transaction",
            "message": (
                f"₹{int(row['amount']):,} at {str(row['desc'])[:40]} — "
                f"that's {pct}% of your total spend. Confirm this was intentional."
            ),
            "impact": f"₹{int(row['amount']):,} ({pct}% of total)",
            "confidence": "high",
            "icon": "🚨",
        })

    return insights


def detect_subscriptions(expense_df: pd.DataFrame) -> list[dict]:
    """Extract recurring subscription charges from Entertainment and Bills."""
    if expense_df.empty:
        return []

    subs = expense_df[expense_df["category"].isin(["Entertainment", "Bills"])].copy()
    subscriptions = []
    seen: set[str] = set()
    for _, row in subs.iterrows():
        key = extract_merchant_key(row["desc"])
        if key not in seen and row["amount"] < 5000:
            seen.add(key)
            name = key.title() if key == key.upper() else key
            subscriptions.append({"name": name, "amount": round(float(row["amount"]), 2)})

    return subscriptions


def compute_whatif_simulations(breakdown: list[dict], total_expense: float) -> list[dict]:
    """For categories above healthy benchmarks, compute savings from a 30% cut."""
    HEALTHY_PCT = {"Food": 20, "Shopping": 15, "Transport": 10, "Entertainment": 5}
    sims = []

    for item in breakdown:
        cat = item["category"]
        if cat not in HEALTHY_PCT or item["pct"] <= HEALTHY_PCT[cat]:
            continue
        save_30  = round(item["amount"] * 0.30)
        annual   = save_30 * 12
        sims.append({
            "category":     cat,
            "currentSpend": round(item["amount"]),
            "cutPct":       30,
            "monthlySaving": save_30,
            "annualSaving":  annual,
            "message": f"Cut {cat} by 30% → save ₹{save_30:,}/month → ₹{annual:,}/year",
        })

    return sims[:3]


def assign_persona(
    expense_df: pd.DataFrame,
    savings_rate: int,
    breakdown: list[dict],
) -> dict:
    """Dynamically choose a spending persona based on actual transaction data."""
    top_cat = breakdown[0]["category"] if breakdown else "Other"
    top_pct = breakdown[0]["pct"]      if breakdown else 0
    top_amt = breakdown[0]["amount"]   if breakdown else 0

    food_count = int(expense_df[expense_df["category"] == "Food"].shape[0])        if not expense_df.empty else 0
    ent_count  = int(expense_df[expense_df["category"] == "Entertainment"].shape[0]) if not expense_df.empty else 0
    total_txns = len(expense_df) if not expense_df.empty else 0

    if top_cat == "Food" and top_pct > 30:
        return {
            "key": "foodie",
            "titles": {
                "playful": "The Food Court VIP 🍜",
                "gentle":  "You love good food",
                "blunt":   "Food is eating your salary",
            },
            "subs": {
                "playful": f"You placed {food_count} food orders. That's dedication.",
                "gentle":  f"{top_pct}% of your spend went to food & delivery. Small cuts = big savings.",
                "blunt":   f"{top_pct}% on food. The healthy benchmark is 20%.",
            },
        }

    if top_cat == "Shopping" and top_pct > 25:
        save_30 = int(top_amt * 0.30)
        return {
            "key": "shopaholic",
            "titles": {
                "playful": "The Cart That Never Abandons 🛒",
                "gentle":  "A keen shopper",
                "blunt":   "Shopping needs trimming",
            },
            "subs": {
                "playful": "Your cart never got lonely this month.",
                "gentle":  f"{top_pct}% went to shopping. A 30% cut saves ₹{save_30:,}/mo.",
                "blunt":   f"{top_pct}% on shopping. Trim it.",
            },
        }

    if savings_rate >= 40:
        return {
            "key": "saver",
            "titles": {
                "playful": "The Silent Wealth Builder 💰",
                "gentle":  "A disciplined saver",
                "blunt":   "Savings rate: solid",
            },
            "subs": {
                "playful": "You're quietly winning at money.",
                "gentle":  f"Saving {savings_rate}% of income puts you ahead of most people.",
                "blunt":   f"{savings_rate}% savings rate. Keep it up.",
            },
        }

    if ent_count >= 5:
        return {
            "key": "subscriber",
            "titles": {
                "playful": "The Subscription Hoarder 📺",
                "gentle":  "A comfort spender",
                "blunt":   "Too many subscriptions",
            },
            "subs": {
                "playful": "You're keeping every streaming service alive single-handedly.",
                "gentle":  f"{ent_count} entertainment charges detected. Review what you actually use.",
                "blunt":   f"{ent_count} entertainment charges. Cut the unused ones.",
            },
        }

    return {
        "key": "analyser",
        "titles": {
            "playful": "The Receipt Detective 🔍",
            "gentle":  "A thoughtful spender",
            "blunt":   "Spending analysed.",
        },
        "subs": {
            "playful": "We shredded your statement. Juicy findings inside.",
            "gentle":  "Your finances are now clearly laid out. Small tweaks = big results.",
            "blunt":   f"{total_txns} expense transactions parsed. Work to do.",
        },
    }


def compute_health_score(
    savings_rate: int,
    biggest_leak: dict | None,
    behavior_insights: list[dict],
    breakdown: list[dict],
) -> tuple[int, str]:
    score = 100

    # Savings rate: up to -40 points
    if savings_rate < 20:
        score -= (20 - max(savings_rate, 0)) * 2

    # Biggest category leak: -15
    if biggest_leak and biggest_leak.get("potentialSave", 0) > 0:
        score -= 15

    # Frequency / clustering behaviors: -5 each, capped at -15
    freq_count = sum(1 for i in behavior_insights if i.get("type") == "behavior")
    score -= min(freq_count * 5, 15)

    # Anomalous spikes: -10 each, capped at -20
    spike_count = sum(1 for i in behavior_insights if i.get("type") == "spike")
    score -= min(spike_count * 10, 20)

    # Category imbalance: dominant non-essential category > 40% of spend → -10
    if breakdown:
        top = breakdown[0]
        if top["category"] not in ("Other", "Income", "Bills") and top["pct"] > 40:
            score -= 10

    score = max(10, min(100, score))
    status = "healthy" if score > 75 else ("needs_work" if score > 40 else "critical")
    return score, status


# ─────────────────────────────────────────────
# ANALYTICS ORCHESTRATOR
# ─────────────────────────────────────────────

def compute_health_score_v2(
    savings_rate: int,
    breakdown: list[dict],
    biggest_leak: dict | None,
    subscriptions: list[dict],
    behavior_insights: list[dict],
) -> tuple[int, str, list[dict]]:
    drivers: list[dict] = []
    score = 58

    if savings_rate >= 25:
        boost = min(18, round(savings_rate * 0.45))
        score += boost
        drivers.append({
            "label": "Savings cushion",
            "impact": "positive",
            "evidence": f"You saved {savings_rate}% of income this period.",
            "confidence": "high",
            "_weight": boost,
        })
    else:
        drag = min(22, round(max(0, 20 - savings_rate) * 1.1))
        score -= drag
        drivers.append({
            "label": "Low savings rate",
            "impact": "negative",
            "evidence": f"Only {savings_rate}% of income remained after spending.",
            "confidence": "high",
            "_weight": drag,
        })

    if biggest_leak and biggest_leak.get("potentialSave", 0) > 0:
        overage = max(0, biggest_leak["yourPct"] - biggest_leak["healthyPct"])
        drag = min(18, round(overage * 1.1))
        score -= drag
        drivers.append({
            "label": f"{biggest_leak['category']} overspend",
            "impact": "negative",
            "evidence": (
                f"{biggest_leak['category']} took {biggest_leak['yourPct']}% of spend "
                f"vs a {biggest_leak['healthyPct']}% benchmark."
            ),
            "confidence": "high",
            "filter": {"by": "category", "value": biggest_leak["category"]},
            "_weight": drag,
        })

    subs_total = sum(s["amount"] for s in subscriptions)
    if len(subscriptions) >= 3 or subs_total >= 2500:
        drag = min(12, 4 + len(subscriptions))
        score -= drag
        drivers.append({
            "label": "Recurring charges",
            "impact": "negative",
            "evidence": f"{len(subscriptions)} recurring charges add up to ₹{int(subs_total):,}/mo.",
            "confidence": "medium",
            "filter": {"by": "subscription"},
            "_weight": drag,
        })

    spike_count = sum(1 for i in behavior_insights if i.get("type") == "spike")
    if spike_count:
        drag = min(14, spike_count * 7)
        score -= drag
        drivers.append({
            "label": "Unusual spikes",
            "impact": "negative",
            "evidence": f"{spike_count} unusually large transaction(s) deserve a second look.",
            "confidence": "medium",
            "filter": {"by": "spike"},
            "_weight": drag,
        })

    recurring_behavior_count = sum(1 for i in behavior_insights if i.get("type") == "behavior")
    if recurring_behavior_count:
        drag = min(10, recurring_behavior_count * 3)
        score -= drag
        drivers.append({
            "label": "Frequent convenience spending",
            "impact": "negative",
            "evidence": "Repeated merchant patterns suggest habit spending rather than one-off needs.",
            "confidence": "medium",
            "_weight": drag,
        })

    if breakdown:
        top = breakdown[0]
        if top["category"] not in ("Other", "Income", "Bills") and top["pct"] > 40:
            score -= 8
            drivers.append({
                "label": "Category concentration",
                "impact": "negative",
                "evidence": f"{top['category']} alone accounts for {top['pct']}% of total spend.",
                "confidence": "medium",
                "filter": {"by": "category", "value": top["category"]},
                "_weight": 8,
            })

    score = max(10, min(95, score))
    status = "healthy" if score >= 75 else ("needs_work" if score >= 45 else "critical")
    ranked = sorted(drivers, key=lambda item: item.get("_weight", 0), reverse=True)
    for item in ranked:
        item.pop("_weight", None)
    return score, status, ranked[:3]


def infer_statement_type(income_df: pd.DataFrame, expense_df: pd.DataFrame) -> str:
    if expense_df.empty and income_df.empty:
        return "unknown"
    if income_df.empty and not expense_df.empty:
        return "credit_card"
    if not income_df.empty and not expense_df.empty:
        return "bank_account"
    return "mixed"


def build_empty_diagnosis_payload(transaction_count: int = 0, parsing_diagnostics: dict | None = None) -> dict:
    return {
        "period": {"month": "Detected", "bankName": "Statement", "txnCount": transaction_count},
        "parsingDiagnostics": parsing_diagnostics or {},
        "dataQuality": {
            "statementType": "unknown",
            "transactionCount": transaction_count,
            "parsingConfidence": "low",
            "inferredIncome": False,
            "demo": False,
            "emptyState": True,
        },
        "score": {
            "value": 0,
            "status": "needs_work",
            "reason": "We could not extract enough reliable data to produce a trustworthy money health check.",
            "reasons": [
                "Too few transactions were parsed from the uploaded statement.",
                "A cleaner statement export is needed before the app can make spending claims.",
            ],
            "confidence": "low",
        },
        "diagnosis": {
            "whatIsHealthy": "The safest move here is not to guess.",
            "whatNeedsAttention": "This statement did not produce enough reliable transactions for analysis.",
            "bestNextMove": "Try another PDF export or a clearer statement file, then rerun the health check.",
        },
        "drivers": [
            {
                "label": "Low extraction confidence",
                "impact": "negative",
                "evidence": f"Only {transaction_count} usable transaction(s) were detected.",
                "confidence": "low",
            }
        ],
        "assumptions": [
            "No financial diagnosis was generated because the statement did not yield enough reliable transactions."
        ],
        "metrics": {"income": 0, "expenses": 0, "saved": 0, "savingsRate": 0},
        "breakdown": [],
        "biggestLeak": None,
        "insights": [],
        "behaviorInsights": [],
        "whatIf": [],
        "subscriptions": [],
        "emergency": {
            "months": None,
            "target": 3,
            "monthlyContribNeeded": None,
            "estimated": True,
            "unavailableReason": "Not enough reliable income and spending data.",
        },
        "persona": {
            "key": "analyser",
            "titles": {
                "playful": "Not enough to call it yet",
                "gentle": "We need a clearer statement",
                "blunt": "Diagnosis unavailable",
            },
            "subs": {
                "playful": "This file did not give us enough signal to be useful.",
                "gentle": "We held back instead of guessing. Upload a clearer statement to continue.",
                "blunt": "Too little reliable data to score.",
            },
        },
    }


def build_diagnosis_sections(
    savings_rate: int,
    biggest_leak: dict | None,
    subscriptions: list[dict],
    assumptions: list[str],
    drivers: list[dict],
) -> dict:
    healthy = (
        f"You saved {savings_rate}% this period."
        if savings_rate > 0 else
        "The app found enough structure in the statement to identify real patterns."
    )
    if assumptions:
        healthy = "The app is being explicit about assumptions instead of pretending the data is perfect."

    if biggest_leak and biggest_leak.get("potentialSave", 0) > 0:
        needs_attention = (
            f"{biggest_leak['category']} is the clearest drag on this month, "
            f"running {biggest_leak['yourPct']}% of spend against a {biggest_leak['healthyPct']}% benchmark."
        )
        best_next = f"Start with {biggest_leak['category']}: trimming that category could recover about ₹{int(biggest_leak['potentialSave']):,}/month."
    elif subscriptions:
        needs_attention = f"Recurring charges are meaningful here, with {len(subscriptions)} subscription-like payments detected."
        best_next = "Review the recurring charges first and cancel or downgrade the least-used services."
    elif drivers:
        needs_attention = drivers[0]["evidence"]
        best_next = "Review the highlighted transactions and focus on the most repetitive discretionary spend first."
    else:
        needs_attention = "No single leak dominated the month, so the opportunity is likely spread across smaller repeated decisions."
        best_next = "Open the transactions list and review the top merchants for easy cuts."

    return {
        "whatIsHealthy": healthy,
        "whatNeedsAttention": needs_attention,
        "bestNextMove": best_next,
    }


def _insight_to_filter(bi: dict) -> dict:
    """Map a behavior insight to a frontend filter descriptor."""
    title = bi.get("title", "")
    msg   = bi.get("message", "")
    if "High-frequency:" in title:
        merchant = title.split("High-frequency:", 1)[1].strip().upper()
        return {"by": "merchant", "value": merchant}
    if "Same-day spending cluster" in title:
        m = re.search(r"from (.+?) on", msg)
        if m:
            return {"by": "merchant", "value": m.group(1).strip().upper()}
    if bi.get("type") == "spike":
        return {"by": "spike"}
    return {"by": "all"}


def derive_period_label(transactions: list[dict]) -> str:
    parsed = [d for d in _parse_txn_dates(pd.Series([t["date"] for t in transactions])).tolist() if d]
    if not parsed:
        return "Detected"
    parsed.sort()
    first = parsed[0]
    last = parsed[-1]
    if first.month == last.month and first.year == last.year:
        return first.strftime("%b %Y")
    if first.year == last.year:
        return f"{first.strftime('%b')}–{last.strftime('%b %Y')}"
    return f"{first.strftime('%b %Y')}–{last.strftime('%b %Y')}"


def _min_confidence(a: str, b: str) -> str:
    rank = {"low": 0, "medium": 1, "high": 2}
    if rank.get(b, 0) < rank.get(a, 0):
        return b
    return a


def _compute_parsing_confidence(
    transaction_count: int,
    inferred_income: bool,
    parsing_diagnostics: dict | None,
) -> str:
    base = "low" if transaction_count < 4 else ("medium" if transaction_count < 15 or inferred_income else "high")
    if not parsing_diagnostics or transaction_count <= 0:
        return base

    mode_counts = parsing_diagnostics.get("modeCounts") if isinstance(parsing_diagnostics, dict) else None
    text_count = int(mode_counts.get("Text", 0)) if isinstance(mode_counts, dict) else 0
    dedupe_dropped = int(parsing_diagnostics.get("dedupeDropped", 0)) if isinstance(parsing_diagnostics, dict) else 0
    rejected_rows = parsing_diagnostics.get("rejectedRows") if isinstance(parsing_diagnostics, dict) else None
    rejected_total = sum(int(v) for v in rejected_rows.values()) if isinstance(rejected_rows, dict) else 0

    if rejected_total / transaction_count >= 0.25:
        base = _min_confidence(base, "low")
    if dedupe_dropped / transaction_count >= 0.25:
        base = _min_confidence(base, "low")
    if text_count / transaction_count >= 0.6:
        base = _min_confidence(base, "medium")
    if text_count / transaction_count >= 0.85:
        base = _min_confidence(base, "low")

    return base


def compute_insights(transactions: list[dict], parsing_diagnostics: dict | None = None) -> dict:
    if not transactions:
        return build_empty_diagnosis_payload(0, parsing_diagnostics=parsing_diagnostics)

    df = pd.DataFrame(transactions)
    expense_df = df[df["type"] == "debit"].copy()
    income_df = df[df["type"] == "credit"]

    if len(transactions) < 4:
        return build_empty_diagnosis_payload(len(transactions), parsing_diagnostics=parsing_diagnostics)

    total_income = float(income_df["amount"].sum()) if not income_df.empty else 0.0
    total_expense = float(expense_df["amount"].sum()) if not expense_df.empty else 0.0
    statement_type = infer_statement_type(income_df, expense_df)
    inferred_income = False
    assumptions: list[str] = []

    if total_expense > 0 and total_income < total_expense * 0.1:
        inferred_income = True
        total_income = total_expense * 2.5
        assumptions.append(
            "Income was estimated because the statement looked like a credit-card or expense-only statement without salary credits."
        )

    saved = total_income - total_expense
    savings_rate = round((saved / total_income) * 100) if total_income > 0 else 0

    cat_group = (
        expense_df.groupby("category")["amount"]
        .sum()
        .reset_index()
        .sort_values("amount", ascending=False)
    )

    breakdown = []
    biggest_leak = None
    healthy_pct = {"Food": 20, "Shopping": 15, "Transport": 10, "Entertainment": 5, "Education": 5}
    leak_candidates: list[dict] = []

    for _, row in cat_group.iterrows():
        pct = round((row["amount"] / total_expense) * 100) if total_expense > 0 else 0
        cat = row["category"]
        amt = round(float(row["amount"]), 2)
        breakdown.append({"category": cat, "amount": amt, "pct": pct})

        healthy = healthy_pct.get(cat)
        if healthy is None:
            continue
        potential = round(amt - (total_expense * healthy / 100), 2)
        if pct > healthy and potential > 0:
            leak_candidates.append({
                "category": cat,
                "amount": amt,
                "yourPct": pct,
                "healthyPct": healthy,
                "potentialSave": potential,
            })

    if leak_candidates:
        biggest_leak = sorted(
            leak_candidates,
            key=lambda item: (item["potentialSave"], item["yourPct"]),
            reverse=True,
        )[0]

    behavior_insights: list[dict] = []
    behavior_insights.extend(detect_high_frequency_merchants(expense_df))
    behavior_insights.extend(detect_spend_clustering(expense_df))
    behavior_insights.extend(detect_weekend_spending(expense_df))
    behavior_insights.extend(detect_spending_spikes(expense_df, total_expense))

    subscriptions = detect_subscriptions(expense_df)
    whatif = compute_whatif_simulations(breakdown, total_expense)
    score, status, drivers = compute_health_score_v2(
        savings_rate, breakdown, biggest_leak, subscriptions, behavior_insights
    )

    parsing_confidence = _compute_parsing_confidence(len(transactions), inferred_income, parsing_diagnostics)
    score_confidence = "low" if inferred_income or parsing_confidence == "low" else ("medium" if parsing_confidence == "medium" else "high")

    score_reasons = [driver["evidence"] for driver in drivers[:3]]
    if not score_reasons:
        score_reasons = ["The statement was parsed, but there were limited high-signal behaviors to rank."]
    reason = " ".join(score_reasons[:2])

    emergency = {
        "months": None,
        "target": 3,
        "monthlyContribNeeded": None,
        "estimated": inferred_income,
        "unavailableReason": "A trustworthy income figure is needed before estimating runway.",
    }
    if total_expense > 0 and total_income > 0 and not inferred_income:
        cushion_months = min(round(saved / total_expense, 1), 24.0)
        emergency = {
            "months": cushion_months,
            "target": 3,
            "monthlyContribNeeded": max(0, round((3 - cushion_months) * total_expense / 12)),
            "estimated": False,
        }

    n_cats = len(cat_group)
    insights: list[dict] = [
        {"icon": "TX", "text": f"{len(transactions)} transactions across {n_cats} categories", "filter": {"by": "all"}},
    ]
    for bi in behavior_insights[:3]:
        insights.append({"icon": bi["icon"], "text": bi["message"], "filter": _insight_to_filter(bi)})
    if whatif:
        insights.append({"icon": "TIP", "text": whatif[0]["message"], "filter": {"by": "category", "value": whatif[0]["category"]}})
    if not behavior_insights:
        food_rows = expense_df[expense_df["category"] == "Food"]
        if not food_rows.empty:
            insights.append({
                "icon": "FOOD",
                "text": f"{len(food_rows)} food/delivery orders - Rs. {int(food_rows['amount'].sum()):,} total",
                "filter": {"by": "category", "value": "Food"},
            })
    if subscriptions:
        subs_total = sum(s["amount"] for s in subscriptions)
        insights.append({"icon": "SUB", "text": f"{len(subscriptions)} recurring charges - Rs. {int(subs_total):,}/mo", "filter": {"by": "subscription"}})

    for bi in behavior_insights:
        bi["filter"] = _insight_to_filter(bi)

    persona = assign_persona(expense_df, savings_rate, breakdown)
    diagnosis = build_diagnosis_sections(savings_rate, biggest_leak, subscriptions, assumptions, drivers)

    return {
        "period": {"month": derive_period_label(transactions), "bankName": "Statement", "txnCount": len(transactions)},
        "parsingDiagnostics": parsing_diagnostics or {},
        "dataQuality": {
            "statementType": statement_type,
            "transactionCount": len(transactions),
            "parsingConfidence": parsing_confidence,
            "inferredIncome": inferred_income,
            "demo": False,
            "emptyState": False,
        },
        "score": {
            "value": int(score),
            "status": status,
            "reason": reason,
            "reasons": score_reasons,
            "confidence": score_confidence,
        },
        "diagnosis": diagnosis,
        "drivers": drivers,
        "assumptions": assumptions,
        "metrics": {
            "income": round(total_income),
            "expenses": round(total_expense),
            "saved": round(saved),
            "savingsRate": savings_rate,
        },
        "breakdown": breakdown,
        "biggestLeak": biggest_leak,
        "insights": insights,
        "behaviorInsights": behavior_insights,
        "whatIf": whatif,
        "subscriptions": subscriptions,
        "emergency": emergency,
        "persona": persona,
    }


if app is not None and StreamingResponse is not None and File is not None:
    @app.post("/api/parse")
    async def parse_statement(request: Request, file: UploadFile = File(...)):
        from fastapi.responses import JSONResponse
        client_ip = request.client.host if request.client else "unknown"
        if _is_rate_limited(client_ip):
            logger.warning("Rate limit hit for ip=%s", client_ip)
            return JSONResponse(status_code=429, content={"error": "Too many requests. Please wait a moment before trying again."})

        MAX_SIZE = 20 * 1024 * 1024  # 20 MB
        content = await file.read()

        if len(content) > MAX_SIZE:
            logger.warning("Rejected oversized upload from %s: %d bytes", client_ip, len(content))
            return JSONResponse(status_code=413, content={"error": "File too large. Maximum size is 20 MB."})

        if not (file.content_type == "application/pdf" or (file.filename or "").lower().endswith(".pdf")):
            logger.warning("Rejected non-PDF upload from %s: content_type=%s", client_ip, file.content_type)
            return JSONResponse(status_code=415, content={"error": "Only PDF files are supported."})

        logger.info("Parse request: file=%s size=%d ip=%s", file.filename, len(content), client_ip)

        async def generate():
            def sse(data): return f"data: {json.dumps(data)}\n\n"

            yield sse({"type": "progress", "pct": 10, "message": "Reading your statement…"})
            await asyncio.sleep(0.6)

            yield sse({"type": "progress", "pct": 30, "message": "Detecting format…"})
            await asyncio.sleep(0.4)

            diagnostics: dict = {}
            try:
                transactions = extract_transactions_from_pdf(content, diagnostics=diagnostics)
            except Exception as e:
                logger.error("PDF extraction failed for %s: %s", file.filename, e)
                yield sse({"type": "error", "error": f"Could not read PDF: {e}"})
                return

            yield sse({"type": "progress", "pct": 55, "message": f"Found {len(transactions)} transactions"})
            await asyncio.sleep(0.5)
            if len(transactions) == 0:
                logger.warning("Zero transactions extracted from %s", file.filename)
                yield sse({"type": "insight", "icon": "!", "text": "We could not extract enough reliable transactions to score this statement."})
                await asyncio.sleep(0.5)
                yield sse({"type": "done", "data": build_empty_diagnosis_payload(0, parsing_diagnostics=diagnostics), "transactions": []})
                return

            cats: dict[str, int] = {}
            for t in transactions:
                cats[t["category"]] = cats.get(t["category"], 0) + 1

            for cat, count in sorted(cats.items(), key=lambda x: x[1], reverse=True)[:3]:
                yield sse({"type": "insight", "icon": "🔍", "text": f"{count} {cat} transactions"})
                await asyncio.sleep(0.7)

            yield sse({"type": "progress", "pct": 80, "message": "Building a trustworthy health check..."})
            await asyncio.sleep(0.5)

            data = compute_insights(transactions, parsing_diagnostics=diagnostics)

            # Content-based bank detection takes priority; filename is fallback
            content_bank = diagnostics.get("detectedBank")
            if content_bank:
                data["period"]["bankName"] = content_bank
                logger.info("Bank detected from content: %s", content_bank)
            else:
                fname = file.filename or ""
                fname_lower = fname.lower()
                bank_from_fname = detect_bank_from_text(fname_lower)
                if bank_from_fname:
                    data["period"]["bankName"] = bank_from_fname

            if data.get("dataQuality", {}).get("inferredIncome"):
                yield sse({"type": "insight", "icon": "i", "text": "Income was estimated because this looks like an expense-only statement."})
                await asyncio.sleep(0.3)

            logger.info("Parse complete: file=%s txns=%d score=%s", file.filename, len(transactions), data.get("score", {}).get("value"))
            yield sse({"type": "progress", "pct": 100, "message": "Done!"})
            await asyncio.sleep(0.3)

            yield sse({"type": "done", "data": data, "transactions": transactions})

        return StreamingResponse(generate(), media_type="text/event-stream")


    @app.post("/api/recompute")
    async def recompute_statement(payload: dict):
        transactions = payload.get("transactions", [])
        return compute_insights(transactions)


    # Server-side CAPTCHA challenge store: token -> (num1, num2, expires_monotonic)
    _challenges: dict[str, tuple[int, int, float]] = {}
    _CHALLENGE_TTL = 600  # 10 minutes

    @app.get("/api/challenge")
    async def get_challenge():
        now = time.monotonic()
        expired = [t for t, (_, _, exp) in list(_challenges.items()) if now > exp]
        for t in expired:
            _challenges.pop(t, None)
        num1 = random.randint(2, 9)
        num2 = random.randint(2, 8)
        token = secrets.token_urlsafe(16)
        _challenges[token] = (num1, num2, now + _CHALLENGE_TTL)
        return {"token": token, "num1": num1, "num2": num2}

    @app.post("/api/suggest")
    async def capture_suggestion(payload: dict):
        email = str(payload.get("email", "")).strip()
        concern = str(payload.get("concern", "")).strip()
        token = str(payload.get("challengeToken", ""))
        answer = int(payload.get("answer", -1))

        # 1. Server-side CAPTCHA verification
        challenge = _challenges.pop(token, None)
        if challenge is None:
            return {"success": False, "error": "CAPTCHA challenge expired or invalid. Please refresh and try again."}
        num1, num2, expires = challenge
        if time.monotonic() > expires:
            return {"success": False, "error": "CAPTCHA challenge expired. Please refresh and try again."}
        if num1 + num2 != answer:
            return {"success": False, "error": "CAPTCHA answer incorrect. Please try again."}

        if not email or not concern:
            return {"success": False, "error": "Email and Concern fields cannot be blank."}

        if len(email) > 254:
            return {"success": False, "error": "Email address is too long."}
        if len(concern) > 2000:
            return {"success": False, "error": "Concern text must be 2,000 characters or fewer."}

        # 2. Log Suggestion Locally
        suggestion_entry = {
            "timestamp": datetime.now().isoformat(),
            "email": email,
            "concern": concern,
        }

        suggestions_file = os.environ.get("SUGGESTIONS_FILE", "suggestions.json")
        try:
            existing: list = []
            if os.path.exists(suggestions_file):
                try:
                    with open(suggestions_file, "r", encoding="utf-8") as f:
                        existing = json.load(f)
                except Exception:
                    existing = []
            existing.append(suggestion_entry)
            tmp = suggestions_file + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(existing, f, indent=2)
            os.replace(tmp, suggestions_file)
        except Exception as e:
            logger.warning("Could not write to %s: %s", suggestions_file, e)

        # 3. Optional Resend Integration
        api_key = os.environ.get("RESEND_API_KEY")
        if api_key:
            import urllib.request
            import urllib.parse
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            email_payload = {
                "from": "FixMyFinance <onboarding@resend.dev>",
                "to": [os.environ.get("ADMIN_EMAIL", "admin@fixmyfinance.app")],
                "subject": "New Suggestion Received",
                "html": f"""
                <h3>New FixMyFinance Feedback</h3>
                <p><strong>From:</strong> {email}</p>
                <p><strong>Concern/Suggestion:</strong></p>
                <blockquote style="border-left: 4px solid #2F2FE4; padding-left: 12px; font-style: italic; background: #f8f9fc; padding: 10px;">
                    {concern.replace("\n", "<br/>")}
                </blockquote>
                <p style="font-size: 11px; color: #666; margin-top: 15px;">Received locally on device at {datetime.now().strftime("%d %b %Y %H:%M")}</p>
                """
            }
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(email_payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req) as resp:
                    resp.read()
            except Exception as e:
                logger.warning("Resend email failed: %s", e)

        return {"success": True, "message": "Suggestion captured successfully."}



if __name__ == "__main__":
    if uvicorn is not None:
        uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
