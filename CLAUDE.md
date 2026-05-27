# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FixMyFinance** is a local-first, privacy-focused financial statement analyzer. Users upload PDF bank statements; a Python backend parses and categorizes transactions, then streams results to a React frontend via Server-Sent Events (SSE).

## Running the App

Requires two processes running simultaneously:

**Backend** (Python, activate venv first):
```bash
python -m venv .venv          # first-time setup
.venv\Scripts\activate        # Windows
pip install fastapi uvicorn pdfplumber pandas python-multipart
uvicorn main:app --reload     # listens on http://127.0.0.1:8000
```

**Frontend** (React/Vite):
```bash
npm install     # first-time setup
npm run dev     # listens on http://localhost:5173
```

The Vite dev server proxies `/api/*` → `http://127.0.0.1:8000`, so no CORS configuration is needed during development.

## Build & Lint

```bash
npm run build    # tsc -b && vite build  (output to dist/)
npm run lint     # eslint
npm run preview  # preview production build
```

**Backend smoke test** (no server needed — runs directly against a PDF file):
```bash
python test_extract.py   # requires "Test Pdf.pdf" in project root
```

## Architecture

### Data Flow
1. User drops a PDF on the Upload screen
2. `POST /api/parse` (multipart) → FastAPI in `main.py`
3. Backend parses the PDF with `pdfplumber`, categorizes transactions, computes financial insights, and **streams SSE events** back: `progress`, `insight`, and `done` event types
4. Frontend (`src/screens/Upload.tsx`) reads the SSE stream via the Fetch API (`ReadableStream`) and dispatches into Zustand store
5. On `done`, `InsightPayload` is stored in Zustand and the app navigates to the Insights screen after a 1.5s delay

### Frontend Structure
- **Single-page, screen-based routing** — no router library. `App.tsx` renders one of five screens based on `useAppStore.currentScreen`: `landing → upload → processing → insights` (and `review` for the Transactions screen, though it's not wired into the default flow)
- **State** — single Zustand store at `src/store/useAppStore.ts`. Holds the file, raw transactions, parsed `InsightPayload`, live SSE findings, progress, persona tone, theme, and what-if reduction sliders
- **Screens** — `src/screens/`: `Landing`, `Upload`, `Processing`, `Transactions`, `Insights`
- **Components** — `src/components/`: reusable UI primitives (`Button`, `Card`, `Chip`, `Gauge`, `Donut`, `MetricCard`, `Dropzone`, `TxnRow`, `WhatIfSlider`, etc.)
- **Styling** — custom CSS variables in `src/index.css` (light/dark via `data-theme` attribute on `<html>`). No CSS framework. Theme toggle is in `useAppStore.toggleTheme()`. Utility classes: `.hand` (display font), `.mono`, `.sub`, `.row`/`.col`, `.between`
- **Animations** — Framer Motion; icons from `lucide-react`

### Backend Structure (`main.py`)
- **PDF parsers** — `parse_credit_card_table()` (Axis/HDFC CC format: single AMOUNT column with Dr/Cr suffix) and `parse_savings_bank_table()` (separate DEBIT/CREDIT columns). Auto-detected by column headers via `detect_and_parse_table()`. Falls back to regex text extraction when table parsing yields nothing.
- **Categorization** — keyword-based `categorize()` using `CATEGORY_RULES` dict and `MERCHANT_CATEGORY_MAP`. Categories: Food, Shopping, Transport, Bills, Entertainment, Education, Other
- **Insights engine** — computes health score (0–100), savings rate, biggest spending leak vs. healthy benchmark, subscription detection, emergency fund projection, and persona assignment
- **SSE streaming** — `POST /api/parse` returns a `StreamingResponse` with `text/event-stream`. Each `data: {...}\n\n` line is a JSON event
- **Bank name detection** — inferred from the uploaded filename: "axis" → Axis Bank, "hdfc" → HDFC, "sbi" → SBI

### Key Types (defined in `src/store/useAppStore.ts`)
- `Transaction` — `{date, desc, amount, type, category, confidence?, isRecurring?, mode?}`
- `InsightPayload` — full analysis result: `period`, `score`, `metrics`, `breakdown`, `biggestLeak`, `insights`, `subscriptions`, `emergency`, `persona`
- `WhatIfReductions` — slider state for "what if I cut food/shopping/subs by X%"

## Non-Obvious Behaviors

- **Zero-transaction fallback**: If the PDF yields 0 transactions, the backend automatically returns `get_mock_payload()` (demo data) instead of an error. The frontend won't know it's receiving mock data.
- **Upload checkboxes are UI-only**: The "Detect recurring subscriptions" and "Flag late-payment fees" checkboxes on the Upload screen are not passed to the backend — the `handleAnalyze` function sends only the file.
- **Transactions screen is vestigial in current flow**: On the `done` SSE event, `rawTransactions` is set to `[]`. Navigating to the `review` screen (Transactions) shows "No transactions to review". The Transactions screen is only useful if `setRawTransactions` is called before navigation.
- **Credit card income assumption**: When `total_income < total_expense * 0.1` (typical for CC statements which don't include salary deposits), `compute_insights()` synthesizes income as `total_expense * 2.5` — the health score and savings rate are estimates in this case.
- **`computeWhatIfSavings()`** is an exported selector in the store file, not a component hook. Import it alongside `useAppStore`.
- **Persona copy**: `Insights.tsx` contains a hardcoded `PERSONA_COPY` fallback, but the canonical persona titles/subtitles come from `InsightPayload.persona.titles` and `.subs` returned by the backend.
- **Production static files**: The backend mounts `public/` (not `dist/`) as static files at `/app`. After `npm run build`, copy the contents of `dist/` into `public/` for production serving.
