# FixMyFinance — UI Specification

> A reference document to hand to engineering alongside the PRD. It describes what the UI is, how it behaves, what components exist, what states they have, and what each screen needs to render. Paired with the wireframes in `FixMyFinance Wireframes.html`.

---

## 1. Product in one paragraph

FixMyFinance is a **money‑diagnosis tool**. A user uploads a bank statement, and within ~30 seconds they get a plain‑English report of where their money actually went, what's wrong with it, and what to do. It is not a tracker, not a budgeting app, not a bank. It is a single‑session diagnostic. No login. No data stored. Mobile‑first, desktop supported.

**Primary job of the UI:** answer *"where is my money going wrong?"* in under 5 seconds once the report loads.

---

## 2. Design principles

1. **Clarity over completeness.** Every screen can skip non‑essential detail.
2. **Emotion over data density.** Big numbers, short sentences, not dashboards.
3. **Diagnosis over tracking.** This is a one‑time checkup, not a ledger.
4. **Privacy is a feature.** "Runs on your device" is shown, not hidden in footer copy.
5. **Never shame.** Copy is direct but neutral. "You spent 42% on food" — not "You overspent".
6. **Minimum input, maximum insight.** One upload, no forms.

---

## 3. Tech assumptions (for eng)

* **Stack:** any modern web framework. Wireframes are vanilla HTML/CSS; implementation can be React/Vue/Svelte + Tailwind.
* **Processing:** statement parsing happens **client‑side**. No file is uploaded to a server. If a server call is ever needed (e.g. OCR for scanned images), it must be stateless and delete input on response.
* **Persistence:** none by default. Only ephemeral session state. A "save my report" feature is out of scope for v1.
* **Responsive breakpoints:**
  * Mobile: `< 640px` (primary)
  * Tablet: `640–1024px`
  * Desktop: `> 1024px`
* **Min tap target:** 44×44px on mobile.
* **Supported file types:** PDF, CSV, PNG/JPG (image of e‑statement), ZIP containing any of the above. Max 20MB.

---

## 4. Design tokens

### 4.1 Color

| Token | Hex | Use |
|---|---|---|
| `--blue` | `#2F2FE4` | Primary CTA, active states, sliders, links, "you save" numbers |
| `--indigo` | `#162E93` | Secondary headings, supporting text |
| `--navy` | `#1A1953` | Muted ink, dark subheads |
| `--ink` | `#080616` | Primary text, hero cards, dark mode base |
| `--paper` | `#FBFAF5` | Default background |
| `--paper-2` | `#F3F1E8` | Subtle card background |
| `--paper-3` | `#EBE8DC` | Dividers, gauge tracks |
| `--ok` | `#2B9348` | Healthy / income / positive |
| `--warn` | `#E8A54B` | Needs work / food category |
| `--risk` | `#D1324B` | Critical / expenses / biggest leak |
| `--ok-soft` | `#D9F0C6` | Healthy surfaces |
| `--warn-soft` | `#FFE9C2` | Warning surfaces |
| `--risk-soft` | `#FFD9DE` | Risk surfaces |

**Category colors** (for chips, donut slices — fixed mapping):

| Category | Hex |
|---|---|
| Food | `#E8A54B` |
| Shopping | `#8A5CF6` |
| Transport | `#3BA8C6` |
| Bills | `#D1324B` |
| Entertainment | `#E457A5` |
| Income / Savings | `#2B9348` |
| Salary | `#162E93` |
| Other | `#6a6a6a` |

Status (ok / warn / risk) colors are reserved for diagnosis. Never use red/amber decoratively.

### 4.2 Typography

| Role | Family | Weights | Use |
|---|---|---|---|
| Display / emotive | Kalam (fallback Caveat) | 400, 700 | Headlines, questions, friendly copy, persona title |
| UI / body | Inter | 400, 500, 600, 700, 800 | Body text, numbers, form controls, buttons |
| Numerical detail | JetBrains Mono | 400, 500 | Dates, small amounts, transaction metadata |

**Rules**
* All **money amounts** are Inter (never Kalam). Numbers must read as real.
* All **dates** are JetBrains Mono, uppercased, tracked.
* Headline copy is Kalam. Use 28–58px on desktop, 22–34px on mobile.
* Body is Inter 13–16px.
* Minimum body size: 12px on mobile.

### 4.3 Spacing & radius

