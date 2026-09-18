# AegisGuard — AI-Powered Customer Support Intelligence & Phishing Threat Detection System

Production-style working web application that unifies **AI Customer Support Intelligence** with **Automated Cybersecurity Phishing Threat Detection**.

---

## 1. Problem Statement & Overview

Enterprise customer support desks face millions of incoming interactions (emails, support tickets, chats) daily. Among legitimate support complaints (duplicate billing, order delays, refund requests) lurk sophisticated **phishing attacks**, **lookalike domain scams**, **credential harvesting**, and **2FA/OTP interception** attempts.

AegisGuard analyzes incoming customer interactions to instantly answer:
- **What is the customer saying & requesting?**
- **What is the issue, sentiment, emotion, and priority?**
- **Has the issue been resolved?**
- **Is there a cybersecurity threat (Phishing, Impersonation, Credential Theft, OTP scam)?**
- **What is the calculated risk score (0–100) and recommended SOC action?**

---

## 2. Tech Stack

- **Frontend**: React, Vite, JavaScript, Tailwind CSS, Recharts, Lucide React icons.
- **Backend**: Node.js, Express.js, REST APIs.
- **Database**: SQLite with `better-sqlite3` (WAL mode enabled, portable SQL schema).
- **AI Engine**: Anthropic SDK (`@anthropic-ai/sdk`), Claude 3.5 Sonnet (`claude-sonnet-4-6`) + Fallback heuristic intelligence engine.

---

## 3. Key Features

1. **Real-time AI & Security Analysis Engine**: Evaluates incoming text, emails, or chats for categorization, sentiment, emotion, priority, resolution status, and security threats.
2. **Deterministic Risk Scoring (0–100)**: Evaluates lookalike domains (`paypa1-security.example`), IP host usage, unencrypted HTTP, shorteners, credential requests, OTP interceptions, and coercive urgency.
3. **SOC Threat Intelligence Dashboard**: Special view filtering critical security cases, extracted URLs, suspicious emails, and social engineering techniques.
4. **Interactive Conversations Manager**: Filterable, searchable data table with pagination, details inspector, and re-analysis trigger.
5. **Business Intelligence Analytics**: Root cause analysis, category distribution, sentiment breakdown, top lookalike domains, date range filters (Today, 7D, 30D, All Time).
6. **Dataset & Demo Generator**: Seed button generating 60+ realistic support and phishing conversations stored directly into SQLite.
7. **Zero Static Fake Data**: All KPI cards, charts, and tables dynamically query the SQLite database.

---

## 4. Folder Structure

```
/client
  /src
    /components
      /common        # Badges, StatCards, RiskMeter, LoadingSpinner
      /layout        # Sidebar, Header, Layout
    /pages           # Dashboard, AnalyzeConversation, Conversations, Details, Threats, Analytics, Dataset, Settings
    /services        # Centralized api.js service
    App.jsx
    main.jsx
    index.css
  vite.config.js
  tailwind.config.js

/server
  /src
    /controllers     # HTTP Request handlers
    /db              # SQLite Database setup (app.db)
    /routes          # REST API endpoints
    /services        # Security engine, Claude AI service, Seed service
    server.js
  package.json
  .env.example
```

---

## 5. Startup & Running Instructions

### Step 1: Install Dependencies

Run in project root:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables

Create `server/.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=5000
DATABASE_PATH=./data/app.db
```
*(Note: If `ANTHROPIC_API_KEY` is omitted, the system automatically uses the high-accuracy deterministic intelligence engine so demo testing works offline seamlessly!)*

### Step 3: Run Backend & Frontend

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Verification & Demo Flow

1. **Dashboard**: Verify KPI cards and charts populate directly from SQLite data.
2. **Seed Demo Data**: Click **"Seed Demo Data"** in header to populate 60+ realistic conversations across billing, refunds, tech issues, and phishing scams.
3. **Analyze Phishing Case**:
   - Go to **Analyze Conversation**.
   - Click preset button: **"Example 2: Phishing Scam"** (`URGENT! Your account has been compromised... http://paypa1-security.example/login`).
   - Click **"Analyze Conversation"**.
   - Observe **CRITICAL Risk Level**, Risk Score 85+, lookalike domain flag (`paypa1-security.example`), OTP & Credential Harvesting flags.
4. **Analyze Support Complaint**:
   - Click preset button: **"Example 1: Payment Complaint"** (`My payment was deducted twice...`).
   - Click **"Analyze Conversation"**.
   - Observe **Negative Sentiment**, **High Priority**, **Billing Category**, and **Clean Security status**.
5. **Check Threat Intelligence**: Navigate to **Threat Intelligence** to view all flagged security threats.
6. **Check Analytics**: Navigate to **Analytics** to view top suspicious domains and social engineering tactics.
