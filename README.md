# Inventory Management System

A full-stack **Inventory & Warehouse Management System** developed using **Java Spring Boot, React.js, MySQL, and REST APIs**.

The application is designed to manage industrial inventory efficiently by providing item management, supplier management, stock transactions, low-stock monitoring, reorder suggestions, transaction history, dashboard analytics, and CSV export functionality.

---

## 📌 Project Overview

The Inventory Management System provides a centralized platform for managing warehouse inventory and stock movement.

It supports:

- Item catalogue management
- Supplier management
- Stock-IN and Stock-OUT operations
- Automatic inventory quantity updates
- Low-stock monitoring
- Reorder quantity suggestions
- Transaction history and audit trail
- Item search and category filtering
- Category-wise stock value analysis
- CSV inventory export
- Dashboard-based inventory monitoring
- Data validation and business-rule protection

The project follows a modern **full-stack architecture** with a React frontend communicating with a Spring Boot REST API and MySQL database.

---

## 🚀 Key Features

### 📦 Item Management

- Add new inventory items
- Edit existing items
- Delete items when no transaction history exists
- Unique SKU validation
- Category management
- Quantity tracking
- Minimum stock threshold
- Unit price management
- Automatic stock value calculation

---

### 🔄 Stock Management

#### Stock-IN

- Select an inventory item
- Select the supplier
- Enter received quantity
- Add transaction remarks
- Automatically increase available stock
- Record transaction date and details

#### Stock-OUT

- Select an inventory item
- Enter outgoing quantity
- Validate available stock
- Automatically decrease inventory quantity
- Record transaction history

---

### 👥 Supplier Management

- Add suppliers
- Edit supplier information
- Delete suppliers when not linked to transaction history
- Supplier email validation
- Supplier contact information
- Supplier association with Stock-IN transactions

---

### ⚠️ Low Stock Monitoring

The system automatically identifies items where:

```text
Current Quantity <= Minimum Threshold
