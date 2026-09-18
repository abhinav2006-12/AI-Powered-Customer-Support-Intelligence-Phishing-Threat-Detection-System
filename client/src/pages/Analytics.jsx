import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { getAnalytics } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Globe, 
  Users, 
  AlertTriangle,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export function Analytics() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  const fetchAnalytics = async (selectedRange) => {
    try {
      setLoading(true);
      const res = await getAnalytics(selectedRange);
      setData(res);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  if (loading && !data) {
    return (
      <Layout title="Analytics & Business Intelligence">
        <LoadingSpinner message="Aggregating business intelligence metrics from SQLite..." />
      </Layout>
    );
  }

  const {
    categories = [],
    topIssues = [],
    sentiments = [],
    resolutions = [],
    suspiciousDomains = [],
    topTechniques = [],
    channels = []
  } = data || {};

  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Layout title="Analytics & Business Intelligence">
      <div className="space-y-6">
        {/* Date Filter Header */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Support Operations & Cybersecurity Risk Intelligence</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Time Range:</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 cursor-pointer transition-colors"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Grid 1: Categories & Top Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Common Complaint Categories Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Most Common Support Complaint Categories</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across customer support requests</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: tickColor }} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0284C7" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Frequent Issues Table */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Top Root Cause Issues</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Most frequently occurring customer pain points</p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
              {topIssues.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">No issue records found for selected period.</p>
              ) : (
                topIssues.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.issue}</span>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded border border-blue-100 dark:border-blue-800/60">
                      {item.count} cases
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Grid 2: Suspicious Domains & Social Engineering Techniques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Suspicious Domains */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Top Suspicious / Lookalike Domains</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Extracted domain names with elevated phishing risk scores</p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {suspiciousDomains.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">No suspicious domain patterns detected in period.</p>
              ) : (
                suspiciousDomains.map((dom, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{dom.domain}</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Occurrences: {dom.count}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-extrabold rounded border border-rose-200 dark:border-rose-800/60">
                      Max Risk: {dom.max_risk}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Social Engineering Techniques */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Prevalent Social Engineering Tactics</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Coercive techniques detected in incoming messages</p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topTechniques.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">No social engineering techniques detected.</p>
              ) : (
                topTechniques.map((tech, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{tech.technique}</span>
                    <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold rounded border border-amber-200 dark:border-amber-800/60">
                      {tech.count} instances
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
