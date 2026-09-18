import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PublicScamChatAdvisor } from '../components/chat/PublicScamChatAdvisor';
import { analyzeConversation } from '../services/api';
import { RiskBadge, PriorityBadge, SentimentBadge, ResolutionBadge } from '../components/common/Badge';
import { RiskMeter } from '../components/common/RiskMeter';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  FileText, 
  Key, 
  CreditCard, 
  Globe, 
  Mail, 
  Clock, 
  Trash2, 
  Share2, 
  Clipboard, 
  MessageSquare, 
  Bot, 
  BookOpen, 
  ChevronDown, 
  HelpCircle,
  Link2,
  Smartphone,
  Shield,
  Zap,
  Info,
  Layers,
  AlertOctagon
} from 'lucide-react';

const PRESET_CHIPS = [
  {
    mode: 'message',
    label: '⚡ 2FA & OTP Harvesting Trap',
    risk: 'CRITICAL',
    sender: 'support@paypa1-security.example',
    text: 'URGENT! Your account has been compromised due to unauthorized access. Click this link immediately http://paypa1-security.example/login to verify your identity. Enter your username, password and 6-digit OTP code to secure your account within 24 hours.'
  },
  {
    mode: 'url',
    label: '🔗 Fake Bank Typosquat Link',
    risk: 'HIGH',
    sender: 'helpdesk.bank.security@gmail.com',
    text: 'http://paypa1-security.example/login'
  },
  {
    mode: 'whatsapp',
    label: '📱 WhatsApp KYC Suspension Alert',
    risk: 'HIGH',
    sender: '+91-98765-43210',
    text: 'Dear customer, your SIM and UPI access will be blocked tonight due to incomplete KYC. Share your Aadhaar and 6-digit bank verification OTP to update immediately.'
  },
  {
    mode: 'email',
    label: '💳 Billing Refund Query',
    risk: 'SAFE',
    sender: 'priya.sharma@globaltech.in',
    subject: 'Subscription Double Charge Dispute',
    text: 'My payment was deducted twice for the annual subscription (₹2,500). The transaction ID is TXN-99821 but my order wasn\'t confirmed. Please help me get my refund as soon as possible.'
  },
  {
    mode: 'message',
    label: '📦 Amazon Order Delivery',
    risk: 'SAFE',
    sender: 'shipment-tracking@amazon.com',
    text: 'Hi Alex, your Amazon package with order #402-9912034 is out for delivery today. You can track your courier driver in real-time directly in the Amazon mobile app under Your Orders.'
  }
];

const SAFETY_RULES = [
  {
    title: 'Never Share 6-Digit OTPs or Passwords',
    desc: 'Banks, Google, WhatsApp, and official apps will NEVER ask you for your one-time passwords over SMS, call, or chat.',
    icon: Key
  },
  {
    title: 'Inspect Website URLs Closely',
    desc: 'Look out for subtle letter substitutions (e.g. "paypa1.com" or "micros0ft.com" or suspicious domains ending in ".xyz" or ".online").',
    icon: Globe
  },
  {
    title: 'Beware of Sudden Panic or Urgency',
    desc: 'Scammers create artificial panic ("Your account will be suspended in 2 hours!") to force quick, careless mistakes.',
    icon: Clock
  },
  {
    title: 'Never Enter UPI PIN to Receive Money',
    desc: 'You only enter your UPI PIN or scan a QR code when SENDING money. Receiving money NEVER requires a PIN.',
    icon: CreditCard
  }
];

const FAQS = [
  {
    q: 'How does the KAAVALX Scam Checker work?',
    a: 'KAAVALX analyzes text using real-time cybersecurity heuristics: detecting lookalike typosquatting domains, psychological urgency traps, OTP harvesting indicators, free-webmail impersonation, and fraudulent payment prompts.'
  },
  {
    q: 'Is this checker completely free and confidential?',
    a: 'Yes. You do not need an account or login to scan messages. The checker is open to the public to keep individuals and families protected against modern online fraud.'
  },
  {
    q: 'What should I do if I already clicked a scam link or gave my password?',
    a: '1) Disconnect Wi-Fi/mobile data immediately. 2) From a separate clean device, change passwords for all important accounts and turn on 2-Factor Authentication. 3) If banking details or OTP was shared, immediately contact your bank customer care to freeze online transactions.'
  },
  {
    q: 'What is lookalike domain spoofing (Typosquatting)?',
    a: 'Cybercriminals register web domains that look nearly identical to real companies (e.g. substituting the letter "o" with number "0", or "l" with "1") to deceive victims into submitting confidential information.'
  }
];

