import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { getConversations, deleteConversation } from '../services/api';
import { PriorityBadge, RiskBadge, SentimentBadge, ResolutionBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';

export function Conversations() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [security, setSecurity] = useState('');
  const [resolution, setResolution] = useState('');

  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  const fetchConversations = async (pageNumber = 1, customSearch = null) => {
    try {
      setLoading(true);
      const activeSearch = customSearch !== null ? customSearch : search;
      const res = await getConversations({
        search: activeSearch,
        category,
        priority,
        sentiment,
        security,
        resolution,
        page: pageNumber,
        limit: 15
      });

      setItems(res.items || res.conversations || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (e) {
      console.error('Failed to load conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(1);
  }, [category, priority, sentiment, security, resolution]);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchConversations(1, val);
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    fetchConversations(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    fetchConversations(1, '');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation record?')) {
      try {
        await deleteConversation(id);
        fetchConversations(pagination.page);
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  return (
    <Layout title="Conversations">
      <div className="space-y-5">
        {/* Filters Header Bar */}
        <div className="glass-panel p-4 rounded-2xl space-y-3 transition-all">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search customer name, email, issue, keywords, ID..."
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

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden transition-all"
            >
              <option value="">All Categories</option>
              <option value="Billing / Payment">Billing / Payment</option>
              <option value="Account / Login">Account / Login</option>
              <option value="Product Issue">Product Issue</option>
              <option value="Delivery / Shipping">Delivery / Shipping</option>
              <option value="Refund">Refund</option>
              <option value="Subscription">Subscription</option>
              <option value="Technical Problem">Technical Problem</option>
              <option value="Security Concern">Security Concern</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden transition-all"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden transition-all"
            >
              <option value="">All Sentiments</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
              <option value="Positive">Positive</option>
            </select>

            <select
              value={security}
              onChange={(e) => setSecurity(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden transition-all"
            >
              <option value="">All Security States</option>
              <option value="Threat">Security Threat Detected</option>
              <option value="Clean">Clean (No Threat)</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
            </select>

            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="px-3 py-1.5 glass-input rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden transition-all"
            >
              <option value="">All Resolutions</option>
              <option value="Unresolved">Unresolved</option>
              <option value="Resolved">Resolved</option>
              <option value="Pending">Pending</option>
            </select>

            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-xs shadow-purple-500/25 transition-all cursor-pointer"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Conversations Table */}
        <div className="glass-panel rounded-2xl overflow-hidden transition-all">
          {loading ? (
            <LoadingSpinner message="Fetching conversations from SQLite database..." />
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">No conversations found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Sentiment</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Security</th>
                    <th className="py-3 px-4">Resolution</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/conversations/${item.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.external_id || `CONV-${item.id}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.customer_name}</div>
                        <div className="text-slate-400 dark:text-slate-500 text-[11px] truncate max-w-[160px]">{item.customer_email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {item.channel}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.category || 'Other'}</span>
                        {item.issue && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">{item.issue}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        <SentimentBadge sentiment={item.sentiment} />
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge level={item.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        {item.threat_detected ? (
                          <div className="flex items-center space-x-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <RiskBadge level={item.risk_level} />
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <ResolutionBadge status={item.resolution_status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-[11px]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/conversations/${item.id}`);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded cursor-pointer transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer transition-colors"
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              Showing {items.length} of {pagination.total} records (Page {pagination.page} of {pagination.totalPages})
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchConversations(pagination.page - 1)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchConversations(pagination.page + 1)}
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
