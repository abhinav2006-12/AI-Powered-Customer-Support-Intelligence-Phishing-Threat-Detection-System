<div align="center">
  <img src="assets/logo.png" alt="KAAVALX Logo" width="700"/>
  <h1>KAAVALX</h1>
  <p><strong>AI-Powered Customer Support Intelligence & Phishing Threat Detection System</strong></p>
  <p>
    <img src="assets/apex-logo.png" alt="APEX Logo" width="32" style="vertical-align: middle; margin-right: 6px;"/>
    <strong>Developed by APEX</strong>
  </p>
</div>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-powered-customer-support-intelli.vercel.app/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-38B2AC?style=for-the-badge&logo=react)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

> **An enterprise-grade, full-stack intelligence platform that unifies AI-driven Customer Support Ticket Analysis with Automated Real-Time Cybersecurity Phishing Threat Detection & SOC Triage.**

---

## 📌 Table of Contents
1. [System Overview & Value Proposition](#1-system-overview--value-proposition)
2. [Key Features & Capabilities](#2-key-features--capabilities)
3. [Live Demo & Login Credentials](#3-live-demo--login-credentials)
4. [System Architecture & Tech Stack](#4-system-architecture--tech-stack)
5. [Database Schema (Supabase PostgreSQL & SQLite)](#5-database-schema)
6. [Cybersecurity & Phishing Detection Engine](#6-cybersecurity--phishing-detection-engine)
7. [Customer Support NLP & Intelligence Engine](#7-customer-support-nlp--intelligence-engine)
8. [AI Copilot Studio (Gemini Integration)](#8-ai-copilot-studio-gemini-integration)
9. [REST API Documentation](#9-rest-api-documentation)
10. [Local Development & Installation Guide](#10-local-development--installation-guide)
11. [Supabase Cloud Setup & Data Migration](#11-supabase-cloud-setup--data-migration)
12. [Vercel Deployment Guide](#12-vercel-deployment-guide)
13. [Project Directory Structure](#13-project-directory-structure)
14. [Demo Scenarios & Test Cases](#14-demo-scenarios--test-cases)
15. [License & Acknowledgments](#15-license--acknowledgments)

---

## 1. System Overview & Value Proposition

Enterprise customer support desks face tens of thousands of incoming customer inquiries, emails, chats, and contact forms every day. Among legitimate high-priority complaints (such as duplicate billing, delayed package deliveries, refund disputes, and account locked issues) lurk sophisticated **adversary campaigns**:
- **Phishing attacks** impersonating trusted brands (PayPal, Microsoft, Netflix, Apple).
- **Homoglyph & lookalike domain spoofing** (e.g. `paypa1-security.example`, `micros0ft-update.info`).
- **Credential harvesting forms** designed to steal admin credentials.
- **2FA/OTP exfiltration** and urgent coercion tactics.

**KAAVALX** solves both challenges simultaneously in a single, high-throughput pipeline:
1. **Support Intelligence**: Decodes what the customer is asking, categorizes the issue, detects sentiment & emotional urgency, checks resolution status, and recommends agent workflows.
2. **Cybersecurity Intelligence**: Extracts embedded links/emails, evaluates structural domain risk, flags social engineering techniques, calculates a deterministic **Risk Score (0–100)** with assigned **Risk Level (LOW / MEDIUM / HIGH / CRITICAL)**, and provides actionable **SOC Containment Recommendations**.

---

## 2. Key Features & Capabilities

- 🔐 **Role-Based Authentication**: Secure authentication gate with session persistence in local storage and rapid demo auto-fill credentials.
- 🌓 **Dynamic Theme Switching (Dark & Light Mode)**: Full-featured dark/light theme toggle with high-contrast cybersecurity SOC aesthetics and persistent user preference.
- 🤖 **KAAVALX AI Copilot Studio (Google Gemini 2.5 Flash)**:
  - **Fullscreen AI Studio (`/assistant`)**: Tri-mode chat environment (SOC Threat Hunting, Customer Support Copilot, and Live Database Telemetry).
  - **Global Floating Widget**: Draggable/accessible AI drawer across all application routes.
- ⚡ **Dual-Database Architecture (Cloud + Local)**:
  - **Cloud Database**: Direct read/write integration with **Supabase PostgreSQL**.
  - **Local Database**: Zero-dependency fallback using **SQLite** (`better-sqlite3` in WAL mode).
  - **Auto-Sync Utility**: CLI script (`npm run db:sync:supabase`) to replicate local telemetry to Supabase in one command.
- 📊 **Executive & SOC Dashboard**:
  - Live KPI metrics (Total Conversations, Total Complaints, Critical Cases, Unresolved Backlog, Threats Detected).
  - Interactive charts powered by Recharts (Sentiment distributions, Category volume, Priority allocation, Threat vectors, 14-day velocity trends).
- 🔍 **Deep Inspection & Triage**:
  - Filterable conversation logs with keyword search, priority sorting, sentiment filters, and risk tags.
  - Dedicated **Threat Intelligence** portal detailing lookalike domains, shortened URLs, and social engineering indicators.
- 🧪 **Live Conversation Analyzer**:
  - Interactive workbench with pre-loaded attack payloads and customer complaint scenarios.
  - Re-analyze live records dynamically to test heuristic and LLM scoring updates.

---

## 3. Live Demo & Login Credentials

| Attribute | Details |
| :--- | :--- |
| **Live Deployed App** | [https://ai-powered-customer-support-intelli.vercel.app/](https://ai-powered-customer-support-intelli.vercel.app/) |
| **Default User** | `kavalx@kavalx.in` |
| **Password** | *[Encrypted & Auto-filled directly on login]* |
| **Role** | `SOC Incident Responder & Admin` |

> *Tip: Click the **"Auto Fill"** button on the login screen to sign in instantly without typing credentials.*

---

## 4. System Architecture & Tech Stack

```mermaid
graph TD
    User([End User / SOC Analyst]) -->|HTTPS| Frontend[React 18 + Vite SPA on Vercel]
    Frontend --> AuthCtx[AuthContext / ThemeContext]
    Frontend --> APILayer[API Service Adapter client/src/services/api.js]
    
    APILayer -->|Cloud Direct Fallback| Supabase[(Supabase PostgreSQL Database)]
    APILayer -->|REST API /api/*| Backend[Node.js Express Backend]
    
    Backend --> SQLite[(Local SQLite Database app.db)]
    Backend --> SupabaseDB[(Supabase PostgreSQL)]
    Backend --> GeminiAI[Google Gemini 2.5 Flash API]
    Backend --> SecEngine[Heuristic Security & Phishing Engine]
```

### Technology Breakdown:
- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Recharts, Lucide Icons, React Router v6.
- **Backend**: Node.js, Express.js, CORS, Dotenv.
- **AI & LLM**: Google Gemini 2.5 Flash (`@google/genai`), Anthropic Claude 3.5 Sonnet (`@anthropic-ai/sdk`).
- **Cloud Database**: Supabase PostgreSQL (`@supabase/supabase-js`).
- **Local Database**: SQLite 3 (`better-sqlite3` in WAL mode).
- **Deployment**: Vercel (Frontend SPA) + Render / Railway / Node server (Backend).

---

## 5. Database Schema

The database architecture is symmetrical across both **Supabase PostgreSQL** and **SQLite**:

### 1. `conversations` Table
Stores raw communication records from email, live chat, or tickets.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BIGINT / INTEGER PRIMARY KEY | Unique ID |
| `external_id` | TEXT UNIQUE | Ticket reference code (e.g. `CONV-1726654800`) |
| `customer_name` | TEXT | Customer or Sender name |
| `customer_email` | TEXT | Customer or Sender email address |
| `channel` | TEXT | `Email`, `Chat`, `Support Ticket`, `Contact Form`, `Social Media` |
| `message` | TEXT | Body content of the customer message |
| `conversation_history`| TEXT | Thread history if applicable |
| `status` | TEXT | `Open`, `In Progress`, `Resolved`, `Closed` |
| `created_at` | TIMESTAMPTZ | Timestamp of receipt |

### 2. `analyses` Table
Stores extracted customer support NLP intelligence.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BIGINT / INTEGER PRIMARY KEY | Unique ID |
| `conversation_id` | BIGINT FK | References `conversations(id)` |
| `category` | TEXT | `Billing & Payments`, `Technical Support`, `Order Fulfillment`, `Account & Security`, `General Inquiry` |
| `issue` | TEXT | Specific problem summary |
| `sentiment` | TEXT | `Positive`, `Neutral`, `Negative` |
| `emotion` | TEXT | `Frustrated`, `Angry`, `Satisfied`, `Urgent`, `Calm` |
| `urgency` | TEXT | `Low`, `Medium`, `High`, `Critical` |
| `priority` | TEXT | `Low`, `Medium`, `High`, `Critical` |
| `customer_request` | TEXT | Action requested by user |
| `resolution_status` | TEXT | `Resolved`, `Unresolved`, `Pending` |
| `recommended_action` | TEXT | Guidance for customer support rep |
| `confidence` | REAL | Model confidence (0.0 to 1.0) |

### 3. `threats` Table
Stores cybersecurity risk metrics and phishing telemetry.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | BIGINT / INTEGER PRIMARY KEY | Unique ID |
| `conversation_id` | BIGINT FK | References `conversations(id)` |
| `threat_detected` | INTEGER | `1` (Threat) or `0` (Clean) |
| `threat_type` | TEXT | `Phishing Attack`, `Credential Harvesting`, `Lookalike Domain Scam`, `None` |
| `risk_level` | TEXT | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `risk_score` | INTEGER | Computed score (`0` to `100`) |
| `social_engineering` | INTEGER | Boolean flag for manipulative tactics |
| `social_engineering_techniques` | TEXT | Techniques detected (e.g. `Urgency; Scarcity; Impersonation`) |
| `credential_request` | INTEGER | Flag for password/pin requests |
| `otp_request` | INTEGER | Flag for one-time-password harvesting |
| `reason` | TEXT | Explanatory SOC breakdown |
| `recommended_action` | TEXT | SOC incident containment step |

### 4. `urls` Table & 5. `emails` Table
Stores parsed domains, hostnames, protocol analysis (`http` vs `https`), IP hosts, and homoglyph mismatch scores.

---

## 6. Cybersecurity & Phishing Detection Engine

KAAVALX uses a multi-layered detection matrix combining deterministic structural heuristics with AI:

### Risk Calculation Matrix:
| Indicator | Heuristic Condition | Risk Weight |
| :--- | :--- | :---: |
| **Lookalike / Homoglyph Domain** | Pattern matching (e.g. `paypa1`, `micros0ft`, `amaz0n`, `netfl1x`) | **+35 pts** |
| **Credential Harvesting** | Requests for `password`, `login`, `bank details`, `card number`, `PIN` | **+40 pts** |
| **2FA / OTP Interception** | Demands for `OTP`, `verification code`, `authenticator code`, `security pin` | **+35 pts** |
| **Urgency & Coercive Pressure** | `Within 24 hours`, `account suspended`, `legal action`, `immediate verification` | **+20 pts** |
| **Unencrypted / Raw IP Host** | Protocol is `http://` or hostname is raw IPv4 address | **+25 pts** |
| **URL Shortener Cloaking** | `bit.ly`, `tinyurl.com`, `t.co`, `cutt.ly`, `shorturl.at` | **+15 pts** |
| **Domain Mismatch** | Sender domain does not match claimed brand signature | **+25 pts** |

### Risk Level Classifications:
- 🟢 **LOW (0–19 pts)**: Standard customer message with clean URLs and no coercion.
- 🟡 **MEDIUM (20–44 pts)**: Unverified links or mild urgency; flagged for automated scanning.
- 🟠 **HIGH (45–69 pts)**: Suspicious external links or account verification demands.
- 🔴 **CRITICAL (70–100 pts)**: Active credential phishing, homoglyphs, OTP exfiltration, or malicious URL.

---

## 7. Customer Support NLP & Intelligence Engine

The support intelligence module parses interactions into actionable business telemetry:
- **Root Cause & Issue Extraction**: Automatically tags tickets (`Billing / Duplicate Charge`, `Hardware Failure`, `Delivery Delay`, etc.).
- **Sentiment & Emotion Scoring**: Evaluates emotional polarity (`Positive`, `Neutral`, `Negative`) and psychological state (`Frustrated`, `Alarmed`, `Delighted`).
- **Urgency vs. Priority Matrix**: Calibrates urgency from temporal deadlines and priority based on enterprise SLA impact.
- **Automated Workflow Recommendations**: Generates tailored response templates and escalation recommendations for human agents.

---

## 8. AI Copilot Studio (Gemini Integration)

KAAVALX incorporates **Google Gemini 2.5 Flash** for natural-language analysis:

1. 🛡️ **SOC Threat Analyst Mode**:
   - Paste suspicious emails, raw headers, or URLs to receive immediate malware analysis, threat vector mapping, and remediation steps.
2. 💬 **Support Agent Copilot Mode**:
   - Draft polite, policy-compliant responses to distressed customers, recommend refund workflows, and resolve disputes.
3. 📊 **Ask Database Telemetry Mode**:
   - Query live Supabase / SQLite ticket metrics in plain English (e.g., *"How many critical threats were logged this week?"* or *"Show top billing issues"*).

---

## 9. REST API Documentation

### Base URL: `/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Returns calculated KPI metrics, chart distributions, and recent threats |
| `GET` | `/api/conversations` | Returns paginated conversations with filtering (`search`, `category`, `sentiment`, `risk_level`, `page`, `limit`) |
| `GET` | `/api/conversations/:id` | Returns single conversation with full analysis, threat data, and parsed URLs |
| `POST`| `/api/conversations` | Creates and automatically analyzes a new incoming customer conversation |
| `DELETE`| `/api/conversations/:id` | Deletes a conversation and cascades associated threat/analysis records |
| `POST`| `/api/analyze` | Evaluates a raw message on the fly without saving |
| `POST`| `/api/analyze/conversations/:id/analyze` | Re-evaluates an existing conversation with latest model heuristics |
| `GET` | `/api/threats` | Retrieves all flagged security incidents with threat score breakdown |
| `GET` | `/api/analytics` | Returns analytics data for specified time range (`today`, `7d`, `30d`, `all`) |
| `POST`| `/api/demo/seed` | Seeds database with 60+ realistic support and phishing conversations |
| `POST`| `/api/chat` | Queries Gemini AI Copilot with prompt, conversation mode, and history |
| `GET` | `/api/chat/suggestions` | Retrieves contextual prompt suggestions for SOC and Support modes |

---

## 10. Local Development & Installation Guide

### Prerequisites:
- **Node.js**: v18.0.0 or later ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or later
- **Git**: For version control

### Step 1: Clone the Repository
```bash
git clone https://github.com/abhinav2006-12/AI-Powered-Customer-Support-Intelligence-Phishing-Threat-Detection-System.git
cd "AI-Powered Customer Support Intelligence &  Phishing Threat Detection System"
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 3: Configure Environment Variables

Create `server/.env`:
```env
# Server Port
PORT=5000

# SQLite Local Database File
DATABASE_PATH=./data/app.db

# Google Gemini API Key (Optional: for live Gemini Flash model responses)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Cloud Database (Optional: for cloud syncing)
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_anon_key_here
```

### Step 4: Run the Application

**Terminal 1 (Backend Express Server):**
```bash
cd server
npm run dev
```
*Backend runs at `http://localhost:5000`.*

**Terminal 2 (Frontend Vite Dev Server):**
```bash
cd client
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

Open your browser and visit **`http://localhost:5173`**.

---

## 11. Supabase Cloud Setup & Data Migration

KAAVALX includes full support for Supabase PostgreSQL:

1. **Create Tables in Supabase**:
   - Open your project in [Supabase Dashboard](https://supabase.com/dashboard).
   - Go to the **SQL Editor**.
   - Copy the SQL DDL from `server/data/supabase_schema.sql` and click **Run**.
2. **Sync Local Records to Supabase**:
   - Run the migration utility from the `server` directory:
     ```bash
     cd server
     npm run db:sync:supabase
     ```
   - All 61+ conversations, analyses, threats, and URLs will be migrated to Supabase PostgreSQL.

---

## 12. Vercel Deployment Guide

To deploy the frontend to Vercel:

1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Leave blank (monorepo build scripts in root `package.json` handle `client/` compilation) or set to `client`.
   - **Environment Variables**:
     - `VITE_SUPABASE_URL`: `your_supabase_project_url_here`
     - `VITE_SUPABASE_KEY`: `your_supabase_anon_key_here`
3. Click **Deploy**.

---

## 13. Project Directory Structure

```
AI-Powered Customer Support Intelligence & Phishing Threat Detection System/
├── client/                               # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   └── FloatingChatWidget.jsx# Global floating AI Copilot drawer
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx             # Priority, Sentiment & Risk Badges
│   │   │   │   ├── LoadingSpinner.jsx    # Animated loading indicators
│   │   │   │   ├── ProtectedRoute.jsx    # Auth route guard
│   │   │   │   ├── RiskMeter.jsx         # 0-100 gauge component
│   │   │   │   ├── StatCard.jsx          # KPI card component
│   │   │   │   └── ThemeToggle.jsx       # Dark/Light theme button
│   │   │   └── layout/
│   │   │       ├── Header.jsx            # Top navbar with user profile & theme toggle
│   │   │       ├── Layout.jsx            # Main app shell
│   │   │       └── Sidebar.jsx           # Nav menu
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # User auth & login credentials
│   │   │   └── ThemeContext.jsx          # Dark mode state manager
│   │   ├── pages/
│   │   │   ├── Analytics.jsx             # Business & security analytics
│   │   │   ├── AnalyzeConversation.jsx   # Interactive test workbench
│   │   │   ├── Assistant.jsx             # Fullscreen AI Studio (Gemini)
│   │   │   ├── ConversationDetails.jsx   # Deep-dive ticket inspector
│   │   │   ├── Conversations.jsx         # Paginated conversation table
│   │   │   ├── Dashboard.jsx             # Overview dashboard
│   │   │   ├── Dataset.jsx               # Dataset manager & seeder
│   │   │   ├── Login.jsx                 # Authentication page
│   │   │   ├── Settings.jsx              # System & database config
│   │   │   └── ThreatIntelligence.jsx    # Dedicated SOC threat triage
│   │   ├── services/
│   │   │   ├── api.js                    # Dual-mode API adapter
│   │   │   └── supabaseService.js        # Supabase direct cloud data layer
│   │   ├── App.jsx                       # Route registry
│   │   ├── index.css                     # Custom styles & Tailwind directives
│   │   └── main.jsx                      # App entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
│
├── server/                               # Backend (Node.js + Express)
│   ├── data/
│   │   ├── app.db                        # SQLite database
│   │   └── supabase_schema.sql           # Supabase PostgreSQL DDL
│   ├── src/
│   │   ├── controllers/                  # Route handlers
│   │   │   ├── analytics.controller.js
│   │   │   ├── analyze.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── conversations.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── dataset.controller.js
│   │   │   └── threats.controller.js
│   │   ├── db/
│   │   │   ├── database.js               # SQLite connection
│   │   │   └── supabase.js               # Supabase Node client
│   │   ├── routes/                       # Express router definitions
│   │   ├── scripts/
│   │   │   └── migrate_to_supabase.js    # Data sync script
│   │   ├── services/
│   │   │   ├── ai.service.js             # Claude & Heuristic NLP engine
│   │   │   ├── gemini.service.js         # Google Gemini Flash assistant
│   │   │   ├── security.service.js       # Phishing & domain risk engine
│   │   │   └── seed.service.js           # 60+ record demo seeder
│   │   └── server.js                     # Express application entry
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json                          # Monorepo root build orchestration
├── vercel.json                           # Vercel deployment rewrites
└── README.md                             # Project Documentation
```

---

## 14. Demo Scenarios & Test Cases

You can test the system using the built-in presets on the **Analyze Conversation** page:

### Scenario 1: Critical Phishing Attack (Lookalike + OTP Theft)
- **Input Text**:
  > *"URGENT! Your PayPal security notice: Unauthorized transaction of $450 detected. Verify your account immediately at http://paypa1-security.example/login and enter your 6-digit OTP code to avoid account suspension within 24 hours."*
- **KAAVALX Output**:
  - **Risk Score**: `95/100` (CRITICAL)
  - **Threat Flags**: Lookalike Domain (`paypa1-security.example`), Credential Harvesting, OTP Interception, High Urgency.
  - **SOC Action**: *Block sender domain, quarantine user session, and issue credential reset warning.*

### Scenario 2: Legitimate High-Priority Customer Complaint
- **Input Text**:
  > *"My credit card was charged $120 twice for invoice #INV-98214 on September 15. Please refund the duplicate payment immediately as this was an automated billing error."*
- **KAAVALX Output**:
  - **Risk Score**: `0/100` (CLEAN / LOW)
  - **Category**: `Billing & Payments`
  - **Sentiment**: `Negative` (Dissatisfied)
  - **Priority**: `High`
  - **Resolution**: `Unresolved`
  - **Agent Action**: *Verify transaction ID in payment gateway and issue immediate duplicate charge refund.*

---

## 15. License & Acknowledgments

- **Development**: Engineered and developed with pride by **APEX**.
- **Project Author**: Abhinav ([@abhinav2006-12](https://github.com/abhinav2006-12))
- **License**: MIT Open Source License.
- **Built with**: React, Vite, Tailwind CSS, Node.js, Express, Better-SQLite3, Supabase, Google Gemini, and Recharts.

<div align="center">
  <br/>
  <img src="assets/apex-logo.png" alt="Developed by APEX" width="130"/>
  <p><strong>Engineered by APEX</strong></p>
</div>
