import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import DateRangePicker from '../components/DateRangePicker';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  Users, 
  Coins, 
  DollarSign, 
  Percent, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  FolderTree
} from 'lucide-react';

export default function Reports() {
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM

  // Page active tabs
  const [activeReportTab, setActiveReportTab] = useState<'daily' | 'monthly'>('daily');

  // Daily pick state
  const [selectedDailyDate, setSelectedDailyDate] = useState(todayStr);
  // Interval range states
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  // Monthly pick state
  const [selectedMonthlyMonth, setSelectedMonthlyMonth] = useState(thisMonthStr);

  // Queries
  const { data: dailyReport, isLoading: dailyLoading, refetch: refetchDaily } = useQuery({
    queryKey: ['dailyReport', selectedDailyDate, reportStartDate, reportEndDate],
    queryFn: () => apiService.getDailyReport({
      date: (!reportStartDate && !reportEndDate) ? selectedDailyDate : undefined,
      startDate: reportStartDate || undefined,
      endDate: reportEndDate || undefined
    }),
    enabled: activeReportTab === 'daily'
  });

  const { data: monthlyReport, isLoading: monthlyLoading, refetch: refetchMonthly } = useQuery({
    queryKey: ['monthlyReport', selectedMonthlyMonth],
    queryFn: () => apiService.getMonthlyReport(selectedMonthlyMonth),
    enabled: activeReportTab === 'monthly'
  });

  const handleDownloadMonthlyPDF = () => {
    const url = apiService.getMonthlyPdfUrl(selectedMonthlyMonth);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Upper Area brand */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-3xl">Financial Audit & Analytics Reports</h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5">Review active daily registers, calculate margins accounting for staff compensation subtractions, and download full-page monthly PDF reports.</p>
        </div>
        
        {/* Simple Report Tabs selector */}
        <div id="report-view-tabs" className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start">
          <button
            onClick={() => setActiveReportTab('daily')}
            className={`text-xs font-bold px-4.5 py-2.5 rounded-lg transition-all cursor-pointer ${activeReportTab === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daily Audits
          </button>
          <button
            onClick={() => setActiveReportTab('monthly')}
            className={`text-xs font-bold px-4.5 py-2.5 rounded-lg transition-all cursor-pointer ${activeReportTab === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly Performance
          </button>
        </div>
      </div>

      {/* Daily Audit view */}
      {activeReportTab === 'daily' && (
        <div id="daily-report-view" className="space-y-6">
          {/* Calendar Picker bar */}
          <div className="space-y-4">
            <div className="bg-white p-5 border border-slate-200 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-50 text-slate-500 rounded-xl shrink-0">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Pick Shift Date</span>
                  <input
                    id="daily-date-picker"
                    type="date"
                    disabled={!!(reportStartDate || reportEndDate)}
                    value={selectedDailyDate}
                    onChange={(e) => setSelectedDailyDate(e.target.value)}
                    className="block text-sm font-bold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 cursor-pointer mt-0.5 text-slate-800 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  id="btn-sync-daily"
                  onClick={() => refetchDaily()}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-205 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs focus:outline-none w-full md:w-auto"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Ledger</span>
                </button>
              </div>
            </div>

            {/* Custom Date Range Picker component for interval summaries */}
            <div className="bg-slate-50/40 p-4 rounded-3xl border border-dashed border-slate-200 space-y-3">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block font-sans">Or Filter by Custom Interval Range</span>
              <DateRangePicker
                startDate={reportStartDate}
                endDate={reportEndDate}
                onChange={(start, end) => {
                  setReportStartDate(start);
                  setReportEndDate(end);
                }}
                onClear={() => {
                  setReportStartDate('');
                  setReportEndDate('');
                }}
              />
            </div>
          </div>

          {/* Daily Loading skeleton */}
          {dailyLoading ? (
            <div className="h-64 bg-white border border-slate-200 rounded-3xl animate-pulse" />
          ) : !dailyReport ? (
            <p className="text-center text-xs text-slate-400 py-12">Failed to obtain daily registers.</p>
          ) : (
            <>
              {/* Daily KPIs grids */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Sale amount */}
                <div id="daily-kpi-sales" className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex justify-between items-center relative overflow-hidden">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Gross Sales Revenue</span>
                    <p className="font-display font-extrabold text-slate-950 text-2xl tracking-tight">Rs. {dailyReport.totalSales}</p>
                    <span className="text-[10px] text-[#166534] bg-[#166534]/5 border border-[#166534]/10 rounded-lg px-2 py-0.5 font-bold inline-block">
                      {dailyReport.salesCount} tickets completed
                    </span>
                  </div>
                  <div className="p-3 bg-[#166534]/5 text-[#166534] rounded-xl">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>

                {/* Wages paid today */}
                <div id="daily-kpi-wages" className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex justify-between items-center relative overflow-hidden">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Daily Staff Payrolls (Paid today)</span>
                    <p className="font-display font-extrabold text-slate-950 text-2xl tracking-tight">Rs. {dailyReport.wagesPaid}</p>
                    <span className="text-[10px] text-slate-400 font-medium block font-sans">
                      Sum of active daily wagers wages
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                    <Coins className="h-6 w-6" />
                  </div>
                </div>

                {/* Net profit margin */}
                <div id="daily-kpi-profit" className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm flex justify-between items-center relative overflow-hidden">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Net Profit Margin</span>
                    <p className="font-display font-extrabold text-[#166534] text-2xl tracking-tight">Rs. {dailyReport.netProfit}</p>
                    <span className={`text-[10px] font-bold rounded-lg px-2 py-0.5 inline-flex items-center gap-0.5 
                      ${dailyReport.netProfit >= 0 ? 'bg-[#166534]/5 text-[#166534] border-[#166534]/10' : 'bg-rose-50 text-rose-700 border-[#be123c]/10'}`}
                    >
                      {dailyReport.netProfit >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      <span>Margin net calculated</span>
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl transition-all ${dailyReport.netProfit >= 0 ? 'bg-[#166534] text-white hover:opacity-95' : 'bg-rose-700 text-white hover:opacity-95'}`}>
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Items Sold table list */}
              <div id="daily-items-sold-panel" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/20">
                  <h3 className="font-display font-bold text-slate-800 text-sm">Dishes Sold Breakdown</h3>
                  <span className="text-xs text-slate-450 font-bold font-mono bg-slate-100 rounded-lg py-1 px-2.5">Quantities audit logs</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        <th className="px-6 py-4.5">Menu Dish Name</th>
                        <th className="px-6 py-4.5 text-center">Quantities Dispatched</th>
                        <th className="px-6 py-4.5 text-right">Sum Gross Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-705 font-sans">
                      {dailyReport.itemsSold.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-12 text-center text-slate-400 font-semibold font-sans">No completed ticket dish logs to record for this date shift.</td>
                        </tr>
                      ) : (
                        dailyReport.itemsSold.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/15 transition-all">
                            <td className="px-6 py-4.5 font-extrabold text-slate-900">{row.name}</td>
                            <td className="px-6 py-4.5 text-center">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 rounded-md py-1 px-2 text-[11px] inline-block">
                                {row.quantity} units
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-right font-extrabold text-slate-950">Rs. {row.amount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Monthly Audit view */}
      {activeReportTab === 'monthly' && (
        <div id="monthly-report-view" className="space-y-6">
          {/* Month picker and PDF downloader */}
          <div className="bg-white p-4.5 border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm animate-none">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-slate-50 text-slate-500 rounded-xl shrink-0">
                <Calendar className="h-4.5 w-4.5" />
              </span>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Pick Audit Month</span>
                <input
                  id="monthly-picker"
                  type="month"
                  value={selectedMonthlyMonth}
                  onChange={(e) => setSelectedMonthlyMonth(e.target.value)}
                  className="block text-sm font-bold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 cursor-pointer mt-0.5 text-slate-800 font-display"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-sync-monthly"
                onClick={() => refetchMonthly()}
                className="p-2.5 bg-white hover:bg-slate-50 border border-slate-205 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-all focus:outline-none shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <button
                id="btn-download-monthly-pdf"
                onClick={handleDownloadMonthlyPDF}
                disabled={monthlyLoading || !monthlyReport}
                className="px-5 py-2.5 bg-[#166534] hover:bg-[#11552a] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-45 transition-colors"
                title="Download full page report as client file"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>Download Report PDF</span>
              </button>
            </div>
          </div>

          {/* Monthly KPI displays */}
          {monthlyLoading ? (
            <div className="h-64 bg-white border border-slate-200 rounded-3xl animate-pulse" />
          ) : !monthlyReport ? (
            <p className="text-center text-xs text-slate-400 py-12">Failed to obtain monthly performance aggregates.</p>
          ) : (
            <>
              {/* Financial Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {/* Revenue */}
                <div id="monthly-kpi-sales" className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md/5 transition-all">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Total Revenue</span>
                  <p className="font-display font-extrabold text-slate-950 text-xl tracking-tight leading-none">Rs. {monthlyReport.totalSales}</p>
                  <span className="text-[10px] text-slate-400 mt-2.5 block font-semibold leading-tight font-sans">
                    {monthlyReport.totalOrders} completed tickets
                  </span>
                </div>

                {/* Wages paid details */}
                <div id="monthly-kpi-wages" className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md/5 transition-all">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Staff Payroll Paid</span>
                  <p className="font-display font-extrabold text-slate-950 text-xl tracking-tight leading-none">Rs. {monthlyReport.totalWages}</p>
                  <span className="text-[10px] text-slate-400 mt-2.5 block font-semibold leading-tight font-sans">
                    Auto-deductions subtraction active
                  </span>
                </div>

                {/* Net margins */}
                <div id="monthly-kpi-profit" className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md/5 transition-all">
                  <span className="text-[9px] text-[#166534] font-bold uppercase tracking-wider block mb-1.5">Net Operating Profit</span>
                  <p className="font-display font-extrabold text-[#166534] text-xl tracking-tight leading-none">Rs. {monthlyReport.netProfit}</p>
                  <span className="text-[10px] text-[#166534]/70 mt-2.5 block font-semibold leading-tight font-sans">
                    Total sales minus wages
                  </span>
                </div>

                {/* Order velocity */}
                <div id="monthly-kpi-velocity" className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md/5 transition-all">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Shift Orders Count</span>
                  <p className="font-display font-extrabold text-slate-950 text-xl tracking-tight leading-none">{monthlyReport.totalOrders} checkouts</p>
                  <span className="text-[10px] text-slate-400 mt-2.5 block font-semibold leading-tight font-sans">
                    Completed orders registry
                  </span>
                </div>
              </div>

              {/* Breakdown Grid panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category sold volume */}
                <div id="monthly-categories-panel" className="bg-white border text-left border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-150 bg-slate-50/20 flex items-center justify-between">
                    <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <FolderTree className="h-5 w-5 shrink-0 text-[#166534]" />
                      <span>Category Sales Share</span>
                    </h3>
                  </div>
                  <div className="p-6 space-y-5">
                    {Object.keys(monthlyReport.categoriesBreakdown).length === 0 ? (
                      <p className="text-xs text-slate-400 py-8 text-center font-medium">No category units statistics logged.</p>
                    ) : (
                      Object.keys(monthlyReport.categoriesBreakdown).map((category, idx) => {
                        const count = monthlyReport.categoriesBreakdown[category];
                        return (
                          <div id={`category-breakdown-${idx}`} key={idx} className="space-y-1.5 text-xs">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-700">{category}</span>
                              <span className="text-slate-950 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{count} units sold</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5">
                              <div 
                                className="bg-[#166534] h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (count / (monthlyReport.totalOrders || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Staff Payroll Ledger lists */}
                <div id="monthly-staff-payouts-panel" className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden bg-white">
                  <div className="px-6 py-5 border-b border-slate-150 bg-slate-50/20">
                    <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Users className="h-5 w-5 shrink-0 text-slate-500" />
                      <span>Staff Monthly Payroll Registers</span>
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {monthlyReport.salariesPaid.length === 0 ? (
                      <p className="text-xs text-center py-12 text-slate-400 font-medium">No personnel compensation logs created.</p>
                    ) : (
                      monthlyReport.salariesPaid.map((salary, idx) => (
                        <div id={`salary-ledgers-${idx}`} key={idx} className="px-6 py-5 flex justify-between items-center text-xs hover:bg-slate-50/15 transition-all">
                          <div>
                            <span className="font-extrabold text-slate-900 block text-sm">{salary.employeeName}</span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{salary.category}</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-1.5">Def deficit deducted payout</span>
                            <span className="font-display font-extrabold text-slate-950 text-base">Rs. {salary.salaryPaid}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
