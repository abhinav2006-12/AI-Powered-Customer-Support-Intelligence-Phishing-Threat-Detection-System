import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { analyzeSecurity } from '../services/supabaseService';
import { analyzeConversation } from '../services/api';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  AlertOctagon, 
  HelpCircle,
  FileText, 
  Key, 
  Shield, 
  CreditCard, 
  Globe, 
  Mail, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Zap, 
  ExternalLink,
  ChevronDown,
  Share2,
  Clipboard,
  MessageSquare,
  Smartphone,
  CheckCircle,
  Eye,
  Info
} from 'lucide-react';

const PRESET_SCAMS = [
  {
    category: 'Bank & UPI Trap',
    title: 'Bank OTP & Refund Trap',
    type: 'OTP Exfiltration Scam',
    risk: 'CRITICAL',
    sender: 'refunds-desk@bank-alert24.online',
    text: 'Dear Customer, your INR 14,500 refund has been approved for failed transaction #TX9921. Kindly share the 6-digit verification code (OTP) sent to your mobile number or click http://bank-alert24.online/refund to instantly claim your funds.',
    icon: CreditCard,
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30'
  },
  {
    category: 'Account Suspension',
    title: 'PayPal Account Locked',
    type: 'Credential Harvesting Phishing',
    risk: 'CRITICAL',
    sender: 'security@paypa1-support.example',
    text: 'URGENT: Your PayPal account has been temporarily restricted due to unauthorized login attempts. Click immediately on http://paypa1-support.example/login to verify your identity. Enter your email, password, and card CVV within 24 hours to prevent permanent closure.',
    icon: Lock,
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30'
  },
  {
    category: 'Subscription Spoof',
    title: 'Microsoft 365 Expiry',
    type: 'Lookalike Domain Spoofing',
    risk: 'HIGH',
    sender: 'billing@micros0ft-portal.net',
    text: 'Your Microsoft Office 365 business license will expire in 2 hours. Your cloud files will be locked. Please verify your billing card details and login at http://micros0ft-portal.net/renew to continue uninterrupted access.',
    icon: Globe,
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
  },
  {
    category: 'Safe Example',
    title: 'Official Amazon Delivery',
    type: 'Legitimate Tracking Update',
    risk: 'SAFE',
    sender: 'shipment-tracking@amazon.com',
    text: 'Hi Alex, your Amazon package with order #402-9912034 is out for delivery today. You can track your courier driver in real-time directly in the Amazon mobile app under Your Orders. Thank you for shopping with us!',
    icon: ShieldCheck,
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
  }
];

const SAFETY_TIPS = [
  {
    title: 'Never Share 6-Digit OTPs or Passwords',
    desc: 'Banks, Google, WhatsApp, and legitimate businesses will NEVER ask you for your one-time passcodes over chat or phone.',
    icon: Key
  },
  {
    title: 'Inspect the Website URL Closely',
    desc: 'Look out for subtle letter substitutions (e.g. "paypa1.com" or "micros0ft.com" or strange suffixes like ".xyz" or ".online").',
    icon: Globe
  },
  {
    title: 'Beware of Urgent Threats or Panic Calls',
    desc: 'Scammers create artificial panic ("Your account will be suspended in 24 hours!") to force quick, unthinking mistakes.',
    icon: Clock
  },
  {
    title: 'When in Doubt, Use the Official App',
    desc: 'Never tap unverified links. Open your browser and manually type the official website name, or open your verified mobile app.',
    icon: Smartphone
  }
];

const FAQS = [
  {
    q: 'How does KAAVALX determine if a message is a scam?',
    a: 'KAAVALX analyzes text using real-time cyber security heuristics: detecting lookalike typosquatting domains, psychological urgency/panic traps, OTP harvesting indicators, free-email impersonation, and fraudulent payment prompts.'
  },
  {
    q: 'Is this tool completely free and anonymous?',
    a: 'Yes. You do not need an account or login to scan messages. The checker is open to the public to keep individuals and families protected against modern online fraud.'
  },
  {
    q: 'What should I do if I already clicked a scam link or gave my password?',
    a: '1) Disconnect Wi-Fi/mobile data temporarily. 2) From a separate clean device, immediately change passwords and activate 2-Factor Authentication. 3) If banking details or OTP was shared, immediately contact your bank customer care to freeze online transactions.'
  },
  {
    q: 'What is lookalike domain spoofing (Typosquatting)?',
    a: 'Cybercriminals register web domains that look nearly identical to real companies (e.g. substituting the letter "o" with number "0", or "l" with "1") to deceive victims into submitting confidential information.'
  }
];

