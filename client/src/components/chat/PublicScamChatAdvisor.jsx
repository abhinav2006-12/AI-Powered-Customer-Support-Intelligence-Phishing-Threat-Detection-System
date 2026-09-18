import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Key,
  CreditCard,
  Globe,
  AlertTriangle,
  Zap,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { sendChatMessage } from '../../services/api';

const QUICK_DOUBTS = [
  {
    label: 'Will my bank ever ask for OTP?',
    prompt: 'Will a bank or official company ever ask for my 6-digit OTP code or password?',
    icon: Key
  },
  {
    label: 'Do I need UPI PIN to receive money?',
    prompt: 'Do I need to enter my UPI PIN or scan a QR code to receive money into my account?',
    icon: CreditCard
  },
  {
    label: 'I clicked a suspicious link by mistake',
    prompt: 'I accidentally clicked a suspicious link. What emergency steps should I take right now?',
    icon: AlertTriangle
  },
  {
    label: 'Is a Telegram / WhatsApp job offer real?',
    prompt: 'Someone messaged me on WhatsApp offering ₹5000/day for liking YouTube videos. Is this real or a scam?',
    icon: Zap
  },
  {
    label: 'How to tell if a link is fake?',
    prompt: 'How do I check if a website address is an authentic brand or a fake phishing clone?',
    icon: Globe
  }
];

export function PublicScamChatAdvisor({ isFloating = false, isOpen = true, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 **Hello! I'm your KAAVALX AI Scam & Safety Advisor.**\n\nAsk me any questions or doubts about suspicious messages, OTP requests, fake payment links, or online fraud. You can also tap one of the common doubts below!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
        mode: 'scam_advisor',
        includeContext: false
      });

      const aiReply = res.data?.reply || res.reply || 'I could not process this request. Please try again.';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: aiReply,
        engine: res.data?.engine || 'KAAVALX AI Engine',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ **Could not connect to advisor service:** ${err.message || 'Please check your connection.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
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
        text: `👋 Chat cleared. What doubt or suspicious message would you like help with?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-[10px]">$1</code>');
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('#### ')) {
            return <h5 key={idx} className="font-bold text-xs text-purple-700 dark:text-purple-300 mt-2 mb-0.5">{line.replace('#### ', '')}</h5>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start space-x-1.5 pl-1">
                <span className="text-purple-500 font-bold">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
              </div>
            );
          }
          if (line.startsWith('|')) {
            return <div key={idx} className="font-mono text-[10px] text-slate-600 dark:text-slate-300 overflow-x-auto py-0.5">{line}</div>;
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
        })}
      </div>
    );
  };

  // If used as floating dialog
  if (isFloating) {
    if (!isOpen) return null;
    return (
      <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh] bg-white dark:bg-[#0E162B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Floating Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm tracking-tight">Scam & Safety Advisor</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-purple-100/80">Ask questions • Clear doubts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleClear}
              title="Clear chat"
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close advisor"
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-900/30">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] rounded-2xl p-3.5 relative group ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-xs shadow-md shadow-purple-600/20'
                  : 'bg-white dark:bg-[#121B35] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-xs'
              }`}>
                {renderFormattedText(msg.text)}

                <div className={`flex items-center justify-between pt-1.5 mt-1 border-t ${
                  msg.role === 'user' ? 'border-white/20 text-white/70' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                } text-[10px]`}>
                  <span>{msg.time}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-purple-600 transition-opacity flex items-center space-x-1 cursor-pointer"
                      title="Copy advice"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs pl-9">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
              <span>Analyzing your doubt...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Doubts Strip */}
        <div className="px-3 py-2 bg-white dark:bg-[#0E162B] border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex space-x-1.5 no-scrollbar flex-shrink-0">
          {QUICK_DOUBTS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(d.prompt)}
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-[#0E162B] border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your question or doubt here..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors cursor-pointer shadow-md shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // In-Page Embedded Mode
  return (
    <div className="bg-white dark:bg-[#0E162B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
      
      {/* Advisor Banner Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                KAAVALX AI Scam Advisor
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-xs uppercase">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-purple-100/90 mt-0.5">
              Ask doubts about suspicious messages, OTP requests, or online fraud
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Quick Doubts Prompt Chips */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Tap to solve common fraud doubts instantly:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_DOUBTS.map((doubt, idx) => {
            const Icon = doubt.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(doubt.prompt)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700/60 transition-all shadow-2xs cursor-pointer group"
              >
                <Icon className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span>{doubt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="p-4 sm:p-6 min-h-[280px] max-h-[460px] overflow-y-auto space-y-4 bg-white dark:bg-[#0E162B]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-3xl p-4 sm:p-5 relative group ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs shadow-lg shadow-purple-600/20'
                : 'bg-slate-50 dark:bg-[#121B35] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-xs'
            }`}>
              {renderFormattedText(msg.text)}

              {/* Timestamp & Actions */}
              <div className={`flex items-center justify-between pt-2 mt-2 border-t ${
                msg.role === 'user' ? 'border-white/20 text-white/70' : 'border-slate-200/80 dark:border-slate-800 text-slate-400'
              } text-[11px]`}>
                <span>{msg.time}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-purple-600 dark:hover:text-purple-400 transition-opacity flex items-center space-x-1 cursor-pointer font-medium"
                    title="Copy advice to clipboard"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy Advice'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs pl-11 py-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
            <span>Consulting AI security engine for guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask anything (e.g. 'Can bank ask for my password?', 'I received an SMS from Netflix...')"
          className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-purple-600/25 flex items-center space-x-1.5 active:scale-[0.98]"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

export default PublicScamChatAdvisor;
