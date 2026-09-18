import React, { useState, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { analyzeConversation } from '../services/api';
import { RiskBadge, PriorityBadge, SentimentBadge, ResolutionBadge } from '../components/common/Badge';
import { PublicScamChatAdvisor } from '../components/chat/PublicScamChatAdvisor';
import { 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck,
  Send, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Mail, 
  User, 
  FileText,
  Lock,
  Key,
  Flame,
  Search,
  Clipboard,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Share2,
  Bot,
  BookOpen,
  HelpCircle,
  ChevronDown,
  CreditCard,
  Globe,
  Clock,
  MessageSquare,
  Layers,
  AlertCircle
} from 'lucide-react';

const PRESET_CASES = [
  {
    category: 'Billing & Refund Dispute',
    title: 'Duplicate Subscription Charge',
    name: 'Priya Sharma',
    email: 'priya.sharma@globaltech.in',
    channel: 'Email',
    risk: 'SAFE',
    text: "My payment was deducted twice for the annual subscription (₹2,500). The transaction ID is TXN-99821 but my order wasn't confirmed. Please help me get my refund as soon as possible.",
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
  },
  {
    category: 'Credential Harvesting & 2FA',
    title: 'PayPal Account Suspension Phish',
    name: 'Security Alert Desk',
    email: 'support@paypa1-security.example',
    channel: 'Email',
    risk: 'CRITICAL',
    text: 'URGENT! Your PayPal account has been restricted due to unauthorized login attempts. Click immediately on http://paypa1-security.example/login to verify your identity. Enter your username, password and 6-digit OTP code to prevent permanent closure within 24 hours.',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
  },
  {
    category: 'Lookalike Domain Impersonation',
    title: 'Bank KYC Verification Trap',
    name: 'Bank Support Alert',
    email: 'helpdesk.bank.security@gmail.com',
    channel: 'Contact Form',
    risk: 'HIGH',
    text: 'Dear Customer, your bank netbanking access has been disabled due to pending KYC documents. Please verify your account credentials and card PIN at http://paypa1-security.example/login to instantly unblock your debit card.',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
  },
  {
    category: 'Delivery Tracking Notice',
    title: 'Official Amazon Order Delivery',
    name: 'Amazon Customer Support',
    email: 'orders@amazon.com',
    channel: 'Chat',
    risk: 'SAFE',
    text: 'Hello, your package with tracking #ORD-98421 is out for delivery today with our courier partner. You can track the driver live inside your mobile app. Please reach out if you have any questions!',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
  }
];

const SOC_TRIAGE_RULES = [
  {
    title: 'Credential & Password Harvesting Containment',
    desc: 'If a conversation contains unverified external links asking for passwords or card numbers, immediately quarantine the ticket, block the destination domain in network firewalls, and notify the customer.',
    icon: Lock
  },
  {
    title: '2FA / One-Time Passcode (OTP) Protection',
    desc: 'Verify that customer support agents NEVER request or read OTPs over chat. Any incoming message requesting an OTP is an immediate critical social engineering threat.',
    icon: Key
  },
  {
    title: 'Lookalike Typosquatting Domain Triage',
    desc: 'Inspect embedded URLs for lookalike characters (e.g. "0" for "o", "1" for "l") and unencrypted HTTP hosts crafted to mimic legitimate enterprise login portals.',
    icon: Globe
  },
  {
    title: 'Empathetic Customer Support Escalation',
    desc: 'For billing disputes or order delays, review customer sentiment and emotion to route tickets to high-priority resolver queues with SLA response targets under 24 hours.',
    icon: MessageSquare
  }
];

const FAQS = [
  {
    q: 'How does KAAVALX perform multi-dimensional conversation analysis?',
    a: 'KAAVALX runs incoming text through a dual-engine pipeline: evaluating customer support parameters (Category, Sentiment, Emotion, Urgency, Priority, Summary) while simultaneously running deep cybersecurity threat inspection (Lookalike URL analysis, Credential Theft detection, OTP Interception flags, and Social Engineering heuristics).'
  },
  {
    q: 'Are analyzed conversations saved to the database?',
    a: 'Yes. Every analyzed conversation is automatically indexed and synchronized with both the primary Supabase PostgreSQL database and the local SQLite database for threat hunting and analytics tracking.'
  },
  {
    q: 'How does the threat risk score get calculated?',
    a: 'The threat engine evaluates weighted vectors including typosquatting (+30), credential requests (+25), OTP exfiltration (+25), brand impersonation (+20), suspicious free webmail senders (+20), and psychological urgency language (+10) to compute a normalized 0–100 score.'
  }
];

export function AnalyzeConversation() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer', 'copilot', 'playbook'
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [channel, setChannel] = useState('Email');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const textareaRef = useRef(null);
  const resultRef = useRef(null);

  const handlePreset = (preset) => {
    setActiveTab('analyzer');
    setCustomerName(preset.name);
    setCustomerEmail(preset.email);
    setChannel(preset.channel);
    setMessage(preset.text);
    setHistory('');
    runAnalysis(preset.text, preset.name, preset.email, preset.channel);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setMessage(text);
          textareaRef.current?.focus();
        }
      } else {
        textareaRef.current?.focus();
      }
    } catch {
      textareaRef.current?.focus();
    }
  };

  const handleClear = () => {
    setCustomerName('');
    setCustomerEmail('');
    setChannel('Email');
    setMessage('');
    setHistory('');
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

  const runAnalysis = async (customMsg, customName, customEmail, customChannel) => {
    const textToAnalyze = (customMsg !== undefined ? customMsg : message || '').trim();
    if (!textToAnalyze) {
      alert('Please enter a conversation message to analyze.');
      textareaRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await analyzeConversation({
        message: textToAnalyze,
        conversation_history: history,
        customer_name: customName || customerName || 'Anonymous Customer',
        customer_email: customEmail || customerEmail || 'anonymous@domain.com',
        channel: customChannel || channel || 'Email'
      });

      if (res && res.analysis) {
        setResult({
          ...res.analysis,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // Smooth scroll to results
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const sec = result.security || {};
    const report = [
      `🛡️ KAAVALX AI Deep Triage & Security Report`,
      `----------------------------------------------`,
      `Threat Status: ${sec.threat_detected ? '🚨 THREAT DETECTED' : '✅ CLEAN & AUTHENTIC'}`,
      `Threat Classification: ${sec.threat_type || 'None'}`,
      `Risk Level: ${sec.risk_level || 'LOW'} (Score: ${sec.risk_score || 0}/100)`,
      `Category: ${result.category || 'General'}`,
      `Sentiment: ${result.sentiment || 'Neutral'} (${result.emotion || 'Normal'})`,
      `Urgency: ${result.urgency || 'Normal'} | Priority: ${result.priority || 'Normal'}`,
      `Summary: ${result.summary || 'N/A'}`,
      `Recommended Action: ${sec.recommended_action || result.recommended_action || 'Standard support processing.'}`,
      ``,
      `Generated by KAAVALX AI Cyber Defense Intelligence System`
    ].join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareReport = () => {
    if (!result) return;
    const sec = result.security || {};
    const shareText = `🛡️ KAAVALX SOC Triage: Conversation flagged as [${sec.risk_level || 'LOW'} RISK] - ${sec.threat_type || result.category}. Action: ${sec.recommended_action || result.recommended_action}`;
    if (navigator.share) {
      navigator.share({
        title: 'KAAVALX Incident Triage',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const sec = result?.security || {};
  const isScam = result && (sec.threat_detected || (sec.risk_score >= 50) || sec.risk_level === 'CRITICAL' || sec.risk_level === 'HIGH');
  const isSuspicious = result && !isScam && (sec.risk_level === 'MEDIUM' || (sec.risk_score > 0));

  return (
    <Layout title="Analyze Conversation">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>AI Deep Triage & Cybersecurity SOC Analysis</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Analyze Support & Threat <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 dark:from-purple-400 dark:via-indigo-300 dark:to-pink-400 bg-clip-text text-transparent">Conversations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Run multi-dimensional intelligence triage on customer tickets, emails, and live chats for sentiment, intent, priority, and malicious phishing indicators.
          </p>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#0E152C] border border-slate-200 dark:border-slate-800 shadow-md space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'analyzer'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Conversation Analyzer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Triage Copilot</span>
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
              <span>SOC Playbook & FAQs</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: ANALYZER ================= */}
        {activeTab === 'analyzer' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Input Card */}
            <div className="bg-white dark:bg-[#0E152C] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-black/40 space-y-4 transition-colors">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Input Conversation Data & Message Body:
                  </span>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg border border-purple-200 dark:border-purple-800/50 transition-colors cursor-pointer"
                    title="Paste message from clipboard"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Paste Clipboard</span>
                  </button>

                  {(message || customerName || customerEmail) && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Clear form"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Form Body */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  runAnalysis();
                }} 
                className="space-y-4"
              >
                {/* 3 Fields Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customer Name</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customer / Sender Email</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. priya.sharma@domain.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Channel</span>
                    </label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer font-medium"
                    >
                      <option value="Email">Email</option>
                      <option value="Chat">Live Chat</option>
                      <option value="Support Ticket">Support Ticket</option>
                      <option value="Contact Form">Contact Form</option>
                      <option value="Social Media">Social Media</option>
                    </select>
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Customer Message / Phishing Body *
                  </label>
                  <textarea
                    ref={textareaRef}
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Paste customer support ticket message, SMS text, or suspicious email body here..."
                    className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans leading-relaxed resize-y shadow-inner"
                    required
                  />
                </div>

                {/* Optional History */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Previous Conversation History (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                    placeholder="Optional: Paste prior message exchanges or agent responses..."
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                  />
                </div>

                {/* Submit Row */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running AI Deep Triage...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Conversation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Preset Incident Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Or load a live triage case study:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {PRESET_CASES.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePreset(ex)}
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

            {/* Error Notification */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 rounded-2xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Verdict & Intelligence Results (Exact Same Backend Pipeline) */}
            <div ref={resultRef}>
              {result && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Top Security Header Alert Banner */}
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
                              KAAVALX AI Deep Triage
                            </span>
                            <span className="text-xs font-mono opacity-70">{result.timestamp}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                            {isScam 
                              ? `🛑 Threat Detected: ${sec.threat_type || 'Phishing & Threat Vector'}` 
                              : isSuspicious 
                              ? '⚠️ Suspicious Incident Detected' 
                              : '✅ Safe & Authentic Customer Communication'}
                          </h2>
                          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1 leading-relaxed">
                            {sec.reason || result.summary || 'Message structure, sender authentication, and links verified clean.'}
                          </p>
                        </div>
                      </div>

                      {/* Threat Badge */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-current/10">
                        <span className="text-xs font-semibold uppercase opacity-70">Threat Risk:</span>
                        <div className="mt-1">
                          <RiskBadge level={sec.risk_level || (isScam ? 'HIGH' : 'LOW')} />
                        </div>
                      </div>
                    </div>

                    {/* Threat Score Progress Meter */}
                    <div className="mt-5 pt-4 border-t border-current/10">
                      <div className="flex justify-between text-xs font-semibold mb-1.5 opacity-90">
                        <span>Threat Probability Meter</span>
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

                  {/* Split Grid: Security Threat Intelligence & Customer Support Context */}
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
                          <p className="font-semibold text-slate-900 dark:text-white">{sec.suspicious_message ? 'Urgency / Fear language' : 'Normal tone'}</p>
                        </div>
                      </div>

                      {/* Detected Attack Techniques Badges */}
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
                      {result.urls && result.urls.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                            Extracted URLs & Domain Inspector ({result.urls.length}):
                          </span>
                          <div className="space-y-1.5">
                            {result.urls.map((u, i) => (
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

                    {/* Right: Customer Support Context & Recommended Action */}
                    <div className="bg-white dark:bg-[#0E152C] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Customer Support Intelligence</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Category:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{result.category || 'General'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Issue:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{result.issue || 'Inquiry'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Sentiment:</span>
                            <div className="mt-0.5"><SentimentBadge sentiment={result.sentiment || 'Neutral'} /></div>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Emotion:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{result.emotion || 'Normal'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Urgency:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{result.urgency || 'Normal'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Priority:</span>
                            <div className="mt-0.5"><PriorityBadge level={result.priority || 'Medium'} /></div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Resolution Status:</span>
                            <div className="mt-0.5"><ResolutionBadge status={result.resolution_status || 'Unresolved'} /></div>
                          </div>
                        </div>

                        {/* Summary & Customer Request */}
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">AI Summary:</span>
                            <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 leading-relaxed">
                              {result.summary}
                            </p>
                          </div>
                        </div>

                        {/* Recommended Action Box */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                            Recommended SOC / Agent Action:
                          </span>
                          <p className="text-xs font-semibold p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 leading-relaxed">
                            {sec.recommended_action || result.recommended_action || 'Escalate to senior resolution specialist.'}
                          </p>
                        </div>
                      </div>

                      {/* Share & Copy Action Bar */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handleCopyReport}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied to Clipboard' : 'Copy Triage Report'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleShareReport}
                            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
                            title="Share incident report"
                          >
                            {shared ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{shared ? 'Report Link Copied' : 'Share Triage'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleClear}
                          className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                        >
                          Analyze Another
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 2: COPILOT ================= */}
        {activeTab === 'copilot' && (
          <div className="animate-fade-in space-y-4">
            <PublicScamChatAdvisor isFloating={false} />
          </div>
        )}

        {/* ================= TAB 3: PLAYBOOK & FAQS ================= */}
        {activeTab === 'playbook' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Playbook Rules Grid */}
            <div className="bg-white dark:bg-[#0E152C] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Security Operations Center (SOC) Triage Playbook
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard operating procedures for customer support analysts when triaging incoming communications.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SOC_TRIAGE_RULES.map((rule, idx) => {
                  const Icon = rule.icon;
                  return (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-purple-300 dark:hover:border-purple-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {rule.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {rule.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive FAQ Accordion */}
            <div className="bg-white dark:bg-[#0E152C] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
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

      </div>
    </Layout>
  );
}

export default AnalyzeConversation;
