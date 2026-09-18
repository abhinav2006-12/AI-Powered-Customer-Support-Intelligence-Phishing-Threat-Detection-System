import React, { useState } from 'react';
import { Search, Bell, RefreshCw, Sparkles, CheckCircle2, LogOut, Shield } from 'lucide-react';
import { seedDemoData } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { useNavigate } from 'react-router-dom';

export function Header({ title = 'Dashboard', onSeedSuccess }) {
  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoData(60);
      setNotification(res.message || 'Successfully seeded demo dataset!');
      if (onSeedSuccess) onSeedSuccess();
      setTimeout(() => setNotification(''), 4000);
    } catch (e) {
      alert('Seed failed: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs transition-colors duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Search bar */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, URLs, emails..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>

        {/* Quick Seed Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Seed realistic demo data into SQLite database"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
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

        {/* Notification Icon */}
        <div className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </div>

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
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
