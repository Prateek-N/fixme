<div align="center">

# 💸 FixMyFinance

### *Your personal money doctor — no cloud, no account, no nonsense.*

**Drop a PDF. Get a diagnosis. Fix your finances. 🩺**

<br/>

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-FF6B35?style=for-the-badge&logo=shieldsdotio&logoColor=white)](#)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](.github/workflows/ci.yml)

<br/>

> 🔒 **Your bank statement never leaves your machine.** Everything runs locally — no uploads, no accounts, no cloud.

</div>

---

## ✨ What is FixMyFinance?

FixMyFinance is a **local-first financial statement analyzer** that turns a raw PDF bank or credit card statement into a full money health report in seconds. It streams live results back to your browser as it processes — no waiting, no spinner, no mystery.

Upload once. Walk away knowing exactly where your money is going, what's hurting your score, and what you can do about it. 📊

---

## 🚀 Features at a Glance

### 💰 Money Health Score
A single number (0–100) that tells you exactly how healthy your finances are this month — with drivers, confidence level, and plain-English diagnosis.

### 🔍 Smart Transaction Analysis
- **Auto-categorizes** every transaction: Food 🍜, Shopping 🛒, Transport 🚗, Bills 💡, Entertainment 🎬, Education 📚
- **Detects recurring subscriptions** automatically — no manual tagging
- **Flags spending spikes**, same-day splurges, and weekend overruns
- **Supports Axis Bank, HDFC, SBI** — auto-detected from filename

### 📡 Live Streaming Results
Powered by **Server-Sent Events (SSE)** — watch findings appear in real time as your statement is processed. No page refresh, no polling. ⚡

### 🧪 What-If Simulator
Drag sliders to see exactly how much you'd save per month (and per year) if you cut food / shopping / subscriptions by any percentage. Instant projections, zero commitment. 🎛️

### 📅 Month-Over-Month Dashboard
Import multiple statements and track your score, savings rate, and spending trends across months — all stored privately on your device. 📈

### 🎯 Goal Scorecard
Set your own targets — savings rate %, category spending caps, subscription budget — and see a live hit ✅ / miss ❌ report on every statement.

### 🧠 Spending Persona
Get assigned a spending archetype (Foodie 🍜 / Shopaholic 🛒 / Saver 💰 / Subscriber 📺 / Analyst 🔍) with personalized insights in your preferred tone: Playful, Gentle, or Blunt.

### 🔐 Privacy-First Architecture
- No account required
- No data sent to any server
- All history stored in your browser's localStorage
- Statement files are processed in-memory and discarded

---

## 🖥️ Getting Started

You need **two terminals** running simultaneously.

### 1️⃣ Backend (Python + FastAPI)

```bash
# First-time setup
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install fastapi uvicorn pdfplumber pandas python-multipart

# Start the API server
uvicorn main:app --reload
```

> 📍 API listens on `http://127.0.0.1:8000`

### 2️⃣ Frontend (React + Vite)

```bash
npm install
npm run dev
```

> 📍 App opens at `http://localhost:5173` — Vite proxies `/api/*` to the backend automatically.

---

## 🏗️ Production Deploy

```bash
# Build frontend + copy assets to public/ in one step
npm run deploy

# Then start the backend (serves the built app at /app)
uvicorn main:app
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure for your deployment:

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `localhost:5173` |
| `SUGGESTIONS_FILE` | Path to persist feedback JSON | `suggestions.json` |
| `ADMIN_EMAIL` | Recipient for feedback notifications | `admin@fixmyfinance.app` |
| `RESEND_API_KEY` | Optional — enables email notifications | *(disabled)* |

---

## 🧪 Tests

```bash
# Backend unit tests (11 test cases)
python -m pytest test_diagnosis.py -v

# PDF extraction smoke test (requires Test Pdf.pdf in root)
python test_extract.py
```

CI runs automatically on every push to `main` via GitHub Actions. ✅

---

## 🗂️ Project Structure

```
fixmyfinance/
├── main.py                  # FastAPI backend — parsing, scoring, SSE, endpoints
├── test_diagnosis.py        # Unit tests for the insights engine
├── test_extract.py          # Smoke test for PDF extraction
├── public/                  # Production static files (copy dist/ here)
├── src/
│   ├── App.tsx              # Screen router + error boundary
│   ├── screens/
│   │   ├── Landing.tsx      # Hero / welcome screen
│   │   ├── Upload.tsx       # PDF drop zone + analyze trigger
│   │   ├── Processing.tsx   # Live SSE progress feed
│   │   ├── Insights.tsx     # Full report: score, breakdown, what-if, goals
│   │   ├── Transactions.tsx # Per-transaction editor
│   │   ├── Dashboard.tsx    # Month-over-month history
│   │   └── Goals.tsx        # Set savings & category targets
│   ├── components/          # Reusable UI: Button, Card, Donut, Gauge, etc.
│   ├── store/
│   │   └── useAppStore.ts   # Zustand store — all app state + selectors
│   └── index.css            # Design system: CSS variables, themes, utilities
└── .github/workflows/ci.yml # GitHub Actions CI pipeline
```

---

## 🔒 Security & Reliability

| Protection | Status |
|------------|--------|
| File size limit (20 MB max) | ✅ |
| PDF-only upload enforcement | ✅ |
| Rate limiting (5 req / IP / 60s) | ✅ |
| React error boundary | ✅ |
| 90s SSE timeout with user message | ✅ |
| Atomic suggestions file writes | ✅ |
| Configurable CORS for production | ✅ |
| Structured server logging | ✅ |

---

## 🗺️ How It Works

```
📄 PDF Upload
     ↓
🐍 FastAPI (main.py)
     ↓  pdfplumber extracts tables / text
     ↓  Auto-detects: Credit Card or Bank Account format
     ↓  Categorizes + deduplicates transactions
     ↓  Runs behavioral analysis (spikes, frequency, clustering)
     ↓  Computes health score + persona + what-if scenarios
     ↓  Streams SSE events: progress → insight → done
     ↓
⚛️  React Frontend
     ↓  Reads SSE stream in real time
     ↓  Updates Zustand store → live UI
     ↓  Saves report to localStorage
     ↓
📊 Insights Screen
     → Health score, diagnosis, breakdown
     → What-if simulator, goal scorecard
     → Persona, subscriptions, emergency runway
```

---

## 📸 Screen Tour

| Screen | What you see |
|--------|-------------|
| 🏠 Landing | Hero with value prop + sample report |
| 📤 Upload | PDF dropzone with privacy guarantee |
| ⚡ Processing | Live findings feed as parsing happens |
| 📊 Insights | Full money health report with sliders |
| 📋 Transactions | Edit categories, mark recurring |
| 📅 Dashboard | Month history + goal progress |
| 🎯 Goals | Set your financial targets |

---

## 🤝 Contributing & Feedback

Found a bug or have a suggestion? Use the **Suggestions** button inside the app (top-right navbar) — it supports a math CAPTCHA for spam prevention and optionally notifies the maintainer via Resend email.

---

<div align="center">

**Built with 💙 for people who want to understand their money — not hand it to a cloud.**

*Local. Private. Honest.* 🔐

</div>
