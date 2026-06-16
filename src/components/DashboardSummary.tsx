import React from 'react';
import { DollarSign, Clock, FileWarning } from 'lucide-react';

interface DashboardSummaryProps {
  todayRevenue: number;
  activeOrdersCount: number;
  pendingInvoicesCount: number;
}

export default function DashboardSummary({ todayRevenue, activeOrdersCount, pendingInvoicesCount }: DashboardSummaryProps) {
  return (
    <div id="dashboard-summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Gross Sales Card */}
      <div 
        id="summary-card-revenue" 
        className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Today's Total Revenue</span>
            <div className="font-display font-black text-slate-900 text-4xl sm:text-5xl tracking-tight mt-1">
              Rs. {todayRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-3.5 bg-[#166534]/5 text-[#166534] border border-[#166534]/10 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
            <DollarSign className="h-7 w-7" />
          </div>
        </div>
        <div className="text-xs text-slate-450 font-medium mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span>Completed Checkouts</span>
          <span className="font-mono font-bold text-slate-600 bg-slate-100 rounded-md px-2 py-0.5">Real-time</span>
        </div>
      </div>

      {/* Active Orders Card */}
      <div 
        id="summary-card-active-orders" 
        className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Active Orders</span>
            <div className="font-display font-black text-[#166534] text-4xl sm:text-5xl tracking-tight mt-1">
              {activeOrdersCount}
            </div>
          </div>
          <div className="p-3.5 bg-[#166534]/5 text-[#166534] border border-[#166534]/10 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="h-7 w-7 animate-pulse" />
          </div>
        </div>
        <div className="text-xs text-slate-450 font-medium mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span>Active in Kitchen</span>
          <span className="font-mono font-bold text-amber-700 bg-amber-50 rounded-md px-2 py-0.5">Pending Preparation</span>
        </div>
      </div>

      {/* Pending Invoices Card */}
      <div 
        id="summary-card-pending-invoices" 
        className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Pending Invoices</span>
            <div className="font-display font-black text-rose-700 text-4xl sm:text-5xl tracking-tight mt-1">
              {pendingInvoicesCount}
            </div>
          </div>
          <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
            <FileWarning className="h-7 w-7" />
          </div>
        </div>
        <div className="text-xs text-slate-450 font-medium mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span>Unpaid Checks Pending</span>
          <span className="font-mono font-bold text-rose-700 bg-rose-50 rounded-md px-2 py-0.5">Awaiting Checkout</span>
        </div>
      </div>
    </div>
  );
}
