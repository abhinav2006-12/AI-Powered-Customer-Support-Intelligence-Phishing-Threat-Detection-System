<div align="center">
  <img src="assets/logo.png" alt="KAAVALX Logo" width="700"/>
  <h1>KAAVALX Public Scam Verification Portal Guide</h1>
  <p><strong>Comprehensive Guide to the Public Consumer Scam Checker, Multi-Mode Scanner, and AI Fraud Advisor (`/verify`)</strong></p>
  <p>
    <img src="assets/apex-logo.png" alt="APEX Logo" width="32" style="vertical-align: middle; margin-right: 6px;"/>
    <strong>Engineered by APEX</strong>
  </p>
</div>

---

## 📌 Document Overview

This document provides a complete, **A-to-Z operational and architectural guide** for the **KAAVALX Public Scam Verification Portal (`/verify`)**. It explains all consumer-facing features, multi-mode input scanners, heuristic risk calculation models, the "Why We Flagged This" AI forensic engine, the embedded AI Scam Advisor, and emergency consumer protection workflows.

---

## 📑 Table of Contents

1. [Portal Overview & Consumer Protection Mission](#1-portal-overview--consumer-protection-mission)
2. [Direct Access & Routing (`/` $\rightarrow$ `/verify`)](#2-direct-access--routing--rightarrow-verify)
3. [Header Controls & Theme Customization](#3-header-controls--theme-customization)
4. [Multi-Mode Input Workbench](#4-multi-mode-input-workbench)
5. [Interactive Sample Scenario Chips](#5-interactive-sample-scenario-chips)
6. [Threat Score & Visual Verdict Result Screen](#6-threat-score--visual-verdict-result-screen)
7. ["Why We Flagged This" AI Forensic Breakdown](#7-why-we-flagged-this-ai-forensic-breakdown)
8. [Inspected Web Links & Typosquatting Forensics](#8-inspected-web-links--typosquatting-forensics)
9. [Public AI Scam Chat Advisor (`PublicScamChatAdvisor`)](#9-public-ai-scam-chat-advisor-publicscamchatadvisor)
10. [Consumer Safety Playbook & Interactive FAQs](#10-consumer-safety-playbook--interactive-faqs)
11. [Incident Sharing & Emergency Mitigation Steps](#11-incident-sharing--emergency-mitigation-steps)
12. [Backend Architecture & API Integration](#12-backend-architecture--api-integration)

---

## 1. Portal Overview & Consumer Protection Mission

Modern digital fraud—ranging from fake electricity bill SMS alerts and deceptive bank KYC threats to lookalike domain phishing and UPI QR code scams—victimizes millions of individuals daily. 

**KAAVALX Public Scam Verification Portal (`/verify`)** provides a free, instant, and privacy-focused cyber defense tool for everyday consumers, families, and organizations.

```
+----------------------------------------------------------------------------------------------------+
|                                    KAAVALX PUBLIC SCAM CHECKER                                     |
+----------------------------------------------------------------------------------------------------+
|  [ ⚡ 2FA & OTP Trap ]  [ 🔗 Fake Bank Link ]  [ 📱 WhatsApp KYC ]  [ 💳 Billing Dispute ]  [ 📦 Delivery ] |
+----------------------------------------------------------------------------------------------------+
|  INPUT MODES:                                                                                      |
|  [ 💬 Message / SMS ]    [ 🔗 Website URL ]    [ ✉️ Email & Sender ]    [ 📱 WhatsApp / Chat ]     |
+----------------------------------------------------------------------------------------------------+
|  [ Paste suspicious text, SMS, email body, or website link...                            ]         |
|  [ Optional: Sender Email or Phone Number (e.g. support@paypa1.example)                  ]         |
|                                                                                [ CHECK FOR SCAM ]  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  🚨 VERDICT SCREEN:                                                                                |
|  Status: DANGEROUS SCAM DETECTED (Threat Score: 95/100 - CRITICAL RISK)                            |
|  Reason: 2FA/OTP exfiltration demand and lookalike typosquatting domain detected.                  |
|                                                                                                    |
|  💡 WHY WE FLAGGED THIS (AI FORENSIC BREAKDOWN):                                                   |
|  • 2FA / OTP Interception Demand (+35 Risk Pts)                                                    |
|  • Deceptive Lookalike Domain 'paypa1' (+25 Risk Pts)                                              |
|  • Artificial Urgency Coercion (+20 Risk Pts)                                                      |
|                                                                                                    |
|  [ Copy Safety Report ]         [ Warn Friends / Family ]          [ Ask AI Scam Advisor ]         |
+----------------------------------------------------------------------------------------------------+
```

### Core Value Pillars:
- **No Login Required**: Open to the public with zero registration friction.
- **Privacy by Default**: Scanned text is analyzed dynamically without exposing personal data.
- **Explainable Cyber Defense**: Explains *why* an incident is dangerous in simple, actionable terms.
- **Immediate Action Guidance**: Direct instructions on what to do if a user has already clicked a link or shared credentials.

---

## 2. Direct Access & Routing (`/` $\rightarrow$ `/verify`)

- **Default Root Route**: Navigating to the root URL (`http://localhost:5173/`) automatically redirects directly to `/verify`.
- **Direct Link**: `http://localhost:5173/verify`
- **Enterprise SOC Gateway**: SOC analysts can switch to the internal management dashboard at any time by clicking the **"SOC Portal"** button in the header.

---

## 3. Header Controls & Theme Customization

The top navigation bar of `/verify` provides streamlined controls:
- **KAAVALX Brand Identity**: Clickable logo with a green animated pulse badge indicating `"FREE SCANNER"`.
- **Ask AI Advisor Button**: Instantly switches to the interactive fraud chatbot tab.
- **Theme Toggle (`ThemeToggle.jsx`)**: Switches between Dark Mode (Cyberpunk SOC Aesthetic) and Light Mode with instant state persistence.
- **SOC Portal Button**: Direct link to the administrative analyst login page (`/login`).

---

## 4. Multi-Mode Input Workbench

To accommodate different types of suspicious communications, the scanner provides **four specialized input modes**:

```
+----------------------------------------------------------------------------------+
|  [ 💬 Message / SMS ]   [ 🔗 Website URL ]   [ ✉️ Email & Sender ]   [ 📱 WhatsApp ]|
+----------------------------------------------------------------------------------+
```

### 4.1 Mode 1: Message / SMS (`message`)
- **Use Case**: Suspicious text messages, bank debit SMS alerts, fake parcel delivery alerts, lottery claims.
- **Fields**:
  - `Message Text`: Multiline textarea with character count indicator.
  - `Sender Identifier` *(Optional)*: Sender name or SMS alphanumeric header (e.g. `AD-HDFCBK`, `VK-SBIINB`).

### 4.2 Mode 2: Website URL (`url`)
- **Use Case**: Standalone links received in chats, suspicious login pages, shortened URLs (`bit.ly`, `tinyurl`).
- **Fields**:
  - `Website Link or URL`: Single focused URL input field (e.g. `http://paypa1-security.example/login`).
  - Automatically evaluates domain typosquatting, raw IP hosting, unencrypted HTTP protocols, and known homoglyphs.

### 4.3 Mode 3: Email & Sender (`email`)
- **Use Case**: Phishing emails claiming account suspensions, tax refunds, or cloud storage expirations.
- **Fields**:
  - `From (Sender Email)`: Originating email address (e.g. `security@paypa1-support.example`).
  - `Email Subject Line`: Subject header (e.g. `URGENT: Verify Account within 24 Hours`).
  - `Email Body Content`: Full multiline email body.

### 4.4 Mode 4: WhatsApp / Chat (`whatsapp`)
- **Use Case**: Forwarded WhatsApp messages, fake job offers, investment schemes, emergency fund requests.
- **Fields**:
  - `Sender Phone / Group Name`: Originating phone number or contact name.
  - `Chat / Forwarded Text`: Full forwarded message body.

### 4.5 Fast Action Workbench Tools:
- 📋 **Paste Clipboard**: One-click button using browser Clipboard API to immediately insert copied text.
- 🗑️ **Clear**: Resets input fields, clears past results, and refocuses the cursor.

---

## 5. Interactive Sample Scenario Chips

Above the input workbench, users can click **compact preset scenario chips** to test the system with real-world scenarios:

| Scenario Chip | Mode | Risk Classification | Attack / Interaction Vector |
| :--- | :---: | :---: | :--- |
| ⚡ **2FA & OTP Harvesting Trap** | `message` | 🔴 **CRITICAL** | Account compromised alert demanding 6-digit OTP code |
| 🔗 **Fake Bank Typosquat Link** | `url` | 🔴 **CRITICAL** | `http://paypa1-security.example/login` homoglyph domain |
| 📱 **WhatsApp KYC Alert** | `whatsapp` | 🟠 **HIGH** | Urgent SIM/UPI suspension threatening bank block |
| 💳 **Billing Refund Query** | `email` | 🟢 **SAFE** | Legitimate e-commerce double charge refund request |
| 📦 **Amazon Order Delivery** | `message` | 🟢 **SAFE** | Official parcel out-for-delivery notification with app tracking |

---

## 6. Threat Score & Visual Verdict Result Screen

Submitting any message or link triggers the unified backend intelligence engine, generating a high-contrast verdict banner:

```
+----------------------------------------------------------------------------------------------------+
|  [ SHIELD ICON ]   🛑 DANGEROUS SCAM: OTP Interception Scam                   [ SCORE GAUGE ]      |
|                    Reason: Message demands a 6-digit OTP code and              85 / 100            |
|                    contains an unverified lookalike domain.                   CRITICAL RISK        |
|  +----------------------------------------------------------------------------------------------+  |
|  | [========================================================================                  ] |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

### Key Visual Verdict Elements:
1. **Severity Status Icon**:
   - 🔴 `ShieldAlert` (Red) for Critical/High risk scams.
   - 🟡 `AlertTriangle` (Amber) for Moderate/Suspicious incidents.
   - 🟢 `ShieldCheck` (Emerald Green) for Clean/Safe communications.
2. **Threat Headline**: Explicit classification (e.g. `🛑 Threat Detected: Credential Harvesting Phishing`).
3. **Reason Statement**: Plain-English explanation generated by the heuristic and LLM analysis.
4. **Threat Risk Score ($0-100$)**:
   - **0–19**: 🟢 **LOW RISK** (Authentic, no threats detected)
   - **20–44**: 🟡 **MEDIUM RISK** (Suspicious links or mild pressure)
   - **45–69**: 🟠 **HIGH RISK** (External verification demands, unverified domains)
   - **70–100**: 🔴 **CRITICAL RISK** (Active credential phishing, OTP theft, homoglyphs)
5. **Dynamic Progress Meter**: High-impact glowing progress bar calibrated to the risk score.

---

## 7. "Why We Flagged This" AI Forensic Breakdown

To eliminate confusion and educate the user, the result screen presents a dedicated **AI Forensic Breakdown** card that itemizes all detected threat indicators and their respective risk point weights:

```
+----------------------------------------------------------------------------------------------------+
|  ⚡ WHY WE FLAGGED THIS (AI FORENSIC BREAKDOWN)                                                     |
+--------------------------------------------------+-------------------------------------------------+
|  🚨 2FA / OTP Interception Demand   [+35 Pts]    |  🚨 Credential Theft Attempt       [+30 Pts]    |
|  Demands a 6-digit OTP code which banks never    |  Prompts entry of password or CVV on an         |
|  ask for over chat or email.                     |  external unverified form.                      |
+--------------------------------------------------+-------------------------------------------------+
|  ⚠️ Psychological Panic Urgency     [+20 Pts]    |  🚨 Deceptive Lookalike Domain     [+25 Pts]    |
|  Uses artificial deadlines ("within 24 hours")   |  Contains typosquat domain mimicking official   |
|  designed to bypass critical scrutiny.           |  trusted brand.                                 |
+--------------------------------------------------+-------------------------------------------------+
```

### Indicator Pills Grid:
Provides an instant 4-badge health check:
- **Credential Theft**: `⚠️ Password Requested` or `Clean`
- **OTP / 2FA Trap**: `🚨 OTP Demanded` or `Clean`
- **Psychological Panic**: `⚠️ Urgency / Fear` or `Normal`
- **Lookalike Domain**: `🚨 Typosquat URL` or `Clean`

---

## 8. Inspected Web Links & Typosquatting Forensics

When URLs are detected in the scanned text, a detailed forensic table is rendered:

| Field | Description | Safety Check |
| :--- | :--- | :--- |
| **URL** | Full extracted link address | Highlights suspicious paths and parameter strings |
| **Domain** | Parsed root domain name | Compares against official brand registries |
| **Lookalike Typosquat** | `YES` / `NO` | Detects letter substitutions (e.g. `1` for `l`, `0` for `o`) |
| **Raw IP Host** | `YES` / `NO` | Flags links pointing to numerical IP addresses |
| **URL Risk Score** | `0 – 100` | Individual risk rating for that specific web destination |

---

## 9. Public AI Scam Chat Advisor (`PublicScamChatAdvisor`)

The **AI Scam Advisor** is powered by **Google Gemini 2.5 Flash** with specialized consumer fraud instructions.

### 9.1 Access Modes:
- **Embedded Mode (Tab 2: Ask AI Advisor)**: Fullscreen conversational assistant integrated into the main page.
- **Floating Widget Mode**: Click the floating bot icon in the bottom-right corner of any screen to open the chat drawer.

### 9.2 Quick Inquiry Chips:
Users can click prompt chips to get instant expert guidance on:
- 🔑 *"Will a bank ever ask for my OTP?"*
- 💳 *"Do I need to enter UPI PIN to receive money?"*
- 🚨 *"I clicked a suspicious link. What should I do right now?"*
- 📱 *"How to verify fake WhatsApp job offers?"*

---

## 10. Consumer Safety Playbook & Interactive FAQs

Accessible via **Tab 3: Safety Rules & FAQs**:

### 10.1 Four Golden Safety Rules:
1. 🔑 **Never Share 6-Digit OTPs or Passwords**: Official apps, banks, and Google never ask for OTPs over calls, SMS, or chat.
2. 🌐 **Inspect Website URLs Closely**: Check for letter substitutions (`paypa1.com`, `micros0ft.com`, `.xyz`, `.online`).
3. ⏰ **Beware of Sudden Panic or Urgency**: Scammers create artificial pressure (*"Your account will be closed in 2 hours!"*) to force careless mistakes.
4. 💳 **Never Enter UPI PIN to Receive Money**: PIN is only entered when **SENDING** funds. Receiving funds **NEVER** requires a PIN or QR scan.

### 10.2 Interactive FAQ Accordion:
- *How does the KAAVALX Scam Checker work?*
- *Is this checker completely free and confidential?*
- *What should I do if I already entered my password on a scam site?*
- *What is lookalike domain spoofing (Typosquatting)?*

---

## 11. Incident Sharing & Emergency Mitigation Steps

### 11.1 Report & Sharing Tools:
- 📋 **Copy Full Report**: Copies a formatted text summary of the security audit to the clipboard.
- 📲 **Warn Friends / Family**: Uses the Web Share API (or copies a shareable link) to send a scam alert warning to relatives and chat groups.

### 11.2 Emergency Checklist for Victims:
If a user realizes they have fallen for a scam:
1. 🔌 **Disconnect Wi-Fi and Mobile Data immediately**.
2. 💻 From a separate, clean device, **change passwords** for banking, email, and social accounts.
3. 🔐 **Enable 2-Factor Authentication (2FA)** using an authenticator app (Google Authenticator / Authy) rather than SMS where possible.
4. 🏦 **Contact your bank's fraud helpline immediately** to freeze debit/credit cards and block online UPI transactions.
5. 🛡️ **Report the incident** to your national cybercrime portal (e.g. `cybercrime.gov.in` in India or `ic3.gov` in the US).

---

## 12. Backend Architecture & API Integration

The `/verify` portal communicates with the backend via the unified **`POST /api/analyze`** endpoint:

```json
// Request Payload (client/src/services/api.js)
POST /api/analyze
{
  "message": "URGENT! Account suspended. Click http://paypa1-security.example/login to verify OTP",
  "conversation_history": "",
  "customer_name": "Public User",
  "customer_email": "anonymous@domain.com",
  "channel": "Email"
}

// Response Payload (server/src/controllers/analysis.controller.js)
{
  "success": true,
  "analysis": {
    "category": "Security Concern",
    "issue": "Potential Security Incident / Account Protection",
    "sentiment": "Negative",
    "urgency": "Critical",
    "priority": "P1",
    "security": {
      "threat_detected": true,
      "threat_type": "OTP Interception Scam",
      "risk_level": "CRITICAL",
      "risk_score": 95,
      "credential_request": true,
      "otp_request": true,
      "suspicious_message": true,
      "techniques": ["Urgency", "Credential Harvesting", "OTP Interception"],
      "reason": "Message demands 6-digit OTP code and includes typosquatted domain paypa1-security.example"
    },
    "urls": [
      {
        "url": "http://paypa1-security.example/login",
        "domain": "paypa1-security.example",
        "lookalike": true,
        "uses_ip": false,
        "risk_score": 95
      }
    ],
    "recommended_action": "IMMEDIATE ACTION REQUIRED: Do not click link, do not share OTP/password, and block sender."
  }
}
```

---

<div align="center">
  <br/>
  <p><strong>KAAVALX Public Cyber Defense Portal</strong> • Engineered by <strong>APEX</strong></p>
  <img src="assets/apex-logo.png" alt="APEX Logo" width="100"/>
</div>
