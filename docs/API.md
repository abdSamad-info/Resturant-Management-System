# Restaurant Management System — Backend API Specification

This document maps all backend pathways, request schemas, caching TTL rules, and response objects.

---

## 👥 Employee Directory (`/api/employees`)

### 1. `GET /api/employees`
- **Description:** Returns full list of active and inactive staff members.
- **Headers:** `Content-Type: application/json`
- **Output (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "abc982x",
      "name": "Muhammad Ali",
      "phone": "+923001234567",
      "joiningDate": "2025-01-10",
      "salaryType": "monthly",
      "monthlySalary": 45000,
      "currentSalary": 45000,
      "category": "Chef",
      "advanceBalance": 5000,
      "isActive": true
    }
  ]
}
```

### 2. `POST /api/employees`
- **Description:** Registers a new staff profile.
- **Request Body:**
```json
{
  "name": "Sajid Khan",
  "phone": "+923129876543",
  "joiningDate": "2025-03-15",
  "salaryType": "daily",
  "dailyWage": 800,
  "category": "Waiter"
}
```
- **Output (201 Created):**
```json
{
  "success": true,
  "message": "Employee registered successfully.",
  "data": { ... }
}
```

### 3. `POST /api/employees/:id/advance`
- **Description:** Allocates an advance loan deficit to a specific staff member.
- **Request Body:** `{ "amount": 5000 }`
- **Output (200 OK):**
```json
{
  "success": true,
  "message": "Successfully advanced Rs. 5000 to Sajid Khan. Deficit registered.",
  "data": { ... }
}
```

### 4. `POST /api/employees/:id/increment`
- **Description:** Promotes an employee's base pay and records a transcript in `SalaryHistory`.
- **Request Body:**
```json
{
  "incrementType": "percentage",
  "incrementValue": 10,
  "remarks": "Standard annual perform increment"
}
```
- **Output (200 OK):**
```json
{
  "success": true,
  "message": "Salary successfully incremented from Rs. 40000 to Rs. 44000.",
  "data": { ... }
}
```

---

## 🍛 menu Products (`/api/products`)

### 1. `GET /api/products`
- **Description:** Fetches all dishes. Uses `node-cache` (TTL of 6 minutes).
- **Output (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "p72x9",
      "name": "Chicken Karahi (Full)",
      "category": "Main Course",
      "price": 1200,
      "description": "Traditional spicy chicken karahi",
      "isAvailable": true
    }
  ],
  "cached": true
}
```

### 2. `POST /api/products`
- **Description:** Inserts a dish into the menu. Automatically invalidates product cache.

---

## 🧾 Orders (`/api/orders`)

### 1. `GET /api/orders`
- **Description:** List checkouts. Supports query parameters `date` (YYYY-MM-DD), `type` (dine-in | delivery), and `status` (pending | completed | cancelled).

---

## 🧾 Checkout Invoices (`/api/invoices`)

### 1. `GET /api/invoices/:id/pdf`
- **Description:** Streams a high-fidelity continuous thermal-roll styled Receipt PDF.

---

## 📊 Analytics Reports (`/api/reports`)

### 1. `GET /api/reports/daily?date=YYYY-MM-DD`
- **Description:** Returns daily transaction counts, total revenue, daily wage metrics, and item unit sales metrics.

### 2. `GET /api/reports/monthly/pdf?month=YYYY-MM`
- **Description:** Generates and exports a full-page Letter-sized Financial monthly Performance Ledger PDF.
