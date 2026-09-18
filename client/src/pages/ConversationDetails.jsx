import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { getConversation, reanalyzeConversation, deleteConversation } from '../services/api';
import { PriorityBadge, RiskBadge, SentimentBadge, ResolutionBadge } from '../components/common/Badge';
import { RiskMeter } from '../components/common/RiskMeter';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  Trash2, 
  Mail, 
  User, 
  Clock, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle2,
  Lock,
  Key
} from 'lucide-react';

export function ConversationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getConversation(id);
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load conversation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      await reanalyzeConversation(id);
      await fetchDetails();
    } catch (e) {
      alert('Re-analysis failed: ' + e.message);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(id);
        navigate('/conversations');
      } catch (e) {
        alert('Delete failed: ' + e.message);
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Conversation Details">
        <LoadingSpinner message="Fetching details from database..." />
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout title="Conversation Details">
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-4 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error || 'Conversation record not found'}</span>
        </div>
      </Layout>
    );
  }

  const { conversation, analysis, threat, urls = [], emails = [] } = data;

  return (
    <Layout title={`Conversation Details — ${conversation.external_id || `#${conversation.id}`}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/conversations')}
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Conversations</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              <span>{reanalyzing ? 'Re-analyzing...' : 'Re-Run AI Analysis'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>
          </div>
        </div>

        {/* Security Overview Alert Banner */}
        {threat && (
          <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-4 transition-colors ${
            threat.threat_detected 
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200' 
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}>
            <div className="flex items-start space-x-3">
              {threat.threat_detected ? (
                <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold">
                    {threat.threat_detected ? `Threat Detected: ${threat.threat_type}` : 'Cybersecurity Check Passed — No Threat Detected'}
                  </h3>
                  <RiskBadge level={threat.risk_level} />
                </div>
                <p className="text-xs mt-1 leading-relaxed">{threat.reason}</p>
              </div>
            </div>

            <div className="w-full sm:w-52 flex-shrink-0">
              <RiskMeter score={threat.risk_score} level={threat.risk_level} />
            </div>
          </div>
        )}

        {/* Info Grid: Customer Info & AI Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Metadata Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Customer Profile
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Customer Name:</span>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{conversation.customer_name}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Customer Email:</span>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{conversation.customer_email || 'Not provided'}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Channel:</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{conversation.channel}</p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Date Received:</span>
                <p className="text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(conversation.created_at).toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* AI Support Intelligence Card */}
          {analysis && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                AI Support Intelligence & Categorization
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Category:</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{analysis.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Sentiment:</span>
                  <div className="mt-0.5"><SentimentBadge sentiment={analysis.sentiment} /></div>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Emotion:</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{analysis.emotion}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Priority:</span>
                  <div className="mt-0.5"><PriorityBadge level={analysis.priority} /></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Main Issue:</span>
                  <p className="text-slate-900 dark:text-white font-medium">{analysis.issue}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">AI Summary:</span>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">{analysis.summary}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Customer Request:</span>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">{analysis.customer_request}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Transcript Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Conversation Transcript
          </h4>
          
          <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800">
            {conversation.message}
          </div>

          {conversation.conversation_history && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">History Log:</span>
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-3 rounded-lg font-mono text-xs mt-1 whitespace-pre-wrap border border-slate-200 dark:border-slate-700">
                {conversation.conversation_history}
              </div>
            </div>
          )}
        </div>

        {/* Extracted URLs & Email Analysis Tables */}
        {urls.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Extracted & Analyzed URLs ({urls.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2 px-3">URL</th>
                    <th className="py-2 px-3">Domain</th>
                    <th className="py-2 px-3">Protocol</th>
                    <th className="py-2 px-3">IP Usage</th>
                    <th className="py-2 px-3">Lookalike Flag</th>
                    <th className="py-2 px-3">Risk Score</th>
                    <th className="py-2 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {urls.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900 dark:text-white truncate max-w-xs">{u.url}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">{u.domain}</td>
                      <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400">{u.protocol}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{u.uses_ip ? 'YES (IP Host)' : 'No'}</td>
                      <td className="py-2.5 px-3">
                        {u.lookalike ? (
                          <span className="text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/60">
                            Impersonation
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">No</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">{u.risk_score}</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs">{u.risk_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recommended Action Box */}
        {analysis && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recommended Agent / Security Action</h4>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-semibold text-xs rounded-lg border border-blue-200 dark:border-blue-900/60">
              {analysis.recommended_action}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
