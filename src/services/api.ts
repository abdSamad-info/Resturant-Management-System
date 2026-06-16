import axios from 'axios';
import { Employee, SalaryHistory, Product, Order, Invoice, DailyReport, MonthlyReport } from '../types';

// Axios dynamic client instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  // --- Employees ---
  getEmployees: async (): Promise<Employee[]> => {
    const res = await api.get<{ success: boolean; data: Employee[] }>('/employees');
    return res.data.data;
  },
  createEmployee: async (data: Omit<Employee, '_id' | 'advanceBalance' | 'currentSalary' | 'isActive'> & { advanceBalance?: number; currentSalary?: number }): Promise<Employee> => {
    const res = await api.post<{ success: boolean; data: Employee }>('/employees', data);
    return res.data.data;
  },
  updateEmployee: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const res = await api.put<{ success: boolean; data: Employee }>(`/employees/${id}`, data);
    return res.data.data;
  },
  deleteEmployee: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean }>(`/employees/${id}`);
    return res.data.success;
  },
  giveAdvance: async (id: string, amount: number): Promise<Employee> => {
    const res = await api.post<{ success: boolean; data: Employee }>(`/employees/${id}/advance`, { amount });
    return res.data.data;
  },
  clearAdvance: async (id: string): Promise<Employee> => {
    const res = await api.post<{ success: boolean; data: Employee }>(`/employees/${id}/pay-deficit`);
    return res.data.data;
  },
  addIncrement: async (id: string, payload: { incrementType: 'fixed' | 'percentage'; incrementValue: number; remarks?: string }): Promise<Employee> => {
    const res = await api.post<{ success: boolean; data: Employee }>(`/employees/${id}/increment`, payload);
    return res.data.data;
  },
  getSalaryHistory: async (id: string): Promise<SalaryHistory[]> => {
    const res = await api.get<{ success: boolean; data: SalaryHistory[] }>(`/employees/${id}/history`);
    return res.data.data;
  },

  // --- Products Menu ---
  getProducts: async (): Promise<Product[]> => {
    const res = await api.get<{ success: boolean; data: Product[] }>('/products');
    return res.data.data;
  },
  createProduct: async (data: Omit<Product, '_id' | 'isAvailable'>): Promise<Product> => {
    const res = await api.post<{ success: boolean; data: Product }>('/products', data);
    return res.data.data;
  },
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const res = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, data);
    return res.data.data;
  },
  deleteProduct: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean }>(`/products/${id}`);
    return res.data.success;
  },

  // --- Orders ---
  getOrders: async (filters?: { date?: string; startDate?: string; endDate?: string; type?: string; status?: string }): Promise<Order[]> => {
    const res = await api.get<{ success: boolean; data: Order[] }>('/orders', { params: filters });
    return res.data.data;
  },
  createOrder: async (data: Omit<Order, '_id' | 'status' | 'createdAt' | 'totalAmount'> & { items: { productId: string; quantity: number }[] }): Promise<Order> => {
    const res = await api.post<{ success: boolean; data: Order }>('/orders', data);
    return res.data.data;
  },
  updateOrderStatus: async (id: string, status: 'pending' | 'completed' | 'cancelled'): Promise<Order> => {
    const res = await api.put<{ success: boolean; data: Order }>(`/orders/${id}`, { status });
    return res.data.data;
  },
  deleteOrder: async (id: string): Promise<boolean> => {
    const res = await api.delete<{ success: boolean }>(`/orders/${id}`);
    return res.data.success;
  },

  // --- Invoices ---
  getInvoices: async (filters?: { search?: string; date?: string }): Promise<Invoice[]> => {
    const res = await api.get<{ success: boolean; data: Invoice[] }>('/invoices', { params: filters });
    return res.data.data;
  },
  getInvoicePdfUrl: (id: string) => `/api/invoices/${id}/pdf`,

  // --- Reports ---
  getDailyReport: async (params: { date?: string; startDate?: string; endDate?: string }): Promise<DailyReport> => {
    const res = await api.get<{ success: boolean; data: DailyReport }>('/reports/daily', { params });
    return res.data.data;
  },
  getMonthlyReport: async (month: string): Promise<MonthlyReport> => {
    const res = await api.get<{ success: boolean; data: MonthlyReport }>('/reports/monthly', { params: { month } });
    return res.data.data;
  },
  getMonthlyPdfUrl: (month: string) => `/api/reports/monthly/pdf?month=${month}`
};
