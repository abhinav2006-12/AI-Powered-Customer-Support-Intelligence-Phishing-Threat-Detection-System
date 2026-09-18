import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge, PriorityBadge, SentimentBadge, ResolutionBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { getDashboard } from '../services/api';
import { 
  MessageSquare, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area 
} from 'recharts';

const SENTIMENT_COLORS = {
  Positive: '#10B981',
  Neutral: '#64748B',
  Negative: '#EF4444'
};

const PRIORITY_COLORS = {
  Low: '#94A3B8',
  Medium: '#F59E0B',
  High: '#F97316',
  Critical: '#EF4444'
};

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboard();
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <LoadingSpinner message="Calculating real-time security & support intelligence from SQLite..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Error loading metrics: {error}</span>
        </div>
      </Layout>
    );
  }

  const { kpi, charts, recent } = data;

  return (
    <Layout title="Dashboard" onSeedSuccess={fetchMetrics}>
      <div className="space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="Total Conversations"
            value={kpi.totalConversations}
            subtext="Across all channels"
            icon={MessageSquare}
            color="blue"
          />
          <StatCard
            title="Total Complaints"
            value={kpi.totalComplaints}
            subtext="Negative / Support tickets"
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            title="Critical Cases"
            value={kpi.criticalCases}
            subtext="Priority or Risk Critical"
            icon={AlertOctagon}
            color="rose"
          />
          <StatCard
            title="Unresolved Cases"
            value={kpi.unresolvedCases}
            subtext="Requires agent action"
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Threats Detected"
            value={kpi.threatsDetected}
            subtext="Phishing & Malicious links"
            icon={ShieldAlert}
            color="rose"
          />
        </div>

        {/* Charts Row 1: Trends & Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area Chart: 14-Day Activity & Threat Trends */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Conversation & Security Threat Trends</h3>
                <p className="text-xs text-slate-500">Daily support volume vs detected phishing threats (14 Days)</p>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.trends}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="total" name="Total Messages" stroke="#3B82F6" fillOpacity={1} fill="url(#totalGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="threats" name="Threats" stroke="#EF4444" fillOpacity={1} fill="url(#threatGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Distribution Pie Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Sentiment Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Customer emotional tone distribution</p>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.sentiment}
                    dataKey="count"
                    nameKey="sentiment"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {charts.sentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 text-xs font-medium text-slate-600">
              {charts.sentiment.map(s => (
                <div key={s.sentiment} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS[s.sentiment] || '#94A3B8' }}></span>
                  <span>{s.sentiment}: {s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Categories & Threat Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaint Category Distribution */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Complaint Category Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Volume of issues by classified domain</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0284C7" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threat Type Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Detected Cybersecurity Threat Types</h3>
            <p className="text-xs text-slate-500 mb-4">Phishing, OTP scams, & impersonation cases</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.threatTypes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="threat_type" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#E11D48" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Threats Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent High-Risk Threats</h3>
              </div>
              <button 
                onClick={() => navigate('/threats')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>View All Threats</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recent.threats.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 text-center">No security threats recorded.</p>
              ) : (
                recent.threats.map(threat => (
                  <div 
                    key={threat.threat_id} 
                    onClick={() => navigate(`/conversations/${threat.conversation_id}`)}
                    className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-900">{threat.customer_name}</span>
                        <RiskBadge level={threat.risk_level} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{threat.threat_type} — {threat.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600">{threat.risk_score} Score</span>
                      <p className="text-[10px] text-slate-400">{new Date(threat.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Unresolved Complaints */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Unresolved Support Tickets</h3>
              </div>
              <button 
                onClick={() => navigate('/conversations?resolution=Unresolved')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>View Unresolved</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recent.unresolved.length === 0 ? (
                <p className="p-4 text-xs text-slate-500 text-center">No unresolved complaints pending.</p>
              ) : (
                recent.unresolved.map(item => (
                  <div 
                    key={item.conversation_id} 
                    onClick={() => navigate(`/conversations/${item.conversation_id}`)}
                    className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-900">{item.customer_name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{item.channel}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{item.issue}</p>
                    </div>
                    <div className="text-right">
                      <PriorityBadge level={item.priority} />
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
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
