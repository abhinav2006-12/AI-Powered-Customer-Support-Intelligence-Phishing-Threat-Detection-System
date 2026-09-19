import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FloatingChatWidget } from '../chat/FloatingChatWidget';

export function Layout({ children, title, onSeedSuccess }) {
  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/70 to-purple-50/30 dark:from-[#070B18] dark:via-[#0C1226] dark:to-[#090D1E] text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      {/* Ambient Radial Gradient Mesh Orbs behind Frosted Glass */}
      <div className="ambient-mesh">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Glass Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
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

export default Layout;
