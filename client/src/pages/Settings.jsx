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
  Sparkles,
  RefreshCw,
  Activity
} from 'lucide-react';
import { checkSystemHealth } from '../services/api';

export function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { theme, isDark, setTheme } = useTheme();

  const loadHealth = async (isManual = false) => {
    if (isManual) setTesting(true);
    try {
      const data = await checkSystemHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'offline', error: err.message });
    } finally {
      setLoading(false);
      if (isManual) setTesting(false);
    }
  };

  useEffect(() => {
    loadHealth();
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
        
        {/* Theme Settings Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 transition-all">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-white/5 pb-3">
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
        <div className="glass-panel p-6 rounded-2xl space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Health & Live Connection Telemetry</h3>
            </div>

            <button
              type="button"
              onClick={() => loadHealth(true)}
              disabled={testing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Pinging Services...' : 'Test Connections Now'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Backend Server */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Backend REST Server:</span>
                {health?.backend?.latencyMs && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    ⚡ {health.backend.latencyMs}ms
                  </span>
                )}
              </div>
              <p className={`font-bold flex items-center space-x-1 mt-1.5 ${
                health?.backend?.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {health?.backend?.connected ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{health?.backend?.connected ? `ONLINE (Port ${health?.backend?.port || 5000})` : 'OFFLINE (Not reachable)'}</span>
              </p>
            </div>

            {/* Supabase Database */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Supabase Cloud DB:</span>
                {health?.supabase?.latencyMs && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    ⚡ {health.supabase.latencyMs}ms
                  </span>
                )}
              </div>
              <p className={`font-bold flex items-center space-x-1.5 mt-1.5 ${
                health?.supabase?.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                <Database className="w-3.5 h-3.5" />
                <span>{health?.supabase?.connected ? 'CONNECTED & SYNCED' : 'DISCONNECTED'}</span>
              </p>
            </div>

            {/* AI Intelligence API */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-slate-400 font-medium">AI Intelligence Engine:</span>
              <p className="font-bold text-blue-600 dark:text-blue-400 mt-1.5 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{health?.apis?.gemini?.configured ? 'Gemini 2.5 Flash' : 'Built-in Copilot + Heuristics'}</span>
              </p>
            </div>
          </div>

          {/* Supabase Status Banner */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Database Engine Architecture</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                health?.supabase?.connected 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              }`}>
                {health?.database?.primary || (health?.supabase?.connected ? 'Supabase PostgreSQL' : 'SQLite Local')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {health?.supabase?.connected 
                ? 'Your application is connected to live Supabase PostgreSQL cloud storage. Telemetry is persisted and synchronized with client-side real-time channels.'
                : 'Supabase cloud credentials not detected in server/.env or server is in offline standby. The system is operating securely with local SQLite database storage.'}
            </p>
          </div>
        </div>

        {/* Security Scoring Engine Parameters */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 transition-all">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-white/5 pb-3">
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
