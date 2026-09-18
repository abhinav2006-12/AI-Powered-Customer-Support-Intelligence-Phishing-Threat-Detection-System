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
  HelpCircle 
} from 'lucide-react';

const PRESET_CASES = [
  {
    category: 'Billing & Dispute',
    title: 'Billing & Refund Dispute',
    name: 'Priya Sharma',
    email: 'priya.sharma@globaltech.in',
    risk: 'SAFE',
    text: 'My payment was deducted twice for the annual subscription (₹2,500). The transaction ID is TXN-99821 but my order wasn\'t confirmed. Please help me get my refund as soon as possible.',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
  },
  {
    category: 'Credential Harvesting',
    title: '2FA & Credential Harvesting Attack',
    name: 'Security Alert System',
    email: 'support@paypa1-security.example',
    risk: 'CRITICAL',
    text: 'URGENT! Your account has been compromised due to unauthorized access. Click this link immediately http://paypa1-security.example/login to verify your identity. Enter your username, password and 6-digit OTP code to secure your account within 24 hours.',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
  },
  {
    category: 'Lookalike Domain',
    title: 'Lookalike Impersonation Link',
    name: 'Bank Alert Desk',
    email: 'helpdesk.bank.security@gmail.com',
    risk: 'HIGH',
    text: 'Please verify your account and unblock your access at http://paypa1-security.example/login',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
  },
  {
    category: 'Order Notification',
    title: 'Official Amazon Delivery',
    name: 'Amazon Customer Service',
    email: 'shipment-tracking@amazon.com',
    risk: 'SAFE',
    text: 'Hi Alex, your Amazon package with order #402-9912034 is out for delivery today. You can track your courier driver in real-time directly in the Amazon mobile app under Your Orders. Thank you for shopping with us!',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
  }
];

