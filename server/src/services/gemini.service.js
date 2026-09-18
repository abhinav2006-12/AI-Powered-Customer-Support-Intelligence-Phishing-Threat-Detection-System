import dotenv from 'dotenv';
import db from '../db/database.js';

dotenv.config();

/**
 * Gather live database context for grounding Gemini's responses
 */
export function getLiveSystemContext() {
  try {
    const totalConv = db.prepare('SELECT COUNT(*) as count FROM conversations').get()?.count || 0;
    const unresolved = db.prepare("SELECT COUNT(*) as count FROM analyses WHERE resolution_status = 'Unresolved'").get()?.count || 0;
    const totalThreats = db.prepare('SELECT COUNT(*) as count FROM threats WHERE threat_detected = 1').get()?.count || 0;
    const criticalThreats = db.prepare("SELECT COUNT(*) as count FROM threats WHERE risk_level = 'CRITICAL'").get()?.count || 0;

    const topCategories = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM analyses 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 4
    `).all() || [];

    const recentThreats = db.prepare(`
      SELECT t.threat_type, t.risk_level, t.risk_score, t.reason, c.customer_name 
      FROM threats t 
      JOIN conversations c ON t.conversation_id = c.id 
      WHERE t.threat_detected = 1 
      ORDER BY t.id DESC 
      LIMIT 5
    `).all() || [];

    const suspiciousUrls = db.prepare(`
      SELECT url, domain, lookalike, risk_score 
      FROM urls 
      ORDER BY risk_score DESC 
      LIMIT 5
    `).all() || [];

    return {
      kpi: {
        totalConversations: totalConv,
        unresolvedCases: unresolved,
        totalThreats,
        criticalThreats
      },
      topCategories,
      recentThreats,
      suspiciousUrls
    };
  } catch (err) {
    console.error('Error fetching live system context:', err.message);
    return null;
  }
}

/**
 * Generate AI Chat response using Gemini 2.5/2.0 Flash or deterministic fallback
 */
export async function generateChatResponse({ message, history = [], mode = 'soc', includeContext = true }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const dbContext = includeContext ? getLiveSystemContext() : null;

  const systemInstructions = `
You are "KAAVALX Scam & Security Advisor", an AI assistant created by KAAVALX to protect everyday users and organizations from online fraud, scams, phishing, and cybersecurity threats.
You specialize in:
1. CONSUMER SCAM & FRAUD PROTECTION: Answering user doubts about suspicious SMS, WhatsApp messages, emails, fake job offers, lottery traps, bank KYC alerts, OTP harvesting, UPI PIN scams, and deceptive website links in simple, easy-to-understand English.
2. CYBERSECURITY & SOC THREAT INTELLIGENCE: Phishing detection, lookalike domains (e.g. paypa1-security.example), credential harvesting, 2FA/OTP interception, and incident mitigation.
3. CUSTOMER SUPPORT OPERATIONS: Issue diagnosis, root-cause categorization, sentiment analysis, and drafting professional, empathetic responses.

Current Active Mode: ${mode.toUpperCase()}
${dbContext ? `
=== LIVE KAAVALX DATABASE CONTEXT ===
- Total Conversations in DB: ${dbContext.kpi.totalConversations}
- Unresolved Complaints: ${dbContext.kpi.unresolvedCases}
- Total Flagged Security Threats: ${dbContext.kpi.totalThreats} (Critical: ${dbContext.kpi.criticalThreats})
- Top Complaint Categories: ${dbContext.topCategories.map(c => `${c.category} (${c.count})`).join(', ')}
- Recent High-Risk Threats: ${JSON.stringify(dbContext.recentThreats)}
- Flagged Suspicious Domains: ${JSON.stringify(dbContext.suspiciousUrls)}
========================================
` : ''}

Instructions:
- When advising consumers with doubts about messages or links: be clear, reassuring, direct, and actionable. Explicitly tell them whether something is safe or a scam, why it is dangerous, and what steps they should take right now.
- Never use overly dense jargon when explaining to consumers.
- Use clean Markdown formatting with bullet points and bold highlights.
`.trim();

  // If Gemini API Key is provided, call Google Gemini
  if (apiKey && apiKey.trim() !== '') {
    try {
      // Direct REST API call to Gemini 2.5 Flash for maximum compatibility
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const contents = [];
      
      // Add conversation history if available
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach(h => {
          if (h.role && h.text) {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            });
          }
        });
      }

      // Add latest user message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemInstructions }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Gemini API call failed, falling back:', errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const resData = await response.json();
      const reply = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        return {
          reply,
          mode,
          engine: 'Google Gemini 2.5 Flash',
          contextIncluded: !!dbContext
        };
      }
    } catch (err) {
      console.warn('Gemini invocation error, using fallback intelligent assistant:', err.message);
    }
  }

  // Fallback intelligent response generator
  const fallback = generateIntelligentFallbackResponse(message, mode, dbContext);
  return {
    reply: fallback,
    mode,
    engine: 'KAAVALX Intelligence Engine (Fallback)',
    contextIncluded: !!dbContext
  };
}

/**
function generateIntelligentFallbackResponse(message, mode, dbContext) {
  const lower = message.toLowerCase();

  // 0. Consumer Scam Advisor Mode & Common Doubts
  if (mode === 'scam_advisor' || lower.includes('upi') || lower.includes('clicked') || lower.includes('telegram') || lower.includes('job') || lower.includes('lottery') || lower.includes('prize') || lower.includes('kyc') || lower.includes('bank ask') || lower.includes('qr code')) {
    
    // OTP / Password Inquiries
    if (lower.includes('otp') || lower.includes('password') || lower.includes('pin') || lower.includes('bank ask')) {
      if (lower.includes('upi') || lower.includes('receive money') || lower.includes('qr code') || lower.includes('refund')) {
        return `### 🛑 CRITICAL ADVICE: Never Enter UPI PIN to Receive Money!

**Verdict:** 🚨 **100% FRAUD ATTEMPT**

#### Key Facts You Must Know:
- **UPI Rule:** You **NEVER** need to enter your UPI PIN, scan a QR code, or approve a request to **receive money** into your bank account.
- **PIN is only for sending money:** Entering your UPI PIN will **deduct** funds from your account instantly.
- **Fake Refund Trap:** Fraudsters claim "Enter PIN to receive INR 15,000 refund" — entering your PIN authorizes the bank to transfer money TO the scammer.

#### 🛡️ What You Should Do Right Now:
1. **Cancel the Transaction:** Do not enter your PIN or tap "Pay/Approve".
2. **Block the Sender:** Block the phone number and report the UPI ID in your payment app (GPay, PhonePe, Paytm).
3. **Never Share OTPs:** Legitimate bank officials will never ask for your 6-digit OTP code over SMS, call, or chat.`;
      }

      return `### 🔒 Will a Bank or Company Ever Ask for Your OTP?

**Direct Answer:** **NEVER. Absolutely Not.**

#### Why This is Dangerous:
- **What is an OTP?** A One-Time Password is the final security barrier protecting your bank account, email, or social media.
- **Why Scammers Want It:** If they have your phone number or email, they attempt to reset your password or transfer money — but the bank stops them and sends an OTP to *your* phone.
- **The Lie:** They will pretend to be bank managers, delivery agents, or support staff and say *"Share the code to verify your identity or cancel a fraud transaction."*

#### 🛡️ Immediate Safety Rules:
1. **Never read or type your OTP** to anyone over call, SMS, WhatsApp, or unverified web forms.
2. If you already shared an OTP, **call your bank immediately** to block your debit card and internet banking.`;
    }

    // Clicked Suspicious Link
    if (lower.includes('clicked') || lower.includes('opened link') || lower.includes('mistake') || lower.includes('entered my password')) {
      return `### 🚨 What to Do If You Clicked a Suspicious Link

Don't panic — follow these emergency security steps immediately:

#### 1. Disconnect Device
- Turn off **Wi-Fi** and **Mobile Data** on your phone/computer right away to prevent background malware communication.

#### 2. Change Passwords Immediately (From a Clean Device)
- Use a **different device** (like a trusted family member's phone or computer) to log into your primary accounts (Google, Apple, Bank, Email) and change your passwords.
- Choose **"Log out of all active sessions/devices"**.

#### 3. Enable Two-Factor Authentication (2FA)
- Turn on 2FA via an authenticator app (Google Authenticator) on all essential accounts.

#### 4. If You Entered Card Details or Bank Info:
- Call your bank's official 24x7 helpline (from the back of your debit card) and request an **immediate temporary block on cards & netbanking**.

#### 5. Scan Your Device for Malware:
- Run a full scan using your device's built-in antivirus (e.g. Windows Defender or Google Play Protect).`;
    }

    // Telegram / Part-Time Job Scams
    if (lower.includes('telegram') || lower.includes('job') || lower.includes('part time') || lower.includes('like video') || lower.includes('rating') || lower.includes('hotel review')) {
      return `### ⚠️ Warning: Fake "Work from Home / Part-Time Job" Scam

**Verdict:** 🚨 **DANGEROUS TASK-BASED FRAUD**

#### How This Scam Works:
1. **The Bait:** You receive a WhatsApp/Telegram message offering ₹2,000–₹10,000 per day for simple tasks like *liking YouTube videos, reviewing hotels on Google Maps, or rating products*.
2. **The Hook:** They actually pay you a tiny amount (₹150–₹500) initially to gain your trust.
3. **The Trap:** They ask you to join a Telegram group and pay a "prepaid deposit" (₹5,000 to ₹50,000) for "higher return investment tasks". Once you send money, they lock your funds and demand more fees.

#### 🛡️ What You Should Do:
- **Do not deposit any money.** You will never get it back.
- **Block and report** the Telegram channels and contact numbers.
- Legitimate companies never charge candidates money to work or ask them to do prepaid crypto/trading tasks.`;
    }

    // Lottery / Customs / Prize Traps
    if (lower.includes('lottery') || lower.includes('prize') || lower.includes('won') || lower.includes('customs') || lower.includes('parcel')) {
      return `### 🎁 Is This Lottery or Parcel Message Real?

**Verdict:** 🚨 **100% FAKE PRIZE / ADVANCE-FEE SCAM**

#### Red Flags:
- You cannot win a lottery or sweepstakes you never bought a ticket for.
- Scammers ask for a "processing fee", "customs clearance duty", or "tax deposit" to release your jackpot or courier package.
- Once the fee is paid, the scammer disappears.

#### 🛡️ Rule of Thumb:
If anyone asks you to pay money to receive a prize, reward, or parcel — **it is a scam.** Delete and block immediately.`;
    }

    // Fake Website / URL Check
    if (lower.includes('website') || lower.includes('fake') || lower.includes('lookalike') || lower.includes('domain') || lower.includes('url')) {
      return `### 🔍 How to Tell If a Website or Link is Fake

#### 1. Look for Typosquatting (Letter Swaps)
Scammers register addresses that look real at first glance:
- Real: \`paypal.com\` ➡️ Fake: \`paypa1-security.example\` or \`paypal-verify24.com\`
- Real: \`microsoft.com\` ➡️ Fake: \`micros0ft-portal.net\`
- Real: \`amazon.com\` ➡️ Fake: \`amaz0n-orders.xyz\`

#### 2. Check the Ending (TLD)
Be extra careful with unusual domains like \`.xyz\`, \`.top\`, \`.online\`, \`.cc\`, or \`.tk\` claiming to be banks or government portals.

#### 3. Unofficial Subdomains
A link like \`sbi.bank-login-update.com\` is **NOT** SBI — the actual root domain is \`bank-login-update.com\` (owned by a scammer).

#### 4. Use the KAAVALX Scanner
Paste the exact link into the **KAAVALX Scam Checker** on this page to analyze the domain reputation and threat level instantly!`;
    }
  }

  // 1. Phishing / URL / Security analysis queries
  if (lower.includes('http') || lower.includes('.com') || lower.includes('.example') || lower.includes('phish') || lower.includes('threat') || lower.includes('scam') || lower.includes('otp') || lower.includes('password')) {
    const isLookalike = lower.includes('paypa1') || lower.includes('bank') || lower.includes('security') || lower.includes('login') || lower.includes('verify');
    
    return `### 🛡️ KAAVALX Threat Intelligence Analysis

**Assessment:** ${isLookalike ? '🚨 **CRITICAL SECURITY THREAT DETECTED**' : '⚠️ **POTENTIAL SUSPICIOUS PATTERN**'}

| Indicator | Finding |
| :--- | :--- |
| **Threat Classification** | ${lower.includes('otp') ? 'OTP / 2FA Interception & Credential Theft' : 'Brand Impersonation & Phishing'} |
| **Risk Score** | **${isLookalike ? '88 / 100 (CRITICAL)' : '65 / 100 (HIGH)'}** |
| **Domain Analysis** | Lookalike or unverified external host |
| **Social Engineering** | Urgent fear escalation & credential coercion |

#### 🔍 Technical Breakdown:
1. **Deceptive Tactics:** The message uses coercive urgency to bypass customer vigilance.
2. **Harvesting Mechanism:** Attempts to lure victim to an unauthenticated verification link to capture credentials.

#### 📋 Recommended Action:
- 🚫 **Do Not Click:** Avoid opening the destination web link.
- 🔒 **Never Disclose Credentials:** Keep passwords and one-time verification pins private.
- ✉️ **Block Sender:** Mark message as junk/phishing in your messaging application.`;
  }

  // 2. Live Database & Metrics queries
  if (lower.includes('database') || lower.includes('metrics') || lower.includes('how many') || lower.includes('status') || lower.includes('unresolved') || lower.includes('summary')) {
    if (dbContext) {
      return `### 📊 Live KAAVALX Intelligence Summary

Here is the current operational status from the database:

- **Total Recorded Conversations:** \`${dbContext.kpi.totalConversations}\`
- **Active Unresolved Complaints:** \`${dbContext.kpi.unresolvedCases}\`
- **Detected Cybersecurity Threats:** \`${dbContext.kpi.totalThreats}\` (*${dbContext.kpi.criticalThreats} Critical*)

#### 📈 Top Support Complaint Categories:
${dbContext.topCategories.map(c => `- **${c.category}:** ${c.count} cases`).join('\n')}

#### 🚨 Recent High-Risk Flagged Threats:
${dbContext.recentThreats.slice(0, 3).map(t => `- **${t.customer_name}**: ${t.threat_type} (Score: ${t.risk_score} — *${t.risk_level}*)`).join('\n')}

*All metrics are queried in real-time from the KAAVALX security repository.*`;
    }
  }

  // 3. Customer Support Response Drafting queries
  if (lower.includes('reply') || lower.includes('draft') || lower.includes('response') || lower.includes('email') || lower.includes('refund') || lower.includes('complaint')) {
    return `### ✉️ Suggested Customer Support Response

**Subject:** Update regarding your support request — KAAVALX Care Team

Dear Customer,

Thank you for reaching out to our support team. We sincerely apologize for the inconvenience and frustration this issue has caused you.

We have reviewed your account details regarding the recent issue. Our billing and technical team is actively prioritizing your case to ensure a complete resolution within **24 hours**.

- **Action Taken:** Issue escalated to senior resolver team.
- **Reference Ticket:** \`CASE-${Math.floor(100000 + Math.random() * 900000)}\`

Please rest assured that if any erroneous charges were incurred, a full refund will be processed back to your original payment method immediately.

If you have any further questions or need additional assistance, simply reply directly to this message.

Warm regards,  
**Customer Support Specialist**  
*KAAVALX Support Operations*`;
  }

  // Default Guidance Response for Consumer Security
  return `### 🛡️ KAAVALX AI Scam & Safety Advisor Ready

I am here to help you solve any doubts regarding online scams, suspicious links, and messages. Here are things you can ask me:

1. **"Can my bank ever ask for my OTP or password?"**
2. **"Do I need to enter my UPI PIN to receive money?"**
3. **"I clicked a suspicious link by mistake, what should I do?"**
4. **"Is this Telegram part-time job offer real or fake?"**
5. **"How do I check if a website link is authentic?"**

*You can also paste any suspicious text or link in the Scam Checker above to run a deep threat scan!*`;
}

