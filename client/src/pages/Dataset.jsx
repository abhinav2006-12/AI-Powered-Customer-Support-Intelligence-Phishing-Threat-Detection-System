import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { getDatasetInfo, importDataset, clearDataset, seedDemoData } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  Database, 
  Upload, 
  Trash2, 
  RefreshCw, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  Globe,
  Mail
} from 'lucide-react';

export function Dataset() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      const res = await getDatasetInfo();
      setInfo(res);
    } catch (e) {
      console.error('Failed to load dataset info:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, []);

  const handleSeed = async () => {
    try {
      setActionLoading(true);
      const res = await seedDemoData(60);
      setNotification(res.message);
      await fetchDataset();
      setTimeout(() => setNotification(''), 4000);
    } catch (e) {
      alert('Seed failed: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to delete ALL dataset records from SQLite?')) {
      try {
        setActionLoading(true);
        const res = await clearDataset();
        setNotification(res.message);
        await fetchDataset();
        setTimeout(() => setNotification(''), 4000);
      } catch (e) {
        alert('Clear failed: ' + e.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;

    try {
      setActionLoading(true);
      const parsed = JSON.parse(jsonInput);
      const itemsArr = Array.isArray(parsed) ? parsed : [parsed];
      
      const res = await importDataset({ items: itemsArr });
      setNotification(res.message);
      setShowImportModal(false);
      setJsonInput('');
      await fetchDataset();
      setTimeout(() => setNotification(''), 4000);
    } catch (e) {
      alert('Import failed. Invalid JSON format: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !info) {
    return (
      <Layout title="Dataset Management">
        <LoadingSpinner message="Inspecting SQLite database tables..." />
      </Layout>
    );
  }

  const { summary = {}, sampleRecords = [] } = info || {};

  return (
    <Layout title="Dataset Management">
      <div className="space-y-6">
        {/* Header Action Card */}
        <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">SQLite Intelligence Repository</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage, import, and seed training & evaluation datasets</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Upload className="w-4 h-4" />
              <span>Import Dataset (JSON)</span>
            </button>

            <button
              onClick={handleSeed}
              disabled={actionLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>Synchronize Telemetry Feeds</span>
            </button>

            <button
              onClick={handleClear}
              disabled={actionLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Database</span>
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center space-x-2 animate-fade-in transition-colors">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{notification}</span>
          </div>
        )}

        {/* Dataset Table Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="Conversations"
            value={summary.totalConversations || 0}
            subtext="conversations table"
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            title="AI Analyses"
            value={summary.totalAnalyses || 0}
            subtext="analyses table"
            icon={Database}
            color="purple"
          />
          <StatCard
            title="Threat Flagged"
            value={summary.totalThreats || 0}
            subtext="threats table"
            icon={ShieldAlert}
            color="rose"
          />
          <StatCard
            title="Extracted URLs"
            value={summary.totalUrls || 0}
            subtext="urls table"
            icon={Globe}
            color="amber"
          />
          <StatCard
            title="Extracted Emails"
            value={summary.totalEmails || 0}
            subtext="emails table"
            icon={Mail}
            color="emerald"
          />
        </div>

        {/* Database Records Table Preview */}
        <div className="glass-panel rounded-2xl overflow-hidden transition-all">
          <div className="p-4 border-b border-slate-200/60 dark:border-white/5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Stored Database Records</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sampleRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">Database is empty. Click "Synchronize Telemetry Feeds" to pull live records.</td>
                  </tr>
                ) : (
                  sampleRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{r.external_id || `CONV-${r.id}`}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{r.customer_name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.channel}</td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{r.category || 'Other'}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.sentiment || 'Neutral'}</td>
                      <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">{r.risk_level || 'LOW'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Importing JSON Dataset */}
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl border border-white/60 dark:border-white/10">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Import JSON Conversation Dataset</span>
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Paste JSON Array of Conversations:
                  </label>
                  <textarea
                    rows={8}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={`[\n  {\n    "customer_name": "John Doe",\n    "customer_email": "john@example.com",\n    "channel": "Email",\n    "message": "My card was charged twice..."\n  }\n]`}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Importing & Analyzing...' : 'Import Dataset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
