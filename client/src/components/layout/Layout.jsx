import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingChatWidget } from '../chat/FloatingChatWidget';

export function Layout({ children, title, onSeedSuccess }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0B1120]">
        <Header title={title} onSeedSuccess={onSeedSuccess} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      {/* Global Floating AI Assistant Widget */}
      <FloatingChatWidget />
    </div>
  );
}
