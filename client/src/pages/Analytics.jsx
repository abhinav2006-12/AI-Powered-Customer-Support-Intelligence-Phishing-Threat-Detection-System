import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { getAnalytics } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
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

const COLORS = ['#0284C7', '#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD'];

export function Analytics() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout title="Analytics & Business Intelligence">
      <div className="space-y-6">
        {/* Date Filter Header */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Support Operations & Cybersecurity Risk Intelligence</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Time Range:</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white cursor-pointer"
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Most Common Support Complaint Categories</h4>
            <p className="text-xs text-slate-500">Distribution across customer support requests</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0284C7" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Frequent Issues Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Top Root Cause Issues</h4>
            <p className="text-xs text-slate-500">Most frequently occurring customer pain points</p>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {topIssues.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 text-center">No issue records found for selected period.</p>
              ) : (
                topIssues.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 line-clamp-1">{item.issue}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-100">
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-bold text-slate-900">Top Suspicious / Lookalike Domains</h4>
            </div>
            <p className="text-xs text-slate-500">Extracted domain names with elevated phishing risk scores</p>
            <div className="divide-y divide-slate-100">
              {suspiciousDomains.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 text-center">No suspicious domain patterns detected in period.</p>
              ) : (
                suspiciousDomains.map((dom, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-slate-900">{dom.domain}</span>
                      <p className="text-[10px] text-slate-400 font-sans">Occurrences: {dom.count}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-extrabold rounded border border-rose-200">
                      Max Risk: {dom.max_risk}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Social Engineering Techniques */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">Prevalent Social Engineering Tactics</h4>
            </div>
            <p className="text-xs text-slate-500">Coercive techniques detected in incoming messages</p>
            <div className="divide-y divide-slate-100">
              {topTechniques.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 text-center">No social engineering techniques detected.</p>
              ) : (
                topTechniques.map((tech, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{tech.technique}</span>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 font-bold rounded border border-amber-200">
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
