# 🍽️ The Green Bistro — Restaurant Management System

A full-stack, professional, and mobile-responsive **Restaurant Management Suite** designed with a beautiful, high-contrast, white-dominant color palette, custom Google Typography pairing, and instant action sliders.

---

## ✨ Primary Features

### 👥 1. Employee Management
- Complete profile directory for adding, editing, and deleting team members.
- Configurable base-pay schemas: **Monthly Salary scale** or **Daily Wage scale**.
- **Deficit Advance Management**: Tracks employee loans (`advanceBalance`), automatically deducts deficit amounts from monthly wage payroll calculations, and allows manual clearances on settlements.
- **Pay Promotions (Increments)**: Distribute Fixed Amount adjustments (e.g., +2000) or Percentage-based promotions (e.g., +10%). All increment events automatically record historic entries inside the `SalaryHistory` logger.

### 🍛 2. Dishes & Products Catalog
- Organizes food menus into clean searchable sections (**Main Course**, **Beverages**, **Bread**, **Special**).
- Includes instant kitchen toggles to alter stocks / availability.
- Maximizes request latency optimization with server-side caching via `node-cache` (6-minute TTL) and reactive, state-memoized tab filter searches on the frontend with `useMemo`.

### 🧾 3. Interactive Order Dispatch
- Manual order builder containing intuitive unit increments (+ / -) and item deletion actions.
- Real-time billing total calculation directly on the basket workspace.
- Supports both **Dine-in (Table selections)** and **Home Delivery (Contact credentials)** service routes.
- Full checkout history log allowing instant statuses changes (Pending, Completed, Cancelled).

### 🧾 4. Printed Invoices
- Transitions completed orders immediately into sequential printed invoice logs.
- Features dynamic, serverside PDF receipt formatting via `pdfkit` styled like a standard continuous thermal-roll thermal printer slips (logo placeholder, detailed items table, totals highlight, thank-you footer).

### 📊 5. Financial Audits & Analytics
- **Daily Audits**: Select a date and view completed sales, daily staff wage registers, and final operating profit margins alongside dishes sold totals.
- **Monthly Performance**: Evaluates monthly revenues, accumulated personnel wages, and category sales ratios with direct exports to full-page Monthly financial ledger PDFs.

---

## 🛠️ Technological Foundations
- **Backend**: Node.js, Express.js.
- **Data Persistence**: Lightweight disk-backed JSON database (`/backend/db.ts`) with atomicity protections. Fits ideally inside Cloud Run instances without local database network connection dependencies.
- **Security**: 글로벌 API Rate-limiting (`express-rate-limit`) preventing overloading, plus query parameters sanitizer (`express-mongo-sanitize`).
- **Frontend**: React (Vite, TypeScript), Tailwind CSS, React Query (`@tanstack/react-query`), Lucide Icons.

---

## 🚀 Speed Setup & Initialization

Verify you have Node.js and npm installed. Run these steps inside the workspace root:

1. **Copy local environments**:
   ```bash
   cp .env.example .env
   ```
2. **Setup dependencies**:
   ```bash
   npm install
   ```
3. **Start the single process server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access the Bistro Suite.

---

## 📂 Directories Architecture
```
/
├── backend/               ← Server logic
│   ├── db.ts              ← JSON-based atomic datastore (modeling MongoDB schemas)
│   ├── routes.ts          ← Modular Express API controllers
│   ├── middleware/        ← Sanitizer, RateLimiter, errorHandler
│   └── utils/             ← AppError, server-cache, pdfGenerator
├── docs/                  ← Detailed specs documents
│   ├── API.md
│   ├── SCHEMA.md
│   └── SETUP.md
├── src/                   ← React SPA codebase
│   ├── components/        ← Sidebar, Layout frame
│   ├── pages/             ← Dashboard, Products, Orders, Invoices, Reports views
│   ├── services/          ← Axios network service definitions
│   └── types.ts           ← Shared TypeScript compiler contracts
├── index.html
├── package.json
└── server.ts              ← Node Entrypoint (serving Express routes and Vite middlewares)
```
