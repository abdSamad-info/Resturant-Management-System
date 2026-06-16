import { Router, Request, Response, NextFunction } from 'express';
import { db, Employee, Product, Order, Invoice } from './db';
import { cache, invalidateCachePrefix } from './utils/cache';
import { AppError } from './utils/AppError';
import { generateInvoicePDF, generateMonthlyReportPDF } from './utils/pdfGenerator';

export const apiRouter = Router();

// GET /api/backup -> Expose interactive database backups download
apiRouter.get('/backup', (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataSnap = {
      employees: db.getEmployees(),
      salaryHistory: db.getSalaryHistory(),
      products: db.getProducts(),
      orders: db.getOrders(),
      invoices: db.getInvoices(),
      exportedAt: new Date().toISOString()
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=bistro-database-backup.json');
    res.json(dataSnap);
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 1. Employee Management Routes
// ============================================================================

// GET /api/employees -> List all staff members
apiRouter.get('/employees', (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = db.getEmployees();
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

// POST /api/employees -> Create a new employee
apiRouter.post('/employees', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, joiningDate, salaryType, dailyWage, monthlySalary, category } = req.body;

    // Advanced input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return next(new AppError('A valid employee name is required.', 400));
    }
    if (!phone || typeof phone !== 'string') {
      return next(new AppError('Employee phone number is required.', 400));
    }
    if (!category || typeof category !== 'string') {
      return next(new AppError('A valid work category (e.g., Chef, Waiter) is required.', 400));
    }
    if (!['daily', 'monthly'].includes(salaryType)) {
      return next(new AppError('Salary type must be either "daily" or "monthly".', 400));
    }

    let resolvedSalary = 0;
    if (salaryType === 'daily') {
      const wage = Number(dailyWage);
      if (isNaN(wage) || wage <= 0) {
        return next(new AppError('Daily wage must be a positive number.', 400));
      }
      resolvedSalary = wage;
    } else {
      const sal = Number(monthlySalary);
      if (isNaN(sal) || sal <= 0) {
        return next(new AppError('Monthly salary must be a positive number.', 400));
      }
      resolvedSalary = sal;
    }

    const employee = db.createEmployee({
      name: name.trim(),
      phone: phone.trim(),
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      salaryType,
      dailyWage: salaryType === 'daily' ? resolvedSalary : undefined,
      monthlySalary: salaryType === 'monthly' ? resolvedSalary : undefined,
      category: category.trim(),
      advanceBalance: 0,
      currentSalary: resolvedSalary,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully.',
      data: employee
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/employees/:id -> Update employee profile
apiRouter.put('/employees/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, category, isActive, salaryType, dailyWage, monthlySalary } = req.body;

    const emp = db.getEmployeeById(id);
    if (!emp) {
      return next(new AppError('Employee record not found.', 404));
    }

    const updates: Partial<Employee> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (category !== undefined) updates.category = category;
    if (isActive !== undefined) updates.isActive = !!isActive;

    if (salaryType !== undefined) {
      if (!['daily', 'monthly'].includes(salaryType)) {
        return next(new AppError('Invalid salary type.', 400));
      }
      updates.salaryType = salaryType;
    }

    // Standard Wage adjustments
    if (dailyWage !== undefined && emp.salaryType === 'daily') {
      const val = Number(dailyWage);
      if (!isNaN(val) && val > 0) {
        updates.dailyWage = val;
        updates.currentSalary = val;
      }
    }
    if (monthlySalary !== undefined && emp.salaryType === 'monthly') {
      const val = Number(monthlySalary);
      if (!isNaN(val) && val > 0) {
        updates.monthlySalary = val;
        updates.currentSalary = val;
      }
    }

    const updated = db.updateEmployee(id, updates);
    res.json({
      success: true,
      message: 'Employee updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/employees/:id -> Delete employee
apiRouter.delete('/employees/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const success = db.deleteEmployee(id);
    if (!success) {
      return next(new AppError('Employee record not found.', 404));
    }
    res.json({
      success: true,
      message: 'Employee record purged from registry.'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/employees/:id/advance -> Give an advance loan to an employee
apiRouter.post('/employees/:id/advance', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body.amount);

    if (isNaN(amount) || amount <= 0) {
      return next(new AppError('Specify a positive advance amount.', 400));
    }

    const emp = db.getEmployeeById(id);
    if (!emp) {
      return next(new AppError('Employee record not found.', 404));
    }

    const updatedBalance = emp.advanceBalance + amount;
    const updated = db.updateEmployee(id, { advanceBalance: updatedBalance });

    res.json({
      success: true,
      message: `Successfully advanced Rs. ${amount} to ${emp.name}. Deficit registered.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/employees/:id/pay-deficit -> Clear an employee's advance (settle balance manually)
apiRouter.post('/employees/:id/pay-deficit', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const emp = db.getEmployeeById(id);
    if (!emp) {
      return next(new AppError('Employee record not found.', 404));
    }

    const updated = db.updateEmployee(id, { advanceBalance: 0 });
    res.json({
      success: true,
      message: `Advance balance for ${emp.name} cleared successfully.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/employees/:id/increment -> Record a salary increment inside SalaryHistory
apiRouter.post('/employees/:id/increment', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { incrementType, incrementValue, remarks } = req.body;

    const emp = db.getEmployeeById(id);
    if (!emp) {
      return next(new AppError('Employee record not found.', 404));
    }

    const val = Number(incrementValue);
    if (isNaN(val) || val <= 0) {
      return next(new AppError('Increment value must be a positive number.', 400));
    }

    if (!['fixed', 'percentage'].includes(incrementType)) {
      return next(new AppError('Increment type must be "fixed" or "percentage".', 400));
    }

    const originalSalary = emp.currentSalary;
    let newSalary = originalSalary;

    if (incrementType === 'fixed') {
      newSalary = originalSalary + val;
    } else {
      newSalary = Math.round(originalSalary * (1 + val / 100));
    }

    // Save increment entry in history
    db.createSalaryHistory({
      employeeId: id,
      previousSalary: originalSalary,
      newSalary,
      incrementType,
      incrementValue: val,
      incrementDate: new Date().toISOString().split('T')[0],
      remarks: remarks || 'Annual performance increment'
    });

    // Update active salary of employee
    const updated = db.updateEmployee(id, {
      currentSalary: newSalary,
      ...(emp.salaryType === 'monthly' ? { monthlySalary: newSalary } : { dailyWage: newSalary })
    });

    res.json({
      success: true,
      message: `Salary successfully incremented from Rs. ${originalSalary} to Rs. ${newSalary}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/employees/:id/history -> View increment history
apiRouter.get('/employees/:id/history', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const history = db.getSalaryHistoryByEmployeeId(id);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});


// ============================================================================
// 2. Product Management Routes (with cache TTL of 6 minutes)
// ============================================================================

// GET /api/products -> Fetch menu (caching active)
apiRouter.get('/products', (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'products_all';
    const cachedProducts = cache.get<Product[]>(cacheKey);

    if (cachedProducts) {
      return res.json({ success: true, data: cachedProducts, cached: true });
    }

    const fresh = db.getProducts();
    cache.set(cacheKey, fresh); // automatically cached for 6 mins
    res.json({ success: true, data: fresh, cached: false });
  } catch (error) {
    next(error);
  }
});

// POST /api/products -> Add food item (invalidates cache)
apiRouter.post('/products', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, price, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return next(new AppError('A valid product name is required.', 400));
    }
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return next(new AppError('A product category is required.', 400));
    }
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return next(new AppError('Menu price must be a positive amount.', 400));
    }

    const fresh = db.createProduct({
      name: name.trim(),
      category: category.trim(),
      price: parsedPrice,
      description: description ? description.trim() : '',
      isAvailable: true
    });

    // Invalidate product caches
    invalidateCachePrefix('products_all');

    res.status(201).json({
      success: true,
      message: 'Product added to the menu.',
      data: fresh
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id -> Edit product (invalidates cache)
apiRouter.put('/products/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, isAvailable } = req.body;

    const prod = db.getProductById(id);
    if (!prod) {
      return next(new AppError('Menu item not found.', 404));
    }

    const updates: Partial<Product> = {};
    if (name !== undefined) updates.name = name.trim();
    if (category !== undefined) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (isAvailable !== undefined) updates.isAvailable = !!isAvailable;

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return next(new AppError('Menu price must be a positive amount.', 400));
      }
      updates.price = parsedPrice;
    }

    const updated = db.updateProduct(id, updates);
    invalidateCachePrefix('products_all');

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id -> Remove menu item (invalidates cache)
apiRouter.delete('/products/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const success = db.deleteProduct(id);
    if (!success) {
      return next(new AppError('Menu item not found.', 404));
    }
    invalidateCachePrefix('products_all');
    res.json({
      success: true,
      message: 'Product permanently deleted from the menu.'
    });
  } catch (error) {
    next(error);
  }
});


// ============================================================================
// 3. Order Management Routes
// ============================================================================

// GET /api/orders -> List orders (date, type, and status filtering)
apiRouter.get('/orders', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, startDate, endDate, type, status } = req.query;
    let list = db.getOrders();

    // Date Filter (YYYY-MM-DD format)
    if (date) {
      const target = String(date);
      list = list.filter((order) => {
        const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDateStr === target;
      });
    }

    // Date Range Filter (startDate & endDate YYYY-MM-DD format)
    if (startDate || endDate) {
      const start = startDate ? String(startDate) : '';
      const end = endDate ? String(endDate) : '';
      list = list.filter((order) => {
        const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
        if (start && end) {
          return orderDateStr >= start && orderDateStr <= end;
        } else if (start) {
          return orderDateStr >= start;
        } else if (end) {
          return orderDateStr <= end;
        }
        return true;
      });
    }

    // Order Type Filter
    if (type) {
      list = list.filter((order) => order.orderType === type);
    }

    // Status Filter
    if (status) {
      list = list.filter((order) => order.status === status);
    }

    // Sort descending of creation
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders -> Place a new order
apiRouter.post('/orders', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderType, tableNumber, customerName, customerAddress, items } = req.body;

    if (!['dine-in', 'delivery'].includes(orderType)) {
      return next(new AppError('Order type must be "dine-in" or "delivery".', 400));
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Order must contain at least one items row.', 400));
    }

    // Validate details depending on order type
    if (orderType === 'dine-in' && !tableNumber) {
      return next(new AppError('Table number is required for dine-in orders.', 400));
    }
    if (orderType === 'delivery' && !customerName) {
      return next(new AppError('Customer name is required for delivery orders.', 400));
    }

    // Validate and structure items
    let calculatedTotal = 0;
    const validatedItems = items.map((row: any) => {
      const prod = db.getProductById(row.productId);
      if (!prod) {
        throw new AppError(`Item "${row.productName || 'unknown'}" is not in the menu registry.`, 400);
      }
      const qty = Number(row.quantity);
      if (isNaN(qty) || qty <= 0) {
        throw new AppError(`Invalid units count for product ${prod.name}`, 400);
      }
      const subtotal = prod.price * qty;
      calculatedTotal += subtotal;

      return {
        productId: prod._id,
        productName: prod.name,
        quantity: qty,
        unitPrice: prod.price,
        subtotal
      };
    });

    const freshOrder = db.createOrder({
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      customerName: orderType === 'delivery' ? customerName : undefined,
      customerAddress: orderType === 'delivery' ? customerAddress : undefined,
      items: validatedItems,
      totalAmount: calculatedTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: freshOrder
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id -> Update order status (completion, cancel)
apiRouter.put('/orders/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, tableNumber, customerName, customerAddress } = req.body;

    const ord = db.getOrderById(id);
    if (!ord) {
      return next(new AppError('Order details not found.', 404));
    }

    const updates: Partial<Order> = {};
    if (status) {
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        return next(new AppError('Invalid order status.', 400));
      }
      updates.status = status;
    }
    if (tableNumber !== undefined && ord.orderType === 'dine-in') updates.tableNumber = tableNumber;
    if (customerName !== undefined && ord.orderType === 'delivery') updates.customerName = customerName;
    if (customerAddress !== undefined && ord.orderType === 'delivery') updates.customerAddress = customerAddress;

    const updated = db.updateOrder(id, updates);
    res.json({
      success: true,
      message: `Order marked as ${status || 'updated'}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id -> Cancel / delete order
apiRouter.delete('/orders/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const success = db.deleteOrder(id);
    if (!success) {
      return next(new AppError('Order not found.', 404));
    }
    res.json({
      success: true,
      message: 'Order discarded.'
    });
  } catch (error) {
    next(error);
  }
});


// ============================================================================
// 4. Invoice Management Routes
// ============================================================================

// GET /api/invoices -> List invoices (search, date range filters)
apiRouter.get('/invoices', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, date } = req.query;
    let list = db.getInvoices();

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((inv) => inv.invoiceNumber.toLowerCase().includes(q));
    }

    if (date) {
      const target = String(date);
      list = list.filter((inv) => inv.generatedAt.split('T')[0] === target);
    }

    // Sort descending of creation
    list.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id/pdf -> Stream high fidelity PDF receipt
apiRouter.get('/invoices/:id/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const invoice = db.getInvoiceById(id);
    if (!invoice) {
      return next(new AppError('No invoice found matching ID.', 404));
    }

    const order = db.getOrderById(invoice.orderId);
    if (!order) {
      return next(new AppError('Linked order record is missing.', 404));
    }

    const pdfBuffer = await generateInvoicePDF(invoice, order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
});


// ============================================================================
// 5. Reports & Analytics Routes
// ============================================================================

// GET /api/reports/daily -> Daily performance summary (supports single date or date range intervals)
apiRouter.get('/reports/daily', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, startDate, endDate } = req.query;
    const selectedDate = String(date || new Date().toISOString().split('T')[0]);

    // Gather completed orders
    const allOrders = db.getOrders();
    let targetOrders = [];

    if (startDate || endDate) {
      const start = startDate ? String(startDate) : '';
      const end = endDate ? String(endDate) : '';
      targetOrders = allOrders.filter((o) => {
        const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        const inStatus = o.status === 'completed';
        if (!inStatus) return false;
        
        if (start && end) {
          return orderDateStr >= start && orderDateStr <= end;
        } else if (start) {
          return orderDateStr >= start;
        } else if (end) {
          return orderDateStr <= end;
        }
        return true;
      });
    } else {
      targetOrders = allOrders.filter((o) => {
        const orderDateStr = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDateStr === selectedDate && o.status === 'completed';
      });
    }

    // Sub-aggregates
    let totalSaleAmount = 0;
    const itemsSoldBreakdown: Record<string, { quantity: number; amount: number }> = {};

    targetOrders.forEach((o) => {
      totalSaleAmount += o.totalAmount;
      o.items.forEach((item) => {
        if (!itemsSoldBreakdown[item.productName]) {
          itemsSoldBreakdown[item.productName] = { quantity: 0, amount: 0 };
        }
        itemsSoldBreakdown[item.productName].quantity += item.quantity;
        itemsSoldBreakdown[item.productName].amount += item.subtotal;
      });
    });

    // 1. Employee wages paid that day (Sum of active daily wager employees daily wage)
    const activeStaff = db.getEmployees().filter((e) => e.isActive);
    let wagesPaidSingleDay = 0;
    
    activeStaff.forEach((e) => {
      if (e.salaryType === 'daily' && e.dailyWage) {
        wagesPaidSingleDay += e.dailyWage;
      }
    });

    // Calculate days count if range was passed
    let daysCount = 1;
    if (startDate && endDate) {
      const startT = new Date(String(startDate)).getTime();
      const endT = new Date(String(endDate)).getTime();
      const diffMs = endT - startT;
      if (!isNaN(diffMs) && diffMs >= 0) {
        daysCount = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const wagesPaidPeriod = wagesPaidSingleDay * daysCount;
    const netProfit = totalSaleAmount - wagesPaidPeriod;

    res.json({
      success: true,
      data: {
        date: startDate && endDate ? `${startDate} to ${endDate}` : selectedDate,
        salesCount: targetOrders.length,
        totalSales: totalSaleAmount,
        wagesPaid: wagesPaidPeriod,
        netProfit,
        itemsSold: Object.keys(itemsSoldBreakdown).map((name) => ({
          name,
          quantity: itemsSoldBreakdown[name].quantity,
          amount: itemsSoldBreakdown[name].amount
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/monthly -> Monthly general ledger metrics
apiRouter.get('/reports/monthly', (req: Request, res: Response, next: NextFunction) => {
  try {
    const monthYear = String(req.query.month || new Date().toISOString().substring(0, 7)); // e.g. "2026-06"

    const allOrders = db.getOrders();
    const targetOrders = allOrders.filter((o) => {
      return o.createdAt.startsWith(monthYear) && o.status === 'completed';
    });

    // Quantize revenue and item counts by category
    let totalRevenue = 0;
    const productsByCategory: Record<string, number> = {};

    targetOrders.forEach((ord) => {
      totalRevenue += ord.totalAmount;
      ord.items.forEach((item) => {
        // Find product category helper
        const prod = db.getProductById(item.productId);
        const category = prod ? prod.category : 'Miscellaneous';
        
        productsByCategory[category] = (productsByCategory[category] || 0) + item.quantity;
      });
    });

    // Track employee salaries paid this month:
    // Defined as: for monthly, monthlySalary - advanceBalance
    // For daily wagers: we estimate 26 paid working days for monthly reports, or count days. Let's use simple standard computed salary payout.
    const allStaff = db.getEmployees();
    const salariesLedger: { employeeName: string; category: string; salaryPaid: number }[] = [];
    let totalSalariesPaid = 0;

    allStaff.forEach((e) => {
      if (e.isActive) {
        let earned = 0;
        if (e.salaryType === 'monthly') {
          // currentMonthly - advance deficit
          earned = Math.max(0, e.currentSalary - e.advanceBalance);
        } else if (e.salaryType === 'daily') {
          // Estimated average 26 active working days
          earned = (e.currentSalary) * 26;
        }
        
        totalSalariesPaid += earned;
        salariesLedger.push({
          employeeName: e.name,
          category: e.category,
          salaryPaid: earned
        });
      }
    });

    const netProfit = totalRevenue - totalSalariesPaid;

    res.json({
      success: true,
      data: {
        month: monthYear,
        totalSales: totalRevenue,
        totalOrders: targetOrders.length,
        totalWages: totalSalariesPaid,
        netProfit,
        categoriesBreakdown: productsByCategory,
        salariesPaid: salariesLedger
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/monthly/pdf -> Download Monthly PDF ledger file
apiRouter.get('/reports/monthly/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const monthYear = String(req.query.month || new Date().toISOString().substring(0, 7)); // e.g. "2026-06"

    const allOrders = db.getOrders();
    const targetOrders = allOrders.filter((o) => {
      return o.createdAt.startsWith(monthYear) && o.status === 'completed';
    });

    let totalRevenue = 0;
    const productsByCategory: Record<string, number> = {};

    targetOrders.forEach((ord) => {
      totalRevenue += ord.totalAmount;
      ord.items.forEach((item) => {
        const prod = db.getProductById(item.productId);
        const category = prod ? prod.category : 'Miscellaneous';
        productsByCategory[category] = (productsByCategory[category] || 0) + item.quantity;
      });
    });

    const allStaff = db.getEmployees();
    const salariesLedger: { employeeName: string; category: string; salaryPaid: number }[] = [];
    let totalSalariesPaid = 0;

    allStaff.forEach((e) => {
      if (e.isActive) {
        let earned = 0;
        if (e.salaryType === 'monthly') {
          earned = Math.max(0, e.currentSalary - e.advanceBalance);
        } else if (e.salaryType === 'daily') {
          earned = (e.currentSalary) * 26; // 26 working days standard estimate
        }
        totalSalariesPaid += earned;
        salariesLedger.push({
          employeeName: e.name,
          category: e.category,
          salaryPaid: earned
        });
      }
    });

    const netProfit = totalRevenue - totalSalariesPaid;

    const pdfBuffer = await generateMonthlyReportPDF(
      monthYear,
      {
        totalSales: totalRevenue,
        totalOrders: targetOrders.length,
        totalWages: totalSalariesPaid,
        netProfit,
      },
      productsByCategory,
      salariesLedger
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Monthly-Report-${monthYear}.pdf"`);
    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
});
