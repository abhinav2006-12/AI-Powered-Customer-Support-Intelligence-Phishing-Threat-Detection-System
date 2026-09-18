// Deterministic Phishing & Security Risk Engine

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 
  'ow.ly', 'rebrand.ly', 'cutt.ly', 'tiny.cc', 'shorturl.at'
]);

const KNOWN_FREE_MAILS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
  'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'mail.com'
]);

const TRUSTED_BRANDS = [
  'paypal', 'microsoft', 'google', 'apple', 'amazon', 'netflix', 
  'chase', 'wellsfargo', 'bankofamerica', 'stripe', 'meta', 'facebook'
];

const LOOKALIKE_PATTERNS = [
  /paypa1/i, /micros0ft/i, /g00gle/i, /amaz0n/i, /netfl1x/i, /app1e/i,
  /secure-.*-login/i, /verify-.*-account/i, /support-.*-sec/i,
  /.*-security\.example/i, /.*-verify\.com/i, /.*-update\.info/i,
  /bank.*-alert/i, /account.*-suspended/i
];

/**
 * Safely extract and analyze URLs from conversation text
 */
export function extractAndAnalyzeUrls(text) {
  if (!text) return [];

  // Match URLs (including http, https, and standalone domain-like paths)
  const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9-]+\.(?:example|com|net|org|info|biz|io|security|verify)[^\s<>"]*)/gi;
  const matches = Array.from(new Set(text.match(urlRegex) || []));

  return matches.map(rawUrl => {
    let formattedUrl = rawUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'http://' + formattedUrl;
    }

    let urlObj;
    let hostname = '';
    let protocol = 'http';
    
    try {
      urlObj = new URL(formattedUrl);
      hostname = urlObj.hostname.toLowerCase();
      protocol = urlObj.protocol.replace(':', '');
    } catch (e) {
      hostname = rawUrl.split('/')[0].toLowerCase();
    }

    const isHttps = protocol === 'https';
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    
    // Subdomain & domain parsing
    const hostParts = hostname.split('.');
    let domain = hostname;
    let subdomain = '';
    if (hostParts.length > 2 && !isIp) {
      domain = hostParts.slice(-2).join('.');
      subdomain = hostParts.slice(0, -2).join('.');
    }

    const isShortened = KNOWN_SHORTENERS.has(hostname) || KNOWN_SHORTENERS.has(domain);
    const hasSuspiciousChars = /[@%=\-\_]{2,}|[0-9]{5,}|homoglyph/i.test(rawUrl);
    
    // Lookalike detection
    let isLookalike = LOOKALIKE_PATTERNS.some(pattern => pattern.test(hostname));
    if (!isLookalike) {
      // Check if domain contains brand name + extra words (e.g. paypal-security, google-verify)
      for (const brand of TRUSTED_BRANDS) {
        if (domain.includes(brand) && domain !== `${brand}.com` && domain !== `${brand}.net` && domain !== `${brand}.org`) {
          isLookalike = true;
          break;
        }
      }
    }

    let riskScore = 0;
    const reasons = [];

    if (isLookalike) {
      riskScore += 35;
      reasons.push('Lookalike / brand impersonation domain pattern detected');
    }
    if (isIp) {
      riskScore += 25;
      reasons.push('Uses IP address instead of registered domain name');
    }
    if (!isHttps) {
      riskScore += 15;
      reasons.push('Unencrypted HTTP protocol used');
    }
    if (isShortened) {
      riskScore += 15;
      reasons.push('URL shortener service obfuscating final destination');
    }
    if (hasSuspiciousChars) {
      riskScore += 15;
      reasons.push('Contains suspicious character encoding or symbol repetition');
    }
    if (hostname.length > 35 || rawUrl.length > 75) {
      riskScore += 10;
      reasons.push('Abnormally long URL / hostname length');
    }
    if (subdomain.split('.').length >= 3) {
      riskScore += 15;
      reasons.push('Excessive subdomain depth');
    }

    return {
      url: rawUrl,
      domain,
      subdomain,
      protocol,
      url_length: rawUrl.length,
      uses_ip: isIp ? 1 : 0,
      https: isHttps ? 1 : 0,
      suspicious_characters: hasSuspiciousChars ? 1 : 0,
      shortened: isShortened ? 1 : 0,
      lookalike: isLookalike ? 1 : 0,
      risk_score: Math.min(riskScore, 100),
      risk_reason: reasons.join('; ') || 'Standard web address'
    };
  });
}

