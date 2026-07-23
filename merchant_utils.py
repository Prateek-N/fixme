import re

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


def _match_alias(desc_up: str) -> str | None:
    """Shared scan used by normalize_merchant() and extract_merchant_key() —
    previously duplicated verbatim in both functions."""
    for alias, canonical in _ALIAS_LOOKUP.items():
        if alias in desc_up:
            return canonical
    return None


def normalize_merchant(desc: str) -> str:
    """Resolve known alias variants to their canonical name."""
    desc_up = desc.upper().strip()
    return _match_alias(desc_up) or desc


def extract_merchant_key(desc: str) -> str:
    """Return a stable merchant identifier for grouping purposes."""
    desc_up = desc.upper().strip()
    matched = _match_alias(desc_up)
    if matched:
        return matched
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
