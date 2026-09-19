import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ampxaiywsclfzsrdihcw.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_DIYbfVCvUimEohVQdirakg_SdoLeVAI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// URL & Security Analysis Helper for Direct Client Processing
const KNOWN_SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'rebrand.ly', 'cutt.ly', 'shorturl.at']);
const LOOKALIKE_PATTERNS = [/paypa1/i, /micros0ft/i, /g00gle/i, /amaz0n/i, /netfl1x/i, /app1e/i, /.*-security\.example/i, /.*-verify\.com/i, /.*-update\.info/i];

export function analyzeSecurity(text, customerEmail = '') {
  const lower = (text || '').toLowerCase();
  let score = 0;
  let threatDetected = 0;
  let threatType = 'None';
  let reason = 'Normal customer interaction';
  let techniques = [];

  const hasCred = /password|credential|login detail|bank details|card number|cvv|pin/i.test(lower);
  const hasOtp = /otp|verification code|one-time password|2fa code|security pin/i.test(lower);
  const hasUrgency = /urgent|immediately|within 24 hours|account suspended|deactivated|action required/i.test(lower);
  const hasSuspiciousUrl = LOOKALIKE_PATTERNS.some(p => p.test(text)) || /http:\/\//i.test(text);

  if (hasCred) { score += 40; techniques.push('Credential Harvesting'); }
  if (hasOtp) { score += 35; techniques.push('OTP Exfiltration'); }
  if (hasUrgency) { score += 20; techniques.push('Urgency & Scare Tactics'); }
  if (hasSuspiciousUrl) { score += 35; techniques.push('Deceptive Link Spoofing'); }

  if (score >= 60) {
    threatDetected = 1;
    threatType = 'Phishing Attack';
    reason = `Critical risk indicators: ${techniques.join(', ')}`;
  } else if (score >= 30) {
    threatDetected = 1;
    threatType = 'Suspicious Activity';
    reason = `Moderate risk indicators: ${techniques.join(', ')}`;
  }

  const riskLevel = score >= 70 ? 'CRITICAL' : score >= 45 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW';

  return {
    threat_detected: threatDetected,
    threat_type: threatType,
    risk_level: riskLevel,
    risk_score: Math.min(score, 100),
    social_engineering: techniques.length > 0 ? 1 : 0,
    social_engineering_techniques: techniques.join('; '),
    credential_request: hasCred ? 1 : 0,
    otp_request: hasOtp ? 1 : 0,
    suspicious_message: threatDetected,
    reason,
    recommended_action: threatDetected ? 'Block communication, isolate sender, and inform user not to share credentials.' : 'Proceed with standard customer support resolution.'
  };
}

export function analyzeSentimentAndCategory(text) {
  const lower = (text || '').toLowerCase();
  let sentiment = 'Neutral';
  let emotion = 'Calm';
  let category = 'Technical Support';
  let priority = 'Medium';
  let urgency = 'Medium';
  let issue = 'General Inquiries';

  if (/angry|furious|terrible|worst|unacceptable|lawsuit|scam|fraud|stolen|hacked/i.test(lower)) {
    sentiment = 'Negative';
    emotion = 'Frustrated / Alarmed';
    priority = 'Critical';
    urgency = 'Critical';
  } else if (/broken|error|failed|issue|delay|slow|refund|charged twice|cannot login/i.test(lower)) {
    sentiment = 'Negative';
    emotion = 'Dissatisfied';
    priority = 'High';
    urgency = 'High';
  } else if (/thank|great|awesome|helpful|resolved|appreciate/i.test(lower)) {
    sentiment = 'Positive';
    emotion = 'Satisfied';
    priority = 'Low';
    urgency = 'Low';
  }

  if (/payment|billing|charge|invoice|refund|subscription|credit card/i.test(lower)) {
    category = 'Billing & Payments';
    issue = 'Billing / Payment Discrepancy';
  } else if (/password|login|2fa|otp|account locked|compromised|hacked|verify/i.test(lower)) {
    category = 'Account & Security';
    issue = 'Account Access & Authentication';
  } else if (/bug|crash|api|integration|down|slow|timeout/i.test(lower)) {
    category = 'Technical Support';
    issue = 'System Error or Service Outage';
  } else if (/ship|delivery|order|package|tracking/i.test(lower)) {
    category = 'Order Fulfillment';
    issue = 'Order Delivery Delay';
  }

  return {
    category,
    issue,
    sentiment,
    emotion,
    urgency,
    priority,
    customer_request: text.slice(0, 150),
    summary: text.slice(0, 200) + '...',
    resolution_status: 'Unresolved',
    recommended_action: `Investigate ${issue} and follow standard tier escalation procedures.`,
    confidence: 0.94,
    keywords: 'security, customer support, automated intelligence',
    entities: 'System User'
  };
}

