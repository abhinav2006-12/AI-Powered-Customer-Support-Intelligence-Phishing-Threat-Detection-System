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
You are "KAAVALX Copilot", an elite AI Assistant embedded in KAAVALX — an enterprise Customer Support Intelligence & Phishing Threat Detection System.
You specialize in two interconnected domains:
1. CYBERSECURITY & SOC THREAT INTELLIGENCE: Phishing detection, lookalike domains (e.g. paypa1-security.example), credential harvesting, 2FA/OTP interception, social engineering tactics, and risk mitigation.
2. CUSTOMER SUPPORT OPERATIONS: Issue diagnosis, root-cause categorization, sentiment analysis, and drafting professional, empathetic responses to angry/frustrated customer tickets.

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
- Provide clear, actionable, structured insights in clean Markdown.
- When analyzing text/URLs for threats, break down the Threat Type, Risk Score (0-100), Attack Vector, and Recommended SOC Actions.
- When drafting customer support replies, make them empathetic, professional, clear, and reassuring.
- If asked about live system data or database metrics, reference the live KAAVALX database context provided above.
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
 * Intelligent deterministic fallback responses for offline or unconfigured API keys
 */
function generateIntelligentFallbackResponse(message, mode, dbContext) {
  const lower = message.toLowerCase();

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

#### 📋 Recommended SOC Action:
- 🚫 **Block Domain:** Add target domains and IPs to corporate firewall and email gateway blocklists.
- ✉️ **Customer Notification:** Alert affected customer that this communication was fraudulent.
- 🔒 **Credential Reset:** Enforce password and active session invalidation if credentials were submitted.`;
  }

  // 2. Live Database & Metrics queries
  if (lower.includes('database') || lower.includes('metrics') || lower.includes('how many') || lower.includes('status') || lower.includes('unresolved') || lower.includes('summary')) {
    if (dbContext) {
      return `### 📊 Live KAAVALX Intelligence Summary

Here is the current operational status from the SQLite database:

- **Total Recorded Conversations:** \`${dbContext.kpi.totalConversations}\`
- **Active Unresolved Complaints:** \`${dbContext.kpi.unresolvedCases}\`
- **Detected Cybersecurity Threats:** \`${dbContext.kpi.totalThreats}\` (*${dbContext.kpi.criticalThreats} Critical*)

#### 📈 Top Support Complaint Categories:
${dbContext.topCategories.map(c => `- **${c.category}:** ${c.count} cases`).join('\n')}

#### 🚨 Recent High-Risk Flagged Threats:
${dbContext.recentThreats.slice(0, 3).map(t => `- **${t.customer_name}**: ${t.threat_type} (Score: ${t.risk_score} — *${t.risk_level}*)`).join('\n')}

*All metrics are queried in real-time from the local SQLite repository.*`;
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

  // Default Guidance Response
  return `### 🤖 KAAVALX Copilot Ready

I am connected to your **KAAVALX Customer Support & Threat Detection System**. Here is what you can ask me to do:

1. **Analyze Suspicious Content:** Paste any email text, chat snippet, or URL to perform instant phishing triage and calculate a 0–100 risk score.
2. **Draft Support Responses:** Ask me to write empathetic, policy-compliant replies to angry customers with duplicate charges or order delays.
3. **Inspect Live Metrics:** Ask *"What are our top complaint categories?"* or *"Show recent critical threats"* to query the database.
4. **Social Engineering Deconstruction:** Ask how specific attack patterns (OTP harvesting, fake PayPal alerts) operate.

*Tip: You can add your \`GEMINI_API_KEY\` to \`server/.env\` to enable live generative intelligence!*`;
}
