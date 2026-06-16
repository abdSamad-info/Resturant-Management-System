import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  onClear?: () => void;
}

export default function DateRangePicker({ startDate, endDate, onChange, onClear }: DateRangePickerProps) {
  // Set presets helper
  const applyPreset = (preset: 'today' | 'yesterday' | 'week' | 'month' | 'reset') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'reset') {
      onChange('', '');
      if (onClear) onClear();
      return;
    }

    if (preset === 'today') {
      onChange(todayStr, todayStr);
    } else if (preset === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesStr = yesterday.toISOString().split('T')[0];
      onChange(yesStr, yesStr);
    } else if (preset === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString().split('T')[0];
      onChange(lastWeekStr, todayStr);
    } else if (preset === 'month') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstStr = firstDayOfMonth.toISOString().split('T')[0];
      onChange(firstStr, todayStr);
    }
  };

  return (
    <div 
      id="reusable-date-range-picker" 
      className="bg-white p-4.5 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Start Date */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex-1 sm:flex-none">
          <Calendar className="h-4 w-4 text-slate-450 shrink-0" />
          <div className="flex-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChange(e.target.value, endDate)}
              className="block w-full text-xs font-bold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 cursor-pointer mt-0.5 text-slate-800"
            />
          </div>
        </div>

        <span className="hidden sm:inline text-slate-400 font-bold text-xs">to</span>

        {/* End Date */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex-1 sm:flex-none">
          <Calendar className="h-4 w-4 text-slate-450 shrink-0" />
          <div className="flex-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onChange(startDate, e.target.value)}
              className="block w-full text-xs font-bold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 cursor-pointer mt-0.5 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Quick Presets Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 self-center">
        <button
          type="button"
          onClick={() => applyPreset('today')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => applyPreset('yesterday')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          Yesterday
        </button>
        <button
          type="button"
          onClick={() => applyPreset('week')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          Past 7 Days
        </button>
        <button
          type="button"
          onClick={() => applyPreset('month')}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          This Month
        </button>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer flex items-center gap-1"
            title="Clear date filter"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