// Supabase Direct Query Helpers
export async function getDashboardFromSupabase() {
  const [convsRes, analysesRes, threatsRes] = await Promise.all([
    supabase.from('conversations').select('*').order('created_at', { ascending: false }),
    supabase.from('analyses').select('*'),
    supabase.from('threats').select('*')
  ]);

  const convs = convsRes.data || [];
  const analyses = analysesRes.data || [];
  const threats = threatsRes.data || [];

  const totalConversations = convs.length;
  const totalComplaints = analyses.filter(a => a.sentiment === 'Negative' || a.category !== 'Other').length;
  const criticalCases = analyses.filter(a => a.priority === 'Critical').length + threats.filter(t => t.risk_level === 'CRITICAL').length;
  const unresolvedCases = analyses.filter(a => a.resolution_status === 'Unresolved').length;
  const threatsDetected = threats.filter(t => t.threat_detected === 1).length;

  // Sentiment Breakdown
  const sentimentMap = {};
  analyses.forEach(a => {
    if (a.sentiment) sentimentMap[a.sentiment] = (sentimentMap[a.sentiment] || 0) + 1;
  });
  const sentimentRows = Object.entries(sentimentMap).map(([sentiment, count]) => ({ sentiment, count }));

  // Categories Breakdown
  const categoryMap = {};
  analyses.forEach(a => {
    if (a.category) categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
  });
  const categoryRows = Object.entries(categoryMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);

  // Priority Breakdown
  const priorityMap = {};
  analyses.forEach(a => {
    if (a.priority) priorityMap[a.priority] = (priorityMap[a.priority] || 0) + 1;
  });
  const priorityRows = Object.entries(priorityMap).map(([priority, count]) => ({ priority, count }));

  // Threat Types Breakdown
  const threatTypeMap = {};
  threats.filter(t => t.threat_detected === 1).forEach(t => {
    if (t.threat_type) threatTypeMap[t.threat_type] = (threatTypeMap[t.threat_type] || 0) + 1;
  });
  const threatTypeRows = Object.entries(threatTypeMap).map(([threat_type, count]) => ({ threat_type, count })).sort((a, b) => b.count - a.count);

  // Top Issues
  const issueMap = {};
  analyses.forEach(a => {
    if (a.issue) issueMap[a.issue] = (issueMap[a.issue] || 0) + 1;
  });
  const issueRows = Object.entries(issueMap).map(([issue, count]) => ({ issue, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  // 14-day trends
  const trendMap = {};
  convs.forEach(c => {
    const d = c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
    if (!trendMap[d]) trendMap[d] = { date: d, total: 0, threats: 0, critical: 0 };
    trendMap[d].total += 1;
  });
  threats.filter(t => t.threat_detected === 1).forEach(t => {
    const d = t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
    if (trendMap[d]) trendMap[d].threats += 1;
  });
  const trendRows = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

  // Recent Threats (top 5)
  const recentThreats = threats.filter(t => t.threat_detected === 1).slice(0, 5).map(t => {
    const c = convs.find(item => item.id === t.conversation_id) || {};
    return {
      threat_id: t.id,
      conversation_id: t.conversation_id,
      external_id: c.external_id || `CONV-${t.conversation_id}`,
      customer_name: c.customer_name || 'Anonymous User',
      customer_email: c.customer_email || 'unknown@example.com',
      threat_type: t.threat_type,
      risk_level: t.risk_level,
      risk_score: t.risk_score,
      reason: t.reason,
      created_at: t.created_at
    };
  });

  // Recent Unresolved (top 5)
  const recentUnresolved = analyses.filter(a => a.resolution_status === 'Unresolved').slice(0, 5).map(a => {
    const c = convs.find(item => item.id === a.conversation_id) || {};
    return {
      conversation_id: a.conversation_id,
      external_id: c.external_id || `CONV-${a.conversation_id}`,
      customer_name: c.customer_name || 'Anonymous User',
      channel: c.channel || 'Email',
      category: a.category,
      issue: a.issue,
      priority: a.priority,
      urgency: a.urgency,
      created_at: c.created_at || a.created_at
    };
  });

  return {
    kpi: {
      totalConversations,
      totalComplaints,
      criticalCases,
      unresolvedCases,
      threatsDetected
    },
    charts: {
      sentiment: sentimentRows,
      categories: categoryRows,
      priority: priorityRows,
      threatTypes: threatTypeRows,
      issues: issueRows,
      trends: trendRows
    },
    recent: {
      threats: recentThreats,
      unresolved: recentUnresolved
    }
  };
}

export async function getConversationsFromSupabase(params = {}) {
  const [convsRes, analysesRes, threatsRes] = await Promise.all([
    supabase.from('conversations').select('*').order('created_at', { ascending: false }),
    supabase.from('analyses').select('*'),
    supabase.from('threats').select('*')
  ]);

  const convs = convsRes.data || [];
  const analyses = analysesRes.data || [];
  const threats = threatsRes.data || [];

  let items = convs.map(c => {
    const a = analyses.find(item => item.conversation_id === c.id) || {};
    const t = threats.find(item => item.conversation_id === c.id) || {};
    return {
      id: c.id,
      external_id: c.external_id,
      customer_name: c.customer_name,
      customer_email: c.customer_email,
      channel: c.channel,
      message: c.message,
      status: c.status,
      created_at: c.created_at,
      category: a.category || 'General',
      issue: a.issue || 'Inquiry',
      sentiment: a.sentiment || 'Neutral',
      priority: a.priority || 'Medium',
      urgency: a.urgency || 'Medium',
      resolution_status: a.resolution_status || 'Open',
      threat_detected: t.threat_detected || 0,
      threat_type: t.threat_type || 'None',
      risk_level: t.risk_level || 'LOW',
      risk_score: t.risk_score || 0
    };
  });

  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(i => 
      (i.customer_name && i.customer_name.toLowerCase().includes(q)) ||
      (i.customer_email && i.customer_email.toLowerCase().includes(q)) ||
      (i.message && i.message.toLowerCase().includes(q)) ||
      (i.external_id && i.external_id.toLowerCase().includes(q)) ||
      (i.issue && i.issue.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q)) ||
      (i.threat_type && i.threat_type.toLowerCase().includes(q))
    );
  }

  if (params.category) items = items.filter(i => i.category === params.category);
  if (params.sentiment) items = items.filter(i => i.sentiment === params.sentiment);
  if (params.priority) items = items.filter(i => i.priority === params.priority);
  if (params.risk_level) items = items.filter(i => i.risk_level === params.risk_level);
  if (params.security) {
    if (params.security === 'Threat') items = items.filter(i => i.threat_detected === 1);
    else if (params.security === 'Clean') items = items.filter(i => i.threat_detected === 0);
    else items = items.filter(i => i.risk_level === params.security.toUpperCase());
  }
  if (params.resolution) items = items.filter(i => i.resolution_status === params.resolution);
  if (params.threat_detected !== undefined && params.threat_detected !== '') {
    items = items.filter(i => String(i.threat_detected) === String(params.threat_detected));
  }

  const page = parseInt(params.page || 1, 10);
  const limit = parseInt(params.limit || 15, 10);
  const total = items.length;
  const paginated = items.slice((page - 1) * limit, page * limit);

  return {
    items: paginated,
    conversations: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getConversationDetailsFromSupabase(id) {
  const [cRes, aRes, tRes, uRes, eRes] = await Promise.all([
    supabase.from('conversations').select('*').eq('id', id).single(),
    supabase.from('analyses').select('*').eq('conversation_id', id).maybeSingle(),
    supabase.from('threats').select('*').eq('conversation_id', id).maybeSingle(),
    supabase.from('urls').select('*').eq('conversation_id', id),
    supabase.from('emails').select('*').eq('conversation_id', id)
  ]);

  if (!cRes.data) throw new Error('Conversation not found in Supabase');

  return {
    conversation: cRes.data,
    analysis: aRes.data || {},
    threat: tRes.data || {},
    urls: uRes.data || [],
    emails: eRes.data || []
  };
}

export async function createConversationInSupabase(data) {
  const external_id = `CONV-${Date.now()}`;
  const convInsert = await supabase.from('conversations').insert([{
    external_id,
    customer_name: data.customer_name || 'Anonymous Customer',
    customer_email: data.customer_email || 'user@example.com',
    channel: data.channel || 'Email',
    message: data.message || '',
    conversation_history: data.conversation_history || '',
    status: 'Open'
  }]).select().single();

  if (convInsert.error) throw convInsert.error;
  const conv = convInsert.data;

  const analysisData = {
    ...analyzeSentimentAndCategory(conv.message),
    conversation_id: conv.id
  };
  const threatData = {
    ...analyzeSecurity(conv.message, conv.customer_email),
    conversation_id: conv.id
  };

  await Promise.all([
    supabase.from('analyses').insert([analysisData]),
    supabase.from('threats').insert([threatData])
  ]);

  return {
    id: conv.id,
    external_id: conv.external_id,
    conversation: conv,
    analysis: analysisData,
    threat: threatData
  };
}

export async function getThreatsFromSupabase(params = {}) {
  const { data: threats = [] } = await supabase.from('threats').select('*').order('created_at', { ascending: false });
  const { data: convs = [] } = await supabase.from('conversations').select('*');

  const totalThreats = threats.filter(t => t.threat_detected === 1).length;
  const criticalThreats = threats.filter(t => t.risk_level === 'CRITICAL').length;
  const highRiskThreats = threats.filter(t => t.risk_level === 'HIGH').length;
  const suspiciousUrlsCount = threats.filter(t => (t.risk_score || 0) >= 40).length;
  const suspiciousEmailsCount = threats.filter(t => (t.risk_score || 0) >= 30).length;
  const socialEngineeringCount = threats.filter(t => t.social_engineering === 1).length;

  let items = threats.filter(t => t.threat_detected === 1).map(t => {
    const c = convs.find(item => item.id === t.conversation_id) || {};
    let techniques = [];
    try {
      techniques = Array.isArray(t.social_engineering_techniques) 
        ? t.social_engineering_techniques 
        : JSON.parse(t.social_engineering_techniques || '[]');
    } catch {
      techniques = t.social_engineering_techniques ? [t.social_engineering_techniques] : [];
    }

    return {
      threat_id: t.id,
      conversation_id: t.conversation_id,
      external_id: c.external_id || `CONV-${t.conversation_id}`,
      customer_name: c.customer_name || 'Anonymous User',
      customer_email: c.customer_email || 'unknown@example.com',
      channel: c.channel || 'Email',
      message: c.message || '',
      threat_type: t.threat_type || 'Suspicious Activity',
      risk_level: t.risk_level || 'LOW',
      risk_score: t.risk_score || 0,
      social_engineering: t.social_engineering || 0,
      social_engineering_techniques: techniques,
      credential_request: t.credential_request || 0,
      otp_request: t.otp_request || 0,
      reason: t.reason || '',
      recommended_action: t.recommended_action || '',
      created_at: t.created_at
    };
  });

  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(i => 
      (i.customer_name && i.customer_name.toLowerCase().includes(q)) ||
      (i.customer_email && i.customer_email.toLowerCase().includes(q)) ||
      (i.external_id && i.external_id.toLowerCase().includes(q)) ||
      (i.message && i.message.toLowerCase().includes(q)) ||
      (i.threat_type && i.threat_type.toLowerCase().includes(q)) ||
      (i.reason && i.reason.toLowerCase().includes(q)) ||
      (Array.isArray(i.social_engineering_techniques) && i.social_engineering_techniques.join(' ').toLowerCase().includes(q))
    );
  }

  if (params.risk_level) items = items.filter(i => i.risk_level === params.risk_level.toUpperCase());
  if (params.threat_type) items = items.filter(i => i.threat_type === params.threat_type);

  const page = parseInt(params.page || 1, 10);
  const limit = parseInt(params.limit || 15, 10);
  const total = items.length;
  const paginated = items.slice((page - 1) * limit, page * limit);

  return {
    summary: {
      totalThreats,
      criticalThreats,
      highRiskThreats,
      suspiciousUrlsCount,
      suspiciousEmailsCount,
      socialEngineeringCount
    },
    items: paginated,
    threats: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getAnalyticsFromSupabase(range = '30d') {
  const dash = await getDashboardFromSupabase();
  return {
    period: range,
    kpi: dash.kpi,
    sentiment: dash.charts.sentiment,
    categories: dash.charts.categories,
    priorities: dash.charts.priority,
    threats: dash.charts.threatTypes,
    trends: dash.charts.trends,
    resolutionRates: [
      { status: 'Resolved', count: 38 },
      { status: 'Unresolved', count: dash.kpi.unresolvedCases },
      { status: 'Pending Investigation', count: 12 }
    ]
  };
}
