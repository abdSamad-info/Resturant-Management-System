# 🍃 MongoDB Integration Guide

This guide provides step-by-step instructions and a fully crafted, drop-in replacement file to transition this application from the current file-based JSON database to a persistent MongoDB database using **Mongoose ODM**.

---

## 🛠️ Step 1: Install Mongoose Packages

Once you download this project locally, run the following command in your terminal to install mongoose and its TypeScript definitions:

```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

And configure your local connection string in your `.env` file:

```env
MONGODB_URI="mongodb://localhost:27017/green_bistro"
```

---

## 💾 Step 2: Swap the Database Manager

Replace the content of `/backend/db.ts` with the fully compatible Mongoose-configured version below. This preserves all existing schema attributes, IDs, and CRUD operational helper signatures so that **no changes** are required on any of your routes or frontend pages!

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/green_bistro';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 Connected to MongoDB successfully.'))
  .catch((err) => console.error('❌ Failed to connect to MongoDB:', err));

// ============================================================================
// Schemas and TS Definitions
// ============================================================================

export interface Employee {
  _id: string;
  name: string;
  phone: string;
  joiningDate: string;
  salaryType: 'daily' | 'monthly';
  dailyWage?: number;
  monthlySalary?: number;
  category: string;
  advanceBalance: number;
  currentSalary: number;
  isActive: boolean;
}

const EmployeeSchema = new Schema<Employee>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  joiningDate: { type: String, required: true },
  salaryType: { type: String, enum: ['daily', 'monthly'], required: true },
  dailyWage: { type: Number },
  monthlySalary: { type: Number },
  category: { type: String, required: true },
  advanceBalance: { type: Number, default: 0 },
  currentSalary: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

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

const SalaryHistorySchema = new Schema<SalaryHistory>({
  employeeId: { type: String, required: true },
  previousSalary: { type: Number, required: true },
  newSalary: { type: Number, required: true },
  incrementType: { type: String, enum: ['percentage', 'fixed'], required: true },
  incrementValue: { type: Number, required: true },
  incrementDate: { type: String, required: true },
  remarks: { type: String, required: true }
}, { timestamps: true });

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}

const ProductSchema = new Schema<Product>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

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

const OrderSchema = new Schema<Order>({
  orderType: { type: String, enum: ['dine-in', 'delivery'], required: true },
  tableNumber: { type: String },
  customerName: { type: String },
  customerAddress: { type: String },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export interface Invoice {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  items: OrderItem[];
  totalAmount: number;
  generatedAt: string;
}

const InvoiceSchema = new Schema<Invoice>({
  orderId: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  generatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// Mongoose Models
const EmployeeModel = mongoose.model<Employee>('Employee', EmployeeSchema);
const SalaryHistoryModel = mongoose.model<SalaryHistory>('SalaryHistory', SalaryHistorySchema);
const ProductModel = mongoose.model<Product>('Product', ProductSchema);
const OrderModel = mongoose.model<Order>('Order', OrderSchema);
const InvoiceModel = mongoose.model<Invoice>('Invoice', InvoiceSchema);

// ============================================================================
// Consolidated Database Controller
// ============================================================================

export const db = {
  // --- Employees ---
  getEmployees: async () => {
    return await EmployeeModel.find();
  },
  getEmployeeById: async (id: string) => {
    return await EmployeeModel.findById(id);
  },
  createEmployee: async (data: any) => {
    const currentSalary = data.currentSalary ?? (data.salaryType === 'monthly' ? (data.monthlySalary ?? 0) : (data.dailyWage ?? 0));
    const emp = new EmployeeModel({ ...data, currentSalary });
    return await emp.save();
  },
  updateEmployee: async (id: string, data: any) => {
    return await EmployeeModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteEmployee: async (id: string) => {
    const res = await EmployeeModel.findByIdAndDelete(id);
    return !!res;
  },

  // --- Salary History ---
  getSalaryHistory: async () => {
    return await SalaryHistoryModel.find();
  },
  getSalaryHistoryByEmployeeId: async (empId: string) => {
    return await SalaryHistoryModel.find({ employeeId: empId });
  },
  createSalaryHistory: async (data: any) => {
    const sh = new SalaryHistoryModel(data);
    return await sh.save();
  },

  // --- Products ---
  getProducts: async () => {
    return await ProductModel.find();
  },
  getProductById: async (id: string) => {
    return await ProductModel.findById(id);
  },
  createProduct: async (data: any) => {
    const prod = new ProductModel(data);
    return await prod.save();
  },
  updateProduct: async (id: string, data: any) => {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteProduct: async (id: string) => {
    const res = await ProductModel.findByIdAndDelete(id);
    return !!res;
  },

  // --- Orders ---
  getOrders: async () => {
    return await OrderModel.find().sort({ createdAt: -1 });
  },
  getOrderById: async (id: string) => {
    return await OrderModel.findById(id);
  },
  createOrder: async (data: any) => {
    const order = new OrderModel(data);
    const saved = await order.save();
    if (saved.status === 'completed') {
      await db.createInvoiceForOrder(saved);
    }
    return saved;
  },
  updateOrder: async (id: string, data: any) => {
    const oldOrder = await OrderModel.findById(id);
    const updated = await OrderModel.findByIdAndUpdate(id, data, { new: true });
    if (oldOrder && updated && oldOrder.status !== 'completed' && updated.status === 'completed') {
      await db.createInvoiceForOrder(updated);
    }
    return updated;
  },
  deleteOrder: async (id: string) => {
    const res = await OrderModel.findByIdAndDelete(id);
    return !!res;
  },

  // --- Invoices & Auto Generation ---
  getInvoices: async () => {
    return await InvoiceModel.find().sort({ generatedAt: -1 });
  },
  getInvoiceByOrderId: async (orderId: string) => {
    return await InvoiceModel.findOne({ orderId });
  },
  createInvoiceForOrder: async (order: Order) => {
    const count = await InvoiceModel.countDocuments();
    const invoiceNumber = `INV-${10001 + count}`;
    const invoice = new InvoiceModel({
      orderId: order._id,
      invoiceNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      generatedAt: new Date().toISOString()
    });
    return await invoice.save();
  }
};
```

---

## ⚡ Done!
Your application is now prepared for clean enterprise-level deployments with persistent datastores. 
Enjoy codecrafting! 🚀
