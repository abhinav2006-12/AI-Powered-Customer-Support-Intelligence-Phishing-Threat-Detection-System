import React, { useState } from 'react';
import { Search, RefreshCw, Sparkles, CheckCircle2, LogOut, Shield } from 'lucide-react';
import { seedDemoData } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { ConnectionStatusIndicator } from '../common/ConnectionStatusIndicator';
import { useNavigate } from 'react-router-dom';

export function Header({ title = 'Dashboard', onSeedSuccess }) {
  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSync = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoData(60);
      setNotification(res.message || 'Telemetry synchronized with real-time stream!');
      if (onSeedSuccess) onSeedSuccess();
      setTimeout(() => setNotification(''), 4000);
    } catch (e) {
      alert('Sync failed: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">SOC Threat Hunting & Support Intelligence Engine</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Database Live Health Status Indicator */}
        <ConnectionStatusIndicator />

        {/* Sync Feeds Trigger */}
        <button
          onClick={handleSync}
          disabled={seeding}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Synchronize live threat intelligence & support telemetry stream"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Syncing...' : 'Sync Live Feeds'}</span>
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Quick Notification Toast */}
        {notification && (
          <div className="flex items-center space-x-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{notification}</span>
          </div>
        )}

        {/* User Chip */}
        {user && (
          <div className="hidden sm:flex items-center pl-3 border-l border-slate-200 dark:border-slate-800 space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
              {user.email?.charAt(0).toUpperCase() || 'K'}
            </div>
            <div className="text-left leading-tight hidden lg:block">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{user.email}</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">Authorized</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
