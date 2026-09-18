import React, { useState } from 'react';
import { Search, Bell, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { seedDemoData } from '../../services/api';

export function Header({ title = 'Dashboard', onSeedSuccess }) {
  const [seeding, setSeeding] = useState(false);
  const [notification, setNotification] = useState('');

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

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search bar */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, URLs, emails..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Quick Seed Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Seed realistic demo data into SQLite database"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>

        {/* Quick Notification Toast */}
        {notification && (
          <div className="flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{notification}</span>
          </div>
        )}

        {/* Notification Icon */}
        <div className="relative p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </div>
      </div>
    </header>
  );
}