/**
 * Extract and analyze email addresses from conversation text
 */
export function extractAndAnalyzeEmails(text, customerEmail = null, customerName = null) {
  if (!text && !customerEmail) return [];

  const emailsFound = new Set();
  if (customerEmail) emailsFound.add(customerEmail.trim());

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const matches = (text || '').match(emailRegex) || [];
  matches.forEach(e => emailsFound.add(e.trim()));

  return Array.from(emailsFound).map(email => {
    const parts = email.toLowerCase().split('@');
    const domain = parts[1] || '';
    const localPart = parts[0] || '';

    const isFreeMail = KNOWN_FREE_MAILS.has(domain);
    let isLookalike = LOOKALIKE_PATTERNS.some(pattern => pattern.test(domain));
    let domainMismatch = false;

    // Check display name or customer name against domain
    const nameToCheck = (customerName || '').toLowerCase();
    for (const brand of TRUSTED_BRANDS) {
      if ((nameToCheck.includes(brand) || localPart.includes(brand)) && !domain.includes(brand)) {
        domainMismatch = true;
      }
      if (domain.includes(brand) && !domain.endsWith(`${brand}.com`)) {
        isLookalike = true;
      }
    }

    let riskScore = 0;
    const reasons = [];

    if (isLookalike) {
      riskScore += 35;
      reasons.push('Email domain uses lookalike characters or brand spoofing');
    }
    if (domainMismatch) {
      riskScore += 25;
      reasons.push('Sender display name or claim mismatches actual email domain');
    }
    if (isFreeMail && (text || '').toLowerCase().includes('official') || (text || '').toLowerCase().includes('security')) {
      riskScore += 20;
      reasons.push('Free public email domain used for official security communications');
    }

    return {
      email,
      domain,
      display_name: customerName || localPart,
      domain_mismatch: domainMismatch ? 1 : 0,
      lookalike: isLookalike ? 1 : 0,
      free_mail: isFreeMail ? 1 : 0,
      risk_score: Math.min(riskScore, 100),
      risk_reason: reasons.join('; ') || 'Standard email address format'
    };
  });
}

/**
 * Hybrid Deterministic Security Engine
 * Analyzes conversation text, URLs, and emails to produce security metrics
 */
