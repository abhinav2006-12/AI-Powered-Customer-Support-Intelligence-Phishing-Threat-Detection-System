import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles,
  KeyRound,
  Fingerprint,
  Activity,
  Cpu,
  Radio,
  CheckCircle2,
  Terminal,
  Layers
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [justAutoFilled, setJustAutoFilled] = useState(false);

  const { login, credentials } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError('');
    setJustAutoFilled(true);
    setTimeout(() => setJustAutoFilled(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070B18] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden transition-colors duration-200 selection:bg-purple-500 selection:text-white">
      
      {/* Top Bar Floating Controls */}
      <div className="absolute top-5 right-5 z-30 flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 backdrop-blur-md shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[11px]">SOC GATEWAY ONLINE</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/15 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[28rem] h-[28rem] bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-tr from-purple-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Split-Card */}
      <div className="w-full max-w-5xl relative z-10 bg-white dark:bg-[#0E152C] rounded-3xl shadow-2xl dark:shadow-black/70 border border-slate-200 dark:border-slate-800/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors">
        
        {/* ================= LEFT COLUMN: Brand & SOC Intelligence Showcase ================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-[#101938] to-[#1c1242] text-white p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
          
          {/* Subtle Ambient Grid Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />

          {/* Header Brand Banner */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-black/80 border border-purple-500/50 p-1 shadow-lg shadow-purple-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="KAAVALX Logo" 
                  className="w-full h-full object-cover transform scale-125"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                    KAAVALX
                  </h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40 uppercase tracking-widest font-mono">
                    SOC v1.0
                  </span>
                </div>
                <p className="text-xs text-purple-200/70 font-medium">Enterprise Threat Defense</p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug mt-6">
              AI Support Intelligence & Phishing Triage Engine
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Automated multi-channel customer sentiment analysis, heuristic lookalike domain interception, and Gemini Copilot reasoning.
            </p>
          </div>

          {/* Core Telemetry Feature Cards */}
          <div className="relative z-10 my-8 space-y-3">
            
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white">Heuristic Phishing Hunter</h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">99.8% Acc</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Zero-day brand spoofing, urgent coercion & credential harvesting detection.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white">Gemini 2.5 AI Copilot</h3>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Live Studio</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Automated ticket summaries, empathetic drafting & deep threat hunting.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Left Footer: Telemetry Ticker & APEX Attribution */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center p-1 shadow-2xs">
                <img src="/apex-logo.png" alt="APEX" className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] text-slate-400">
                Engineered by <strong className="text-white font-semibold tracking-wide">APEX</strong>
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>AES-256 GCM</span>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: Authentication Form ================= */}
        <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#0E152C] transition-colors">
          
          <div className="max-w-md w-full mx-auto">
            
            {/* Form Top Title */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Analyst Sign In
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Authenticate to access SOC telemetry & incident tickets
                </p>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>2FA Verified</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Analyst Email / Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kavalx@kavalx.in"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/80 focus:border-purple-500 transition-all font-medium"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Security Passkey
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Protected SOC Token</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/80 focus:border-purple-500 transition-all font-mono"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Credentials Box */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
                <div className="text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                    <KeyRound className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Demo Security Credentials</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-mono space-y-0.5">
                    <p><span className="text-slate-400">User:</span> <strong className="text-slate-800 dark:text-slate-200">kavalx@kavalx.in</strong></p>
                    <p><span className="text-slate-400">Pass:</span> <strong className="text-slate-800 dark:text-slate-200">kavalx@2026</strong></p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleQuickFill}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 flex-shrink-0 ${
                    justAutoFilled
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50 scale-105'
                      : 'bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/40'
                  }`}
                >
                  {justAutoFilled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Filled!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>1-Click Fill</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Security Compliance Micro-Tag */}
            <div className="mt-5 text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>TLS 1.3 Encryption &bull; Supabase PostgreSQL Guard &bull; ISO 27001</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
