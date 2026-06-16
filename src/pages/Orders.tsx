import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import DateRangePicker from '../components/DateRangePicker';
import { useNotification } from '../context/NotificationContext';
import { Order, Product, OrderItem } from '../types';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  MapPin, 
  Info,
  Layers, 
  FileCheck,
  ShoppingBag, 
  ClipboardList, 
  Search,
  Filter,
  Users,
  UtensilsCrossed,
  XCircle,
  X
} from 'lucide-react';

export default function Orders() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  // Filter states
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active Order Builder state
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Selected products list state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<{ productId: string; productName: string; quantity: number; unitPrice: number }[]>([]);

  // Tables list
  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10'];

  // Queries
  const { data: products = [], isLoading: menuLoading } = useQuery({
    queryKey: ['products'],
    queryFn: apiService.getProducts
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', startDate, endDate, filterType, filterStatus],
    queryFn: () => apiService.getOrders({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      type: filterType === 'All' ? undefined : filterType.toLowerCase(),
      status: filterStatus === 'All' ? undefined : filterStatus.toLowerCase()
    })
  });

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: apiService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dailyReport'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showSuccess('Order ticket registered in kitchen successfully!');
      resetCart();
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to submit order')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'completed' | 'cancelled' }) => 
      apiService.updateOrderStatus(id, status),
    onSuccess: (data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dailyReport'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showSuccess(`Order was marked ${variables.status} successfully!`);
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to update order status')
  });

  const deleteOrderMutation = useMutation({
    mutationFn: apiService.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dailyReport'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showSuccess('Order purged successfully from log!');
    },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to cancel order')
  });

  // Cart operations
  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p._id === selectedProductId);
    if (!prod) return;

    // Check if food item already in basket
    const existingIdx = cartItems.findIndex(item => item.productId === selectedProductId);
    if (existingIdx !== -1) {
      const updated = [...cartItems];
      updated[existingIdx].quantity += Number(selectedQuantity);
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: prod._id,
          productName: prod.name,
          quantity: Number(selectedQuantity),
          unitPrice: prod.price
        }
      ]);
    }
    // reset selection quantity
    setSelectedQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    setCartItems(updated);
  };

  const resetCart = () => {
    setCartItems([]);
    setCustomerName('');
    setCustomerAddress('');
    setTableNumber('Table 1');
  };

  // Live client-side computation
  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [cartItems]);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      showError('Order basket must contain at least one food item before submitting.');
      return;
    }
    if (orderType === 'dine-in' && !tableNumber) {
      showError('Table selection is required for Dine-in orders.');
      return;
    }
    if (orderType === 'delivery' && !customerName) {
      showError('Customer name is required for delivery routes.');
      return;
    }

    createOrderMutation.mutate({
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      customerName: orderType === 'delivery' ? customerName : undefined,
      customerAddress: orderType === 'delivery' ? customerAddress : undefined,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    });
  };

  const handleUpdateStatus = (id: string, status: 'completed' | 'cancelled') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteOrder = (id: string) => {
    deleteOrderMutation.mutate(id);
  };

  const activeProducts = products.filter(p => p.isAvailable);

  return (
    <div className="space-y-8">
      {/* Header upper area */}
      <div>
        <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-3xl">Interactive Order & Kitchen Dispatch</h1>
        <p className="text-xs text-slate-500 font-medium mt-1.5">Manual order creations, active kitchen slips logging, and historical status lookups.</p>
      </div>

      {/* Split Grid area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Creator Panel */}
        <div id="order-creation-panel" className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-none">
          <div className="px-6 py-5 border-b border-slate-150 bg-slate-50/20">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 shrink-0 text-[#166534]" />
              <span>Log Order Slip</span>
            </h3>
          </div>

          <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
            {/* Dining channel select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Service Channel</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrderType('dine-in')}
                  className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer ${orderType === 'dine-in' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Dine-In (In-Table)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer ${orderType === 'delivery' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Home Delivery Route
                </button>
              </div>
            </div>

            {/* Dine-in Table selections */}
            {orderType === 'dine-in' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Table Number</label>
                <select
                  id="select-table"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-slate-50/10 font-semibold focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 outline-none transition-colors"
                >
                  {tables.map(tbl => (
                    <option key={tbl} value={tbl}>{tbl}</option>
                  ))}
                </select>
              </div>
            ) : (
              /* Delivery attributes details */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Customer Name</label>
                  <input
                    id="input-customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Zain Ashraf"
                    className="w-full text-sm border border-slate-200 hover:border-slate-350 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none transition-colors font-medium bg-slate-50/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Customer Address</label>
                  <input
                    id="input-customer-address"
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Plot 12, G-11 Islamabad"
                    className="w-full text-sm border border-slate-200 hover:border-slate-350 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 rounded-xl p-2.5 outline-none transition-colors font-medium bg-slate-50/10"
                  />
                </div>
              </div>
            )}

            {/* Food item additions row */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Select Menu Dishes to Basket</label>
              <div className="flex gap-2">
                <select
                  id="select-dish-to-add"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50/10 outline-none font-semibold focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/15 transition-colors"
                >
                  <option value="">-- Choose Menu Dish --</option>
                  {activeProducts.map(prod => (
                    <option key={prod._id} value={prod._id}>{prod.name} (Rs. {prod.price})</option>
                  ))}
                </select>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/10 px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="px-2 py-1 text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="px-2.5 font-mono text-xs text-slate-800 font-extrabold">{selectedQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  id="btn-add-to-basket"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedProductId}
                  className="bg-[#166534] hover:bg-[#11552a] text-white font-bold rounded-xl px-4 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* Basket Items and list details */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden mt-3 bg-white shadow-xs">
              <div className="bg-slate-50/50 p-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-450 tracking-wide uppercase">
                <span>Cart Order Basket</span>
                <span>{cartItems.length} lines</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto">
                {cartItems.length === 0 ? (
                  <p className="text-xs text-center py-8 text-slate-400 font-medium font-sans">Your basket table is empty. Insert dishes above.</p>
                ) : (
                  cartItems.map((item, idx) => (
                    <div id={`cart-row-${idx}`} key={idx} className="p-3 hover:bg-slate-50/10 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{item.productName}</span>
                        <span className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider block">Unit cost: Rs. {item.unitPrice}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-250 rounded-lg bg-slate-50/45 px-1 py-0.5 scale-90">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(idx, item.quantity - 1)}
                            className="px-1.5 text-slate-400 hover:text-slate-700 font-bold transition-all"
                          >
                            -
                          </button>
                          <span className="px-1.5 font-mono text-slate-800 font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(idx, item.quantity + 1)}
                            className="px-1.5 text-slate-400 hover:text-slate-700 font-bold transition-all"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-slate-900 w-16 text-right">Rs. {item.unitPrice * item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-slate-400 hover:text-rose-700 p-1 hover:bg-slate-50 rounded transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gross total calculation line */}
            <div className="border-t border-slate-150 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase text-slate-450 font-bold tracking-wider block leading-none">Gross Grand Total</span>
                <span className="font-display font-extrabold text-slate-950 text-2xl mt-1.5 block">Rs. {cartTotal}</span>
              </div>
              <button
                id="btn-confirm-order-submit"
                type="submit"
                disabled={cartItems.length === 0}
                className="bg-[#166534] hover:bg-[#11552a] text-white font-bold text-xs py-3.5 px-6 rounded-xl hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
              >
                Submit Kitchen Slip
              </button>
            </div>
          </form>
        </div>

        {/* Right order logs history panels */}
        <div id="order-logs-panel" className="lg:col-span-7 space-y-6">
          {/* Filters shelf */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex gap-4 items-center flex-wrap w-full sm:w-auto">
                {/* Type select filter */}
                <div className="space-y-1 sm:w-auto w-full">
                  <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider block font-sans">DINING CHANNEL</span>
                  <select
                    id="filter-order-type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl p-2.5 px-3 bg-slate-50/10 font-bold outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/10 transition-colors cursor-pointer w-full"
                  >
                    <option value="All">All channels</option>
                    <option value="dine-in">Dine-In</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                {/* Status select filter */}
                <div className="space-y-1 sm:w-auto w-full">
                  <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider block font-sans">STATUS LOCK</span>
                  <select
                    id="filter-order-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl p-2.5 px-3 bg-slate-50/10 font-bold outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/10 transition-colors cursor-pointer w-full"
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reusable Date Range Filter Picker for Orders */}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              onClear={() => {
                setStartDate('');
                setEndDate('');
              }}
            />
          </div>

          {/* Orders log table */}
          <div className="bg-white rounded-3xl border border-slate-205 shadow-sm overflow-hidden bg-white">
            <div className="px-6 py-5 border-b border-slate-150 bg-slate-50/20 flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <ClipboardList className="h-5 w-5 shrink-0 text-slate-500" />
                <span>Synchronized Order Registers</span>
              </h3>
              <span className="text-xs text-slate-450 font-bold font-mono bg-slate-100 rounded-lg py-1 px-2.5">{orders.length} slips</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {ordersLoading ? (
                <div className="p-16 text-center animate-pulse space-y-4">
                  <div className="h-8 bg-slate-100 rounded-xl w-1/3 mx-auto" />
                  <div className="h-4 bg-slate-100 rounded-xl w-1/2 mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
                  <ClipboardList className="h-10 w-10 text-slate-355 mb-1" />
                  <h4 className="font-bold text-slate-700 text-sm">No orders recorded in this query.</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">Change your filters above, or log a fresh table layout slip in the creator.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div id={`order-log-${order._id}`} key={order._id} className="p-6 hover:bg-slate-50/15 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-extrabold text-slate-900 text-sm">
                          {order.orderType === 'dine-in' ? `${order.tableNumber}` : 'Home Delivery Routing'}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5 border 
                          ${order.orderType === 'dine-in' ? 'bg-[#166534]/5 text-[#166534] border-[#166534]/10' : 'bg-sky-50 text-sky-800 border-sky-100'}
                        `}>
                          {order.orderType}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5 border 
                          ${order.status === 'completed' ? 'bg-[#166534]/5 text-[#166534] border-[#166534]/10' : 
                            order.status === 'cancelled' ? 'bg-slate-100 text-slate-400 border-slate-205' : 'bg-amber-50 text-amber-800 border-amber-100'}
                        `}>
                          {order.status}
                        </span>
                      </div>
                      
                      {order.orderType === 'delivery' && (
                        <p className="text-xs text-slate-500 font-medium">
                          Route: <strong className="text-slate-800">{order.customerName}</strong> | Loc: <strong className="text-slate-750">{order.customerAddress}</strong>
                        </p>
                      )}

                      <div className="text-xs">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Row Items</span>
                        <span className="text-slate-700 font-semibold font-sans">
                          {order.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-bold font-mono bg-slate-50 inline-block px-1.5 py-0.5 rounded-md">
                        Recorded: {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Net Ticket</span>
                        <span className="font-display font-extrabold text-slate-900 text-base mt-0.5 block">Rs. {order.totalAmount}</span>
                      </div>

                      {order.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            id={`btn-complete-order-page-${order._id}`}
                            onClick={() => handleUpdateStatus(order._id, 'completed')}
                            className="p-2 bg-[#166534]/5 text-[#166534] hover:bg-[#166534]/10 rounded-xl text-[10px] font-bold border border-[#166534]/10 flex items-center gap-1 cursor-pointer transition-all transition-colors"
                            title="Verify checkout dues & complete slip"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Complete</span>
                          </button>
                          <button
                            id={`btn-cancel-order-page-${order._id}`}
                            onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100/60 rounded-xl text-[10px] font-bold border border-rose-100 flex items-center gap-1 cursor-pointer transition-all transition-colors"
                            title="Declare cancelled"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}

                      {order.status !== 'pending' && (
                        <button
                          id={`btn-delete-log-order-${order._id}`}
                          onClick={() => handleDeleteOrder(order._id)}
                          className="p-2 text-slate-400 hover:text-rose-700 hover:bg-slate-50 border border-slate-205 rounded-xl transition-all cursor-pointer bg-white"
                          title="Purge record"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