export function analyzeSecurityThreats(message = '', conversationHistory = '', extractedUrls = [], extractedEmails = []) {
  const combinedText = `${message} ${conversationHistory}`.toLowerCase();

  // Social Engineering Detectors
  const hasCredentialRequest = /password|passcode|user\s*name|login\s*credentials|enter\s*your\s*password|sign\s*in\s*details|verify\s*your\s*credentials/i.test(combinedText);
  const hasOtpRequest = /\botp\b|one\s*time\s*password|verification\s*code|2fa\s*code|security\s*code|6\s*digit\s*code|authenticator\s*code/i.test(combinedText);
  const hasUrgency = /urgent|immediately|within\s*24\s*hours|act\s*now|right\s*now|before\s*it\s*is\s*too\s*late|account\s*will\s*be\s*blocked/i.test(combinedText);
  const hasFearThreat = /permanently\s*blocked|disabled|suspended|unauthorized\s*activity|legal\s*action|arrest|fraud\s*alert|compromised/i.test(combinedText);
  const hasImpersonation = /official\s*support|security\s*team|customer\s*care\s*head|fraud\s*prevention|bank\s*officer/i.test(combinedText);
  const hasPaymentScam = /transfer\s*funds|wire\s*money|gift\s*card|crypto|bitcoin|send\s*\$|pay\s*immediately/i.test(combinedText);

  // Social Engineering Techniques list
  const techniques = [];
  if (hasUrgency) techniques.push('Urgency Manipulation');
  if (hasCredentialRequest) techniques.push('Credential Harvesting');
  if (hasOtpRequest) techniques.push('OTP / 2FA Interception');
  if (hasFearThreat) techniques.push('Fear & Threat Escalation');
  if (hasImpersonation) techniques.push('Brand / Executive Impersonation');
  if (hasPaymentScam) techniques.push('Fraudulent Payment Request');

  const socialEngineering = techniques.length > 0;

  // Deterministic Scoring System (As defined in prompt section 18)
  let score = 0;
  const scoreReasons = [];

  const hasSuspiciousUrl = extractedUrls.some(u => u.risk_score >= 25);
  const hasLookalikeUrl = extractedUrls.some(u => u.lookalike === 1);
  const hasSuspiciousEmail = extractedEmails.some(e => e.risk_score >= 20);

  if (hasSuspiciousUrl) {
    score += 30;
    scoreReasons.push('Suspicious URL structure detected (+30)');
  }
  if (hasLookalikeUrl) {
    score += 30;
    scoreReasons.push('Lookalike / typosquatting domain detected (+30)');
  }
  if (hasCredentialRequest) {
    score += 25;
    scoreReasons.push('Credential / password harvesting request (+25)');
  }
  if (hasOtpRequest) {
    score += 25;
    scoreReasons.push('OTP / 2FA security code request (+25)');
  }
  if (hasImpersonation) {
    score += 20;
    scoreReasons.push('Brand or security authority impersonation (+20)');
  }
  if (hasUrgency) {
    score += 10;
    scoreReasons.push('Coercive urgency language (+10)');
  }
  if (hasFearThreat) {
    score += 10;
    scoreReasons.push('Fear / account termination threat (+10)');
  }
  if (hasSuspiciousEmail) {
    score += 20;
    scoreReasons.push('Suspicious email address or domain mismatch (+20)');
  }

  const finalRiskScore = Math.min(score, 100);

  let riskLevel = 'LOW';
  if (finalRiskScore >= 75) riskLevel = 'CRITICAL';
  else if (finalRiskScore >= 50) riskLevel = 'HIGH';
  else if (finalRiskScore >= 25) riskLevel = 'MEDIUM';

  const threatDetected = finalRiskScore >= 25 || hasCredentialRequest || hasOtpRequest || hasLookalikeUrl;

  let threatType = 'None';
  if (threatDetected) {
    if (hasCredentialRequest && (hasLookalikeUrl || hasOtpRequest)) {
      threatType = 'Phishing / Credential Harvesting';
    } else if (hasOtpRequest) {
      threatType = 'OTP Interception Scam';
    } else if (hasLookalikeUrl || hasImpersonation) {
      threatType = 'Impersonation & Brand Spoofing';
    } else if (hasPaymentScam) {
      threatType = 'Financial Fraud Scam';
    } else {
      threatType = 'Suspicious Security Incident';
    }
  }

  let recommendedAction = 'No action required. Standard customer interaction.';
  if (riskLevel === 'CRITICAL') {
    recommendedAction = 'IMMEDIATE ACTION REQUIRED: Block sender, flag URL in firewall, alert security operations center (SOC), and advise customer not to share OTP/password.';
  } else if (riskLevel === 'HIGH') {
    recommendedAction = 'HIGH RISK: Isolate ticket, verify sender credentials with official domain records, and report suspicious link to email security gateway.';
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'MEDIUM RISK: Exercise caution. Verify customer identity before disclosing account details.';
  }

  return {
    threat_detected: threatDetected ? 1 : 0,
    threat_type: threatType,
    risk_level: riskLevel,
    risk_score: finalRiskScore,
    social_engineering: socialEngineering ? 1 : 0,
    social_engineering_techniques: JSON.stringify(techniques),
    credential_request: hasCredentialRequest ? 1 : 0,
    otp_request: hasOtpRequest ? 1 : 0,
    suspicious_message: (hasUrgency || hasFearThreat) ? 1 : 0,
    reason: scoreReasons.join('. ') || 'No cybersecurity threats detected in message structure.',
    recommended_action: recommendedAction
  };
}
