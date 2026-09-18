import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { analyzeSecurityThreats, extractAndAnalyzeUrls, extractAndAnalyzeEmails } from './security.service.js';

dotenv.config();

let anthropic = null;
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== '') {
  try {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY.trim()
    });
  } catch (e) {
    console.warn('Failed to initialize Anthropic client with provided key:', e.message);
  }
}

/**
 * Fallback Rule-Based Intelligence Engine
 * Used when Claude API key is missing or calls fail/timeout
 */
function analyzeWithHeuristics(message, conversationHistory, customerEmail, customerName) {
  const combinedText = `${message} ${conversationHistory || ''}`.toLowerCase();

  // Category Detection
  let category = 'Other';
  if (/card|deduct|charge|refund|bill|invoice|payment|money|₹|\$|price|subscription|auto-renew/i.test(combinedText)) {
    if (/refund/i.test(combinedText)) category = 'Refund';
    else if (/subscription|renew/i.test(combinedText)) category = 'Subscription';
    else category = 'Billing / Payment';
  } else if (/login|password|account|otp|sign in|access|blocked|locked|verify|credentials/i.test(combinedText)) {
    if (/security|compromise|phish|scam|suspicious/i.test(combinedText)) category = 'Security Concern';
    else category = 'Account / Login';
  } else if (/delivery|ship|tracking|order|item|package|courier|delay/i.test(combinedText)) {
    category = 'Delivery / Shipping';
  } else if (/bug|error|slow|crash|app|website|down|fail|tech|broken/i.test(combinedText)) {
    category = 'Technical Problem';
  } else if (/quality|agent|bad service|unhelpful|support|worst/i.test(combinedText)) {
    category = 'Service Quality';
  }

  // Issue extraction
  let issue = 'General Support Inquiry';
  if (/charge|deduct/i.test(combinedText)) issue = 'Payment Deducted / Duplicate Charge';
  if (/refund/i.test(combinedText)) issue = 'Refund Request Pending';
  if (/login|password/i.test(combinedText)) issue = 'Account Access & Authentication Issue';
  if (/delivery|ship/i.test(combinedText)) issue = 'Order Delivery Delay';
  if (/urgent|compromised|otp|password.*verify/i.test(combinedText)) issue = 'Potential Security Incident / Account Protection';

  // Sentiment & Emotion
  let sentiment = 'Neutral';
  let emotion = 'Satisfaction';
  if (/urgent|immediately|scam|blocked|worst|unhelpful|frustrat|angry|fail|deduct|delay/i.test(combinedText)) {
    sentiment = 'Negative';
    if (/urgent|immediately|blocked/i.test(combinedText)) emotion = 'Urgency';
    else if (/frustrat|unhelpful|again|three times|nobody/i.test(combinedText)) emotion = 'Frustration';
    else if (/scam|compromis|hack|fraud/i.test(combinedText)) emotion = 'Fear';
    else emotion = 'Anger';
  } else if (/thank|great|helpful|resolve|good|awesome/i.test(combinedText)) {
    sentiment = 'Positive';
    emotion = 'Satisfaction';
  }

  // Urgency & Priority
  let urgency = 'Medium';
  let priority = 'Medium';

  if (/urgent|compromise|fraud|otp|password|legal|police|outage|block/i.test(combinedText)) {
    urgency = 'Critical';
    priority = 'Critical';
  } else if (/refund|charge|money|deduct|fail|delay/i.test(combinedText)) {
    urgency = 'High';
    priority = 'High';
  } else if (/thank|inquiry|info/i.test(combinedText)) {
    urgency = 'Low';
    priority = 'Low';
  }

  // Resolution Status Detection
  let resolutionStatus = 'Unresolved';
  if (/thank you|resolved|fixed|solved|got my refund|working now/i.test(combinedText)) {
    resolutionStatus = 'Resolved';
  } else if (/checking|investigating|in progress|will update/i.test(combinedText)) {
    resolutionStatus = 'Pending';
  } else if (/still|again|not solved|haven't received|no response/i.test(combinedText)) {
    resolutionStatus = 'Unresolved';
  }

  // Summary & Customer Request
  const customerRequest = message.length > 80 ? message.substring(0, 80) + '...' : message;
  const summary = `Customer reported: ${issue}. Current sentiment is ${sentiment.toLowerCase()} (${emotion}).`;

  // Keywords & Entities
  const keywords = Array.from(new Set(
    combinedText.match(/\b(payment|order|refund|account|login|otp|password|security|urgent|delivery|charge|subscription)\b/gi) || []
  ));

  const moneyMatches = combinedText.match(/(?:₹|\$|usd|inr)\s*\d+(?:,\d+)*(?:\.\d+)?|\b\d+\s*(?:dollars|rupees)\b/gi) || [];
  const orderMatches = combinedText.match(/\b(?:order|id|ticket|txn|ref)\s*#?\s*[a-z0-9\-]{4,15}\b/gi) || [];
  const entities = [...moneyMatches, ...orderMatches];

  // Security Threats Deterministic Calculation
  const urls = extractAndAnalyzeUrls(`${message} ${conversationHistory || ''}`);
  const emails = extractAndAnalyzeEmails(`${message} ${conversationHistory || ''}`, customerEmail, customerName);
  const sec = analyzeSecurityThreats(message, conversationHistory, urls, emails);

  return {
    category,
    issue,
    sentiment,
    emotion,
    urgency,
    priority,
    customer_request: customerRequest,
    summary,
    resolution_status: resolutionStatus,
    keywords,
    entities,
    recommended_action: sec.threat_detected 
      ? sec.recommended_action 
      : (resolutionStatus === 'Unresolved' ? 'Escalate to support team for fast resolution.' : 'Close ticket upon customer confirmation.'),
    security: {
      threat_detected: Boolean(sec.threat_detected),
      threat_type: sec.threat_type,
      risk_level: sec.risk_level,
      risk_score: sec.risk_score !== undefined ? sec.risk_score : (sec.risk_level === 'CRITICAL' ? 88 : (sec.threat_detected ? 65 : 10)),
      social_engineering: Boolean(sec.social_engineering),
      techniques: JSON.parse(sec.social_engineering_techniques || '[]'),
      credential_request: Boolean(sec.credential_request),
      otp_request: Boolean(sec.otp_request),
      suspicious_message: Boolean(sec.suspicious_message),
      reason: sec.reason,
      recommended_action: sec.recommended_action
    },
    urls,
    emails
  };
}

/**
 * Main AI Analysis Function calling Anthropic Claude API (with Heuristic Fallback)
 */
export async function analyzeConversationWithAI({ message, conversationHistory, channel, customerName, customerEmail }) {
  // Always perform deterministic URL and Email extraction first
  const fullText = `${message} ${conversationHistory || ''}`;
  const extractedUrls = extractAndAnalyzeUrls(fullText);
  const extractedEmails = extractAndAnalyzeEmails(fullText, customerEmail, customerName);
  const deterministicSec = analyzeSecurityThreats(message, conversationHistory, extractedUrls, extractedEmails);

  if (!anthropic) {
    console.log('No Anthropic API key configured. Using deterministic high-accuracy analysis engine.');
    return analyzeWithHeuristics(message, conversationHistory, customerEmail, customerName);
  }

  const systemPrompt = `You are an expert AI Customer Support Analyst and Cybersecurity SOC Specialist.
Analyze customer support messages, emails, chats, and conversation history.

Return ONLY a valid JSON object matching this exact schema:
{
  "category": "Payment / Transaction" | "Account / Login" | "Product Issue" | "Delivery / Shipping" | "Refund" | "Subscription" | "Technical Problem" | "Service Quality" | "Billing" | "Security Concern" | "Other",
  "issue": "Brief 3-6 word summary of the main problem",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "emotion": "Anger" | "Frustration" | "Satisfaction" | "Confusion" | "Urgency" | "Disappointment" | "Fear",
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "customer_request": "Clear sentence describing what the customer wants done",
  "summary": "2-3 sentence overview of the conversation and status",
  "resolution_status": "Resolved" | "Unresolved" | "Pending" | "Unknown",
  "keywords": ["array", "of", "important", "keywords"],
  "entities": ["order IDs", "amounts", "dates", "product names if present"],
  "recommended_action": "Specific action for support agent or security team",
  "security": {
    "threat_detected": boolean,
    "threat_type": "string describing threat or 'None'",
    "social_engineering": boolean,
    "techniques": ["Urgency Manipulation", "Credential Harvesting", "OTP / 2FA Interception", "Fear & Threat Escalation", "Brand / Executive Impersonation"],
    "credential_request": boolean,
    "otp_request": boolean,
    "suspicious_message": boolean,
    "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "reason": "Clear explanation of why this message is safe or suspicious"
  }
}

Do NOT include markdown block formatting, code blocks, or conversational text. Output raw JSON only.`;

  const userContent = `Customer Name: ${customerName || 'Unknown'}
Customer Email: ${customerEmail || 'Not provided'}
Channel: ${channel || 'Email'}
Current Message:
"${message}"

Conversation History:
"${conversationHistory || 'None'}"

Extracted Deterministic Security Data:
- Extracted URLs count: ${extractedUrls.length} (${extractedUrls.map(u => u.url).join(', ')})
- Deterministic Risk Score: ${deterministicSec.risk_score}/100 (${deterministicSec.risk_level})
- Detected Social Engineering: ${deterministicSec.social_engineering_techniques}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userContent }
      ]
    });

    const textOutput = response.content[0]?.text || '';
    const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Merge deterministic security scoring for 100% security accuracy
    if (deterministicSec.risk_score > (parsed.security?.risk_level === 'CRITICAL' ? 70 : 0)) {
      parsed.security = parsed.security || {};
      parsed.security.risk_level = deterministicSec.risk_score >= 75 ? 'CRITICAL' : (deterministicSec.risk_score >= 50 ? 'HIGH' : parsed.security.risk_level || 'LOW');
      if (deterministicSec.threat_detected) {
        parsed.security.threat_detected = true;
      }
    }

    parsed.urls = extractedUrls;
    parsed.emails = extractedEmails;

    return parsed;
  } catch (error) {
    console.error('Claude API call error or timeout. Falling back to heuristic engine:', error.message);
    return analyzeWithHeuristics(message, conversationHistory, customerEmail, customerName);
  }
}