export function PublicScamChecker() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'advisor', 'playbook'
  const [inputMode, setInputMode] = useState('message'); // 'message', 'url', 'email', 'whatsapp'
  
  // Form fields
  const [inputText, setInputText] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

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

  const runAnalysis = async (customPayload) => {
    const textToAnalyze = customPayload?.text !== undefined ? customPayload.text : inputText;
    const senderToAnalyze = customPayload?.sender !== undefined ? customPayload.sender : senderEmail;
    const subjectToAnalyze = customPayload?.subject !== undefined ? customPayload.subject : emailSubject;

    const trimmedText = (textToAnalyze || '').trim();
    if (!trimmedText) {
      alert(inputMode === 'url' ? 'Please enter a website link to inspect.' : 'Please enter or paste content to inspect.');
      textareaRef.current?.focus();
      return;
    }

    let fullMessage = trimmedText;
    if (inputMode === 'email' && subjectToAnalyze) {
      fullMessage = `Subject: ${subjectToAnalyze}\n\n${trimmedText}`;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const channelMapping = {
        message: 'Email',
        url: 'Email',
        email: 'Email',
        whatsapp: 'Chat'
      };

      const res = await analyzeConversation({
        message: fullMessage,
        conversation_history: '',
        customer_name: senderToAnalyze ? senderToAnalyze.split('@')[0] : 'Public User',
        customer_email: senderToAnalyze || 'anonymous@domain.com',
        channel: channelMapping[inputMode] || 'Email'
      });

      if (res && res.analysis) {
        setResult(res.analysis);
      } else {
        setError('Analysis returned no valid results.');
      }

      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Scanning failed. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseChip = (preset) => {
    setActiveTab('scanner');
    setInputMode(preset.mode);
    setInputText(preset.text);
    setSenderEmail(preset.sender || '');
    setEmailSubject(preset.subject || '');
    runAnalysis({ text: preset.text, sender: preset.sender, subject: preset.subject });
  };

  const handleClear = () => {
    setInputText('');
    setSenderEmail('');
    setEmailSubject('');
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const handleCopyReport = () => {
    if (!result) return;
    const sec = result.security || {};
    const report = [
      `🚨 KAAVALX Threat Intelligence Assessment`,
      `----------------------------------------`,
      `Threat Detected: ${sec.threat_detected ? `YES (${sec.threat_type})` : 'NO'}`,
      `Risk Level: ${sec.risk_level || 'LOW'} (Score: ${sec.risk_score || (sec.threat_detected ? 85 : 10)}/100)`,
      `Reason: ${sec.reason || result.summary || 'Message structure and domain links passed safety checks.'}`,
      `Category: ${result.category || 'General'}`,
      `Issue: ${result.issue || 'Inquiry'}`,
      `Sentiment: ${result.sentiment || 'Neutral'}`,
      `Urgency: ${result.urgency || 'Normal'}`,
      `Recommended Action: ${result.recommended_action || 'No action required.'}`,
      ``,
      `Verified with KAAVALX Cyber Defense Engine: http://localhost:5173/verify`
    ].join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWarning = () => {
    if (!result) return;
    const sec = result.security || {};
    const shareText = `⚠️ Warning: I just scanned a message on KAAVALX: Flagged as ${sec.risk_level || 'LOW'} risk (${sec.threat_type || 'Safety Check'}). Check suspicious messages free at http://localhost:5173/verify`;
    if (navigator.share) {
      navigator.share({
        title: 'KAAVALX Threat Alert',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  // Helper to extract granular explanation reasons
  const getFlaggedReasons = (res) => {
    if (!res) return [];
    const sec = res.security || {};
    const reasons = [];

    if (sec.otp_request) {
      reasons.push({
        title: '2FA / OTP Interception Demand',
        desc: 'Demands a one-time password (OTP) or security PIN. Official services will never request your OTP via chat or email.',
        badge: '+35 Risk Pts',
        type: 'danger'
      });
    }

    if (sec.credential_request) {
      reasons.push({
        title: 'Credential Harvesting Attempt',
        desc: 'Prompts you to enter your confidential password, login credentials, or credit card CVV on an external form.',
        badge: '+30 Risk Pts',
        type: 'danger'
      });
    }

    if (sec.suspicious_message) {
      reasons.push({
        title: 'Urgency & Coercive Psychological Pressure',
        desc: 'Uses artificial deadlines ("within 24 hours", "account locked") designed to trigger panic and bypass scrutiny.',
        badge: '+20 Risk Pts',
        type: 'warning'
      });
    }

    if (res.urls && res.urls.some(u => u.lookalike)) {
      reasons.push({
        title: 'Deceptive Lookalike Domain (Typosquatting)',
        desc: 'Contains web links that mimic well-known brands using character substitutions or illegitimate TLDs.',
        badge: '+25 Risk Pts',
        type: 'danger'
      });
    }

    if (res.urls && res.urls.some(u => u.uses_ip)) {
      reasons.push({
        title: 'Unencrypted Raw IP Address Host',
        desc: 'Points directly to a raw numerical IP address rather than a registered domain name.',
        badge: '+25 Risk Pts',
        type: 'danger'
      });
    }

    if (sec.techniques && sec.techniques.length > 0 && reasons.length === 0) {
      sec.techniques.forEach(tech => {
        reasons.push({
          title: `Detected Vector: ${tech}`,
          desc: 'Identified specific cyber threat or social engineering vector.',
          badge: 'Security Vector',
          type: 'warning'
        });
      });
    }

    if (reasons.length === 0 && !sec.threat_detected) {
      reasons.push({
        title: 'Verified Safe Interaction',
        desc: 'No credential demands, lookalike homoglyphs, or coercive phishing patterns were identified in the payload.',
        badge: '0 Risk Pts',
        type: 'safe'
      });
    }

    return reasons;
  };

  const flaggedReasons = getFlaggedReasons(result);
  const sec = result?.security || {};
  const isThreat = result && (sec.threat_detected || sec.risk_level === 'CRITICAL' || sec.risk_level === 'HIGH');
  const isModerate = result && !isThreat && (sec.risk_level === 'MEDIUM');
  const riskScore = sec.risk_score || (sec.risk_level === 'CRITICAL' ? 90 : (sec.threat_detected ? 75 : (sec.risk_level === 'MEDIUM' ? 35 : 10)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B18] text-slate-800 dark:text-slate-100 relative font-sans antialiased transition-colors duration-200 selection:bg-purple-500 selection:text-white pb-16">
      
      {/* Ambient Background Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-3xl" />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0E152C]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <Link 
            to="/verify" 
            className="flex items-center space-x-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black border border-purple-500/40 overflow-hidden flex items-center justify-center shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
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
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  FREE SCANNER
                </span>
              </div>
            </div>
          </Link>

          {/* Header Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('advisor')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs ${
                activeTab === 'advisor'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
              }`}
              title="Chat with AI Scam Advisor to clear doubts"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Advisor</span>
            </button>
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs"
              title="Security Operations Center & Analyst Login"
            >
              <span>SOC Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">

        {/* Compact Hero Section (Reduced Spacing) */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Verify If a Message or Link is a <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-400 dark:via-indigo-300 dark:to-pink-400 bg-clip-text text-transparent">Scam</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Detect OTP exfiltration, credential harvesting, lookalike domains, and urgency coercion in seconds.
          </p>
        </div>

        {/* Compact Preset Scenarios Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center space-x-1 flex-shrink-0 pr-1">
            <Sparkles className="w-3 h-3" />
            <span>Try sample:</span>
          </span>
          <div className="flex items-center space-x-1.5 flex-nowrap">
            {PRESET_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUseChip(chip)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#0E152C] border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-all cursor-pointer flex-shrink-0 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Segmented Top Mode Navigation Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-white dark:bg-[#0E152C] border border-slate-200 dark:border-slate-800 shadow-xs space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Instant Scam Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'advisor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI Advisor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('playbook')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'playbook'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Safety Rules & FAQs</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: SCANNER WORKBENCH ================= */}
        {activeTab === 'scanner' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Input Container */}
            <div className="bg-white dark:bg-[#0E152C] rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-black/30 space-y-4 transition-colors">
              
              {/* Separate Input Mode Tabs (Message / URL / Email / WhatsApp) */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInputMode('message')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      inputMode === 'message'
                        ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message / SMS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode('url')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      inputMode === 'url'
                        ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Website URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode('email')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      inputMode === 'email'
                        ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email & Sender</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode('whatsapp')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      inputMode === 'whatsapp'
                        ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>WhatsApp / Chat</span>
                  </button>
                </div>

                {/* Fast Action Tools */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg border border-purple-200 dark:border-purple-800/50 transition-colors cursor-pointer"
                    title="Paste directly from your clipboard"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Paste</span>
                  </button>

                  {inputText && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Clear text"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mode-Specific Input Fields */}
              {inputMode === 'url' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Suspicious Website Link or URL:</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={textareaRef}
                        type="url"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="e.g. http://paypa1-security.example/login or http://192.168.1.1/update"
                        className="w-full pl-4 pr-10 py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Inspects domain typosquatting, raw IP hosting, and credential submission endpoints.
                  </p>
                </div>
              ) : inputMode === 'email' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        From (Sender Email):
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="e.g. alerts@bank-security.online"
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Subject Line:
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="e.g. Urgent Notice: Account Access Restricted"
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Body Content:
                    </label>
                    <textarea
                      ref={textareaRef}
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste the full email body text or notice here..."
                      className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all font-sans resize-y"
                    />
                  </div>
                </div>
              ) : inputMode === 'whatsapp' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Phone Number or Group Name (Optional):
                    </label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="e.g. +91 98765 43210 or Bank Support Helpline"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp / Chat Text:
                    </label>
                    <textarea
                      ref={textareaRef}
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste the WhatsApp forward, job offer, lottery claim, or KYC message here..."
                      className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all font-sans resize-y"
                    />
                  </div>
                </div>
              ) : (
                /* General Message / SMS Mode */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Suspicious SMS or Message Text:
                    </label>
                    <textarea
                      ref={textareaRef}
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste suspicious text message, bank alert, or notification here..."
                      className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all font-sans resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>Sender Identifier or Email (Optional):</span>
                    </label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="e.g. AD-HDFCBK or alert@support.com"
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Action Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => runAnalysis()}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] shadow-md shadow-purple-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning via AI Engine...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Check For Scam</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ================= VERDICT & THREAT-SCORE RESULT SCREEN ================= */}
            <div ref={resultRef}>
              {result && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Strong Visual Threat-Score Result Banner */}
                  <div className={`p-6 sm:p-7 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
                    isThreat 
                      ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/80 text-rose-950 dark:text-rose-100 shadow-rose-600/10' 
                      : isModerate 
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100 shadow-amber-600/10'
                      : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 text-emerald-950 dark:text-emerald-100 shadow-emerald-600/10'
                  }`}>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                      
                      {/* Left: Status Icon & Verdict */}
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${
                          isThreat ? 'bg-rose-600 shadow-rose-600/40' : isModerate ? 'bg-amber-600 shadow-amber-600/40' : 'bg-emerald-600 shadow-emerald-600/40'
                        }`}>
                          {isThreat ? <ShieldAlert className="w-9 h-9" /> : isModerate ? <AlertTriangle className="w-9 h-9" /> : <ShieldCheck className="w-9 h-9" />}
                        </div>

                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-white/10 border border-current/20">
                              Threat Assessment
                            </span>
                            <RiskBadge level={sec.risk_level || (isThreat ? 'HIGH' : 'LOW')} />
                          </div>
                          
                          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                            {isThreat 
                              ? `🚨 DANGEROUS SCAM: ${sec.threat_type || 'Phishing Trap'}` 
                              : isModerate 
                              ? '⚠️ SUSPICIOUS INCIDENT DETECTED' 
                              : '✅ SAFE & AUTHENTIC MESSAGE'}
                          </h2>
                          
                          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1 max-w-lg leading-relaxed">
                            {sec.reason || result.summary || 'Message structure and domain links passed safety heuristics.'}
                          </p>
                        </div>
                      </div>

                      {/* Right: High-Impact Circular Score Meter */}
                      <div className="flex-shrink-0 text-center p-3 rounded-2xl bg-white/70 dark:bg-black/30 border border-current/10 w-full sm:w-auto">
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Threat Risk Score</div>
                        <div className={`text-3xl sm:text-4xl font-black tracking-tight my-0.5 ${
                          isThreat ? 'text-rose-600 dark:text-rose-400' : isModerate ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {riskScore}<span className="text-base font-bold opacity-60">/100</span>
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-wide opacity-80">
                          {sec.risk_level || (isThreat ? 'CRITICAL' : 'LOW')} RISK
                        </div>
                      </div>

                    </div>

                    {/* Horizontal Visual Threat Meter Bar */}
                    <div className="mt-4 pt-3 border-t border-current/10">
                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-black/40 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 rounded-full ${
                            isThreat ? 'bg-gradient-to-r from-rose-500 to-red-600' : isModerate ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          }`}
                          style={{ width: `${Math.max(riskScore, 10)}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* ================= "WHY WE FLAGGED THIS" AI FORENSIC BREAKDOWN ================= */}
                  <div className="bg-white dark:bg-[#0E152C] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Why We Flagged This (AI Forensic Breakdown)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {flaggedReasons.map((reason, idx) => (
                        <div 
                          key={idx}
                          className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-colors ${
                            reason.type === 'danger'
                              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                              : reason.type === 'warning'
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {reason.type === 'danger' ? (
                              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            ) : reason.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {reason.title}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-white/80 dark:bg-black/40 border border-current/20">
                                {reason.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              {reason.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Security Indicators Badges */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Credential Theft</span>
                        <span className={`font-bold text-xs ${sec.credential_request ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {sec.credential_request ? '⚠️ Password Requested' : 'Clean'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">OTP / 2FA Trap</span>
                        <span className={`font-bold text-xs ${sec.otp_request ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {sec.otp_request ? '🚨 OTP Demanded' : 'Clean'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Psychological Panic</span>
                        <span className={`font-bold text-xs ${sec.suspicious_message ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {sec.suspicious_message ? '⚠️ Urgency / Fear' : 'Normal'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Lookalike Domain</span>
                        <span className={`font-bold text-xs ${result.urls?.some(u=>u.lookalike) ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {result.urls?.some(u=>u.lookalike) ? '🚨 Typosquat URL' : 'Clean'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Extracted URLs Table (if present) */}
                  {result.urls && result.urls.length > 0 && (
                    <div className="bg-white dark:bg-[#0E152C] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <Link2 className="w-4 h-4 text-purple-600" />
                        <span>Inspected Web Links ({result.urls.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {result.urls.map((u, i) => (
                          <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1 font-mono">
                            <div className="flex items-center justify-between">
                              <span className="font-bold truncate max-w-sm text-slate-900 dark:text-slate-100">{u.url}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.risk_score >= 25 ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'}`}>
                                Score: {u.risk_score}
                              </span>
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                              Domain: <strong className="font-mono text-slate-700 dark:text-slate-300">{u.domain}</strong> | Lookalike Typosquat: <strong className={u.lookalike ? 'text-rose-600' : 'text-emerald-600'}>{u.lookalike ? 'YES' : 'NO'}</strong> | Raw IP Host: <strong className={u.uses_ip ? 'text-rose-600' : 'text-emerald-600'}>{u.uses_ip ? 'YES' : 'NO'}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Action Card */}
                  <div className="bg-white dark:bg-[#0E152C] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Shield className="w-4 h-4" />
                      <span>Recommended Safety Action</span>
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 leading-relaxed">
                      {result.recommended_action}
                    </p>
                  </div>

                  {/* Share & Report Toolbar */}
                  <div className="bg-white dark:bg-[#0E152C] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleCopyReport}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied to Clipboard' : 'Copy Full Report'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareWarning}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
                        title="Share warning with friends or family"
                      >
                        {shared ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{shared ? 'Alert Link Copied' : 'Warn Friends / Family'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer py-1"
                    >
                      Scan Another Message
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 2: AI ADVISOR CHATBOT ================= */}
        {activeTab === 'advisor' && (
          <div className="animate-fade-in space-y-4">
            <PublicScamChatAdvisor isFloating={false} />
          </div>
        )}

        {/* ================= TAB 3: SAFETY PLAYBOOK & FAQS ================= */}
        {activeTab === 'playbook' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Safety Rules Grid */}
            <div className="bg-white dark:bg-[#0E162B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Essential Safety Rules to Avoid Online Fraud
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Follow these four core rules to keep your banking, passwords, and personal identities safe.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SAFETY_RULES.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-purple-300 dark:hover:border-purple-700/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
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
            <div className="bg-white dark:bg-[#0E162B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
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

          </div>
        )}

      </main>

      {/* Floating Chat Advisor Modal Dialog */}
      <PublicScamChatAdvisor 
        isFloating={true} 
        isOpen={isFloatingChatOpen} 
        onClose={() => setIsFloatingChatOpen(false)} 
      />

      {/* Floating Chat Trigger Button (when not on advisor tab) */}
      {!isFloatingChatOpen && activeTab !== 'advisor' && (
        <button
          onClick={() => setIsFloatingChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 p-3 sm:px-3.5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer border border-white/20 group"
          title="Open AI Scam & Safety Advisor"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-purple-700 animate-pulse"></span>
          </div>
          <span className="text-xs font-bold hidden sm:inline tracking-tight">Ask Advisor</span>
        </button>
      )}

      {/* Footer Attribution */}
      <footer className="relative z-10 mt-10 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#070B18]/50 backdrop-blur-md py-5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-black flex items-center justify-center p-0.5 border border-purple-500/30">
              <img src="/logo.png" alt="KAAVALX" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">KAAVALX Cyber Defense System</span>
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
