import re

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
