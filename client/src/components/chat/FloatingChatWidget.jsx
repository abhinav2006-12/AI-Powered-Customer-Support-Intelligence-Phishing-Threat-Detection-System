import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  ShieldAlert, 
  MessageSquare, 
  Sparkles, 
  Maximize2, 
  Trash2, 
  Copy, 
  Check, 
  Database, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { sendChatMessage } from '../../services/api';

const QUICK_PROMPTS = {
  soc: [
    'Analyze http://paypa1-security.example/login',
    'How do lookalike domain attacks operate?',
    'What are SOC actions for credential theft?'
  ],
  support: [
    'Draft reply for duplicate billing complaint',
    'Write escalation apology for delayed delivery',
    'How to handle customer asking for instant refund?'
  ],
  database: [
    'What are top complaint categories right now?',
    'Show unresolved cases and critical threats',
    'How many support tickets are recorded?'
  ]
};

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('soc'); // 'soc' | 'support' | 'database'
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hello! I'm **KAAVALX Copilot** powered by **Google Gemini**.\n\nChoose a mode above to triage security threats, draft customer support replies, or inspect live database telemetry.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

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
        includeContext: true
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
        text: "👋 Chat cleared. How can I assist you with **KAAVALX** intelligence today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormattedText = (text) => {
    // Simple markdown-style formatter for chat bubbles
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('#### ')) {
            return <h5 key={idx} className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2 mb-1">{line.replace('#### ', '')}</h5>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start space-x-1.5 pl-1">
                <span className="text-blue-500 font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
              </div>
            );
          }
          if (line.startsWith('|')) {
            return <div key={idx} className="font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto py-0.5">{line}</div>;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
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
      .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px] text-blue-600 dark:text-blue-400">$1</code>');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center p-3.5 bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ring-4 ring-white/20 dark:ring-purple-900/40"
            title="Open KAAVALX Copilot (Gemini AI Assistant)"
          >
            <Bot className="w-6 h-6 animate-pulse" />
            
            {/* Ambient Pulse Ring */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-400 border-2 border-slate-900 rounded-full"></span>
            
            {/* Tooltip on hover */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none hidden sm:block">
              KAAVALX AI Copilot
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] glass-panel rounded-3xl shadow-2xl dark:shadow-purple-950/40 border border-white/60 dark:border-white/10 flex flex-col overflow-hidden animate-fade-in transition-all duration-200">
          
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900/90 via-[#131C31]/90 to-slate-900/90 backdrop-blur-md text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-purple-600 rounded-xl text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold tracking-tight">KAAVALX AI Copilot</h3>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-medium">Gemini Flash</span>
                </div>
                <p className="text-[10px] text-slate-400">SOC & Support Intelligence</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assistant');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                title="Open Fullscreen Studio"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="bg-white/50 dark:bg-slate-900/60 backdrop-blur-md p-1.5 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMode('soc')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                mode === 'soc'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>SOC Threats</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('support')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                mode === 'support'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Support Copilot</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('database')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                mode === 'database'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>Ask Database</span>
            </button>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto bg-slate-50 dark:bg-[#0B1120] transition-colors">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 shadow-xs relative group ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/70 rounded-bl-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}

                  {/* Copy button on AI messages */}
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity rounded bg-slate-100 dark:bg-slate-700 cursor-pointer"
                      title="Copy Response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 px-1 mt-1 text-[10px] text-slate-400">
                  <span>{msg.time}</span>
                  {msg.engine && (
                    <span>&bull; {msg.engine}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center space-x-2 p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/70 w-28">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-1.5 bg-slate-100/90 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </span>
            {(QUICK_PROMPTS[mode] || []).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 text-[11px] rounded-full whitespace-nowrap shadow-2xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'soc'
                  ? 'Paste email, suspicious link, or ask SOC triage question...'
                  : mode === 'support'
                  ? 'Ask to draft customer response or explain policy...'
                  : 'Ask about live SQLite tickets, categories, or metrics...'
              }
              className="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-40"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
