import React from 'react';
import { Shield } from 'lucide-react';

export function LoadingSpinner({ 
  message = 'Loading intelligence data...', 
  subtext = 'Processing telemetry...',
  size = 'md',
  fullScreen = false 
}) {
  const isSmall = size === 'sm';

  const content = (
    <div className={`flex flex-col items-center justify-center text-center select-none ${isSmall ? 'p-4' : 'p-8 min-h-[260px]'}`}>
      {/* Animated Glowing Dual Orbit Spinner */}
      <div className="relative flex items-center justify-center mb-4">
        {/* Soft Background Glow Aura */}
        <div className="absolute w-16 h-16 bg-purple-500/20 dark:bg-purple-600/25 rounded-full blur-xl animate-pulse pointer-events-none" />

        {/* Outer Orbiting Gradient Ring */}
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-purple-600 border-r-indigo-500 dark:border-t-purple-400 dark:border-r-indigo-400 animate-spin" style={{ animationDuration: '1.2s' }} />

        {/* Inner Counter-Rotating Gradient Ring */}
        <div className="absolute w-8 h-8 rounded-full border-2 border-transparent border-b-cyan-500 border-l-blue-500 dark:border-b-cyan-400 dark:border-l-blue-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />

        {/* Center Pulsing Shield / Core Orb */}
        <div className="absolute flex items-center justify-center w-5 h-5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full shadow-xs shadow-purple-500/50 animate-pulse">
          <Shield className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* Primary Message */}
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide">
        {message}
      </p>

      {/* Subtext with Wave Dots */}
      {subtext && !isSmall && (
        <div className="flex items-center space-x-1.5 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <span>{subtext}</span>
          <span className="flex space-x-0.5">
            <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
