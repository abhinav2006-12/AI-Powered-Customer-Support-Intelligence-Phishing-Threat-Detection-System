import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PublicScamChatAdvisor } from '../components/chat/PublicScamChatAdvisor';
import { analyzeConversation } from '../services/api';
import { RiskBadge, PriorityBadge, SentimentBadge } from '../components/common/Badge';
import { RiskMeter } from '../components/common/RiskMeter';
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
  Info,
  Bot,
  Layers,
  BookOpen
} from 'lucide-react';

const PRESET_SCAMS = [
  {
    category: 'Bank & UPI OTP Trap',
    title: 'Fake Refund & OTP Request',
    type: 'OTP Exfiltration Scam',
    risk: 'CRITICAL',
    sender: 'refunds-desk@bank-alert24.online',
    text: 'Dear Customer, your INR 14,500 refund has been approved for failed transaction #TX9921. Kindly share the 6-digit verification code (OTP) sent to your mobile number or click http://bank-alert24.online/refund to instantly claim your funds.',
    icon: CreditCard,
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
  },
  {
    category: 'Account Suspension Trap',
    title: 'PayPal Account Suspended',
    type: 'Credential Harvesting Phishing',
    risk: 'CRITICAL',
    sender: 'security@paypa1-support.example',
    text: 'URGENT: Your PayPal account has been temporarily restricted due to unauthorized login attempts. Click immediately on http://paypa1-support.example/login to verify your identity. Enter your email, password, and card CVV within 24 hours to prevent permanent closure.',
    icon: Lock,
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
  },
  {
    category: 'Subscription Spoofing',
    title: 'Microsoft 365 Expiration',
    type: 'Lookalike Domain Spoofing',
    risk: 'HIGH',
    sender: 'billing@micros0ft-portal.net',
    text: 'Your Microsoft Office 365 business license will expire in 2 hours. Your cloud files will be locked. Please verify your billing card details and login at http://micros0ft-portal.net/renew to continue uninterrupted access.',
    icon: Globe,
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
  },
  {
    category: 'Legitimate Notice',
    title: 'Official Amazon Delivery',
    type: 'Safe Order Status Notice',
    risk: 'SAFE',
    sender: 'shipment-tracking@amazon.com',
    text: 'Hi Alex, your Amazon package with order #402-9912034 is out for delivery today. You can track your courier driver in real-time directly in the Amazon mobile app under Your Orders. Thank you for shopping with us!',
    icon: ShieldCheck,
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
  const [rawAnalysis, setRawAnalysis] = useState(null);
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
    setRawAnalysis(null);

    try {
      // Direct unified backend analysis call (same as Analyze Conversation)
      const res = await analyzeConversation({
        message: text,
        customer_name: 'Public Verification User',
        customer_email: sender || 'anonymous@verify.local',
        channel: 'Web Verification Scanner',
        save: true
      });

      if (res && res.analysis) {
        setRawAnalysis({
          ...res.analysis,
          urls: res.analysis.urls || [],
          emails: res.analysis.emails || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // Auto scroll smoothly to verdict
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      console.error('Scan error:', err);
      alert('Scanning failed. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsePreset = (example) => {
    setActiveTab('scanner');
    setInputText(example.text);
    setSenderEmail(example.sender);
    runAnalysis(example.text, example.sender);
  };

  const handleClear = () => {
    setInputText('');
    setSenderEmail('');
    setRawAnalysis(null);
    textareaRef.current?.focus();
  };

  const handleCopyReport = () => {
    if (!rawAnalysis) return;
    const sec = rawAnalysis.security || {};
    const isDangerous = sec.threat_detected || (sec.risk_score >= 50);
    const report = [
      `🚨 KAAVALX Security Scam Assessment`,
      `----------------------------------------`,
      `Status: ${isDangerous ? '🛑 DANGEROUS SCAM DETECTED' : '✅ LOOKS SAFE'}`,
      `Risk Level: ${sec.risk_level} (Threat Score: ${sec.risk_score || 0}/100)`,
      `Detected Type: ${sec.threat_type || 'None'}`,
      `Category: ${rawAnalysis.category || 'General'}`,
      `Recommended Action: ${sec.recommended_action || rawAnalysis.recommended_action || 'Standard verification.'}`,
      ``,
      `Verified with KAAVALX Cyber Defense Backend Engine: http://localhost:5173/verify`
    ].join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWarning = () => {
    if (!rawAnalysis) return;
    const sec = rawAnalysis.security || {};
    const shareText = `⚠️ Warning: I just checked a suspicious message on KAAVALX and it was flagged as a ${sec.risk_level || 'HIGH'} risk threat (${sec.threat_type || 'Scam'})! Never share OTPs or passwords. Check any suspicious messages at http://localhost:5173/verify`;
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

  const sec = rawAnalysis?.security || {};
  const isScam = rawAnalysis && (sec.threat_detected || (sec.risk_score >= 50) || sec.risk_level === 'CRITICAL' || sec.risk_level === 'HIGH');
  const isSuspicious = rawAnalysis && !isScam && (sec.risk_level === 'MEDIUM' || (sec.risk_score > 0));

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
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

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

              {/* Quick Preset Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Or test with a sample fraud scenario:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {PRESET_SCAMS.map((ex, idx) => (
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
                  ))}
                </div>
              </div>

            </div>

            {/* Verdict Card Section (Powered by Backend Analysis) */}
            <div ref={resultRef}>
              {rawAnalysis && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Main Banner Alert */}
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
                              Backend AI Verification
                            </span>
                            <span className="text-xs font-mono opacity-70">{rawAnalysis.timestamp}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                            {isScam 
                              ? `🛑 Threat Detected: ${sec.threat_type || 'Phishing / Scam'}` 
                              : isSuspicious 
                              ? '⚠️ Suspicious Incident Detected' 
                              : '✅ Safe & Authentic Message'}
                          </h2>
                          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1 leading-relaxed">
                            {sec.reason || rawAnalysis.summary || 'No suspicious threats or deceptive links were detected.'}
                          </p>
                        </div>
                      </div>

                      {/* Threat Badge */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-current/10">
                        <span className="text-xs font-semibold uppercase opacity-70">Risk Level:</span>
                        <div className="mt-1">
                          <RiskBadge level={sec.risk_level || (isScam ? 'HIGH' : 'LOW')} />
                        </div>
                      </div>
                    </div>

                    {/* Threat Score Progress Meter */}
                    <div className="mt-5 pt-4 border-t border-current/10">
                      <div className="flex justify-between text-xs font-semibold mb-1.5 opacity-90">
                        <span>Threat Risk Probability</span>
                        <span>Score: {sec.risk_score || (isScam ? 85 : 10)} / 100 ({sec.risk_level || 'LOW'})</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-black/40 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            isScam ? 'bg-gradient-to-r from-rose-500 to-red-600' : isSuspicious ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          }`}
                          style={{ width: `${Math.max(sec.risk_score || (isScam ? 85 : 10), 8)}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Split Grid: Security Threat Intelligence & Message Context */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left: Security Threat Intelligence */}
                    <div className="bg-white dark:bg-[#0E152C] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                      <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Security Threat Intelligence</span>
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Threat Detected:</span>
                          <p className={`font-semibold ${sec.threat_detected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {sec.threat_detected ? 'YES' : 'NO'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Threat Type:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{sec.threat_type || 'None'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Credential Theft:</span>
                          <p className={`font-semibold ${sec.credential_request ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {sec.credential_request ? 'Yes (Password/PIN requested)' : 'No'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">OTP / 2FA Interception:</span>
                          <p className={`font-semibold ${sec.otp_request ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {sec.otp_request ? 'Yes (OTP requested)' : 'No'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Social Engineering:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{sec.social_engineering ? 'Detected' : 'None'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Coercive Language:</span>
                          <p className="font-semibold text-slate-900 dark:text-white">{sec.suspicious_message ? 'Urgency / Fear tactics' : 'Normal tone'}</p>
                        </div>
                      </div>

                      {/* Detected Techniques Pills */}
                      {sec.techniques && sec.techniques.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Detected Attack Techniques:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {sec.techniques.map((tech, i) => (
                              <span key={i} className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-lg text-[11px] font-semibold">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extracted URLs List */}
                      {rawAnalysis.urls && rawAnalysis.urls.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                            Analyzed Web Links ({rawAnalysis.urls.length}):
                          </span>
                          <div className="space-y-1.5">
                            {rawAnalysis.urls.map((u, i) => (
                              <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1 font-mono">
                                <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                                  <span className="font-bold truncate max-w-[200px]">{u.url}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.risk_score >= 25 
                                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60' 
                                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                  }`}>
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

                    {/* Right: Message Intelligence & Recommended Action */}
                    <div className="bg-white dark:bg-[#0E162B] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Message & Customer Context</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Category:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{rawAnalysis.category || 'General'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Issue Summary:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{rawAnalysis.issue || 'Inquiry'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Sentiment:</span>
                            <div className="mt-0.5"><SentimentBadge sentiment={rawAnalysis.sentiment || 'Neutral'} /></div>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Urgency:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{rawAnalysis.urgency || 'Normal'}</p>
                          </div>
                        </div>

                        {/* Recommended Action Box */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Recommended Safety Action:
                          </span>
                          <p className="text-xs font-semibold p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 leading-relaxed">
                            {sec.recommended_action || rawAnalysis.recommended_action || 'Do not click links or share credentials.'}
                          </p>
                        </div>
                      </div>

                      {/* Share & Copy Bar */}
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
