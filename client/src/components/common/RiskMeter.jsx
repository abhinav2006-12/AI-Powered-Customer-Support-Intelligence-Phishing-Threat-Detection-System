import React from 'react';

export function RiskMeter({ score = 0, level = 'LOW' }) {
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';

  if (score >= 75) {
    barColor = 'bg-rose-600';
    textColor = 'text-rose-700';
  } else if (score >= 50) {
    barColor = 'bg-orange-500';
    textColor = 'text-orange-700';
  } else if (score >= 25) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cybersecurity Risk Score</span>
        <span className={`text-sm font-bold ${textColor}`}>
          {score} / 100 ({level})
        </span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${barColor}`} 
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
