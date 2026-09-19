import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { getThreats } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Globe, 
  Mail, 
  Users, 
  Eye, 
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export function ThreatIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskLevel, setRiskLevel] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  const fetchThreatData = async (pageNo = 1, customSearch = null) => {
    try {
      setLoading(true);
      const activeSearch = customSearch !== null ? customSearch : search;
      const res = await getThreats({
        risk_level: riskLevel,
        search: activeSearch,
        page: pageNo,
        limit: 15
      });
      setData(res);
      setPage(pageNo);
    } catch (e) {
      console.error('Failed to load threat intelligence:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatData(1);
  }, [riskLevel]);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchThreatData(1, val);
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    fetchThreatData(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    fetchThreatData(1, '');
  };

  if (loading && !data) {
    return (
      <Layout title="Threat Intelligence">
        <LoadingSpinner message="Scanning SQLite threat repository..." />
      </Layout>
    );
  }

  const { summary = {}, items = [], pagination = {} } = data || {};

  return (
    <Layout title="Threat Intelligence (SOC Dashboard)">
      <div className="space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <StatCard
            title="Total Threats"
            value={summary.totalThreats || 0}
            subtext="Flagged security cases"
            icon={ShieldAlert}
            color="rose"
          />
          <StatCard
            title="Critical Threats"
            value={summary.criticalThreats || 0}
            subtext="Immediate SOC action"
            icon={AlertTriangle}
            color="rose"
          />
          <StatCard
            title="High Risk Cases"
            value={summary.highRiskThreats || 0}
            subtext="Score >= 50"
            icon={Lock}
            color="amber"
          />
          <StatCard
            title="Suspicious URLs"
            value={summary.suspiciousUrlsCount || 0}
            subtext="Lookalikes & IP hosts"
            icon={Globe}
            color="blue"
          />
          <StatCard
            title="Suspicious Emails"
            value={summary.suspiciousEmailsCount || 0}
            subtext="Domain mismatches"
            icon={Mail}
            color="purple"
          />
          <StatCard
            title="Social Engineering"
            value={summary.socialEngineeringCount || 0}
            subtext="Coercive phishing"
            icon={Users}
            color="emerald"
          />
        </div>

        {/* Filters Header Bar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 transition-all">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search threat type, customer, reason, ID, technique..."
                className="w-full pl-9 pr-8 py-1.5 glass-input rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs rounded-xl shadow-xs shadow-rose-500/25 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter by Risk:</span>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-xl text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden transition-all"
            >
              <option value="">All Risk Levels</option>
              <option value="CRITICAL">CRITICAL Risk</option>
              <option value="HIGH">HIGH Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="LOW">LOW Risk</option>
            </select>
          </div>
        </div>

        {/* Threat Table */}
        <div className="glass-panel rounded-2xl overflow-hidden transition-all">
          {items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">No security threats detected in current filter view.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Threat ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Threat Type</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Risk Score</th>
                    <th className="py-3 px-4">Detected Techniques</th>
                    <th className="py-3 px-4">Date Flagged</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr
                      key={item.threat_id}
                      onClick={() => navigate(`/conversations/${item.conversation_id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.external_id || `CONV-${item.conversation_id}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.customer_name}</div>
                        <div className="text-slate-400 dark:text-slate-500 text-[11px] truncate max-w-[150px]">{item.customer_email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-200">
                        {item.threat_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={item.risk_level} />
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-600 dark:text-rose-400">
                        {item.risk_score} / 100
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.social_engineering_techniques && item.social_engineering_techniques.length > 0 ? (
                            item.social_engineering_techniques.map((t, idx) => (
                              <span key={idx} className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-rose-100 dark:border-rose-800/60">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Suspicious Pattern</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-[11px]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/conversations/${item.conversation_id}`);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer transition-colors"
                          title="View Threat Breakdown"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors">
            <span>
              Showing {items.length} of {pagination.total || 0} threats
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchThreatData(page - 1)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => fetchThreatData(page + 1)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
