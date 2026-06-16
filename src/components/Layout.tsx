import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-[#166534]/10">
      {/* Shared Navigation Sidebar */}
      <Sidebar />

      {/* Main App Content Viewport */}
      <main id="main-content" className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="hidden md:flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5 shrink-0">
          <div>
            <h2 id="desktop-header-title" className="font-display font-bold text-slate-900 tracking-tight text-base">
              The Bistro Console
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Control center for daily restaurant registers</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-250 rounded-full px-3.5 py-1.5 text-[11px] text-slate-500 font-mono font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Session active</span>
            </div>
            <div className="text-xs font-semibold text-[#166534] bg-[#166534]/5 border border-[#166534]/10 rounded-xl px-3 py-1.5 uppercase tracking-wider">
              Administrator
            </div>
          </div>
        </header>

        {/* Page Inner Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
