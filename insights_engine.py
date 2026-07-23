import re

import pandas as pd

from behavior_engine import (
    _parse_txn_dates,
    detect_high_frequency_merchants,
    detect_spend_clustering,
    detect_weekend_spending,
    detect_spending_spikes,
    detect_subscriptions,
    compute_whatif_simulations,
    assign_persona,
)
from health_scoring import compute_health_score_v2


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
