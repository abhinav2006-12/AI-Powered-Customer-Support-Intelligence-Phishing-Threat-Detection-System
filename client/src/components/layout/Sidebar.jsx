import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  MessageSquare, 
  ShieldAlert, 
  BarChart3, 
  Database, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Analyze Conversation', path: '/analyze', icon: Sparkles },
    { label: 'Conversations', path: '/conversations', icon: MessageSquare },
    { label: 'Threat Intelligence', path: '/threats', icon: ShieldAlert },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Dataset', path: '/dataset', icon: Database },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-400 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-900/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">AegisGuard AI</h1>
          <p className="text-xs text-slate-500 font-medium">Support & Threat Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
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
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-slate-300">Claude AI & Threat Engine</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Status: Active & Protected</p>
      </div>
    </aside>
  );
}
