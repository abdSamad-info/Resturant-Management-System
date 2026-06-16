import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import DashboardSummary from '../components/DashboardSummary';
import { useNotification } from '../context/NotificationContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  UtensilsCrossed, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Inbox,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch metrics data concurrently
  const { data: employees = [], isLoading: empLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: apiService.getEmployees
  });

  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ['products'],
    queryFn: apiService.getProducts
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiService.getOrders()
  });

  const { data: dailyReport, isLoading: reportLoading } = useQuery({
    queryKey: ['dailyReport', todayStr],
    queryFn: () => apiService.getDailyReport({ date: todayStr })
  });

  // Action mutation to transition order statuses
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'completed' | 'cancelled' }) => 
      apiService.updateOrderStatus(id, status),
    onSuccess: (data: any, variables: any) => {
      // Invalidate active queues to stream updates
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dailyReport'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showSuccess(`Order status updated to ${variables.status} successfully.`);
    },
    onError: (err: any) => {
      showError(err?.response?.data?.message || 'Failed to update order status');
    }
  });

  const handleUpdateStatus = (id: string, status: 'completed' | 'cancelled') => {
    updateOrderMutation.mutate({ id, status });
  };

  // Extract pending orders for the action panel
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeProducts = products.filter(p => p.isAvailable).length;

  const stats = [
    {
      id: 'stat-revenue',
      title: "Today's Sales",
      value: dailyReport ? `Rs. ${dailyReport.totalSales}` : 'Rs. 0',
      icon: DollarSign,
      color: 'bg-[#166534]/5 text-[#166534] border-[#166534]/10',
      desc: `${dailyReport?.salesCount || 0} completed orders`
    },
    {
      id: 'stat-pending',
      title: 'Pending Orders',
      value: String(pendingOrders.length),
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      desc: 'Awaiting kitchen dispatch'
    },
    {
      id: 'stat-staff',
      title: 'Active Employees',
      value: String(employees.filter(e => e.isActive).length),
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      desc: `${employees.filter(e => e.salaryType === 'daily').length} daily wagers`
    },
    {
      id: 'stat-menu',
      title: 'Current Menu',
      value: `${activeProducts} / ${products.length}`,
      icon: UtensilsCrossed,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
      desc: 'Available items catalog font-medium'
    }
  ];

  const isLoading = empLoading || prodLoading || ordersLoading || reportLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 h-44 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-3xl">Bistro Overview & Logs</h1>
        <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#166534] inline-block" />
          Real-time status registers for the date of {new Date(todayStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards Dashboard Summary */}
      <DashboardSummary
        todayRevenue={dailyReport?.totalSales || 0}
        activeOrdersCount={pendingOrders.length}
        pendingInvoicesCount={pendingOrders.length}
      />

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active pending order list */}
        <div id="pending-orders-panel" className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-display font-bold text-slate-800 text-base">Active Orders Kitchen Hub</h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-0.5">
              {pendingOrders.length} pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-slate-50 text-slate-350 rounded-full">
                  <Inbox className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">All cleared for now!</h4>
                <p className="text-xs text-slate-400 max-w-xs font-medium leading-relaxed">There are no pending tickets in the kitchen. Use the Orders page to log a new table or delivery.</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div id={`pending-order-${order._id}`} key={order._id} className="p-6 hover:bg-slate-50/30 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-slate-800 text-sm">
                        {order.orderType === 'dine-in' ? `In-Table / Room: ${order.tableNumber}` : 'Home Delivery Route'}
                      </span>
                      <span className={`text-[9px] font-mono tracking-wider font-bold rounded-md px-2 py-0.5 uppercase 
                        ${order.orderType === 'dine-in' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-rose-50/70 text-rose-700 border border-rose-100'}
                      `}>
                        {order.orderType}
                      </span>
                    </div>
                    {order.orderType === 'delivery' && (
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 inline shrink-0 text-slate-400" /> {order.customerName} - {order.customerAddress}
                      </p>
                    )}
                    <div className="pt-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected Items:</p>
                      <p className="text-xs text-slate-600 mt-0.5 font-semibold">
                        {order.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1 font-medium">
                      Logged at: {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] uppercase text-slate-400 font-bold block leading-none tracking-wide">Gross Ticket</span>
                      <span className="font-display font-black text-[#166534] text-base block mt-1">Rs. {order.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`btn-complete-order-${order._id}`}
                        onClick={() => handleUpdateStatus(order._id, 'completed')}
                        className="py-2.5 px-3 rounded-xl text-[#166534] bg-[#166534]/5 border border-[#166534]/10 hover:bg-[#166534]/10 transition-all flex items-center gap-1.5 focus:outline-none text-xs font-semibold cursor-pointer"
                        title="Dues cleared, mark as complete & print invoice"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Complete</span>
                      </button>
                      <button
                        id={`btn-cancel-order-${order._id}`}
                        onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                        className="py-2.5 px-3 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all flex items-center gap-1.5 focus:outline-none text-xs font-semibold cursor-pointer"
                        title="Void order entry"
                      >
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Quick Tip Panel */}
        <div id="dashboard-notice-board" className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-base">Bistro Operator Guard</h3>
            <div className="p-4 rounded-2xl bg-[#166534]/5 border border-[#166534]/10 text-[#166534] space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#166534]" />
                <span className="text-xs font-bold uppercase tracking-wide">Active Deficit Auto-deduction</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                Staff member monthly payouts are automatically configured. Front-facing salaries of monthly staff subtract advance loans on report payouts, keeping staff records mathematically synced.
              </p>
            </div>
            
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                <span className="text-xs font-bold uppercase tracking-wide">Automatic Receipt Creation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                Completing order tickets from the kitchen logs panel immediately creates invoice registries, ensuring rapid checkout and continuous sales logging.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono font-semibold">
            <span>Server sync state: OK</span>
            <span>Est TTL cache: 6m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
