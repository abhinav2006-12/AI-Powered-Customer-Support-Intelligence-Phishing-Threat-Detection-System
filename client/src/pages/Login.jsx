import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
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
      setError('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070B18] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors duration-200">
      
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient Background Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/15 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 bg-white dark:bg-[#0E152C] rounded-3xl shadow-2xl dark:shadow-black/70 border border-slate-200 dark:border-slate-800/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors">
        
        {/* ================= LEFT COLUMN: Brand Banner ================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-[#101938] to-[#1a113d] text-white p-8 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
          
          <div className="relative z-10">
            {/* KAAVALX Brand Banner */}
            <div className="w-full rounded-2xl overflow-hidden border border-purple-500/40 bg-black shadow-xl mb-6">
              <img 
                src="/logo.png" 
                alt="KAAVALX Logo" 
                className="w-full h-auto object-cover block"
              />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
              AI-Powered Customer Support Intelligence & Phishing Threat Detection System
            </h2>
          </div>

          {/* APEX Attribution */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1 shadow-md flex-shrink-0">
              <img src="/apex-logo.png" alt="APEX Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-purple-200/70 tracking-wider">Engineered by</p>
              <p className="text-sm font-bold text-white tracking-wide">APEX</p>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: Sign In Form ================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-[#0E152C]">
          
          <div className="max-w-sm w-full mx-auto">
            
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sign In
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access the security workspace
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-start space-x-2.5 text-rose-700 dark:text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Public Scam Checker Link for non-logged-in users */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Received a suspicious message or phishing link?
              </p>
              <button
                type="button"
                onClick={() => navigate('/verify')}
                className="w-full py-2 px-3 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Open Free Scam & Phishing Checker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Security Footnote */}
            <div className="mt-4 pt-3 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted & Protected Access</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
