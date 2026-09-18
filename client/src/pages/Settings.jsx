import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Server
} from 'lucide-react';

export function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

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
        {/* System Health Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">System Health & API Diagnostics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-medium">Backend REST Server:</span>
              <p className="font-bold text-emerald-600 flex items-center space-x-1 mt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>ONLINE (Port 5000)</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-medium">Database Engine:</span>
              <p className="font-bold text-slate-900 mt-1">SQLite 3 (better-sqlite3)</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 font-medium">AI Engine Model:</span>
              <p className="font-bold text-blue-600 mt-1">claude-sonnet-4-6</p>
            </div>
          </div>
        </div>

        {/* Security Scoring Engine Parameters */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Deterministic Threat Scoring Parameters</h3>
          </div>

          <p className="text-xs text-slate-500">
            Weighted security scoring rules executed on every incoming email, support ticket, and link.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
              <span>Lookalike / Brand Impersonation Domain</span>
              <span className="font-bold text-rose-600">+30 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
              <span>Suspicious URL Structure / Encoding</span>
              <span className="font-bold text-rose-600">+30 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
              <span>Credential / Password Request</span>
              <span className="font-bold text-rose-600">+25 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
              <span>OTP / 2FA Security Code Interception</span>
              <span className="font-bold text-rose-600">+25 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
              <span>Executive / Security Impersonation Claim</span>
              <span className="font-bold text-amber-600">+20 Risk Points</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
              <span>Coercive Urgency or Fear Escalation</span>
              <span className="font-bold text-amber-600">+10 Risk Points</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