* 8‑point spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 56, 72`.
* Card radius: `12–14px`.
* Button radius: `999px` (full pill).
* Phone frame radius: `28px` inner, `36px` outer.

### 4.4 Elevation

Cards use a hard offset shadow (`3px 3px 0 rgba(8,6,22,0.08)`) for a "paper" look — not Material elevation. Alarming cards use a red‑tinted version.

---

## 5. Reusable components

| Component | Purpose | Variants / states |
|---|---|---|
| `<Button>` | CTA | `primary` (blue), `ghost` (outlined), sizes `sm` / `default` / `wide` |
| `<Chip>` | Category tag | One per category color; with/without dot; `editable` shows ▾ |
| `<StatusPill>` | Health label | `ok` / `warn` / `risk` |
| `<Card>` | Content container | `default`, `alert` (risky), `hero-ink` (dark), `hero-blue` (brand) |
| `<MetricCard>` | Big number + label | Variant: income/expense/save |
| `<Donut>` | Spending breakdown | Fed by category %s + legend |
| `<Gauge>` | Linear progress meter | `ok` / `warn` / `risk` fill color |
| `<Slider>` | What‑if control | `lbl + track + thumb + value`, live update |
| `<Step>` | Processing step | `pending` / `active` (animated ellipsis) / `done` (checkmark) |
| `<TxnRow>` | Transaction line | Mobile card or desktop table row; flags: `recurring`, `uncertain`, `income` |
| `<CategoryPicker>` | Bottom sheet / dropdown | Grid of categories + "re‑tag future" checkbox |
| `<Dropzone>` | Upload target | `idle` / `dragover` / `parsing` / `success` / `error` |
| `<StickyCTA>` | Bottom action bar | Mobile only |
| `<StoryCard>` | Swipeable insight | Full‑bleed dark; used in the Story variant of Insights |

### Component states to design & build

Every interactive component needs:
* **default / hover / focus‑visible / active / disabled / loading**
* Focus ring: 2px `--blue` outer + 2px paper offset.
* Skeletons for all cards on Insights page (shown while parsing completes).

---

## 6. Screens

Each screen lists: **goal · layout · behavior · data needed · edge cases · wireframe reference.**

### 6.1 Landing

**Goal:** emotional hook in under 5 seconds; one clear CTA.

**Mobile layout**
* Wordmark at top (Kalam, blue).
* Headline (Kalam, 28–34px): *"Where did your salary go last month?"*
* Subtext (Kalam, 15–17px): *"Upload your bank statement. Get answers in 30 seconds."*
* Primary CTA (blue, pill, full width): **Analyze My Money →**
* Trust strip (tiny, muted): `🔒 No login · No data stored · Works with all banks`

**Desktop layout**
* Two columns. Left: headline + CTA + trust strip. Right: floating "report preview" stack — 3 rotated report cards teasing the payoff (Health Score, Biggest Leak, Donut). Below the fold: 4‑step horizontal strip (Upload → Read → Diagnose → Forget).

**Behavior**
* CTA navigates to `/upload`.
* "See sample report" secondary button (desktop only) routes to `/report?demo=true` which pre‑loads fixture data.

**Data:** none.

**Edge cases**
* Desktop preview cards must never block the CTA at narrower widths — collapse to single column below 900px.

**Wireframe ref:** Landing tab · variations A/B/C and desktop A.

---

### 6.2 Upload

**Goal:** zero friction. File in 1 tap.

**Mobile layout**
* Header: back arrow + "Upload statement" + step indicator (1 of 3).
* Headline: *"Pick your file"* / *"Drop it here."*
* Dropzone (dashed border, ~220px tall) with cloud icon, "Drop file here" / "tap to browse", and format chips (PDF · CSV · Image).
* Below dropzone: 2×2 grid of file‑type picker buttons (PDF / CSV / Camera / Image) as an alternative for mobile.
* "Try with sample data" ghost button.
* Trust card: *"🔒 Processed on your device. Nothing is uploaded."*

**Desktop layout**
* Two columns. Left: large dropzone (~320px tall, 2.5px dashed). Right: three stacked cards — *Privacy*, *What we look for* (5‑item list), *New here?* (ink card).

**Post‑pick state** (shown before parsing begins)
* File card: icon + filename + size + detected txn count + remove button.
* Validation card: green "✓ Looks like a valid bank statement" OR red "⚠ We couldn't read this — try a different export".
* Toggles: `Include recurring payments`, `Detect late fees` (both default on).
* Primary CTA: **Analyze →**

**Behavior**
* Drag‑over: border turns solid blue, background tints `--blue-soft`.
* On file selection, client parses → shows post‑pick state. Parse failures return to dropzone with an error banner.
* Bank detection is automatic; if detected, echo it ("Looks like HDFC"). Never ask the user.

**Data:** parsed transaction list with merchant, amount, date, mode, tentative category + confidence.

**Edge cases**
* File > 20MB → inline error, no retry loop.
* Password‑protected PDF → prompt for password in a modal, decrypt client‑side.
* Scanned image → OCR pass; show a one‑time notice "This might take a bit longer".
* No transactions found → error state with "Try a different file" and link to export help.

**Wireframe ref:** Upload tab · A/B/C and desktop.

---

### 6.3 Processing

**Goal:** build trust while parsing. No spinner.

**Primary variant (ship this):** *Live tease*
* Headline: *"Finding things…"*
* Progress gauge (blue, horizontal, 0–100%).
* List of discovered findings **appearing as they resolve**, each as a card with an icon + "found" label + the finding (e.g. "18 food orders", "7 subscriptions, ₹2,840/mo", "₹650 in late fees").
* Pending card at the bottom with dashed border, reduced opacity: "calculating health score".
* ETA line: "~10 seconds left".

**Fallback variant:** 5‑step list with animated ellipsis on the active step — use on slow devices where findings can't surface incrementally.

**Desktop layout**
* Horizontal step timeline (5 dots along a track), plus two columns below: Findings live‑feed on the left, rotating *Did you know* card on the right.

**Behavior**
* All findings are **real**, surfaced as soon as the parser resolves them. If parsing completes in under 3 seconds, still keep the user on this screen for a 1.5s minimum to avoid jarring transitions.
* Route to `/review` (or straight to `/report` if no edits are needed — see below) when complete.

**Data:** stream of partial parse results.

**Edge cases**
* Parser failure mid‑flight → show the last resolved findings as a summary + "We couldn't finish reading this. Try again?" CTA.

**Wireframe ref:** Processing tab · variation C and desktop.

---

### 6.4 Transaction Review (optional stop)

**Goal:** let the user correct obvious miscategorizations. Must be skippable.

**Mobile layout — default (card list)**
* Header: back arrow · step 3 of 3.
* Count: *"147 transactions"*.
* Subhead: *"Tap any category to fix it."*
* Horizontal category filter row (chips, scrollable).
* Day‑grouped txn cards, each showing: merchant · category chip (with ▾) · amount · mode.
* Low‑confidence rows get a dashed chip border + tinted background + inline hint "↑ tap to change category".
* Recurring rows carry a 🔁 chip.
* **Sticky CTA** at bottom: *"142/147 categorized" · Show insights →*.

**Mobile alt — by category**
* Same screen, different grouping. Collapsible category blocks.

**Category edit (bottom sheet)**
* Drag handle + txn summary.
* Category grid (2 cols), current selection highlighted blue.
* Checkbox: *"Also re‑tag future Amazon as Shopping"* — default **on**.
* Save CTA.

**Desktop layout**
* 3‑pane: left sidebar (category list with counts + filters: "Show recurring only", "Hide under ₹100", "Flagged only"), center table, right detail drawer.
* Table columns: Date · Merchant · Category · Amount · Type.
* Uncertain rows have amber row tint.
* Detail drawer shows amount + category select + "Re‑tag future X" checkbox + confidence line ("We're 68% sure this is Shopping").

**Behavior**
* User can skip this screen entirely via CTA.
* Editing a single txn with "re‑tag future" checked updates all matching merchants instantly.
* Uncertain rows are counted and highlighted in a filter shortcut.

**Data:** transaction list with editable category; a per‑txn confidence score; persisted only for the current session.

**Edge cases**
* Very short statements (< 10 txns) should skip the bulk filter row and show a single flat list.
* > 500 txns → virtualize the list.

**Wireframe ref:** Transactions tab · A/B/C and desktop.

---

### 6.5 Insights Dashboard ★

**Goal:** the money diagnosis. First impression = health score. Second impression = biggest leak. Everything else supports those two.

**Mobile canonical layout** (top → bottom, single scroll)

1. **Header** — month + bank, one‑line: *"Your money diagnosis"*.
2. **Health Score card** (hero‑ink, dark):
   * Big number out of 100 (Inter 800, ~56px).
   * Status pill: `Healthy` / `Needs work` / `Critical`.
   * One‑line explanation (Kalam) — the *one* thing most wrong, in plain English.
   * Mini gradient bar visualizing score position.
3. **Metrics row** (3 mini cards): Income · Expenses · Saved. Each shows abbreviated (76.5k) + exact (₹76,500).
4. **Donut + legend** — "Where it went". 6 category slices max; "Other" absorbs the rest.
5. **Biggest Money Leak card** (alert, red):
   * Headline: *"Food is eating ₹18,400/month."*
   * 3 stats row: YOU % → HEALTHY % → Save up to ₹X/mo.
   * Non‑dismissable.
6. **Smart Insights stack** — N cards (4–8 is the sweet spot), each an emoji + one sentence. Examples:
   * *"You ordered food 18 times."*
   * *"Biggest spend day: Sat Oct 4 — ₹4,200."*
   * *"You paid ₹650 in late fees."*
   * *"68% of food orders came after 10 PM."*
7. **What‑If Simulator** — 3 sliders (Food / Shop / Subs by default, extensible). Each slider is a *% reduction*. Footer shows live `You save ₹X/mo` and `In a year ₹X`.
8. **Subscriptions card** — list of detected recurring payments with name, amount, unused‑days tag. Footer: `Total / month ₹X`. "Unused" subs get red struck‑through price.
9. **Emergency Cushion card** — months‑of‑expenses the user could survive. Big number, gauge, target note. Secondary card suggests monthly contribution to hit 3 months in a year.
10. **Persona card** (blue, shareable) — illustration, persona title, 1‑line explanation, **Share** + **See full report** buttons. Persona copy varies by tone setting (playful / gentle / blunt).
11. **Footer** — reassurance: *"Your statement was not saved. Reload to start over."*

**Desktop layout**
* Top strip (dark, full width): Health Score (left, hero‑sized) + 3 metrics (Income · Expenses · Saved).
* Full‑width red **Biggest Leak** banner underneath, 3 stats inline.
* Body in 3 columns:
  * **Col 1:** Donut + Smart Insights.
  * **Col 2:** What‑If Simulator (in a blue card) + Subscriptions.
  * **Col 3:** Emergency Cushion + Persona card.

**Behavior**
* Health score is computed client‑side (see Appendix A).
* Donut slices are ordered largest → smallest; any slice < 4% rolls into "Other".
* What‑If sliders update the bottom readout in real time, debounced at 30fps. No submit button.
* Persona is chosen from a fixed list based on category dominance (see Appendix B).
* Share button on persona card opens native share sheet (mobile) or copies a pre‑rendered PNG link (desktop) — for v1, generate the PNG client‑side via canvas.
* Print view: desktop dashboard renders to a single‑page PDF via `window.print()` using a print stylesheet.

**Data needed**
```ts
{
  period: { month: string, bankName: string, txnCount: number },
  score: { value: 0..100, status: 'healthy' | 'needs_work' | 'critical', reason: string },
  metrics: { income: number, expenses: number, saved: number, savingsRate: number },
  breakdown: { category: string, amount: number, pct: number }[],
  biggestLeak: { category: string, amount: number, yourPct: number, healthyPct: number, potentialSave: number },
  insights: { icon: string, text: string }[],       // 4–8
  subscriptions: { name: string, amount: number, unusedDays?: number }[],
  emergency: { months: number, target: 3 | 6, monthlyContribNeeded: number },
  persona: { key: string, titles: { playful, gentle, blunt: string }, subs: { ... } }
}
```

**Edge cases**
* < 10 transactions → hide donut + persona, show a "not enough data" banner instead.
* No clear biggest leak (all categories < 25%) → replace the red card with a neutral "You're well balanced" card.
* Negative savings (spent > income) → savings metric goes red, emergency gauge empty with copy "You're at zero runway".
* User edits categories *after* seeing report → score, donut, simulator, persona all recompute live.

**Wireframe ref:** Insights tab · all variations + desktop.

---

## 7. Copywriting rules

* **Voice:** smart friend, not a bank.
* **Tense:** present and past ("You spent", "You saved"). Never aspirational ("You will save").
* **Length:** headlines ≤ 7 words, body sentences ≤ 18 words.
* **Never say:** *financial wellness, expenditure, fiscal, optimize, utilize, overspend*.
* **Say instead:** *your money, what you spent, where it went, cut back, save*.
* **Persona tones** — match the user's tweak preference:
  * *Playful*: "The Foodie 🍜 — you spend like a food‑court mayor."
  * *Gentle*: "You love good food — 4 in 10 rupees went to eating out."
  * *Blunt*: "Food is eating your salary — 42% of your spend."

---

## 8. Interaction & motion

* **Entry transitions:** findings cards fade + slide up (300ms, ease‑out). Insights cards stagger by 60ms.
* **Sliders:** 1:1 tracking, no debounce on visuals; debounce only the computed "you save" at 50ms.
* **Persona share:** 400ms press‑scale animation on the button before sheet opens.
* **Avoid:** skeumorphic animations, parallax, bouncy springs, content‑shift on hover.
* **Respect** `prefers-reduced-motion` — all transitions ≤ 100ms or none.

---

## 9. Accessibility

* All text must clear WCAG AA on its background. White‑on‑`--blue` passes; white‑on‑`--warn` does not — use `--ink` instead.
* Every icon is decorative (status is conveyed by color **and** label).
* Sliders must be reachable by keyboard (`←` / `→`) and screen readers (labeled `aria-label="Reduce food spending by X%"`).
* Category chips are `button` elements with `aria-expanded` where they open a picker.
* Sticky CTA bar must not trap focus.
* Focus ring always visible on keyboard navigation (never `outline: none`).

---

## 10. Privacy surfaces

Every screen carries a privacy cue appropriate to its moment:
* **Landing:** tiny trust strip below CTA.
* **Upload:** a dedicated privacy card; the line *"Processed on your device"* is 13px, not footnote.
* **Processing:** no special cue — the live findings prove the work is local.
* **Review / Insights:** footer line *"Your statement was not saved. Reload to start over."*

Never display a "trusted by" logo strip. The value prop is "we don't know who you are".

---

## 11. Out of scope for v1

* User accounts, multi‑month trends, bank connections (Plaid‑style).
* Household / couple mode.
* Custom categories (allow rename only, no tree editing).
* Goal tracking, alerts, notifications.
* Multi‑currency. INR only in v1.

---

## 12. Appendix A — Health Score formula (first draft)

Out of 100. Engineering can tune weights; UI needs to display the score + single‑line reason.

| Factor | Weight | Ideal |
|---|---|---|
| Savings rate | 30 | ≥ 30% |
| Biggest category share | 25 | ≤ 25% |
| Emergency cushion (months) | 20 | ≥ 3 |
| No late fees | 10 | 0 |
| Subscription load | 10 | ≤ 8% of income |
| Night‑spend ratio | 5 | ≤ 20% |

Status bands: 80+ Healthy · 50–79 Needs work · <50 Critical.

Reason line = the single worst factor, expressed in user language.

---

## 13. Appendix B — Persona taxonomy

Persona is chosen by which category most exceeds its healthy band. Non‑exclusive list:

| Key | Trigger | Title (gentle) |
|---|---|---|
| `foodie` | Food > 25% | You love good food |
| `shopper` | Shopping > 20% | You're a shopper |
| `commuter` | Transport > 15% | You live on the road |
| `streamer` | Entertainment / subs > 10% | Subscriptions are your weakness |
| `bill-heavy` | Bills > 40% | Bills run your month |
| `cautious` | Savings rate > 40% & no outliers | You're quietly winning |
| `tight` | Savings rate < 0% | You're running on empty |

Each persona has 3 copy variants (playful / gentle / blunt) and an illustration slug.

---

## 14. Open questions for product

* **Returning user** — we assume no login; what does a second visit look like? (Just re‑upload? Remember persona?)
* **Sample report depth** — how "fake" can the demo data look before users distrust it?
* **Persona artwork** — placeholder pattern in wireframes; real illustrations to be commissioned.
* **Print / export** — PDF of the dashboard, or a PNG of just the persona card? Or both?
* **Late‑fee recovery** — do we surface a "call your bank" script as an insight, or keep the tool read‑only?

---

*File paired with:* `FixMyFinance Wireframes.html` (lo‑fi wireframes, all screens, mobile + desktop, tweakable).
