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
    { label: 'Aegis AI Copilot', path: '/assistant', icon: Bot },
    { label: 'Analyze Conversation', path: '/analyze', icon: Sparkles },
    { label: 'Conversations', path: '/conversations', icon: MessageSquare },
    { label: 'Threat Intelligence', path: '/threats', icon: ShieldAlert },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Dataset', path: '/dataset', icon: Database },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 flex flex-col h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 z-30 transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">AegisGuard AI</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Support & Threat Intelligence</p>
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
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
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
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-600/30 border border-blue-200 dark:border-blue-500/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs flex-shrink-0">
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

        {/* System Status Footnote */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 px-1 pt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-medium truncate">Claude AI & Threat Engine</span>
        </div>
      </div>
    </aside>
  );
}
