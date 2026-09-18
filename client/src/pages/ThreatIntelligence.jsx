import React, { useEffect, useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export function ThreatIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskLevel, setRiskLevel] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const fetchThreatData = async (pageNo = 1) => {
    try {
      setLoading(true);
      const res = await getThreats({
        risk_level: riskLevel,
        search,
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchThreatData(1);
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search threat type, customer, reason..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500">Filter by Risk:</span>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:bg-white"
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {items.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm font-medium">No security threats detected in current filter view.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
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
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item.threat_id}
                      onClick={() => navigate(`/conversations/${item.conversation_id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {item.external_id || `CONV-${item.conversation_id}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.customer_name}</div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[150px]">{item.customer_email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {item.threat_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={item.risk_level} />
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-600">
                        {item.risk_score} / 100
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.social_engineering_techniques && item.social_engineering_techniques.length > 0 ? (
                            item.social_engineering_techniques.map((t, idx) => (
                              <span key={idx} className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-rose-100">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">Suspicious Pattern</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/conversations/${item.conversation_id}`);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
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
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {items.length} of {pagination.total || 0} threats
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchThreatData(page - 1)}
                className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => fetchThreatData(page + 1)}
                className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
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
