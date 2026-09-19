import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { analyzeConversation } from '../services/api';
import { RiskBadge, PriorityBadge, SentimentBadge, ResolutionBadge } from '../components/common/Badge';
import { RiskMeter } from '../components/common/RiskMeter';
import { 
  Sparkles, 
  ShieldAlert, 
  Send, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Mail, 
  User, 
  FileText,
  Lock,
  Key,
  Flame
} from 'lucide-react';

const PRESET_CASES = [
  {
    title: 'Billing & Refund Dispute',
    name: 'Priya Sharma',
    email: 'priya.sharma@globaltech.in',
    channel: 'Email',
    text: 'My payment was deducted twice for the annual subscription (₹2,500). The transaction ID is TXN-99821 but my order wasn\'t confirmed. Please help me get my refund as soon as possible.'
  },
  {
    title: '2FA & Credential Harvesting Attack',
    name: 'Security Alert System',
    email: 'support@paypa1-security.example',
    channel: 'Email',
    text: 'URGENT! Your account has been compromised due to unauthorized access. Click this link immediately http://paypa1-security.example/login to verify your identity. Enter your username, password and 6-digit OTP code to secure your account within 24 hours.'
  },
  {
    title: 'Lookalike Impersonation Link',
    name: 'Bank Alert Desk',
    email: 'helpdesk.bank.security@gmail.com',
    channel: 'Contact Form',
    text: 'Please verify your account and unblock your access at http://paypa1-security.example/login'
  }
];

export function AnalyzeConversation() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [channel, setChannel] = useState('Email');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePreset = (preset) => {
    setCustomerName(preset.name);
    setCustomerEmail(preset.email);
    setChannel(preset.channel);
    setMessage(preset.text);
    setHistory('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter a conversation message to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await analyzeConversation({
        message,
        conversation_history: history,
        customer_name: customerName || 'Anonymous Customer',
        customer_email: customerEmail || 'anonymous@domain.com',
        channel: channel
      });

      setResult(res.analysis);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Analyze Conversation">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Preset Incident Buttons */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
          <div className="flex items-center space-x-2 text-purple-900 dark:text-purple-300">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">Live Incident Triage Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_CASES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreset(preset)}
                className="px-3 py-1.5 glass-input hover:border-purple-400 dark:hover:border-purple-500 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-xl shadow-2xs hover:bg-purple-50/80 dark:hover:bg-purple-900/30 transition-all cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="glass-panel p-6 rounded-2xl transition-all">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Input Conversation Data</h3>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Customer Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Customer Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. priya.sharma@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors"
                >
                  <option value="Email">Email</option>
                  <option value="Chat">Chat</option>
                  <option value="Support Ticket">Support Ticket</option>
                  <option value="Contact Form">Contact Form</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Customer Message *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste customer email, support chat message, or phishing body here..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Conversation History (Optional)</label>
              <textarea
                rows={2}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder="Paste previous messages or support responses..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Conversation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Analyze Conversation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Intelligence Report Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Security Header Alert */}
            <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-4 transition-colors ${
              result.security?.threat_detected 
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex items-start space-x-3">
                {result.security?.threat_detected ? (
                  <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold">
                      {result.security?.threat_detected ? `Threat Detected: ${result.security.threat_type}` : 'No Cybersecurity Threat Detected'}
                    </h3>
                    <RiskBadge level={result.security?.risk_level} />
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">
                    {result.security?.reason || 'Message structure and domain links passed safety checks.'}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-48 flex-shrink-0">
                <RiskMeter score={result.security?.risk_level === 'CRITICAL' ? 85 : (result.security?.threat_detected ? 60 : 10)} level={result.security?.risk_level || 'LOW'} />
              </div>
            </div>

            {/* Split Grid: Customer Intelligence & Security Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Customer Support Intelligence */}
              <div className="glass-panel p-5 rounded-2xl space-y-4 transition-all">
                <h4 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Customer Support Intelligence
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Category:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Issue Summary:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.issue}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Sentiment:</span>
                    <div className="mt-0.5"><SentimentBadge sentiment={result.sentiment} /></div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Emotion:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.emotion}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Urgency:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.urgency}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Priority:</span>
                    <div className="mt-0.5"><PriorityBadge level={result.priority} /></div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Resolution Status:</span>
                    <div className="mt-0.5"><ResolutionBadge status={result.resolution_status} /></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">AI Summary:</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">{result.summary}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Customer Request:</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">{result.customer_request}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Security Threat Intelligence */}
              <div className="glass-panel p-5 rounded-2xl space-y-4 transition-all">
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Security Threat & Phishing Intelligence
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Threat Detected:</span>
                    <p className={`font-semibold ${result.security?.threat_detected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {result.security?.threat_detected ? 'YES' : 'NO'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Threat Type:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.security?.threat_type || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Social Engineering:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.security?.social_engineering ? 'Detected' : 'None'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Credential Harvesting:</span>
                    <p className={`font-semibold ${result.security?.credential_request ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {result.security?.credential_request ? 'Yes (Password requested)' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">OTP / 2FA Interception:</span>
                    <p className={`font-semibold ${result.security?.otp_request ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {result.security?.otp_request ? 'Yes (OTP code requested)' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Coercive Language:</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.security?.suspicious_message ? 'Urgency / Fear language' : 'Normal tone'}</p>
                  </div>
                </div>

                {/* Social Engineering Techniques Pills */}
                {result.security?.techniques && result.security.techniques.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Detected Techniques:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.security.techniques.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded text-[11px] font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted URLs list */}
                {result.urls && result.urls.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Extracted URLs ({result.urls.length}):</span>
                    <div className="mt-1 space-y-1">
                      {result.urls.map((u, i) => (
                        <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded text-[11px] space-y-1 font-mono">
                          <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                            <span className="font-bold truncate max-w-xs">{u.url}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${u.risk_score >= 25 ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'}`}>
                              Score: {u.risk_score}
                            </span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                            Domain: {u.domain} | Lookalike: {u.lookalike ? 'YES' : 'No'} | IP Host: {u.uses_ip ? 'YES' : 'No'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Action Card */}
            <div className="glass-panel p-5 rounded-2xl transition-all">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recommended Agent / SOC Action</h4>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-300 backdrop-blur-xs">
                {result.recommended_action}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
