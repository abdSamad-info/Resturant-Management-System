# Database Model & Schemas Spec

This document records the schemas representing the data layer.

---

## 👥 1. `Employee`
Stores personal and active payroll configurations.

| Attribute Name | Variable Type | Domain Constraints | Purpose / Mechanics |
| :--- | :--- | :--- | :--- |
| `_id` | String | Unique auto-generated hash | PRIMARY KEY |
| `name` | String | Required, trimmed, max 60 chars | Employee Full Name |
| `phone` | String | Required, valid contact format | Phone connection |
| `joiningDate` | String | YYYY-MM-DD format | Service duration calculations |
| `salaryType` | String | `"daily"` or `"monthly"` | Controls compensation calculation |
| `dailyWage` | Number | Optional, positive values | Active rate if daily wager |
| `monthlySalary`| Number | Optional, positive values | Active rate if monthly wager |
| `category` | String | `Chef`, `Waiter`, `Cleaner`, `Manager` | Work designation category |
| `advanceBalance`| Number | Non-negative integer, default 0 | Accumulated advance loans given |
| `currentSalary`| Number | Positive integer | Active base pay scale rate |
| `isActive` | Boolean | Default `true` | Staff status toggles |

---

## 📈 2. `SalaryHistory`
Tracks compensations wage adjustments and audit logs.

| Attribute | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String | Unique hash | PRIMARY KEY |
| `employeeId` | String | Foreign key reference | Reference to employee card |
| `previousSalary`| Number | Positive | Salary rate before increment |
| `newSalary` | Number | Positive | Promoted salary rate |
| `incrementType`| String | `"fixed"` or `"percentage"` | Incremental math scale applied |
| `incrementValue`| Number | Positive | Definite increment (e.g., 2000 or 10%) |
| `incrementDate`| String | YYYY-MM-DD | Date of adjustment authorization |
| `remarks` | String | Optional description text | Performance remarks log |

---

## 🍛 3. `Product`
Represents Bistro food items.

| Attribute | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String | Unique hash | PRIMARY KEY |
| `name` | String | Trimmed | Culinary title of dish |
| `category` | String | `Main Course`, `Beverages`, etc | Tab filter placement |
| `price` | Number | Positive float | Menu dish cost |
| `description` | String | Optional | Spice profiles, servings style |
| `isAvailable` | Boolean | Default `true` | Available to list in checkout baskets |

---

## 🧾 4. `Order`
Represents dine-in table accounts or deliveries.

| Attribute | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String | Unique code | PRIMARY KEY |
| `orderType` | String | `"dine-in"` or `"delivery"` | Serving channel selector |
| `tableNumber` | String | Required if dine-in | Service table number |
| `customerName` | String | Required if delivery | Delivery contact |
| `customerAddress`| String | Required if delivery | Delivery address |
| `items` | Array | `[{ productId, productName, qty, price... }]` | Basket order lines |
| `totalAmount` | Number | Self-calculating | Sum of item totals |
| `status` | String | `pending` \| `completed` \| `cancelled` | Active kitchen order status |
| `createdAt` | String | IOS Date stream | Logging timestamp |

---

## 🧾 5. `Invoice`
Checkout summary receipts.

| Attribute | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String | Unique code | PRIMARY KEY |
| `orderId` | String | Ref key | Reference to completed order |
| `invoiceNumber` | String | `INV-XXXXX` format | Sequential identification code |
| `items` | Array | Subtable list copy | Copy of bought dishes |
| `totalAmount` | Number | Numeric total | Net bill amount |
| `generatedAt` | String | Timestamp | Creation timestamp |
