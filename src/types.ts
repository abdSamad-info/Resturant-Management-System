export interface Employee {
  _id: string;
  name: string;
  phone: string;
  joiningDate?: string;
  salaryType: 'daily' | 'monthly';
  dailyWage?: number;
  monthlySalary?: number;
  category: string;
  advanceBalance: number;
  currentSalary: number;
  isActive: boolean;
}

export interface SalaryHistory {
  _id: string;
  employeeId: string;
  previousSalary: number;
  newSalary: number;
  incrementType: 'percentage' | 'fixed';
  incrementValue: number;
  incrementDate: string;
  remarks: string;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderType: 'dine-in' | 'delivery';
  tableNumber?: string;
  customerName?: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Invoice {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  items: OrderItem[];
  totalAmount: number;
  generatedAt: string;
}

export interface DailyReport {
  date: string;
  salesCount: number;
  totalSales: number;
  wagesPaid: number;
  netProfit: number;
  itemsSold: {
    name: string;
    quantity: number;
    amount: number;
  }[];
}

export interface MonthlyReport {
  month: string;
  totalSales: number;
  totalOrders: number;
  totalWages: number;
  netProfit: number;
  categoriesBreakdown: Record<string, number>;
  salariesPaid: {
    employeeName: string;
    category: string;
    salaryPaid: number;
  }[];
}
