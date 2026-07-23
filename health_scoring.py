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
