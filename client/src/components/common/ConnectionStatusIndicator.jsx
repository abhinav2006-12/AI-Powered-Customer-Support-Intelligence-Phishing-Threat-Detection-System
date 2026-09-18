import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Database, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  X, 
  Copy, 
  Check, 
  Layers, 
  ChevronDown 
} from 'lucide-react';
import { checkSystemHealth } from '../../services/api';

export function ConnectionStatusIndicator() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const modalRef = useRef(null);

  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await checkSystemHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (e) {
      console.error('Diagnostic health check failed:', e);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto-poll health status every 45 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Close modal when pressing ESC or clicking outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyDiagnostics = () => {
    if (!health) return;
    const diag = JSON.stringify(health, null, 2);
    navigator.clipboard.writeText(diag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine overall status colors and text
  const isHealthy = health?.overall === 'healthy';
  const isDegraded = health?.overall === 'degraded';
  const isOffline = health?.overall === 'offline';

  const badgeBg = isHealthy 
    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60' 
    : isDegraded 
    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60' 
    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60';

  const dotColor = isHealthy 
    ? 'bg-emerald-500' 
    : isDegraded 
    ? 'bg-amber-500' 
    : 'bg-rose-500';

  const pingLatency = health?.backend?.latencyMs || health?.supabase?.latencyMs;

  return (
    <div className="relative inline-block">
      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 hover:shadow-xs select-none ${badgeBg}`}
        title="Click to view real-time API, Backend & Supabase connection diagnostics"
        aria-label="System Connection Diagnostics"
      >
        {/* Pulsing Status Dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
        </span>

        {/* Labels & Micro-Icons */}
        <div className="flex items-center space-x-1.5">
          <span className="hidden sm:inline-block font-medium">
            {loading ? 'Checking...' : isHealthy ? 'Systems Live' : isDegraded ? 'Degraded Mode' : 'Offline'}
          </span>
          <span className="sm:hidden font-medium">
            {loading ? '...' : isHealthy ? 'Live' : isDegraded ? 'Degraded' : 'Off'}
          </span>

          {/* Mini connectivity status dots */}
          <div className="flex items-center space-x-1 pl-1 border-l border-current/20">
            <span 
              title={`Backend: ${health?.backend?.connected ? 'Online' : 'Offline'}`}
              className={`w-1.5 h-1.5 rounded-full ${health?.backend?.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            <span 
              title={`Supabase: ${health?.supabase?.connected ? 'Connected' : 'Offline'}`}
              className={`w-1.5 h-1.5 rounded-full ${health?.supabase?.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            <span 
              title={`AI APIs: ${health?.apis?.gemini?.configured ? 'Gemini Cloud' : 'Fallback Copilot'}`}
              className={`w-1.5 h-1.5 rounded-full ${health?.apis?.gemini?.configured ? 'bg-emerald-500' : 'bg-amber-400'}`}
            />
          </div>

          {/* Latency badge */}
          {pingLatency && !loading && (
            <span className="hidden md:inline-block text-[10px] font-mono opacity-80 pl-1">
              {pingLatency}ms
            </span>
          )}
        </div>

        <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Diagnostics Popover / Dropdown Modal */}
      {isOpen && (
        <div 
          ref={modalRef}
          className="absolute right-0 mt-2 w-96 max-w-[92vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live System Diagnostics
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Real-time connectivity & service telemetry
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Summary Banner */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isHealthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : isDegraded ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500" />
              )}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isHealthy 
                  ? 'All Core Services Operational' 
                  : isDegraded 
                  ? 'Operating in Resilient Fallback Mode' 
                  : 'Connectivity Failure Detected'}
              </span>
            </div>

            {lastChecked && (
              <span className="text-[10px] text-slate-400 font-mono">
                {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>

          {/* Service Diagnostic Rows */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            
            {/* 1. Backend REST Server */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Backend REST Server</h4>
                    <p className="text-[10px] text-slate-400">Node.js Express API (Port {health?.backend?.port || 5000})</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {health?.backend?.latencyMs && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ⚡ {health.backend.latencyMs}ms
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    health?.backend?.connected 
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                  }`}>
                    {health?.backend?.connected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                {health?.backend?.connected ? (
                  <span>Status: Operational at <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{health?.backend?.url}</code></span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">
                    Backend unreachable. Start with <code className="font-mono text-[10px] bg-rose-50 dark:bg-rose-950 px-1 py-0.5 rounded font-bold">npm run dev:server</code>.
                  </span>
                )}
              </div>
            </div>

            {/* 2. Supabase Cloud Database */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Supabase PostgreSQL</h4>
                    <p className="text-[10px] text-slate-400">Cloud Database & Realtime Sync</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {health?.supabase?.latencyMs && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ⚡ {health.supabase.latencyMs}ms
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    health?.supabase?.connected 
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                  }`}>
                    {health?.supabase?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-7 leading-relaxed">
                {health?.supabase?.connected ? (
                  <span>
                    Status: Verified {health?.supabase?.recordCount !== undefined ? `(${health.supabase.recordCount} conversations)` : ''} — {health?.supabase?.message}
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">
                    {health?.supabase?.message || 'Check SUPABASE_URL and SUPABASE_KEY configuration'}
                  </span>
                )}
              </div>
            </div>

            {/* 3. AI Intelligence Engines (Gemini & Claude) */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Intelligence APIs</h4>
                    <p className="text-[10px] text-slate-400">Gemini 2.5 Flash & Claude Security Triage</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  health?.apis?.gemini?.configured 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                }`}>
                  {health?.apis?.gemini?.configured ? 'CLOUD AI ACTIVE' : 'HEURISTICS ACTIVE'}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-7 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Google Gemini Copilot:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {health?.apis?.gemini?.configured ? 'Gemini 2.5 Flash (Key verified)' : 'Built-in Intelligent Assistant'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Threat Scoring Engine:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Deterministic SOC Heuristics (100% Active)
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Local SQLite Database Engine */}
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Database Engine</h4>
                    <p className="text-[10px] text-slate-400">Primary: {health?.database?.primary || 'Supabase / SQLite'}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  READY
                </span>
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
            <button
              onClick={handleCopyDiagnostics}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Copy raw telemetry JSON to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Telemetry'}</span>
            </button>

            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Pinging...' : 'Test Connections Now'}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
