import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Invoice } from '../types';
import { 
  FileText, 
  Search, 
  Calendar, 
  Download, 
  RefreshCw, 
  MapPin, 
  Tag, 
  ArrowRight,
  Inbox,
  AlertCircle
} from 'lucide-react';

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Fetch full invoice logs with interactive filter combinations
  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ['invoices', searchTerm, filterDate],
    queryFn: () => apiService.getInvoices({
      search: searchTerm || undefined,
      date: filterDate || undefined
    })
  });

  const handleDownloadPDF = (id: string, invoiceNumber: string) => {
    const url = apiService.getInvoicePdfUrl(id);
    // Directly trigger standard download or open in new tab
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-3xl">Invoice & Checkout Ledger</h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5">Audit, search, and download print-ready thermal-style receipt PDFs for completed checkouts.</p>
        </div>
        <button
          id="btn-refetch-invoices"
          onClick={() => refetch()}
          className="bg-white hover:bg-slate-50 border border-slate-205 py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-2 self-start cursor-pointer transition-colors shadow-xs"
        >
          <RefreshCw className="h-4 w-4 shrink-0 text-slate-500" />
          <span>Sync Register</span>
        </button>
      </div>

      {/* Filter Options box */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 shrink-0" />
          <input
            id="invoice-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number (e.g. INV-10001)..."
            className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none hover:border-slate-350 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 transition-all bg-slate-50/5 font-bold"
          />
        </div>
        
        {/* Date picking */}
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex items-center">
            <Calendar className="absolute left-3 text-slate-400 h-4 w-4 shrink-0" />
            <input
              id="invoice-date-picker"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-48 text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 bg-slate-50/5 outline-none font-bold focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 transition-all cursor-pointer"
            />
          </div>
          {filterDate && (
            <button
              id="btn-clear-invoice-date"
              onClick={() => setFilterDate('')}
              className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 font-bold hover:bg-rose-100/60 shrink-0 cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main List Table layout */}
      {isLoading ? (
        <div className="bg-white border rounded-3xl p-12 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-100 w-1/4 rounded-xl mx-auto" />
          <div className="h-12 bg-slate-100 w-full rounded-xl" />
          <div className="h-12 bg-slate-100 w-full rounded-xl" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white border rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-slate-300 mb-3 shrink-0" />
          <h4 className="font-bold text-slate-750 text-sm">No printed invoices found.</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Ready slips automatically generate inside this ledger as soon as active kitchen orders are flagged "completed".</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4.5">Invoice Number</th>
                  <th className="px-6 py-4.5">Date generated</th>
                  <th className="px-6 py-4.5">Ordered Items</th>
                  <th className="px-6 py-4.5 text-right font-display text-[#166534]">Checkout Price</th>
                  <th className="px-6 py-4.5 text-center">Receipt PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {invoices.map((inv) => (
                  <tr id={`invoice-row-${inv._id}`} key={inv._id} className="hover:bg-slate-50/15 transition-all">
                    {/* Invoice ID/No */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#166534]/5 text-[#166534] flex items-center justify-center border border-[#166534]/10 shrink-0">
                          <FileText className="h-4 w-4 shrink-0" />
                        </div>
                        <span id={`invoice-num-${inv._id}`} className="font-display font-bold text-slate-950 text-sm">{inv.invoiceNumber}</span>
                      </div>
                    </td>

                    {/* Gen time */}
                    <td className="px-6 py-5 text-slate-500 font-bold">
                      {new Date(inv.generatedAt).toLocaleString()}
                    </td>

                    {/* Items listing summaries */}
                    <td className="px-6 py-5 max-w-xs md:max-w-md">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {inv.items.map((item, idx) => (
                          <span 
                            key={idx} 
                            className="bg-slate-50 text-slate-600 border border-slate-200 rounded-lg px-2 py-1 leading-none shrink-0 font-bold text-[10px]"
                          >
                            {item.productName} <span className="font-extrabold text-slate-800 font-mono text-[9px] bg-slate-200/60 rounded px-1 ml-0.5">x{item.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Price gross totals */}
                    <td className="px-6 py-5 text-right">
                      <span className="font-display font-extrabold text-slate-900 text-sm">Rs. {inv.totalAmount}</span>
                    </td>

                    {/* PDF Stream operations */}
                    <td className="px-6 py-5 text-center">
                      <button
                        id={`btn-download-pdf-${inv._id}`}
                        onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                        className="bg-white hover:bg-[#166534] hover:text-white border border-slate-250 hover:border-[#166534] p-2 px-3 rounded-xl text-slate-600 flex items-center gap-1.5 mx-auto font-bold text-[11px] transition-all cursor-pointer shadow-xs focus:outline-none"
                        title="Download small thermal paper receipt"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
