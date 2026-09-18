import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Sun,
  Moon,
  Monitor,
  Cloud,
  Zap,
  Sparkles
} from 'lucide-react';

export function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, isDark, setTheme } = useTheme();

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setHealth({ status: 'offline', error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Settings & System Status">
        <LoadingSpinner message="Checking backend system health..." />
      </Layout>
    );
  }

  return (
    <Layout title="Settings & System Status">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Appearance & Theme Settings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sun className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Display Mode</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your preferred display theme for the SOC security dashboard and intelligence interface.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Dark Theme Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-center space-x-3.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="p-3 rounded-lg bg-slate-900 text-amber-400 border border-slate-700">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</span>
                  {isDark && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High-contrast cyber defense palette</p>
              </div>
            </button>

            {/* Light Theme Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex items-center space-x-3.5 transition-all cursor-pointer ${
                !isDark
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div className="p-3 rounded-lg bg-white text-blue-600 border border-slate-200 shadow-xs">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Light Mode</span>
                  {!isDark && (
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Crisp, clean high-readability daylight layout</p>
              </div>
            </button>
          </div>
        </div>

        {/* System Health & Cloud Database Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Health & Database Diagnostics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-slate-400 font-medium">Backend REST Server:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>ONLINE (Port 5000)</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-slate-400 font-medium">Active Database Engine:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>{health?.database || 'SQLite 3 (Local)'}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-slate-400 font-medium">AI Engine Model:</span>
              <p className="font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Google Gemini 2.5 Flash</span>
              </p>
            </div>
          </div>

          {/* Supabase Status Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Supabase (PostgreSQL) Cloud Status</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                health?.supabaseConfigured 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
              }`}>
                {health?.supabaseConfigured ? 'CONNECTED' : 'STANDBY (Using SQLite)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              To connect your live Supabase project, paste your <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px] text-blue-600 dark:text-blue-400">SUPABASE_URL</code> and <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px] text-blue-600 dark:text-blue-400">SUPABASE_KEY</code> into <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">server/.env</code>. Run <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">npm run db:sync:supabase</code> in the server folder to sync records.
            </p>
          </div>
        </div>

        {/* Security Scoring Engine Parameters */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deterministic Threat Scoring Parameters</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weighted security scoring rules executed on every incoming email, support ticket, and link.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span>Lookalike / Brand Impersonation Domain</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">+30 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span>Suspicious URL Structure / Encoding</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">+30 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span>Credential / Password Request</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">+25 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span>OTP / 2FA Security Code Interception</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">+25 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span>Executive / Security Impersonation Claim</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">+20 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span>Coercive Urgency or Fear Escalation</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">+10 Risk Points</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
