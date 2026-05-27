<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wallet.svg" alt="FixMyFinance Logo" width="80" height="80">
  <h1>FixMyFinance</h1>
  <p><b>Your completely private, local-first financial statement analyzer & health dashboard.</b></p>
  <p>
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-green?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Privacy-100%25%20Local-orange?style=for-the-badge&logo=shield" alt="Local First" />
  </p>
</div>

<br/>

## 🌟 What We Have Created

**FixMyFinance** is an insightful, fast, and entirely local financial diagnostic tool. We've built an application that lets you drop in your PDF bank statements and instantly receive real-time, deep insights into your spending habits—all without your data ever leaving your machine!

### ✨ Key Features

- **🛡️ Privacy First:** Your data never goes to a cloud server. The Python engine parses your PDFs locally on your hardware.
- **⚡ Real-Time Insights:** Watch your statement get processed in real-time. Our Server-Sent Events (SSE) system streams the findings to your screen as they are identified.
- **📊 Smart Categorization:** Automatic identification of spending in Food, Shopping, Transport, Bills, and more.
- **🚨 Leak Detection:** Instantly flags overspending relative to industry-standard healthy financial habits.
- **🎨 Visually Appealing UI:** A beautiful, responsive, desktop-first single-page application built with React, Zustand, and Framer Motion for buttery-smooth animations.

---

## 🚀 How to Use

1. **Launch the App:** Ensure both the backend and frontend are running.
2. **Upload a Statement:** On the landing or upload page, drag and drop your bank statement PDF (or select it).
3. **Watch It Process:** Sit back as the processing page gives you an engaging, live stream of what the engine is discovering.
4. **Discover Your Insights:** Review your financial health score, your total income vs. expenses, and your biggest financial leaks.

---

## 🛠️ How to Install

You will need two terminal windows open to run both the backend API and the frontend application.

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.9+ recommended)

### 1️⃣ Set up the Backend (FastAPI + PDF processing)
Open a terminal in the project root directory (`fixmyfinance`):

```bash
# 1. Create a virtual environment (optional but recommended!)
python -m venv .venv

# 2. Activate it
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# 3. Install required Python packages
pip install fastapi uvicorn pdfplumber pandas python-multipart
```

### 2️⃣ Set up the Frontend (React + Vite)
Open another terminal in the project root directory:

```bash
# Install NPM dependencies
npm install
```

---

## 🏁 How to Run

After installing all the dependencies, you can start the development servers.

### Start the Backend
In your backend terminal (with the virtual environment activated), run:
```bash
uvicorn main:app --reload
```
> The API will now listen on `http://127.0.0.1:8000`

### Start the Frontend
In your frontend terminal, run:
```bash
npm run dev
```
> Now open your browser and navigate to **`http://localhost:5173`** and experience FixMyFinance!

*(Note: The frontend is configured to automatically proxy `/api` requests to the local backend, so you won't face any CORS issues!)*

---

<div align="center">
  <p>Built as a privacy-first web application. Your money. Your machine. Your business.</p>
</div>
