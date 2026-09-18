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
  ShieldQuestion,
  Fingerprint
} from 'lucide-react';

const PRESET_SCAMS = [
  {
    title: 'PayPal Account Locked',
    type: 'Credential Harvesting',
    risk: 'CRITICAL',
    sender: 'support@paypa1-security.example',
    text: 'URGENT: Your PayPal account has been temporarily locked due to suspicious activity. Click immediately on http://paypa1-security.example/login to verify your identity. Enter your email, password, and 6-digit OTP code within 24 hours to prevent permanent deactivation.'
  },
  {
    title: 'Microsoft 365 Expiry',
    type: 'Domain Spoofing',
    risk: 'HIGH',
    sender: 'billing@micros0ft-update.info',
    text: 'Your Microsoft Office 365 business license has expired. Your subscription will be cancelled today. Please verify your billing card details and login at http://micros0ft-update.info/billing-verify to renew.'
  },
  {
    title: 'Bank OTP & Refund Trap',
    type: 'OTP Exfiltration',
    risk: 'CRITICAL',
    sender: 'helpdesk.bank.refunds@gmail.com',
    text: 'Dear Customer, INR 14,500 refund approved for failed transaction. Kindly share the 6-digit verification code (OTP) sent to your mobile number to instantly credit the amount to your account.'
  },
  {
    title: 'Amazon Delivery Notice',
    type: 'Legitimate Notice',
    risk: 'SAFE',
    sender: 'orders@amazon.com',
    text: 'Your order #ORD-98421 has been shipped and is out for delivery. You can track your package directly through your Amazon app under Your Orders. Thank you for shopping with us.'
  }
];

const SAFETY_FAQS = [
  {
    q: 'Will my bank, payment app, or tech company ever ask for my OTP or password?',
    a: 'Never. Legitimate organizations will never ask for your passwords, card PINs, or 2-factor authentication (OTP) codes through email, SMS, or phone.'
  },
  {
    q: 'What should I do if I already clicked a suspicious link?',
    a: 'Immediately disconnect your device from Wi-Fi/mobile data, change passwords for affected accounts from a clean secondary device, enable two-factor authentication, and notify your bank if financial details were entered.'
  },
  {
    q: 'What is lookalike domain spoofing (typosquatting)?',
    a: 'Fraudsters register web addresses that look almost identical to authentic brands (e.g. micros0ft instead of microsoft, or paypa1 instead of paypal) to fool users into submitting confidential login information.'
  }
];

