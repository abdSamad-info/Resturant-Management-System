import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  ShoppingBag, 
  FileText, 
  BarChart3, 
  Menu, 
  X,
  ChefHat,
  Database
} from 'lucide-react';

interface SidebarProps {
  onToggleMobile?: () => void;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/products', label: 'Products', icon: UtensilsCrossed },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div id="mobile-top-bar" className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#166534] text-white flex items-center justify-center">
            <ChefHat className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-slate-800 tracking-tight text-base">The Green Bistro</span>
        </div>
        <button 
          id="hamburger-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:outline-none transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Background overlay for mobile */}
      {isOpen && (
        <div 
          id="sidebar-overlay"
          className="fixed inset-0 bg-slate-900/45 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
         id="app-sidebar"
         className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-35 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 w-64 md:sticky md:top-0 md:h-screen
           ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
         `}
      >
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 w-10 h-10 rounded-xl bg-[#166534] text-white flex items-center justify-center">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display font-bold leading-none text-slate-900 tracking-tight text-lg">Green Bistro</h1>
              <p className="text-[10px] uppercase tracking-wider text-[#166534] font-bold mt-1">Management Hub</p>
            </div>
          </div>
          <button 
            id="close-sidebar-mobile"
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-450 hover:bg-slate-50 hover:text-slate-650 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-[#166534]/5 text-[#166534] border border-[#166534]/10 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'}
                `}
              >
                <IconComponent className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Mini Footer Credit */}
        <div className="p-5 border-t border-slate-100 bg-[#f8fafc] space-y-3 shrink-0">
          <a
            id="download-db-backup-link"
            href="/api/backup"
            download="bistro-database-backup.json"
            className="flex items-center gap-2.5 px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-xl bg-white text-slate-550 hover:text-slate-800 text-[11px] font-bold transition-all shadow-xs focus:outline-none justify-center cursor-pointer"
          >
            <Database className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>Export Database Backup</span>
          </a>
          <div className="flex items-center gap-2 px-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-tight">Console Sync Active</span>
          </div>
          <p className="text-[9px] text-slate-400 px-1 font-sans font-semibold">Single User Mode | V1.0.0</p>
        </div>
      </aside>
    </>
  );
}
