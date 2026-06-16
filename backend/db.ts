import fs from 'fs';
import path from 'path';

// Define DB directory
const DATA_DIR = path.join(process.cwd(), 'backend', 'data');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Typings for our models
export interface Employee {
  _id: string;
  name: string;
  phone: string;
  joiningDate: string;
  salaryType: 'daily' | 'monthly';
  dailyWage?: number;
  monthlySalary?: number;
  category: string; // e.g., Chef, Waiter, Cleaner, Manager
  advanceBalance: number; // total advance taken
  currentSalary: number; // active salary after increments
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
  category: string; // e.g., Main Course, Beverages, Bread, Special
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
  tableNumber?: string; // if dine-in
  customerName?: string; // if delivery
  customerAddress?: string; // if delivery
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Invoice {
  _id: string;
  orderId: string;
  invoiceNumber: string; // e.g., INV-10001
  items: OrderItem[];
  totalAmount: number;
  generatedAt: string;
}

// Low-profile helper to load/save JSON
function readJSON<T>(filename: string, defaultData: T[] = []): T[] {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading database file: ${filename}.json`, error);
    return defaultData;
  }
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing database file: ${filename}.json`, error);
  }
}

// Memory-backed stores for high performance
let employees: Employee[] = [];
let salaryHistory: SalaryHistory[] = [];
let products: Product[] = [];
let orders: Order[] = [];
let invoices: Invoice[] = [];

