from merchant_utils import normalize_merchant

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

# Single source of truth for "is this a salary/income credit" — previously
# categorize() and the savings-table parser each kept their own independent
# list and had already drifted (e.g. a plain "CREDIT" transfer counted as
# income in the parser but not in categorize()). Merged per product decision.
INCOME_KEYWORDS = [
    "SALARY", "PAYROLL", "PAYMENT RECEIVED", "NEFT", "IMPS", "CREDIT", "REVERSAL",
]

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
    if any(keyword in desc_up for keyword in INCOME_KEYWORDS):
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
