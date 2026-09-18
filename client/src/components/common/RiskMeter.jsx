import React from 'react';

export function RiskMeter({ score = 0, level = 'LOW' }) {
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700 dark:text-emerald-400';

  if (score >= 75) {
    barColor = 'bg-rose-600';
    textColor = 'text-rose-700 dark:text-rose-400';
  } else if (score >= 50) {
    barColor = 'bg-orange-500';
    textColor = 'text-orange-700 dark:text-orange-400';
  } else if (score >= 25) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700 dark:text-amber-400';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cybersecurity Risk Score</span>
        <span className={`text-sm font-bold ${textColor}`}>
          {score} / 100 ({level})
        </span>
      </div>
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${barColor}`} 
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