// Load everything on module load
function loadDB() {
  employees = readJSON<Employee>('employees', []);
  salaryHistory = readJSON<SalaryHistory>('salary_history', []);
  products = readJSON<Product>('products', []);
  orders = readJSON<Order>('orders', []);
  invoices = readJSON<Invoice>('invoices', []);

  // Seed default data if database is brand new and empty
  if (products.length === 0) {
    seedData();
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function seedData() {
  // 1. Seed Products
  const seedProducts: Product[] = [
    { _id: generateId(), name: 'Chicken Karahi (Full)', category: 'Main Course', price: 1200, description: 'Traditional spicy chicken karahi with green chilies', isAvailable: true },
    { _id: generateId(), name: 'Daal Makhni', category: 'Main Course', price: 350, description: 'Creamy black lentils slow-cooked overnight', isAvailable: true },
    { _id: generateId(), name: 'Mixed Sabzi', category: 'Main Course', price: 300, description: 'Assorted seasonal vegetables cooked in aromatic spices', isAvailable: true },
    { _id: generateId(), name: 'Special Mutton Biryani', category: 'Main Course', price: 650, description: 'Premium fragrant basmati rice with tender succulent mutton', isAvailable: true },
    { _id: generateId(), name: 'Roti / Tandoori Roti', category: 'Bread', price: 20, description: 'Whole wheat flatbread baked in tandoor', isAvailable: true },
    { _id: generateId(), name: 'Garlic Naan', category: 'Bread', price: 80, description: 'Tandoori naan topped with butter and minced fresh garlic', isAvailable: true },
    { _id: generateId(), name: 'Sada Naan', category: 'Bread', price: 40, description: 'Soft tandoori flatbread', isAvailable: true },
    { _id: generateId(), name: 'Mint Raita', category: 'Special', price: 80, description: 'Yogurt dip infused with mint and cumin', isAvailable: true },
    { _id: generateId(), name: 'Fresh Green Salad', category: 'Special', price: 100, description: 'Freshly sliced cucumbers, tomatoes, and onions', isAvailable: true },
    { _id: generateId(), name: 'Zarda (Sweet Rice)', category: 'Special', price: 250, description: 'Traditional yellow sweet rice with dry fruits', isAvailable: true },
    { _id: generateId(), name: 'Mineral Water (Large)', category: 'Beverages', price: 120, description: 'Chilled premium spring water', isAvailable: true },
    { _id: generateId(), name: 'Soft Drink (Can)', category: 'Beverages', price: 100, description: 'Assorted soft beverages', isAvailable: true },
    { _id: generateId(), name: 'Special Lassi', category: 'Beverages', price: 180, description: 'Rejuvenating sweet yogurt beverage served chilled', isAvailable: true }
  ];
  products = seedProducts;
  writeJSON('products', products);

  // 2. Seed Employees
  const chefId = generateId();
  const waiter1Id = generateId();
  const waiter2Id = generateId();
  const managerId = generateId();

  const seedEmployees: Employee[] = [
    {
      _id: chefId,
      name: 'Muhammad Ali',
      phone: '+923001234567',
      joiningDate: '2025-01-10',
      salaryType: 'monthly',
      monthlySalary: 45000,
      currentSalary: 45000,
      category: 'Chef',
      advanceBalance: 5000,
      isActive: true
    },
    {
      _id: waiter1Id,
      name: 'Sajid Khan',
      phone: '+923129876543',
      joiningDate: '2025-03-15',
      salaryType: 'daily',
      dailyWage: 800,
      currentSalary: 800,
      category: 'Waiter',
      advanceBalance: 1500,
      isActive: true
    },
    {
      _id: waiter2Id,
      name: 'Yousuf Raza',
      phone: '+923214567890',
      joiningDate: '2025-04-01',
      salaryType: 'daily',
      dailyWage: 800,
      currentSalary: 800,
      category: 'Waiter',
      advanceBalance: 0,
      isActive: true
    },
    {
      _id: managerId,
      name: 'Farhan Sheikh',
      phone: '+923335551212',
      joiningDate: '2024-11-01',
      salaryType: 'monthly',
      monthlySalary: 60000,
      currentSalary: 60000,
      category: 'Manager',
      advanceBalance: 10000,
      isActive: true
    }
  ];
  employees = seedEmployees;
  writeJSON('employees', employees);

  // 3. Seed SalaryHistory
  const seedSalaryHistory: SalaryHistory[] = [
    {
      _id: generateId(),
      employeeId: chefId,
      previousSalary: 40000,
      newSalary: 45000,
      incrementType: 'fixed',
      incrementValue: 5000,
      incrementDate: '2026-02-01',
      remarks: 'Superb customer reviews on Biryani and Karahi'
    },
    {
      _id: generateId(),
      employeeId: waiter1Id,
      previousSalary: 730,
      newSalary: 800,
      incrementType: 'percentage',
      incrementValue: 10,
      incrementDate: '2026-05-01',
      remarks: 'Standard annual increment'
    }
  ];
  salaryHistory = seedSalaryHistory;
  writeJSON('salary_history', salaryHistory);

  // 4. Seed Orders
  const order1Id = generateId();
  const order2Id = generateId();
  const order3Id = generateId();

  // Pick some product matches
  const p1 = products[0]; // Karahi (1200)
  const p2 = products[4]; // Roti (20)
  const p3 = products[11]; // Coke (100)
  const p4 = products[3]; // Biryani (650)
  const p5 = products[12]; // Lassi (180)

  const seedOrders: Order[] = [
    {
      _id: order1Id,
      orderType: 'dine-in',
      tableNumber: 'Table 4',
      items: [
        { productId: p1._id, productName: p1.name, quantity: 1, unitPrice: p1.price, subtotal: p1.price * 1 },
        { productId: p2._id, productName: p2.name, quantity: 4, unitPrice: p2.price, subtotal: p2.price * 4 },
        { productId: p3._id, productName: p3.name, quantity: 2, unitPrice: p3.price, subtotal: p3.price * 2 }
      ],
      totalAmount: 1480,
      status: 'completed',
      createdAt: '2026-06-15T14:30:00Z'
    },
    {
      _id: order2Id,
      orderType: 'delivery',
      customerName: 'Zain Ashraf',
      customerAddress: 'House 54, Sector G-11, Islamabad',
      items: [
        { productId: p4._id, productName: p4.name, quantity: 2, unitPrice: p4.price, subtotal: p4.price * 2 },
        { productId: p5._id, productName: p5.name, quantity: 2, unitPrice: p5.price, subtotal: p5.price * 2 }
      ],
      totalAmount: 1660,
      status: 'completed',
      createdAt: '2026-06-15T19:45:00Z'
    },
    {
      _id: order3Id,
      orderType: 'dine-in',
      tableNumber: 'Table 1',
      items: [
        { productId: p1._id, productName: p1.name, quantity: 1, unitPrice: p1.price, subtotal: p1.price * 1 },
        { productId: p2._id, productName: p2.name, quantity: 2, unitPrice: p2.price, subtotal: p2.price * 2 }
      ],
      totalAmount: 1240,
      status: 'pending',
      createdAt: '2026-06-16T12:00:00Z' // Today
    }
  ];
  orders = seedOrders;
  writeJSON('orders', orders);

  // 5. Seed Invoices
  const seedInvoices: Invoice[] = [
    {
      _id: generateId(),
      orderId: order1Id,
      invoiceNumber: 'INV-10001',
      items: seedOrders[0].items,
      totalAmount: seedOrders[0].totalAmount,
      generatedAt: '2026-06-15T14:35:00Z'
    },
    {
      _id: generateId(),
      orderId: order2Id,
      invoiceNumber: 'INV-10002',
      items: seedOrders[1].items,
      totalAmount: seedOrders[1].totalAmount,
      generatedAt: '2026-06-15T19:50:00Z'
    }
  ];
  invoices = seedInvoices;
  writeJSON('invoices', invoices);

  console.log('Database seeded successfully!');
}

loadDB();

// Atomic persistence operations with high-fidelity Mongoose feel
export const db = {
  getEmployees: () => employees,
  getEmployeeById: (id: string) => employees.find(e => e._id === id),
  createEmployee: (data: Omit<Employee, '_id' | 'advanceBalance' | 'currentSalary' | 'isActive'> & { advanceBalance?: number; currentSalary?: number; isActive?: boolean }) => {
    const fresh: Employee = {
      ...data,
      _id: generateId(),
      advanceBalance: data.advanceBalance ?? 0,
      currentSalary: data.currentSalary ?? (data.salaryType === 'monthly' ? (data.monthlySalary ?? 0) : (data.dailyWage ?? 0)),
      isActive: data.isActive ?? true
    };
    employees.push(fresh);
    writeJSON('employees', employees);
    return fresh;
  },
  updateEmployee: (id: string, data: Partial<Employee>) => {
    const idx = employees.findIndex(e => e._id === id);
    if (idx === -1) return null;
    employees[idx] = { ...employees[idx], ...data };
    writeJSON('employees', employees);
    return employees[idx];
  },
  deleteEmployee: (id: string) => {
    const originalLength = employees.length;
    employees = employees.filter(e => e._id !== id);
    if (employees.length !== originalLength) {
      writeJSON('employees', employees);
      return true;
    }
    return false;
  },

  getSalaryHistory: () => salaryHistory,
  getSalaryHistoryByEmployeeId: (empId: string) => salaryHistory.filter(s => s.employeeId === empId),
  createSalaryHistory: (data: Omit<SalaryHistory, '_id'>) => {
    const fresh: SalaryHistory = {
      ...data,
      _id: generateId()
    };
    salaryHistory.push(fresh);
    writeJSON('salary_history', salaryHistory);
    return fresh;
  },

  getProducts: () => products,
  getProductById: (id: string) => products.find(p => p._id === id),
  createProduct: (data: Omit<Product, '_id' | 'isAvailable'> & { isAvailable?: boolean }) => {
    const fresh: Product = {
      ...data,
      _id: generateId(),
      isAvailable: data.isAvailable ?? true
    };
    products.push(fresh);
    writeJSON('products', products);
    return fresh;
  },
  updateProduct: (id: string, data: Partial<Product>) => {
    const idx = products.findIndex(p => p._id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data };
    writeJSON('products', products);
    return products[idx];
  },
  deleteProduct: (id: string) => {
    const originalLength = products.length;
    products = products.filter(p => p._id !== id);
    if (products.length !== originalLength) {
      writeJSON('products', products);
      return true;
    }
    return false;
  },

  getOrders: () => orders,
  getOrderById: (id: string) => orders.find(o => o._id === id),
  createOrder: (data: Omit<Order, '_id' | 'status' | 'createdAt'> & { status?: 'pending' | 'completed' | 'cancelled'; createdAt?: string }) => {
    const fresh: Order = {
      ...data,
      _id: generateId(),
      status: data.status ?? 'pending',
      createdAt: data.createdAt ?? new Date().toISOString()
    };
    orders.push(fresh);
    writeJSON('orders', orders);

    // If order is completed, auto-generate invoice
    if (fresh.status === 'completed') {
      db.createInvoiceForOrder(fresh);
    }

    return fresh;
  },
  updateOrder: (id: string, data: Partial<Order>) => {
    const idx = orders.findIndex(o => o._id === id);
    if (idx === -1) return null;
    
    const wasCompleted = orders[idx].status === 'completed';
    orders[idx] = { ...orders[idx], ...data };
    writeJSON('orders', orders);

    // Auto generate invoice if transitioning to completed
    if (orders[idx].status === 'completed' && !wasCompleted) {
      db.createInvoiceForOrder(orders[idx]);
    }

    return orders[idx];
  },
  deleteOrder: (id: string) => {
    const originalLength = orders.length;
    orders = orders.filter(o => o._id !== id);
    if (orders.length !== originalLength) {
      writeJSON('orders', orders);
      return true;
    }
    return false;
  },

  getInvoices: () => invoices,
  getInvoiceById: (id: string) => invoices.find(i => i._id === id),
  getInvoiceByOrderId: (orderId: string) => invoices.find(i => i.orderId === orderId),
  createInvoiceForOrder: (order: Order) => {
    // Check if invoice already exists
    const existing = invoices.find(i => i.orderId === order._id);
    if (existing) return existing;

    const count = invoices.length + 10001; // sequential invoice numbers
    const fresh: Invoice = {
      _id: generateId(),
      orderId: order._id,
      invoiceNumber: `INV-${count}`,
      items: order.items,
      totalAmount: order.totalAmount,
      generatedAt: new Date().toISOString()
    };
    invoices.push(fresh);
    writeJSON('invoices', invoices);
    return fresh;
  }
};