export function PublicScamChecker() {
  const [inputText, setInputText] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sms', 'email', 'link'
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const textareaRef = useRef(null);
  const resultRef = useRef(null);

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText(text);
          textareaRef.current?.focus();
        }
      } else {
        textareaRef.current?.focus();
      }
    } catch {
      textareaRef.current?.focus();
    }
  };

  const runAnalysis = async (customText, customSender) => {
    const text = (customText !== undefined ? customText : inputText || '').trim();
    const sender = (customSender !== undefined ? customSender : senderEmail).trim();

    if (!text) {
      alert('Please enter or paste a suspicious message, SMS, email body, or website link.');
      textareaRef.current?.focus();
      return;
    }

    setLoading(true);
    setVerdict(null);

    try {
      // Deterministic heuristics engine
      const sec = analyzeSecurity(text, sender);
      const lower = text.toLowerCase();
      const redFlags = [];

      // Typosquatting / Lookalike domains
      const lookalikeMatches = [
        /paypa1/i, /micros0ft/i, /g00gle/i, /amaz0n/i, /netfl1x/i, /app1e/i, /faceb00k/i,
        /.*-security\.example/i, /.*-verify\.com/i, /.*-update\.info/i, /.*-support\.org/i,
        /.*-alert24\./i, /.*-portal\.net/i
      ];
      const hasLookalike = lookalikeMatches.some(p => p.test(text));

      // 1. Password & credential theft
      if (/password|login detail|credential|bank details|card number|cvv|security pin|atm pin|secret pin/i.test(lower)) {
        redFlags.push({
          icon: Lock,
          title: 'Password & Card Details Harvesting Trap',
          desc: 'This message explicitly requests your secret login password or card CVV/PIN. Legitimate organizations never ask for your password.',
          severity: 'CRITICAL'
        });
      }

      // 2. OTP Exfiltration
      if (/otp|verification code|one-time password|2fa code|security code|verification pin|passcode/i.test(lower)) {
        redFlags.push({
          icon: Key,
          title: 'One-Time Passcode (OTP) Stealing Attempt',
          desc: 'The sender wants your 6-digit OTP to bypass two-factor protection and hijack your account or siphon funds.',
          severity: 'CRITICAL'
        });
      }

      // 3. Panic & Urgency
      if (/urgent|immediately|within 24 hours|within 2 hours|account suspended|deactivated|action required|final notice|blocked|permanently locked/i.test(lower)) {
        redFlags.push({
          icon: Clock,
          title: 'False Urgency & Scare Tactics',
          desc: 'The message attempts to create sudden panic ("Account locked in 24 hours!") so you act quickly before thinking.',
          severity: 'HIGH'
        });
      }

      // 4. Financial Baits & Fake Refunds
      if (/refund approved|lottery|prize winner|wire transfer|crypto deposit|gift card|unclaimed funds|cash prize|claim your funds/i.test(lower)) {
        redFlags.push({
          icon: CreditCard,
          title: 'Fake Refund / Prize Money Bait',
          desc: 'Promises of unearned cash or unexpected refunds designed to lure you into sharing banking credentials.',
          severity: 'HIGH'
        });
      }

      // 5. Deceptive Links
      const urlsFound = (text.match(/https?:\/\/[^\s]+/gi) || []).map(u => {
        const isLookalikeUrl = lookalikeMatches.some(p => p.test(u));
        const isShort = /bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|cutt\.ly|ow\.ly/i.test(u);
        const isHttp = u.startsWith('http://');
        return {
          url: u,
          isSuspicious: isLookalikeUrl || isShort || isHttp,
          reason: isLookalikeUrl 
            ? 'Deceptive lookalike domain (spoofing trusted brand)' 
            : isShort 
            ? 'Hidden / shortened redirect link' 
            : isHttp 
            ? 'Unencrypted plain HTTP connection' 
            : 'Standard domain'
        };
      });

      if (urlsFound.some(u => u.isSuspicious) || hasLookalike) {
        redFlags.push({
          icon: Globe,
          title: 'Suspicious / Deceptive Web Link',
          desc: 'Contains links pointing to unverified, shortened, or fake lookalike web domains.',
          severity: 'HIGH'
        });
      }

      // 6. Free-Mail Address Spoof
      if (sender && /gmail\.com|yahoo\.com|outlook\.com|hotmail\.com/i.test(sender) && /bank|security|paypal|microsoft|support|desk|refund|alert|amazon/i.test(sender)) {
        redFlags.push({
          icon: Mail,
          title: 'Free Webmail Sender Impersonation',
          desc: 'The sender claims to represent a major enterprise or bank, but sent the message from a personal free email provider.',
          severity: 'HIGH'
        });
      }

      // Calculate score
      let riskScore = sec.risk_score || 0;
      if (redFlags.length >= 3) riskScore = Math.max(riskScore, 95);
      else if (redFlags.length === 2) riskScore = Math.max(riskScore, 75);
      else if (redFlags.length === 1) riskScore = Math.max(riskScore, 55);

      const isScamThreat = riskScore >= 50 || redFlags.length >= 1 || sec.threat_detected === 1;
      const riskLevel = riskScore >= 75 ? 'CRITICAL' : riskScore >= 45 ? 'HIGH' : riskScore >= 20 ? 'MEDIUM' : 'SAFE';

      // Backend API sync
      try {
        const apiRes = await analyzeConversation({
          message: text,
          customer_email: sender,
          channel: 'Email'
        });
        if (apiRes?.analysis?.security) {
          const apiSec = apiRes.analysis.security;
          if (apiSec.risk_score > riskScore) {
            riskScore = apiSec.risk_score;
          }
        }
      } catch {
        // Fallback works deterministically
      }

      const finalVerdict = {
        threat_detected: isScamThreat ? 1 : 0,
        threat_type: isScamThreat 
          ? (hasLookalike ? 'Lookalike Brand Impersonation' : redFlags.some(f => f.title.includes('OTP')) ? 'OTP Harvesting Scam' : 'Credential Harvesting & Phishing')
          : 'Clean & Legitimate Interaction',
        risk_level: isScamThreat ? riskLevel : 'SAFE',
        risk_score: isScamThreat ? Math.max(riskScore, 65) : 0,
        redFlags,
        urls: urlsFound,
        sender: sender || 'Unspecified Sender',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setVerdict(finalVerdict);

      // Auto scroll smoothly to verdict
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      console.error('Scan error:', err);
      alert('Scanning failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsePreset = (example) => {
    setInputText(example.text);
    setSenderEmail(example.sender);
    runAnalysis(example.text, example.sender);
  };

  const handleClear = () => {
    setInputText('');
    setSenderEmail('');
    setVerdict(null);
    textareaRef.current?.focus();
  };

  const handleCopyReport = () => {
    if (!verdict) return;
    const isDangerous = verdict.threat_detected === 1 || verdict.risk_score >= 50;
    const report = [
      `🚨 KAAVALX Security Scam Assessment`,
      `----------------------------------------`,
      `Status: ${isDangerous ? '🛑 DANGEROUS SCAM DETECTED' : '✅ LOOKS SAFE'}`,
      `Risk Level: ${verdict.risk_level} (Threat Score: ${verdict.risk_score}/100)`,
      `Detected Type: ${verdict.threat_type}`,
      `Red Flags Found: ${verdict.redFlags.length}`,
      ``,
      `Safety Advice:`,
      isDangerous 
        ? `• Do NOT click any links in this message.\n• NEVER share OTP codes or passwords.\n• Block and report this sender.`
        : `• Message appears legitimate, but always double-check official domain names before entering sensitive passwords.`,
      ``,
      `Verified via KAAVALX Free Cyber Defense: http://localhost:5173/verify`
    ].join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWarning = () => {
    if (!verdict) return;
    const shareText = `⚠️ Warning: I just checked a suspicious message on KAAVALX and it was flagged as a ${verdict.risk_level} risk scam! Never share OTPs or passwords. Check any suspicious messages at http://localhost:5173/verify`;
    if (navigator.share) {
      navigator.share({
        title: 'KAAVALX Scam Alert',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const isScam = verdict && (verdict.threat_detected === 1 || verdict.risk_score >= 50);
  const isSuspicious = verdict && !isScam && (verdict.risk_level === 'MEDIUM' || verdict.risk_score > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080D1A] text-slate-800 dark:text-slate-100 relative font-sans antialiased transition-colors duration-200 selection:bg-purple-500 selection:text-white pb-16">
      
      {/* Decorative Glow Backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-3xl" />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <Link 
            to="/verify" 
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black border border-purple-500/30 overflow-hidden flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="KAAVALX Logo" 
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-white dark:via-purple-200 dark:to-indigo-300 bg-clip-text text-transparent">
                  KAAVALX
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  FREE SCAM SCANNER
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                AI Phishing & Fraud Protection
              </p>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              title="Security Operations Center & Analyst Login"
            >
              <span>SOC Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">

        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Instant Safety Check • 100% Free & Confidential</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Is that message a <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-400 dark:via-indigo-300 dark:to-pink-400 bg-clip-text text-transparent">Scam or Fake</span>?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Paste any suspicious SMS, WhatsApp message, email, or link below. Our AI engine will inspect it for fake websites, OTP traps, and fraud red flags in seconds.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white dark:bg-[#0E162B] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-black/40 space-y-4 transition-colors">
          
          {/* Card Header & Fast Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <label htmlFor="scam-text-input" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Paste the text, email, or link to inspect:
              </label>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg border border-purple-200 dark:border-purple-800/50 transition-colors cursor-pointer"
                title="Paste directly from your clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste Clipboard</span>
              </button>

              {inputText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Clear current text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              id="scam-text-input"
              ref={textareaRef}
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. URGENT: Your bank account is suspended due to KYC update. Click http://bank-kyc-verify.online immediately to share your OTP and avoid account block..."
              className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans leading-relaxed resize-y shadow-inner"
            />
          </div>

          {/* Sender Email & Submit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
            <div className="sm:col-span-2">
              <label htmlFor="sender-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Sender's Email, Phone Number, or ID (Optional):</span>
              </label>
              <input
                id="sender-input"
                type="text"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. support@paypa1-update.com or +91-98765-XXXXX"
                className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono transition-all"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => runAnalysis()}
                disabled={loading}
                className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Security...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check This Message</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Examples Helper */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Or click a sample message below to test right now:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_SCAMS.map((ex, idx) => {
                const Icon = ex.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUsePreset(ex)}
                    className="p-2.5 rounded-xl border text-left text-xs transition-all duration-150 cursor-pointer bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/60 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 truncate">
                        {ex.title}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${ex.badgeColor}`}>
                        {ex.risk}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {ex.category}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ================= RESULTS / VERDICT SECTION ================= */}
        <div ref={resultRef}>
          {verdict && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Verdict Banner */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
                isScam 
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-100 shadow-rose-500/5' 
                  : isSuspicious 
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-100 shadow-amber-500/5'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/5'
              }`}>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 mt-0.5 sm:mt-0 ${
                      isScam ? 'bg-rose-600 shadow-rose-600/30' : isSuspicious ? 'bg-amber-600 shadow-amber-600/30' : 'bg-emerald-600 shadow-emerald-600/30'
                    }`}>
                      {isScam ? <ShieldAlert className="w-8 h-8" /> : isSuspicious ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-white/10 border border-current/20">
                          Analysis Result
                        </span>
                        <span className="text-xs font-mono opacity-70">{verdict.timestamp}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                        {isScam ? '🛑 Dangerous Scam / Phishing Attack Detected' : isSuspicious ? '⚠️ Suspicious Elements Detected' : '✅ Authentic & Safe Message'}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
                        {isScam 
                          ? 'Do NOT click any links, do NOT enter passwords, and do NOT share any OTP verification codes.'
                          : isSuspicious 
                          ? 'Proceed with caution. The message has unverified elements; verify with the official service.'
                          : 'No deceptive links, OTP traps, or credential theft attempts were found in this text.'}
                      </p>
                    </div>
                  </div>

                  {/* Threat Risk Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-current/10">
                    <span className="text-xs font-semibold uppercase opacity-70">Threat Risk:</span>
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl border mt-1 ${
                      isScam 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200 border-rose-300 dark:border-rose-500/40' 
                        : isSuspicious 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border-amber-300 dark:border-amber-500/40' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40'
                    }`}>
                      {verdict.risk_level} ({verdict.risk_score}/100)
                    </span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-5 pt-4 border-t border-current/10">
                  <div className="flex justify-between text-xs font-semibold mb-1.5 opacity-90">
                    <span>Threat Meter</span>
                    <span>{verdict.risk_score >= 50 ? 'High Danger Level' : 'Safe to Proceed'}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-black/40 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isScam ? 'bg-gradient-to-r from-rose-500 to-red-600' : isSuspicious ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      }`}
                      style={{ width: `${Math.max(verdict.risk_score, 5)}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Grid: Red Flags & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Identified Red Flags */}
                <div className="bg-white dark:bg-[#0E162B] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span>Identified Red Flags ({verdict.redFlags.length})</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Threat Type: <strong className="text-slate-700 dark:text-slate-200">{verdict.threat_type}</strong>
                    </span>
                  </div>

                  {verdict.redFlags && verdict.redFlags.length > 0 ? (
                    <div className="space-y-3">
                      {verdict.redFlags.map((flag, idx) => {
                        const IconComp = flag.icon || AlertCircle;
                        return (
                          <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-1">
                            <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                              <IconComp className="w-4 h-4 flex-shrink-0" />
                              <span>{flag.title}</span>
                            </div>
                            <p className="text-[11px] text-rose-700 dark:text-rose-200/80 leading-relaxed pl-6">
                              {flag.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      <span>No deceptive phishing patterns or credential traps identified.</span>
                    </div>
                  )}

                  {/* Extracted URLs List */}
                  {verdict.urls && verdict.urls.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Web Links Detected in Text:
                      </span>
                      {verdict.urls.map((u, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {u.url}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                            u.isSuspicious 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          }`}>
                            {u.isSuspicious ? 'UNSAFE LINK' : 'CLEAN'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: What to Do Next (Action Checklist) */}
                <div className="bg-white dark:bg-[#0E162B] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>What You Should Do Right Now</span>
                    </h3>

                    <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Do Not Share OTPs or Passwords</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Never disclose verification codes sent to your phone or email.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Ignore Unverified Links</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Open your web browser and navigate directly to the verified official website.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Block & Mark As Spam</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Report the message as spam/fraud in your messaging app or email client.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleCopyReport}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied to Clipboard' : 'Copy Safety Report'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareWarning}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
                        title="Share warning with friends or family"
                      >
                        {shared ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{shared ? 'Alert Link Copied' : 'Warn Family / Friends'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                    >
                      Scan Another
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>

        {/* Consumer Safety Guide Cards */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Essential Rules to Stay Safe from Scams
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Follow these simple best practices to protect your accounts and personal data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAFETY_TIPS.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-white dark:bg-[#0E162B] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-purple-300 dark:hover:border-purple-700/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tip.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="bg-white dark:bg-[#0E162B] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Frequently Asked Questions</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            {FAQS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-purple-600 dark:text-purple-400' : ''}`} />
                  </button>
                  {isExpanded && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2 pl-1 animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer Attribution */}
      <footer className="relative z-10 mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#080D1A]/50 backdrop-blur-md py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center p-0.5 border border-purple-500/30">
              <img src="/logo.png" alt="KAAVALX" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">KAAVALX Cyber Defense System</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="font-mono text-slate-400">Engineered by APEX</span>
            <span>•</span>
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Analyst SOC Portal
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default PublicScamChecker;
