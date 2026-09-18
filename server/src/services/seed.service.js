import db from '../db/database.js';
import { extractAndAnalyzeUrls, extractAndAnalyzeEmails, analyzeSecurityThreats } from './security.service.js';

const CHANNELS = ['Email', 'Chat', 'Support Ticket', 'Contact Form', 'Social Media'];

const MOCK_CUSTOMERS = [
  { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com' },
  { name: 'Marcus Vance', email: 'marcus.vance@techcorp.io' },
  { name: 'Elena Rostova', email: 'elena.rostova@designhub.org' },
  { name: 'David Kim', email: 'david.kim@fintech-solutions.com' },
  { name: 'Priya Sharma', email: 'priya.sharma@globaltech.in' },
  { name: 'Alex Rivera', email: 'alex.rivera@startuplab.co' },
  { name: 'Liam O\'Connor', email: 'liam.oconnor@dublinnet.ie' },
  { name: 'Aisha Patel', email: 'aisha.patel@horizon.net' }
];

const SEED_TEMPLATES = [
  // 1. Phishing Case - Critical
  {
    channel: 'Email',
    customer_name: 'Security Alert System',
    customer_email: 'support@paypa1-security.example',
    message: 'URGENT! Your account has been compromised due to unauthorized access attempt. Click this link immediately http://paypa1-security.example/login to verify your identity. Enter your username, password and 6-digit OTP code to secure your account within 24 hours.',
    history: 'System Notice: Suspicious login detected from IP 104.28.1.5.',
    category: 'Security Concern',
    issue: 'Credential & OTP Harvesting Scam',
    sentiment: 'Negative',
    emotion: 'Fear',
    urgency: 'Critical',
    priority: 'Critical',
    request: 'Verify credentials and enter OTP immediately',
    summary: 'Phishing attack attempting to harvest PayPal login credentials and 2FA OTP codes via lookalike domain paypa1-security.example.',
    resolution: 'Unresolved'
  },
  // 2. Phishing Case - High Risk
  {
    channel: 'Support Ticket',
    customer_name: 'Microsoft Account Security',
    customer_email: 'security@micros0ft-update.info',
    message: 'Your Microsoft Office 365 license has expired. Verify your billing details and account credentials at http://micros0ft-update.info/billing-verify to prevent service termination.',
    history: 'Ticket #8849: Automated Renewal Notice',
    category: 'Security Concern',
    issue: 'Impersonation & Phishing Link',
    sentiment: 'Negative',
    emotion: 'Urgency',
    urgency: 'High',
    priority: 'High',
    request: 'Update billing credentials on external lookalike site',
    summary: 'Suspicious email impersonating Microsoft Office billing asking user to enter account credentials on a typosquatting domain.',
    resolution: 'Unresolved'
  },
  // 3. Normal Complaint - Duplicate Payment
  {
    channel: 'Email',
    customer_name: 'Priya Sharma',
    customer_email: 'priya.sharma@globaltech.in',
    message: 'My card was charged ₹2,500 twice for the annual subscription on order #ORD-98421. I only intended to purchase a single plan. Please check transaction ID TXN-99821 and process a refund for the extra charge.',
    history: 'Customer: ₹2,500 deducted twice.\nSupport: We are verifying transaction logs.',
    category: 'Billing',
    issue: 'Duplicate Payment Charge',
    sentiment: 'Negative',
    emotion: 'Frustration',
    urgency: 'High',
    priority: 'High',
    request: 'Refund duplicate ₹2,500 charge',
    summary: 'Customer experienced duplicate billing on subscription order #ORD-98421. Refund request pending verification.',
    resolution: 'Unresolved'
  },
  // 4. Normal Complaint - Delivery Delay
  {
    channel: 'Chat',
    customer_name: 'David Kim',
    customer_email: 'david.kim@fintech-solutions.com',
    message: 'I ordered the ergonomic keyboard on Monday (Order #KEY-7712), but tracking shows it hasn\'t been dispatched yet. Can you update me on the shipping status?',
    history: 'Support Agent: Checking with courier partner.',
    category: 'Delivery / Shipping',
    issue: 'Order Shipment Delay',
    sentiment: 'Neutral',
    emotion: 'Confusion',
    urgency: 'Medium',
    priority: 'Medium',
    request: 'Provide updated delivery timeline',
    summary: 'Customer inquiring about delayed dispatch for order #KEY-7712.',
    resolution: 'Pending'
  },
  // 5. Positive / Resolved Support Interaction
  {
    channel: 'Chat',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah.jenkins@example.com',
    message: 'Thank you so much! The password reset link worked and I am able to access my account now. Excellent support!',
    history: 'Customer: Cannot login.\nSupport: Sent reset token link.\nCustomer: Password reset successfully.',
    category: 'Account / Login',
    issue: 'Password Reset Successful',
    sentiment: 'Positive',
    emotion: 'Satisfaction',
    urgency: 'Low',
    priority: 'Low',
    request: 'No further action required',
    summary: 'Customer successfully regained access to account after password reset guidance.',
    resolution: 'Resolved'
  },
  // 6. Suspicious Free-Mail Security Threat
  {
    channel: 'Contact Form',
    customer_name: 'Bank Security Desk',
    customer_email: 'helpdesk.bank.security@gmail.com',
    message: 'ATTENTION: Your corporate banking profile is locked due to high-risk IP activity. Please respond immediately with your registered OTP code to unlock your profile.',
    history: '',
    category: 'Security Concern',
    issue: 'Free-Mail Impersonation Scam',
    sentiment: 'Negative',
    emotion: 'Urgency',
    urgency: 'Critical',
    priority: 'Critical',
    request: 'Share OTP code over contact form',
    summary: 'Fraudster using Gmail address claiming to be Bank Security asking for 2FA OTP codes.',
    resolution: 'Unresolved'
  },
  // 7. Technical Bug Report
  {
    channel: 'Support Ticket',
    customer_name: 'Alex Rivera',
    customer_email: 'alex.rivera@startuplab.co',
    message: 'Whenever I export reports to CSV format, the application throws a 500 internal server error. This is blocking our end-of-month finance audit.',
    history: 'Customer: Error 500 on CSV export.\nSupport: Engineering team investigating.',
    category: 'Technical Problem',
    issue: 'CSV Export Server Error',
    sentiment: 'Negative',
    emotion: 'Frustration',
    urgency: 'High',
    priority: 'High',
    request: 'Fix CSV export API bug',
    summary: 'Technical glitch in backend CSV generator causing HTTP 500 errors during financial report exports.',
    resolution: 'Pending'
  },
  // 8. Subscription Cancellation Request
  {
    channel: 'Email',
    customer_name: 'Elena Rostova',
    customer_email: 'elena.rostova@designhub.org',
    message: 'Please cancel my Pro subscription effective immediately. The auto-renew charged my card $149 yesterday, but I no longer use the product. Please refund the latest renewal charge.',
    history: '',
    category: 'Subscription',
    issue: 'Subscription Refund Request',
    sentiment: 'Neutral',
    emotion: 'Disappointment',
    urgency: 'Medium',
    priority: 'Medium',
    request: 'Cancel Pro plan and refund $149 renewal charge',
    summary: 'Customer requesting immediate plan cancellation and auto-renewal refund.',
    resolution: 'Unresolved'
  }
];

export function seedDatabase(count = 60) {
  // Clear existing tables
  db.prepare('DELETE FROM emails').run();
  db.prepare('DELETE FROM urls').run();
  db.prepare('DELETE FROM threats').run();
  db.prepare('DELETE FROM analyses').run();
  db.prepare('DELETE FROM conversations').run();

  const insertConv = db.prepare(`
    INSERT INTO conversations (external_id, customer_name, customer_email, channel, message, conversation_history, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAnalysis = db.prepare(`
    INSERT INTO analyses (conversation_id, category, issue, sentiment, emotion, urgency, priority, customer_request, summary, resolution_status, recommended_action, confidence, keywords, entities, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertThreat = db.prepare(`
    INSERT INTO threats (conversation_id, threat_detected, threat_type, risk_level, risk_score, social_engineering, social_engineering_techniques, credential_request, otp_request, suspicious_message, reason, recommended_action, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertUrl = db.prepare(`
    INSERT INTO urls (conversation_id, url, domain, subdomain, protocol, url_length, uses_ip, https, suspicious_characters, shortened, lookalike, risk_score, risk_reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEmail = db.prepare(`
    INSERT INTO emails (conversation_id, email, domain, display_name, domain_mismatch, lookalike, free_mail, risk_score, risk_reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const template = SEED_TEMPLATES[i % SEED_TEMPLATES.length];
      const customer = MOCK_CUSTOMERS[i % MOCK_CUSTOMERS.length];
      
      const extId = `CONV-${String(1000 + i).padStart(5, '0')}`;
      
      // Randomize dates over last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - daysAgo);
      dateObj.setHours(dateObj.getHours() - hoursAgo);
      const dateStr = dateObj.toISOString();

      const convResult = insertConv.run(
        extId,
        i % 2 === 0 ? template.customer_name : customer.name,
        i % 2 === 0 ? template.customer_email : customer.email,
        template.channel,
        template.message,
        template.history,
        template.resolution === 'Resolved' ? 'Resolved' : 'Open',
        dateStr,
        dateStr
      );

      const convId = convResult.lastInsertRowid;

      // Extract URLs and Emails dynamically
      const urls = extractAndAnalyzeUrls(`${template.message} ${template.history}`);
      const emails = extractAndAnalyzeEmails(`${template.message} ${template.history}`, template.customer_email, template.customer_name);
      const sec = analyzeSecurityThreats(template.message, template.history, urls, emails);

      // Insert Analysis
      insertAnalysis.run(
        convId,
        template.category,
        template.issue,
        template.sentiment,
        template.emotion,
        template.urgency,
        template.priority,
        template.request,
        template.summary,
        template.resolution,
        sec.threat_detected ? sec.recommended_action : 'Standard support escalation.',
        0.96,
        JSON.stringify(['support', 'ticket', template.category.toLowerCase()]),
        JSON.stringify([]),
        dateStr
      );

      // Insert Threat
      insertThreat.run(
        convId,
        sec.threat_detected,
        sec.threat_type,
        sec.risk_level,
        sec.risk_score,
        sec.social_engineering,
        sec.social_engineering_techniques,
        sec.credential_request,
        sec.otp_request,
        sec.suspicious_message,
        sec.reason,
        sec.recommended_action,
        dateStr
      );

      // Insert URLs
      urls.forEach(u => {
        insertUrl.run(
          convId,
          u.url,
          u.domain,
          u.subdomain,
          u.protocol,
          u.url_length,
          u.uses_ip,
          u.https,
          u.suspicious_characters,
          u.shortened,
          u.lookalike,
          u.risk_score,
          u.risk_reason,
          dateStr
        );
      });

      // Insert Emails
      emails.forEach(e => {
        insertEmail.run(
          convId,
          e.email,
          e.domain,
          e.display_name,
          e.domain_mismatch,
          e.lookalike,
          e.free_mail,
          e.risk_score,
          e.risk_reason,
          dateStr
        );
      });
    }
  });

  transaction();
  return { seededCount: count };
}
