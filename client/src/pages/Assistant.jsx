import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  Bot, 
  Send, 
  ShieldAlert, 
  MessageSquare, 
  Sparkles, 
  Database, 
  Trash2, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  Lock, 
  FileText,
  HelpCircle,
  Users,
  KeyRound
} from 'lucide-react';
import { sendChatMessage, getChatSuggestions } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  {
    category: 'SOC Threat Hunting',
    prompts: [
      'Analyze http://paypa1-security.example/login for credential harvesting',
      'How does AegisGuard score lookalike domains and homoglyph attacks?',
      'What are recommended SOC actions for 2FA OTP exfiltration?'
    ]
  },
  {
    category: 'Support Copilot',
    prompts: [
      'Draft an empathetic refund resolution for order #ORD-98421 duplicate charge',
      'How should support de-escalate an angry delivery delay complaint?',
      'Summarize key customer pain points across recent billing tickets'
    ]
  },
  {
    category: 'Live Supabase Telemetry',
    prompts: [
      'What are the top 5 unresolved customer support issues right now?',
      'Show telemetry breakdown of critical risk phishing incidents',
      'Which support channel has the highest rate of threats?'
    ]
  }
];

export function Assistant() {
  const [mode, setMode] = useState('soc'); // 'soc' | 'support' | 'database'
  const [includeContext, setIncludeContext] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "### 🛡️ Welcome to Aegis AI Studio (Powered by Google Gemini)\n\nI am your unified **Customer Support Intelligence & Cybersecurity Threat Copilot**.\n\n- **SOC Threat Analyst Mode:** Paste suspicious emails, links, or headers to detect lookalike domains, credential harvesting, or 2FA interceptions.\n- **Support Copilot Mode:** Draft empathetic, compliant replies to customer tickets with refund, delivery, or billing complaints.\n- **Ask Database Mode:** Query your live Supabase ticket and threat repository in natural language.\n\nSelect a suggestion below or type your query to begin.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'Google Gemini 2.5 Flash'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getChatSuggestions()
      .then(res => {
        if (Array.isArray(res?.suggestions) && res.suggestions.length > 0) {
          // Check if it's array of objects with prompts or array of strings
          if (typeof res.suggestions[0] === 'object' && res.suggestions[0].prompts) {
            setSuggestions(res.suggestions);
          } else if (typeof res.suggestions[0] === 'string') {
            setSuggestions([
              { category: 'Suggested Questions', prompts: res.suggestions.slice(0, 3) },
              { category: 'Security & Phishing', prompts: DEFAULT_SUGGESTIONS[0].prompts },
              { category: 'Customer Support', prompts: DEFAULT_SUGGESTIONS[1].prompts }
            ]);
          }
        }
      })
      .catch(() => {
        setSuggestions(DEFAULT_SUGGESTIONS);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));

      const res = await sendChatMessage({
        message: query.trim(),
        history,
        mode,
        includeContext
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res.data?.reply || 'No response generated.',
        engine: res.data?.engine,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ **Error connecting to AI engine:** ${err.message || 'Please check backend server connection.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "### 🤖 Aegis Copilot Ready\n\nHow can I help you analyze customer tickets or cybersecurity threats today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-base text-slate-900 dark:text-white mt-3 mb-1.5">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('#### ')) {
            return <h5 key={idx} className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2 mb-1">{line.replace('#### ', '')}</h5>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
              </div>
            );
          }
          if (line.startsWith('|')) {
            return <div key={idx} className="font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto py-0.5">{line}</div>;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
        })}
      </div>
    );
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">$1</code>');
  };

  return (
    <Layout title="Aegis AI Copilot (Gemini Studio)">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Control Header Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Aegis AI Intelligence Studio</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Google Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time SOC Threat Triage & Customer Support Copilot
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Context Ingestion Toggle */}
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Live Database Telemetry</span>
            </label>

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMode('soc')}
            className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
              mode === 'soc'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${mode === 'soc' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">SOC Threat Analyst</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Phishing, Lookalikes & OTP Scams</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('support')}
            className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
              mode === 'support'
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${mode === 'support' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Support Agent Copilot</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Empathetic replies & refunds</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('database')}
            className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
              mode === 'database'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${mode === 'database' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Ask Live Database</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Natural language SQLite queries</p>
            </div>
          </button>
        </div>

        {/* Suggestion Cards */}
        {suggestions.length > 0 && messages.length <= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((cat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 transition-colors">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>{cat.category}</span>
                </div>
                <div className="space-y-1.5">
                  {(cat.prompts || []).map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSend(p)}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-2"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Chat Conversation Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[520px] overflow-hidden transition-colors">
          
          {/* Messages Thread */}
          <div className="flex-1 p-6 space-y-5 overflow-y-auto bg-slate-50/50 dark:bg-[#0B1120]/60 transition-colors">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start space-x-2 max-w-[90%] sm:max-w-[80%]">
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 shadow-xs relative group ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}

                    {/* Copy Response Button */}
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-slate-100 dark:bg-slate-700 cursor-pointer shadow-2xs"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pl-9 mt-1 text-[11px] text-slate-400">
                  <span>{msg.time}</span>
                  {msg.engine && (
                    <span>&bull; {msg.engine}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {loading && (
              <div className="flex items-center space-x-3 pl-9">
                <div className="flex items-center space-x-2 p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-400 font-medium pl-1">Gemini is analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'soc'
                    ? 'Paste email header, URL, or ask SOC triage question...'
                    : mode === 'support'
                    ? 'Ask to draft customer reply or policy explanation...'
                    : 'Query database tickets, trends, or unresolved complaints...'
                }
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </Layout>
  );
}
