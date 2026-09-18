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
  Fingerprint
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-500/20 mb-4 ring-1 ring-white/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AegisGuard AI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Customer Support & Phishing Threat Intelligence System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-[#131C31]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl dark:shadow-2xl dark:shadow-black/50 ring-1 ring-slate-900/5 dark:ring-slate-700/50 transition-colors">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">SOC Portal Sign In</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter authorized security credentials</p>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>2FA Verified</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username / Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kavalx@kavalx.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Secured SOC Key</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="text-xs">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>Authorized Credentials</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 space-y-0.5 font-mono">
                  <p>User: <span className="text-slate-900 dark:text-slate-200 font-semibold">kavalx@kavalx.in</span></p>
                  <p>Pass: <span className="text-slate-900 dark:text-slate-200 font-semibold">kavalx@2026</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-600/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                Auto Fill
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Endpoint &bull; AES-256 Threat Intelligence Hub</span>
        </div>
      </div>
    </div>
  );
}