export function PublicScamChecker() {
  const [inputText, setInputText] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  const runAnalysis = async (customText, customSender) => {
    const text = (customText !== undefined ? customText : inputText || '').trim();
    const sender = (customSender !== undefined ? customSender : senderEmail).trim();

    if (!text) {
      alert('Please enter or paste a message, email, SMS, or link to analyze.');
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
        /paypa1/i, /micros0ft/i, /g00gle/i, /amaz0n/i, /netfl1x/i, /app1e/i,
        /.*-security\.example/i, /.*-verify\.com/i, /.*-update\.info/i, /.*-support\.org/i
      ];
      const hasLookalike = lookalikeMatches.some(p => p.test(text));

      // 1. Password & credential theft
      if (/password|login detail|credential|bank details|card number|cvv|security pin|atm pin/i.test(lower)) {
        redFlags.push({
          icon: Lock,
          title: 'Credential Harvesting Trap',
          desc: 'This message explicitly requests your confidential login credentials or payment card PIN. Genuine companies never request passwords via message.'
        });
      }

      // 2. OTP Exfiltration
      if (/otp|verification code|one-time password|2fa code|security code|verification pin/i.test(lower)) {
        redFlags.push({
          icon: Key,
          title: '2-Factor Authentication (OTP) Interception',
          desc: 'Scammers are attempting to steal your 6-digit OTP passcode to bypass security safeguards and access your funds or account.'
        });
      }

      // 3. Panic & Urgency
      if (/urgent|immediately|within 24 hours|account suspended|deactivated|action required|final notice|blocked|permanently locked/i.test(lower)) {
        redFlags.push({
          icon: Clock,
          title: 'Coercive Urgency & Pressure Tactics',
          desc: 'The sender uses threats of immediate suspension or penalty to create artificial panic, forcing hasty decisions without verification.'
        });
      }

      // 4. Financial Baits
      if (/refund approved|lottery|prize winner|wire transfer|crypto deposit|gift card|unclaimed funds/i.test(lower)) {
        redFlags.push({
          icon: CreditCard,
          title: 'Financial Trap & Fake Refund Incentive',
          desc: 'Promises of unexpected cash refunds or prizes designed to deceive you into disclosing confidential financial details.'
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
            ? 'Deceptive lookalike domain (Typosquatting spoof)' 
            : isShort 
            ? 'Shortened redirect link' 
            : isHttp 
            ? 'Unencrypted insecure connection' 
            : 'Standard domain'
        };
      });

      if (urlsFound.some(u => u.isSuspicious) || hasLookalike) {
        redFlags.push({
          icon: Globe,
          title: 'Deceptive Phishing / Lookalike Links',
          desc: 'Contains links pointing to lookalike or masked web domains crafted to impersonate trusted portals.'
        });
      }

      // 6. Free-Mail Address Spoof
      if (sender && /gmail\.com|yahoo\.com|outlook\.com|hotmail\.com/i.test(sender) && /bank|security|paypal|microsoft|support|desk|refund|alert|amazon/i.test(sender)) {
        redFlags.push({
          icon: Mail,
          title: 'Free Webmail Sender Impersonation',
          desc: 'Sender purports to be an official bank or enterprise authority but communicates through a free personal email account.'
        });
      }

      // Compute score
      let riskScore = sec.risk_score || 0;
      if (redFlags.length >= 3) riskScore = Math.max(riskScore, 95);
      else if (redFlags.length === 2) riskScore = Math.max(riskScore, 75);
      else if (redFlags.length === 1) riskScore = Math.max(riskScore, 50);

      const isScamThreat = riskScore >= 50 || redFlags.length >= 1 || sec.threat_detected === 1;
      const riskLevel = riskScore >= 75 ? 'CRITICAL' : riskScore >= 45 ? 'HIGH' : riskScore >= 20 ? 'MEDIUM' : 'LOW';

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
        // Fallback works automatically
      }

      const finalVerdict = {
        threat_detected: isScamThreat ? 1 : 0,
        threat_type: isScamThreat 
          ? (hasLookalike ? 'Lookalike Brand Impersonation' : redFlags.some(f => f.title.includes('OTP')) ? 'OTP Exfiltration Scam' : 'Credential Harvesting & Phishing')
          : 'Clean & Legitimate Interaction',
        risk_level: isScamThreat ? riskLevel : 'SAFE',
        risk_score: isScamThreat ? Math.max(riskScore, 65) : 0,
        redFlags,
        urls: urlsFound,
        sender: sender || 'Unspecified Sender',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setVerdict(finalVerdict);

      // Auto scroll to verdict
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
  };

  const handleCopyReport = () => {
    if (!verdict) return;
    const report = [
      `KAAVALX Security Scam Assessment`,
      `=================================`,
      `Verdict: ${verdict.threat_detected ? 'DANGEROUS SCAM / PHISHING DETECTED' : 'LOOKS SAFE & LEGITIMATE'}`,
      `Risk Level: ${verdict.risk_level} (Threat Score: ${verdict.risk_score}/100)`,
      `Threat Type: ${verdict.threat_type}`,
      `Red Flags Found: ${verdict.redFlags.length}`,
      `Verified with KAAVALX AI Cyber Defense Engine`
    ].join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isScam = verdict && (verdict.threat_detected === 1 || verdict.risk_score >= 50);
  const isSuspicious = verdict && !isScam && (verdict.risk_level === 'MEDIUM' || verdict.risk_score > 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden font-sans antialiased selection:bg-purple-500 selection:text-white">
      
      {/* Dynamic Glassmorphism Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[128px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-[128px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-blue-600/15 blur-[128px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-900/80 to-slate-950" />
      </div>

      {/* Top Navbar with Glassmorphism */}
      <header className="relative z-30 border-b border-white/10 bg-slate-900/70 backdrop-blur-2xl sticky top-0 px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <Link 
            to="/verify" 
            className="flex items-center space-x-3.5 group transition-transform active:scale-[0.98]"
          >
            <div className="h-9 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center p-1 bg-black/40 border border-purple-500/30 backdrop-blur-md shadow-md shadow-purple-500/20 group-hover:border-purple-400/60 transition-all flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="KAAVALX Logo" 
                className="h-full w-auto max-h-8 sm:max-h-9 object-contain drop-shadow group-hover:scale-105 transition-transform" 
              />
            </div>

            <div className="hidden sm:block h-5 w-px bg-white/15" />

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                Scam Shield
              </span>
              <span className="hidden md:inline-flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Public Phishing Scanner</span>
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md transition-all hover:border-purple-500/40 shadow-xs"
            >
              <span>SOC Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Glassmorphic Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* Hero Header with KAAVALX Logo Badge */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-purple-500/30 text-purple-300 backdrop-blur-xl shadow-lg shadow-purple-500/10">
            <img src="/logo.png" alt="KAAVALX" className="w-4 h-4 object-contain" />
            <span>KAAVALX Threat Intelligence • Free & Anonymous</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Check If a Message or Link Is a <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Scam</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Paste any suspicious email, SMS, WhatsApp message, or link below to scan for cyber fraud, deceptive clone websites, and OTP harvesting traps.
          </p>
        </div>

        {/* Glass Presets Grid */}
        <div className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl shadow-black/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_SCAMS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUsePreset(ex)}
                className="p-3.5 rounded-2xl border text-left text-xs transition-all duration-200 cursor-pointer bg-white/5 hover:bg-white/10 border-white/10 hover:border-purple-500/50 backdrop-blur-md group hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-200 group-hover:text-purple-300 truncate">
                    {ex.title}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase border ${
                    ex.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    ex.risk === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {ex.risk}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{ex.type}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Glass Form Card */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            runAnalysis();
          }} 
          className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/40 space-y-4"
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Paste Suspicious Message, Email Body, SMS, or Link</span>
            </label>
            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-red-400 inline-flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. URGENT: Your PayPal account has been suspended. Click http://paypa1-security.example to enter your OTP code immediately..."
            className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 transition-all font-sans leading-relaxed resize-y backdrop-blur-md"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Sender Email Address or Phone (Optional)</span>
              </label>
              <input
                type="text"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. support@paypa1-security.example or +1-800-xxx"
                className="w-full px-4 py-3 rounded-xl text-xs bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 font-mono backdrop-blur-md"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 border border-purple-400/30"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Threat...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check For Fake / Scam</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ================= GLASS VERDICT CARD ================= */}
        <div ref={resultRef}>
          {verdict && (
            <div className="space-y-6">
              
              {/* Main Banner with Glassmorphism */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-all ${
                isScam 
                  ? 'bg-red-950/40 border-red-500/40 text-red-100 shadow-red-950/50' 
                  : isSuspicious 
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-100 shadow-amber-950/50'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
              }`}>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0 mt-1 sm:mt-0 border ${
                      isScam ? 'bg-red-600/90 border-red-400/40 shadow-red-600/30' : isSuspicious ? 'bg-amber-600/90 border-amber-400/40 shadow-amber-600/30' : 'bg-emerald-600/90 border-emerald-400/40 shadow-emerald-600/30'
                    }`}>
                      {isScam ? <ShieldAlert className="w-7 h-7" /> : isSuspicious ? <AlertTriangle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10">
                          KAAVALX Verdict
                        </span>
                        <span className="text-xs font-mono opacity-60">{verdict.timestamp}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5">
                        {isScam ? 'Dangerous Scam / Phishing Attack' : isSuspicious ? 'Suspicious Activity Detected' : 'Safe & Authentic Message'}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
                        {isScam 
                          ? 'Do NOT click any links, do NOT enter passwords, and do NOT share your OTP code.'
                          : isSuspicious 
                          ? 'Proceed with caution. Verify directly with the official company.'
                          : 'No deceptive links or credential harvesting traps were detected in this message.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <span className="text-xs font-semibold uppercase opacity-70">Threat Level:</span>
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl border mt-1 ${
                      isScam ? 'bg-red-500/20 text-red-200 border-red-500/40' : isSuspicious ? 'bg-amber-500/20 text-amber-200 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                    }`}>
                      {verdict.risk_level} ({verdict.risk_score}/100)
                    </span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-semibold mb-1.5 opacity-90">
                    <span>Threat Probability Meter</span>
                    <span>{verdict.risk_score >= 50 ? 'High Risk Danger' : 'Safe to Proceed'}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isScam ? 'bg-gradient-to-r from-red-500 to-rose-400' : isSuspicious ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.max(verdict.risk_score, 5)}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Grid: Red Flags & Recommended Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Identified Threat Indicators */}
                <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Detected Threat Indicators ({verdict.redFlags.length})</span>
                  </h3>

                  {verdict.redFlags && verdict.redFlags.length > 0 ? (
                    <div className="space-y-3">
                      {verdict.redFlags.map((flag, idx) => {
                        const IconComp = flag.icon || AlertCircle;
                        return (
                          <div key={idx} className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-1.5 backdrop-blur-md">
                            <div className="flex items-center space-x-2 text-red-300 font-bold text-xs">
                              <IconComp className="w-4 h-4 flex-shrink-0" />
                              <span>{flag.title}</span>
                            </div>
                            <p className="text-[11px] text-red-200/90 leading-relaxed pl-6">
                              {flag.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>No deceptive patterns or credential theft traps identified.</span>
                    </div>
                  )}

                  {/* Detected Links Table */}
                  {verdict.urls && verdict.urls.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <span className="text-xs font-bold text-slate-300 block">
                        URLs Extracted from Message:
                      </span>
                      {verdict.urls.map((u, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs flex items-center justify-between">
                          <span className="font-mono text-[11px] text-slate-300 truncate max-w-[200px]">
                            {u.url}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                            u.isSuspicious 
                              ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {u.isSuspicious ? 'UNSAFE LINK' : 'CLEAN'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Consumer Safety Playbook */}
                <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Recommended Safety Steps</span>
                    </h3>

                    <div className="space-y-3 text-xs text-slate-300">
                      <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                        <div>
                          <p className="font-bold text-white">Never Share Passwords or OTPs</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Legitimate banks and services will never contact you asking for login passcodes or PIN numbers.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                        <div>
                          <p className="font-bold text-white">Do Not Open Unverified Links</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Type the verified address directly into your web browser or open the official mobile app.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                        <div>
                          <p className="font-bold text-white">Block & Mark as Phishing</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Report the message as spam/fraud in your email client or smartphone messaging app.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Report Copied' : 'Copy Safety Report'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline cursor-pointer"
                    >
                      Scan Another
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>

        {/* Security FAQs with Glassmorphism */}
        <div className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Frequently Asked Safety Questions</span>
          </div>

          <div className="divide-y divide-white/10 text-xs">
            {SAFETY_FAQS.map((faq, idx) => (
              <div key={idx} className="py-3.5 space-y-1">
                <p className="font-bold text-white">{faq.q}</p>
                <p className="text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer with KAAVALX Branding */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl py-6 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <img src="/logo.png" alt="KAAVALX" className="w-4 h-4 object-contain" />
          <span className="font-bold text-slate-300">KAAVALX Cyber Defense</span>
        </div>
        <p>Real-Time AI Threat Protection for Everyday Consumers & Organizations</p>
      </footer>

    </div>
  );
}

export default PublicScamChecker;
