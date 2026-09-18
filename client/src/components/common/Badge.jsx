import React from 'react';

export function PriorityBadge({ level }) {
  const styles = {
    Low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    Medium: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    High: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/60',
    Critical: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 font-semibold'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[level] || styles.Low}`}>
      {level || 'Low'}
    </span>
  );
}

export function RiskBadge({ level }) {
  const styles = {
    LOW: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    MEDIUM: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    HIGH: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/60 font-medium',
    CRITICAL: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700/80 font-bold animate-pulse'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs uppercase tracking-wider border ${styles[level] || styles.LOW}`}>
      {level || 'LOW'}
    </span>
  );
}

export function SentimentBadge({ sentiment }) {
  const styles = {
    Positive: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    Neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    Negative: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${styles[sentiment] || styles.Neutral}`}>
      {sentiment || 'Neutral'}
    </span>
  );
}

export function ResolutionBadge({ status }) {
  const styles = {
    Resolved: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
    Unresolved: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 font-medium',
    Pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
    Unknown: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${styles[status] || styles.Unknown}`}>
      {status || 'Unknown'}
    </span>
  );
}
