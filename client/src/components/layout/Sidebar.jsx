import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  MessageSquare, 
  ShieldAlert, 
  BarChart3, 
  Database, 
  Settings,
  ShieldCheck,
  LogOut,
  UserCheck,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'KAAVALX AI Copilot', path: '/assistant', icon: Bot },
    { label: 'Analyze Conversation', path: '/analyze', icon: Sparkles },
    { label: 'Public Scam Checker', path: '/verify', icon: ShieldCheck },
    { label: 'Conversations', path: '/conversations', icon: MessageSquare },
    { label: 'Threat Intelligence', path: '/threats', icon: ShieldAlert },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Dataset', path: '/dataset', icon: Database },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 flex flex-col h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-black border border-purple-500/30 overflow-hidden flex items-center justify-center shadow-md shadow-purple-500/25 flex-shrink-0">
          <img 
            src="/logo.png" 
            alt="KAAVALX Logo" 
            className="w-full h-full object-contain p-0.5"
          />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <h1 className="text-base font-extrabold tracking-wider bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-white dark:via-purple-200 dark:to-indigo-300 bg-clip-text text-transparent">
              KAAVALX
            </h1>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 uppercase tracking-wider">SOC</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Support & Threat Intel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 transition-colors">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 mb-2 shadow-2xs">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'K'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.email || 'kavalx@kavalx.in'}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                SOC Analyst
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Developed by APEX Footnote */}
        <div className="pt-2.5 mt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between px-1">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-0.5 shadow-xs flex-shrink-0">
              <img 
                src="/apex-logo.png" 
                alt="APEX Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">Engineered by</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">APEX</p>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/50">
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
