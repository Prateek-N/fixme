from main import extract_transactions_from_pdf, compute_insights

with open('Test Pdf.pdf', 'rb') as f:
    content = f.read()

txns = extract_transactions_from_pdf(content)
print(f'Transactions extracted: {len(txns)}')
print('\nSample transactions:')
for t in txns[:10]:
    print(f'  {t["date"]:15} {t["desc"][:35]:35} {t["category"]:12} {t["type"]:6} Rs.{t["amount"]:>10,.2f}')

print('\n--- Analytics ---')
data = compute_insights(txns)
print(f'Health Score : {data["score"]["value"]}/100 ({data["score"]["status"]})')
print(f'Total Expense: Rs.{data["metrics"]["expenses"]:,.2f}')
print(f'Breakdown:')
for b in data['breakdown']:
    print(f'  {b["category"]:15} Rs.{b["amount"]:>10,.2f}  ({b["pct"]}%)')
if data['biggestLeak']:
    bl = data['biggestLeak']
    print(f'Biggest Leak : {bl["category"]} Rs.{bl["amount"]:,.2f} ({bl["yourPct"]}% vs {bl["healthyPct"]}%)')
    print(f'Potential save: Rs.{bl["potentialSave"]:,.2f}')
print('\nInsights:')
for ins in data['insights']:
    print(f'  {ins["icon"]} {ins["text"]}')
