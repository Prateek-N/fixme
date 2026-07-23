from datetime import datetime

import pandas as pd

from merchant_utils import extract_merchant_key


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
