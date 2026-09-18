import React from 'react';

export function PriorityBadge({ level }) {
  const styles = {
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[level] || styles.Low}`}>
      {level || 'Low'}
    </span>
  );
}

export function RiskBadge({ level }) {
  const styles = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200 font-medium',
    CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs uppercase tracking-wider border ${styles[level] || styles.LOW}`}>
      {level || 'LOW'}
    </span>
  );
}

export function SentimentBadge({ sentiment }) {
  const styles = {
    Positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    Negative: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${styles[sentiment] || styles.Neutral}`}>
      {sentiment || 'Neutral'}
    </span>
  );
}

export function ResolutionBadge({ status }) {
  const styles = {
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Unresolved: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Unknown: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${styles[status] || styles.Unknown}`}>
      {status || 'Unknown'}
    </span>
  );
}