const SAFETY_RULES = [
  {
    title: 'Never Share 6-Digit OTPs or Passwords',
    desc: 'Banks, Google, WhatsApp, and official apps will NEVER ask you for your one-time passwords over SMS, call, or chat.',
    icon: Key
  },
  {
    title: 'Inspect the Website URL Closely',
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
  const [inputText, setInputText] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
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

  const runAnalysis = async (customText, customSender) => {
    const text = (customText !== undefined ? customText : inputText || '').trim();
    const sender = (customSender !== undefined ? customSender : senderEmail).trim();

    if (!text) {
      alert('Please enter or paste a suspicious message, SMS, email body, or website link.');
      textareaRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Exactly identical call to analyzeConversation backend engine as in AnalyzeConversation.jsx
      const res = await analyzeConversation({
        message: text,
        conversation_history: '',
        customer_name: sender ? sender.split('@')[0] : 'Anonymous Customer',
        customer_email: sender || 'anonymous@domain.com',
        channel: 'Email'
      });

      if (res && res.analysis) {
        setResult(res.analysis);
      } else {
        setError('Analysis returned no valid results.');
      }

      // Auto scroll smoothly to verdict
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

  const handleUsePreset = (preset) => {
    setActiveTab('scanner');
    setInputText(preset.text);
    setSenderEmail(preset.email);
    runAnalysis(preset.text, preset.email);
  };

  const handleClear = () => {
    setInputText('');
    setSenderEmail('');
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const handleCopyReport = () => {
    if (!result) return;
    const sec = result.security || {};
    const report = [
      `🚨 KAAVALX Security Intelligence Assessment`,
      `----------------------------------------`,
      `Threat Detected: ${sec.threat_detected ? `YES (${sec.threat_type})` : 'NO'}`,
      `Risk Level: ${sec.risk_level || 'LOW'}`,
      `Reason: ${sec.reason || result.summary || 'Message structure and domain links passed safety checks.'}`,
      `Category: ${result.category || 'General'}`,
      `Issue: ${result.issue || 'Inquiry'}`,
      `Sentiment: ${result.sentiment || 'Neutral'}`,
      `Urgency: ${result.urgency || 'Normal'}`,
      `Priority: ${result.priority || 'P3'}`,
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
    const shareText = `⚠️ Warning: I just checked a message on KAAVALX: Risk Level: ${sec.risk_level || 'LOW'} (${sec.threat_type || 'Safety Check'}). Check suspicious messages at http://localhost:5173/verify`;
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B18] text-slate-800 dark:text-slate-100 relative font-sans antialiased transition-colors duration-200 selection:bg-purple-500 selection:text-white pb-16">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-3xl" />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0E152C]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <Link 
            to="/verify" 
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black border border-purple-500/40 overflow-hidden flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
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
                AI Cyber Defense & Phishing Protection
              </p>
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
              <span>Ask AI Advisor</span>
            </button>
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              title="Security Operations Center & Analyst Login"
            >
              <span>SOC Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Powered by Backend Threat Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Verify If a Message or Link is a <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-400 dark:via-indigo-300 dark:to-pink-400 bg-clip-text text-transparent">Scam</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Inspect suspicious messages, bank alerts, and links for OTP traps, credential phishing, and deceptive domain lookalikes.
          </p>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#0E152C] border border-slate-200 dark:border-slate-800 shadow-md space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Instant Scam Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'advisor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Advisor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('playbook')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'playbook'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Safety Rules & FAQs</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: SCANNER ================= */}
        {activeTab === 'scanner' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Input Card */}
            <div className="bg-white dark:bg-[#0E152C] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-black/40 space-y-4 transition-colors">
              
              {/* Header & Fast Action */}
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
                    <span>Sender's Email or Header (Optional):</span>
                  </label>
                  <input
                    id="sender-input"
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="e.g. support@paypa1-security.example"
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
                        <span>Analyzing with AI Engine...</span>
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

              {/* Quick Incident Preset Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Test with live verification presets:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {PRESET_CASES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUsePreset(preset)}
                      className="p-2.5 rounded-xl border text-left text-xs transition-all duration-150 cursor-pointer bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/60 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 truncate">
                          {preset.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${preset.badgeColor}`}>
                          {preset.risk}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {preset.category}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Verdict Card Section (Exact same structure & results as Analyze Conversation) */}
            <div ref={resultRef}>
              {result && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Top Security Header Alert */}
                  <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start justify-between gap-4 transition-colors ${
                    result.security?.threat_detected 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200' 
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {result.security?.threat_detected ? (
                        <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="text-base font-bold">
                            {result.security?.threat_detected ? `Threat Detected: ${result.security.threat_type}` : 'No Cybersecurity Threat Detected'}
                          </h3>
                          <RiskBadge level={result.security?.risk_level} />
                        </div>
                        <p className="text-xs mt-1 leading-relaxed">
                          {result.security?.reason || 'Message structure and domain links passed safety checks.'}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-48 flex-shrink-0">
                      <RiskMeter 
                        score={result.security?.risk_level === 'CRITICAL' ? 85 : (result.security?.threat_detected ? 60 : 10)} 
                        level={result.security?.risk_level || 'LOW'} 
                      />
                    </div>
                  </div>

                  {/* Split Grid: Customer Intelligence & Security Intelligence */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card 1: Customer Support Intelligence */}
                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                        Customer Support Intelligence
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Category:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{result.category}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Issue Summary:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{result.issue}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Sentiment:</span>
                          <div className="mt-0.5"><SentimentBadge sentiment={result.sentiment} /></div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Emotion:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{result.emotion}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Urgency:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{result.urgency}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Priority:</span>
                          <div className="mt-0.5"><PriorityBadge level={result.priority} /></div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Resolution Status:</span>
                          <div className="mt-0.5"><ResolutionBadge status={result.resolution_status} /></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">AI Summary:</span>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">{result.summary}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Customer Request:</span>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">{result.customer_request}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Security Threat Intelligence */}
                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                        Security Threat & Phishing Intelligence
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Threat Detected:</span>
                          <p className={`font-semibold ${result.security?.threat_detected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {result.security?.threat_detected ? 'YES' : 'NO'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Threat Type:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{result.security?.threat_type || 'None'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Social Engineering:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{result.security?.social_engineering ? 'Detected' : 'None'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Credential Harvesting:</span>
                          <p className={`font-semibold ${result.security?.credential_request ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {result.security?.credential_request ? 'Yes (Password requested)' : 'No'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">OTP / 2FA Interception:</span>
                          <p className={`font-semibold ${result.security?.otp_request ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {result.security?.otp_request ? 'Yes (OTP code requested)' : 'No'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Coercive Language:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{result.security?.suspicious_message ? 'Urgency / Fear language' : 'Normal tone'}</p>
                        </div>
                      </div>

                      {/* Social Engineering Techniques Pills */}
                      {result.security?.techniques && result.security.techniques.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Detected Techniques:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {result.security.techniques.map((tech, i) => (
                              <span key={i} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded text-[11px] font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extracted URLs list */}
                      {result.urls && result.urls.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Extracted URLs ({result.urls.length}):</span>
                          <div className="mt-1 space-y-1">
                            {result.urls.map((u, i) => (
                              <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded text-[11px] space-y-1 font-mono">
                                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                                  <span className="font-bold truncate max-w-xs">{u.url}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${u.risk_score >= 25 ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'}`}>
                                    Score: {u.risk_score}
                                  </span>
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                                  Domain: {u.domain} | Lookalike: {u.lookalike ? 'YES' : 'No'} | IP Host: {u.uses_ip ? 'YES' : 'No'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommended Action Card */}
                  <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recommended Agent / SOC Action</h4>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-300">
                      {result.recommended_action}
                    </p>
                  </div>

                  {/* Share & Copy Bar */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleCopyReport}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied to Clipboard' : 'Copy Full Report'}</span>
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
            <div className="bg-white dark:bg-[#0E162B] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
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
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
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
          className="fixed bottom-5 right-5 z-40 p-3.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2.5 cursor-pointer border border-white/20 group"
          title="Open AI Scam & Safety Advisor"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-700 animate-pulse"></span>
          </div>
          <span className="text-xs font-bold hidden sm:inline tracking-tight">Ask Scam Advisor</span>
        </button>
      )}

      {/* Footer Attribution */}
      <footer className="relative z-10 mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#070B18]/50 backdrop-blur-md py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
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
