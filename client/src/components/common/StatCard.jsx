import React from 'react';

export function StatCard({ title, value, subtext, icon: Icon, color = 'blue' }) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-lg border ${colorStyles[color] || colorStyles.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
