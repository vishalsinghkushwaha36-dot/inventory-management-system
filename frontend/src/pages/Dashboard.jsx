import React, { useEffect, useMemo, useState } from "react";
import {
    getItems,
    getTransactionHistory,
    getLowStockItems,
} from "../services/api";

function Dashboard({
                       onNavigate,
                       onAddStock,
                       refreshTrigger = 0,
                   }) {

    /* =========================================================
       STATE
       ========================================================= */

    const [items, setItems] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isNightMode, setIsNightMode] = useState(() => {
        try {
            return localStorage.getItem(
                "inventory-dashboard-theme"
            ) === "night";
        } catch {
            return false;
        }
    });


    /* =========================================================
       THEME PERSISTENCE
       ========================================================= */

    useEffect(() => {
        try {
            localStorage.setItem(
                "inventory-dashboard-theme",
                isNightMode ? "night" : "day"
            );
        } catch {
            // Ignore localStorage errors
        }
    }, [isNightMode]);


    const toggleNightMode = () => {
        setIsNightMode((current) => !current);
    };


    /* =========================================================
       LOAD DASHBOARD DATA
       FAST / NON-BLOCKING LOADING
       ========================================================= */

    const loadDashboardData = async () => {

        // Do not block the dashboard UI while Render APIs respond.
        // Existing data remains visible during refresh.
        setLoading(false);
        setError("");

        // Start all dashboard requests together so network latency
        // is not accumulated one request after another.
        const results = await Promise.allSettled([
            getItems(),
            getTransactionHistory(),
            getLowStockItems(),
        ]);

        const [
            itemsResult,
            transactionsResult,
            lowStockResult,
        ] = results;

        // Inventory data
        if (itemsResult.status === "fulfilled") {

            setItems(
                Array.isArray(itemsResult.value)
                    ? itemsResult.value
                    : []
            );

        } else {

            console.error(
                "Dashboard items loading error:",
                itemsResult.reason
            );
        }

        // Transaction data
        if (transactionsResult.status === "fulfilled") {

            setTransactions(
                Array.isArray(transactionsResult.value)
                    ? transactionsResult.value
                    : []
            );

        } else {

            console.error(
                "Dashboard transactions loading error:",
                transactionsResult.reason
            );
        }

        // Low-stock data
        if (lowStockResult.status === "fulfilled") {

            setLowStockItems(
                Array.isArray(lowStockResult.value)
                    ? lowStockResult.value
                    : []
            );

        } else {

            console.error(
                "Dashboard low-stock loading error:",
                lowStockResult.reason
            );
        }

        // Only show an error when every dashboard request fails.
        // A single failed section should not hide the whole dashboard.
        const allRequestsFailed =
            results.every(
                (result) => result.status === "rejected"
            );

        if (allRequestsFailed) {

            setError(
                "Unable to load dashboard data. Please refresh."
            );
        }
    };


    useEffect(() => {
        loadDashboardData();
    }, [refreshTrigger]);


    /* =========================================================
       DASHBOARD STATISTICS
       ========================================================= */

    const dashboardStats = useMemo(() => {

        const totalItems = items.length;

        const totalStock = items.reduce(
            (total, item) =>
                total +
                (Number(item.quantity) || 0),
            0
        );

        const totalStockValue = items.reduce(
            (total, item) =>
                total +
                (Number(item.quantity) || 0) *
                (Number(item.unitPrice) || 0),
            0
        );

        const lowStockCount = items.filter(
            (item) =>
                Number(item.quantity || 0) <=
                Number(item.threshold || 0)
        ).length;

        return {
            totalItems,
            totalStock,
            totalStockValue,
            lowStockCount,
        };

    }, [items]);


    /* =========================================================
       TRANSACTION STATISTICS
       ========================================================= */

    const transactionStats = useMemo(() => {

        const stockInTransactions =
            transactions.filter(
                (transaction) =>
                    transaction.type === "STOCK_IN"
            );

        const stockOutTransactions =
            transactions.filter(
                (transaction) =>
                    transaction.type === "STOCK_OUT"
            );

        const stockInUnits =
            stockInTransactions.reduce(
                (total, transaction) =>
                    total +
                    (Number(transaction.quantity) || 0),
                0
            );

        const stockOutUnits =
            stockOutTransactions.reduce(
                (total, transaction) =>
                    total +
                    (Number(transaction.quantity) || 0),
                0
            );

        return {

            stockInCount:
            stockInTransactions.length,

            stockOutCount:
            stockOutTransactions.length,

            stockInUnits,

            stockOutUnits,

            totalTransactions:
            transactions.length,

        };

    }, [transactions]);


    /* =========================================================
       CATEGORY SUMMARY
       ========================================================= */

    const categorySummary = useMemo(() => {

        const categoryMap = {};

        items.forEach((item) => {

            const category =
                item.category?.trim() ||
                "Uncategorized";

            if (!categoryMap[category]) {

                categoryMap[category] = {
                    category,
                    items: 0,
                    stock: 0,
                    value: 0,
                };

            }

            categoryMap[category].items += 1;

            categoryMap[category].stock +=
                Number(item.quantity) || 0;

            categoryMap[category].value +=
                (Number(item.quantity) || 0) *
                (Number(item.unitPrice) || 0);
        });

        return Object.values(categoryMap).sort(
            (a, b) => b.stock - a.stock
        );

    }, [items]);


    /* =========================================================
       RECENT TRANSACTIONS
       ========================================================= */

    const recentTransactions = useMemo(() => {

        return [...transactions]
            .sort((a, b) => {

                const dateA = new Date(
                    a.transactionDate || 0
                ).getTime();

                const dateB = new Date(
                    b.transactionDate || 0
                ).getTime();

                return dateB - dateA;
            })
            .slice(0, 5);

    }, [transactions]);


    /* =========================================================
       INVENTORY PREVIEW
       ========================================================= */

    const inventoryPreview = useMemo(() => {

        return [...items]
            .sort(
                (a, b) =>
                    (Number(a.quantity) || 0) -
                    (Number(b.quantity) || 0)
            )
            .slice(0, 8);

    }, [items]);


    /* =========================================================
       FORMATTERS
       ========================================================= */

    const formatCurrency = (value) => {

        return `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };


    const formatNumber = (value) => {

        return Number(value || 0).toLocaleString(
            "en-IN"
        );
    };


    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    const getItemName = (transaction) => {

        if (transaction?.item?.name) {
            return transaction.item.name;
        }

        if (transaction?.itemName) {
            return transaction.itemName;
        }

        return "Unknown Item";
    };


    const getItemSku = (transaction) => {

        if (transaction?.item?.sku) {
            return transaction.item.sku;
        }

        if (transaction?.sku) {
            return transaction.sku;
        }

        return "—";
    };


    const getSupplierName = (transaction) => {

        if (transaction?.supplier?.name) {
            return transaction.supplier.name;
        }

        if (transaction?.supplier?.company) {
            return transaction.supplier.company;
        }

        return "Not Available";
    };


    const isLowStock = (item) => {

        return (
            Number(item.quantity || 0) <=
            Number(item.threshold || 0)
        );
    };


    /* =========================================================
       NAVIGATION
       ========================================================= */

    const handleStockIn = () => {

        if (onAddStock) {
            onAddStock("STOCK_IN");
            return;
        }

        if (onNavigate) {
            onNavigate("transactions");
        }
    };


    const handleStockOut = () => {

        if (onAddStock) {
            onAddStock("STOCK_OUT");
            return;
        }

        if (onNavigate) {
            onNavigate("transactions");
        }
    };


    const handleViewItems = () => {

        if (onNavigate) {
            onNavigate("items");
        }
    };


    const handleViewHistory = () => {

        if (onNavigate) {
            onNavigate("transaction-history");
        }
    };


    const handleRefresh = () => {
        loadDashboardData();
    };


    /* =========================================================
       CSV EXPORT
       ========================================================= */

    const handleExportCSV = () => {

        if (!items || items.length === 0) {

            setError(
                "No inventory data available to export."
            );

            return;
        }

        try {

            const headers = [
                "SKU",
                "Name",
                "Category",
                "Quantity",
                "Threshold",
                "Unit Price",
                "Stock Value",
                "Status",
            ];

            const rows = items.map((item) => {

                const quantity =
                    Number(item.quantity) || 0;

                const threshold =
                    Number(item.threshold) || 0;

                const unitPrice =
                    Number(item.unitPrice) || 0;

                const stockValue =
                    quantity * unitPrice;

                return [
                    item.sku || "",
                    item.name || "",
                    item.category || "",
                    quantity,
                    threshold,
                    unitPrice.toFixed(2),
                    stockValue.toFixed(2),
                    quantity <= threshold
                        ? "Low Stock"
                        : "Available",
                ];
            });

            const csvContent = [
                headers,
                ...rows,
            ]
                .map((row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(
                                    value
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
                )
                .join("\n");

            const blob = new Blob(
                ["\uFEFF" + csvContent],
                {
                    type:
                        "text/csv;charset=utf-8;",
                }
            );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            const today =
                new Date()
                    .toISOString()
                    .slice(0, 10);

            link.href = url;

            link.download =
                `inventory-report-${today}.csv`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            setError("");

        } catch (exportError) {

            console.error(
                "CSV export error:",
                exportError
            );

            setError(
                "Unable to export inventory CSV."
            );
        }
    };


    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {

        return (
            <div
                className={`dashboard-page dashboard-modern ${
                    isNightMode
                        ? "dashboard-night-mode"
                        : "dashboard-day-mode"
                }`}
            >

                <div className="dashboard-loading-box">

                    <div>
                        <span className="dashboard-eyebrow">
                            INVENTORY COMMAND CENTER
                        </span>

                        <h1>
                            Inventory Dashboard
                        </h1>

                        <p>
                            Monitor stock, transactions
                            and warehouse performance.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-theme-toggle"
                        onClick={toggleNightMode}
                    >
                        <span>
                            {isNightMode ? "☀" : "☾"}
                        </span>

                        {isNightMode
                            ? "Day Mode"
                            : "Night Mode"}
                    </button>

                </div>

                <div className="dashboard-loading">
                    <span className="dashboard-spinner"></span>
                    <span>Loading dashboard...</span>
                </div>

            </div>
        );
    }


    /* =========================================================
       MAIN DASHBOARD
       ========================================================= */

    return (
        <div
            className={`dashboard-page dashboard-modern ${
                isNightMode
                    ? "dashboard-night-mode"
                    : "dashboard-day-mode"
            }`}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="dashboard-modern-header">

                <div className="dashboard-title-area">

                    <span className="dashboard-eyebrow">
                        INVENTORY COMMAND CENTER
                    </span>

                    <h1>
                        Inventory Dashboard
                    </h1>

                    <p>
                        Real-time overview of inventory,
                        stock movement and warehouse health.
                    </p>

                </div>


                <div className="dashboard-modern-actions">

                    <button
                        type="button"
                        className="dashboard-theme-toggle"
                        onClick={toggleNightMode}
                        title={
                            isNightMode
                                ? "Switch to Day Mode"
                                : "Switch to Night Mode"
                        }
                    >

                        <span className="theme-icon">
                            {isNightMode ? "☀" : "☾"}
                        </span>

                        <span>
                            {isNightMode
                                ? "Day Mode"
                                : "Night Mode"}
                        </span>

                    </button>


                    <button
                        type="button"
                        className="dashboard-modern-button secondary"
                        onClick={handleExportCSV}
                        disabled={items.length === 0}
                    >
                        <span>↓</span>
                        Export CSV
                    </button>


                    <button
                        type="button"
                        className="dashboard-modern-button secondary"
                        onClick={handleRefresh}
                    >
                        <span>↻</span>
                        Refresh
                    </button>

                </div>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="dashboard-error">

                    <span className="dashboard-error-icon">
                        !
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        ×
                    </button>

                </div>

            )}


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="dashboard-stat-grid">

                <div className="dashboard-modern-stat">

                    <div className="dashboard-stat-icon blue">
                        📦
                    </div>

                    <div className="dashboard-stat-content">

                        <span className="dashboard-stat-label">
                            TOTAL ITEMS
                        </span>

                        <strong>
                            {formatNumber(
                                dashboardStats.totalItems
                            )}
                        </strong>

                        <small>
                            Active inventory items
                        </small>

                    </div>

                </div>


                <div className="dashboard-modern-stat">

                    <div className="dashboard-stat-icon violet">
                        📊
                    </div>

                    <div className="dashboard-stat-content">

                        <span className="dashboard-stat-label">
                            TOTAL STOCK
                        </span>

                        <strong>
                            {formatNumber(
                                dashboardStats.totalStock
                            )}
                        </strong>

                        <small>
                            Units currently available
                        </small>

                    </div>

                </div>


                <div className="dashboard-modern-stat">

                    <div className="dashboard-stat-icon amber">
                        ⚠
                    </div>

                    <div className="dashboard-stat-content">

                        <span className="dashboard-stat-label">
                            LOW STOCK
                        </span>

                        <strong>
                            {formatNumber(
                                dashboardStats.lowStockCount
                            )}
                        </strong>

                        <small>
                            Items requiring attention
                        </small>

                    </div>

                </div>


                <div className="dashboard-modern-stat">

                    <div className="dashboard-stat-icon emerald">
                        ₹
                    </div>

                    <div className="dashboard-stat-content">

                        <span className="dashboard-stat-label">
                            STOCK VALUE
                        </span>

                        <strong className="currency-value">
                            {formatCurrency(
                                dashboardStats.totalStockValue
                            )}
                        </strong>

                        <small>
                            Current inventory valuation
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================================
                QUICK OPERATIONS
            ================================================= */}

            <section className="dashboard-modern-card quick-operations">

                <div className="dashboard-section-heading">

                    <div>

                        <span>
                            QUICK OPERATIONS
                        </span>

                        <h2>
                            Manage Inventory
                        </h2>

                        <p>
                            Access frequently used inventory
                            operations from one place.
                        </p>

                    </div>

                </div>


                <div className="dashboard-operation-grid">

                    <button
                        type="button"
                        className="dashboard-operation blue"
                        onClick={handleStockIn}
                    >

                        <span className="operation-icon">
                            ↓
                        </span>

                        <span className="operation-content">

                            <strong>
                                Stock In
                            </strong>

                            <small>
                                Add incoming stock
                            </small>

                        </span>

                        <span className="operation-arrow">
                            →
                        </span>

                    </button>


                    <button
                        type="button"
                        className="dashboard-operation orange"
                        onClick={handleStockOut}
                    >

                        <span className="operation-icon">
                            ↑
                        </span>

                        <span className="operation-content">

                            <strong>
                                Stock Out
                            </strong>

                            <small>
                                Issue available stock
                            </small>

                        </span>

                        <span className="operation-arrow">
                            →
                        </span>

                    </button>


                    <button
                        type="button"
                        className="dashboard-operation green"
                        onClick={handleViewItems}
                    >

                        <span className="operation-icon">
                            📦
                        </span>

                        <span className="operation-content">

                            <strong>
                                View Items
                            </strong>

                            <small>
                                Manage inventory catalogue
                            </small>

                        </span>

                        <span className="operation-arrow">
                            →
                        </span>

                    </button>


                    <button
                        type="button"
                        className="dashboard-operation purple"
                        onClick={handleViewHistory}
                    >

                        <span className="operation-icon">
                            ↕
                        </span>

                        <span className="operation-content">

                            <strong>
                                Transaction History
                            </strong>

                            <small>
                                Review stock movements
                            </small>

                        </span>

                        <span className="operation-arrow">
                            →
                        </span>

                    </button>

                </div>

            </section>


            {/* =================================================
                HEALTH + VALUE
            ================================================= */}

            <section className="dashboard-two-column">

                <div className="dashboard-modern-card">

                    <div className="dashboard-section-heading">

                        <div>

                            <span>
                                STOCK HEALTH
                            </span>

                            <h2>
                                Inventory Health
                            </h2>

                            <p>
                                Current stock availability
                                and attention status.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-health-list">

                        <div className="dashboard-health-row">

                            <div className="health-round green">
                                ✓
                            </div>

                            <div className="health-row-content">

                                <strong>
                                    {Math.max(
                                        dashboardStats.totalItems -
                                        dashboardStats.lowStockCount,
                                        0
                                    )}
                                </strong>

                                <span>
                                    Healthy Items
                                </span>

                            </div>

                            <span className="dashboard-status-pill green">
                                Available
                            </span>

                        </div>


                        <div className="dashboard-health-row">

                            <div className="health-round red">
                                !
                            </div>

                            <div className="health-row-content">

                                <strong>
                                    {
                                        dashboardStats.lowStockCount
                                    }
                                </strong>

                                <span>
                                    Low Stock Items
                                </span>

                            </div>

                            <span className="dashboard-status-pill red">
                                Attention
                            </span>

                        </div>

                    </div>

                </div>


                <div className="dashboard-modern-card">

                    <div className="dashboard-section-heading">

                        <div>

                            <span>
                                INVENTORY VALUATION
                            </span>

                            <h2>
                                Warehouse Value
                            </h2>

                            <p>
                                Current inventory financial
                                summary.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-value-display">

                        <span>
                            TOTAL STOCK VALUE
                        </span>

                        <strong>
                            {formatCurrency(
                                dashboardStats.totalStockValue
                            )}
                        </strong>

                    </div>


                    <div className="dashboard-metric-grid">

                        <div>
                            <strong>
                                {formatNumber(
                                    dashboardStats.totalItems
                                )}
                            </strong>
                            <span>
                                Item Types
                            </span>
                        </div>

                        <div>
                            <strong>
                                {formatNumber(
                                    dashboardStats.totalStock
                                )}
                            </strong>
                            <span>
                                Total Units
                            </span>
                        </div>

                        <div>
                            <strong>
                                {formatNumber(
                                    categorySummary.length
                                )}
                            </strong>
                            <span>
                                Categories
                            </span>
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                CATEGORY OVERVIEW
            ================================================= */}

            {categorySummary.length > 0 && (

                <section className="dashboard-modern-card dashboard-table-card">

                    <div className="dashboard-section-heading">

                        <div>

                            <span>
                                CATEGORY OVERVIEW
                            </span>

                            <h2>
                                Stock by Category
                            </h2>

                            <p>
                                Distribution of inventory
                                across product categories.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-table-wrapper">

                        <table className="dashboard-modern-table">

                            <thead>

                            <tr>
                                <th>Category</th>
                                <th>Item Types</th>
                                <th>Total Stock</th>
                                <th>Stock Value</th>
                            </tr>

                            </thead>


                            <tbody>

                            {categorySummary.map(
                                (category) => (

                                    <tr
                                        key={
                                            category.category
                                        }
                                    >

                                        <td>

                                            <span className="dashboard-category-badge">
                                                {
                                                    category.category
                                                }
                                            </span>

                                        </td>

                                        <td>
                                            {formatNumber(
                                                category.items
                                            )}
                                        </td>

                                        <td>
                                            {formatNumber(
                                                category.stock
                                            )}
                                        </td>

                                        <td className="table-money">
                                            {formatCurrency(
                                                category.value
                                            )}
                                        </td>

                                    </tr>

                                )
                            )}

                            </tbody>

                        </table>

                    </div>

                </section>

            )}


            {/* =================================================
                CURRENT INVENTORY
            ================================================= */}

            <section className="dashboard-modern-card dashboard-table-card">

                <div className="dashboard-section-heading dashboard-heading-with-action">

                    <div>

                        <span>
                            LIVE INVENTORY
                        </span>

                        <h2>
                            Current Inventory
                        </h2>

                        <p>
                            Live stock overview with the
                            lowest available quantities shown first.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="dashboard-view-button"
                        onClick={handleViewItems}
                    >
                        View All Items
                        <span>→</span>
                    </button>

                </div>


                {inventoryPreview.length === 0 ? (

                    <div className="dashboard-empty-state">

                        <div>
                            📦
                        </div>

                        <strong>
                            No inventory items
                        </strong>

                        <span>
                            Add inventory items to see
                            them here.
                        </span>

                    </div>

                ) : (

                    <div className="dashboard-table-wrapper">

                        <table className="dashboard-modern-table">

                            <thead>

                            <tr>

                                <th>SKU</th>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Available Stock</th>
                                <th>Threshold</th>
                                <th>Unit Price</th>
                                <th>Status</th>

                            </tr>

                            </thead>


                            <tbody>

                            {inventoryPreview.map(
                                (item) => {

                                    const low =
                                        isLowStock(item);

                                    return (

                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>

                                                <span className="dashboard-sku">
                                                    {item.sku || "—"}
                                                </span>

                                            </td>


                                            <td>

                                                <strong className="dashboard-table-item">
                                                    {item.name || "Unnamed Item"}
                                                </strong>

                                            </td>


                                            <td>

                                                <span className="dashboard-category-badge">
                                                    {
                                                        item.category ||
                                                        "Uncategorized"
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <strong className="dashboard-number">
                                                    {formatNumber(
                                                        item.quantity
                                                    )}
                                                </strong>

                                            </td>


                                            <td>
                                                {formatNumber(
                                                    item.threshold
                                                )}
                                            </td>


                                            <td className="table-money">
                                                {formatCurrency(
                                                    item.unitPrice
                                                )}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        low
                                                            ? "dashboard-status-pill red"
                                                            : "dashboard-status-pill green"
                                                    }
                                                >
                                                    {low
                                                        ? "Low Stock"
                                                        : "Available"}
                                                </span>

                                            </td>

                                        </tr>

                                    );
                                }
                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =================================================
                RECENT TRANSACTION ACTIVITY
            ================================================= */}

            <section className="dashboard-modern-card dashboard-table-card">

                <div className="dashboard-section-heading dashboard-heading-with-action">

                    <div>

                        <span>
                            RECENT TRANSACTION ACTIVITY
                        </span>

                        <h2>
                            Recent Transactions
                        </h2>

                        <p>
                            Latest stock movements recorded
                            across your inventory.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="dashboard-view-button"
                        onClick={handleViewHistory}
                    >
                        View History
                        <span>→</span>
                    </button>

                </div>


                <div className="dashboard-activity-summary">

                    <div>
                        <strong>
                            {formatNumber(
                                transactionStats.stockInCount
                            )}
                        </strong>
                        <span>
                            Stock-In Transactions
                        </span>
                    </div>

                    <div>
                        <strong>
                            {formatNumber(
                                transactionStats.stockOutCount
                            )}
                        </strong>
                        <span>
                            Stock-Out Transactions
                        </span>
                    </div>

                    <div>
                        <strong>
                            {formatNumber(
                                transactionStats.stockInUnits
                            )}
                        </strong>
                        <span>
                            Units Received
                        </span>
                    </div>

                    <div>
                        <strong>
                            {formatNumber(
                                transactionStats.stockOutUnits
                            )}
                        </strong>
                        <span>
                            Units Issued
                        </span>
                    </div>

                </div>


                {recentTransactions.length === 0 ? (

                    <div className="dashboard-empty-state">

                        <div>
                            ↕
                        </div>

                        <strong>
                            No transactions recorded
                        </strong>

                        <span>
                            Stock movements will appear
                            here after your first transaction.
                        </span>

                    </div>

                ) : (

                    <div className="dashboard-table-wrapper">

                        <table className="dashboard-modern-table">

                            <thead>

                            <tr>

                                <th>Date</th>
                                <th>Item</th>
                                <th>SKU</th>
                                <th>Transaction Type</th>
                                <th>Quantity</th>
                                <th>Supplier</th>

                            </tr>

                            </thead>


                            <tbody>

                            {recentTransactions.map(
                                (transaction) => {

                                    const isStockIn =
                                        transaction.type ===
                                        "STOCK_IN";

                                    return (

                                        <tr
                                            key={
                                                transaction.id
                                            }
                                        >

                                            <td>
                                                {formatDate(
                                                    transaction.transactionDate
                                                )}
                                            </td>


                                            <td>

                                                <strong className="dashboard-table-item">
                                                    {getItemName(
                                                        transaction
                                                    )}
                                                </strong>

                                            </td>


                                            <td>

                                                <span className="dashboard-sku">
                                                    {getItemSku(
                                                        transaction
                                                    )}
                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        isStockIn
                                                            ? "dashboard-transaction-pill in"
                                                            : "dashboard-transaction-pill out"
                                                    }
                                                >

                                                    <span>
                                                        {isStockIn
                                                            ? "↓"
                                                            : "↑"}
                                                    </span>

                                                    {isStockIn
                                                        ? "STOCK IN"
                                                        : "STOCK OUT"}

                                                </span>

                                            </td>


                                            <td>

                                                <strong className="dashboard-number">
                                                    {formatNumber(
                                                        transaction.quantity
                                                    )}
                                                </strong>

                                            </td>


                                            <td>
                                                {getSupplierName(
                                                    transaction
                                                )}
                                            </td>

                                        </tr>

                                    );
                                }
                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =================================================
                LOW STOCK ALERT
            ================================================= */}

            <section className="dashboard-modern-card dashboard-alert-card">

                <div className="dashboard-section-heading">

                    <div>

                        <span className="alert-heading">
                            CRITICAL STOCK ALERT
                        </span>

                        <h2>
                            Low Stock Items
                        </h2>

                        <p>
                            Items at or below their configured
                            stock threshold require attention.
                        </p>

                    </div>

                </div>


                {lowStockItems.length === 0 ? (

                    <div className="dashboard-healthy-message">

                        <span>
                            ✓
                        </span>

                        <div>
                            <strong>
                                All inventory levels are healthy
                            </strong>

                            <small>
                                No items are currently below
                                their stock threshold.
                            </small>
                        </div>

                    </div>

                ) : (

                    <div className="dashboard-alert-list">

                        {lowStockItems
                            .slice(0, 6)
                            .map((item) => (

                                <div
                                    className="dashboard-alert-row"
                                    key={item.id}
                                >

                                    <div className="alert-item-info">

                                        <strong>
                                            {item.name}
                                        </strong>

                                        <span>
                                            {item.sku}
                                        </span>

                                    </div>


                                    <div className="alert-stock">

                                        <strong>
                                            {formatNumber(
                                                item.quantity
                                            )}
                                        </strong>

                                        <span>
                                            / {formatNumber(
                                            item.threshold
                                        )} units
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        className="dashboard-restock-button"
                                        onClick={
                                            handleStockIn
                                        }
                                    >
                                        Restock
                                        <span>→</span>
                                    </button>

                                </div>

                            ))}

                    </div>

                )}

            </section>


            {/* =================================================
                BOTTOM SUMMARY
            ================================================= */}

            <section className="dashboard-two-column">

                <div className="dashboard-modern-card">

                    <div className="dashboard-section-heading">

                        <div>

                            <span>
                                TRANSACTION ACTIVITY
                            </span>

                            <h2>
                                Stock Movement
                            </h2>

                            <p>
                                Overall inventory movement
                                recorded in the system.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-metric-grid bottom-metrics">

                        <div>

                            <strong>
                                {formatNumber(
                                    transactionStats.totalTransactions
                                )}
                            </strong>

                            <span>
                                Total Transactions
                            </span>

                        </div>


                        <div>

                            <strong>
                                {formatNumber(
                                    transactionStats.stockInUnits
                                )}
                            </strong>

                            <span>
                                Units Received
                            </span>

                        </div>


                        <div>

                            <strong>
                                {formatNumber(
                                    transactionStats.stockOutUnits
                                )}
                            </strong>

                            <span>
                                Units Issued
                            </span>

                        </div>

                    </div>

                </div>


                <div className="dashboard-modern-card">

                    <div className="dashboard-section-heading">

                        <div>

                            <span>
                                SYSTEM STATUS
                            </span>

                            <h2>
                                Warehouse Overview
                            </h2>

                            <p>
                                Current operational and
                                inventory tracking status.
                            </p>

                        </div>

                    </div>


                    <div className="dashboard-health-list">

                        <div className="dashboard-health-row">

                            <div className="health-round green">
                                ✓
                            </div>

                            <div className="health-row-content">

                                <strong>
                                    {formatNumber(
                                        items.length
                                    )}
                                </strong>

                                <span>
                                    Catalogue Items
                                </span>

                            </div>

                            <span className="dashboard-status-pill green">
                                Active
                            </span>

                        </div>


                        <div className="dashboard-health-row">

                            <div className="health-round green">
                                ↕
                            </div>

                            <div className="health-row-content">

                                <strong>
                                    {formatNumber(
                                        transactionStats.totalTransactions
                                    )}
                                </strong>

                                <span>
                                    Recorded Movements
                                </span>

                            </div>

                            <span className="dashboard-status-pill green">
                                Tracked
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                STRONG DASHBOARD SCOPED STYLES

                IMPORTANT:
                These styles are intentionally scoped to
                .dashboard-modern so existing App.css remains
                unaffected outside Dashboard.
            ========================================================= */}

            <style>{`

                /* =====================================================
                   BASE
                ===================================================== */

                .dashboard-modern {
                    --dm-bg: #f5f7fb;
                    --dm-surface: #ffffff;
                    --dm-surface-soft: #f8fafc;
                    --dm-border: #e5e7eb;
                    --dm-border-soft: #edf0f4;
                    --dm-heading: #111827;
                    --dm-text: #374151;
                    --dm-muted: #6b7280;
                    --dm-faint: #9ca3af;
                    --dm-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);

                    width: 100% !important;
                    min-height: 100% !important;
                    box-sizing: border-box !important;
                    color: var(--dm-text) !important;
                    background: var(--dm-bg) !important;
                    padding-bottom: 40px !important;
                }

                .dashboard-modern *,
                .dashboard-modern *::before,
                .dashboard-modern *::after {
                    box-sizing: border-box !important;
                }


                /* =====================================================
                   DAY MODE
                ===================================================== */

                .dashboard-modern.dashboard-day-mode {
                    --dm-bg: #f5f7fb;
                    --dm-surface: #ffffff;
                    --dm-surface-soft: #f8fafc;
                    --dm-border: #e5e7eb;
                    --dm-border-soft: #edf0f4;
                    --dm-heading: #111827;
                    --dm-text: #374151;
                    --dm-muted: #6b7280;
                    --dm-faint: #9ca3af;
                    --dm-shadow:
                        0 8px 28px rgba(15, 23, 42, 0.06);
                }


                /* =====================================================
                   NIGHT MODE
                ===================================================== */

                .dashboard-modern.dashboard-night-mode {
                    --dm-bg: #080d18;
                    --dm-surface: #111827;
                    --dm-surface-soft: #182235;
                    --dm-border: #263247;
                    --dm-border-soft: #202c40;
                    --dm-heading: #f8fafc;
                    --dm-text: #d5deeb;
                    --dm-muted: #9aa9bd;
                    --dm-faint: #718096;
                    --dm-shadow:
                        0 12px 35px rgba(0, 0, 0, 0.30);

                    background: #080d18 !important;
                    color: #d5deeb !important;
                }


                /* =====================================================
                   HEADER
                ===================================================== */

                .dashboard-modern-header {
                    display: flex !important;
                    align-items: flex-start !important;
                    justify-content: space-between !important;
                    gap: 24px !important;
                    margin-bottom: 26px !important;
                }

                .dashboard-title-area {
                    min-width: 0 !important;
                }

                .dashboard-eyebrow {
                    display: block !important;
                    margin-bottom: 8px !important;
                    font-size: 11px !important;
                    line-height: 1.2 !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.14em !important;
                    color: #2563eb !important;
                }

                .dashboard-night-mode .dashboard-eyebrow {
                    color: #60a5fa !important;
                }

                .dashboard-modern-header h1 {
                    margin: 0 !important;
                    color: var(--dm-heading) !important;
                    font-size: clamp(27px, 3vw, 36px) !important;
                    line-height: 1.15 !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.035em !important;
                }

                .dashboard-modern-header p {
                    margin: 10px 0 0 !important;
                    color: var(--dm-muted) !important;
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                    max-width: 680px !important;
                }

                .dashboard-modern-actions {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-end !important;
                    gap: 9px !important;
                    flex-wrap: wrap !important;
                }


                /* =====================================================
                   THEME BUTTON
                ===================================================== */

                .dashboard-modern .dashboard-theme-toggle {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 8px !important;
                    min-height: 42px !important;
                    padding: 0 14px !important;
                    border: 1px solid var(--dm-border) !important;
                    border-radius: 11px !important;
                    background: var(--dm-surface) !important;
                    color: var(--dm-heading) !important;
                    font-size: 12px !important;
                    font-weight: 800 !important;
                    cursor: pointer !important;
                    box-shadow: 0 2px 8px rgba(15,23,42,0.04) !important;
                    transition: all 0.2s ease !important;
                }

                .dashboard-modern .dashboard-theme-toggle:hover {
                    transform: translateY(-1px) !important;
                    border-color: #93c5fd !important;
                }

                .dashboard-modern .theme-icon {
                    font-size: 17px !important;
                    line-height: 1 !important;
                }


                /* =====================================================
                   HEADER BUTTONS
                ===================================================== */

                .dashboard-modern .dashboard-modern-button {
                    min-height: 42px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 7px !important;
                    padding: 0 14px !important;
                    border-radius: 11px !important;
                    border: 1px solid var(--dm-border) !important;
                    background: var(--dm-surface) !important;
                    color: var(--dm-heading) !important;
                    font-size: 12px !important;
                    font-weight: 800 !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                }

                .dashboard-modern .dashboard-modern-button:hover {
                    transform: translateY(-1px) !important;
                    border-color: #93c5fd !important;
                }

                .dashboard-modern .dashboard-modern-button:disabled {
                    opacity: 0.5 !important;
                    cursor: not-allowed !important;
                    transform: none !important;
                }


                /* =====================================================
                   ERROR
                ===================================================== */

                .dashboard-error {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    margin-bottom: 20px !important;
                    padding: 12px 14px !important;
                    border-radius: 12px !important;
                    border: 1px solid #fecaca !important;
                    background: #fef2f2 !important;
                    color: #991b1b !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                }

                .dashboard-night-mode .dashboard-error {
                    border-color: #5b2830 !important;
                    background: #29151a !important;
                    color: #fca5a5 !important;
                }

                .dashboard-error-icon {
                    width: 23px !important;
                    height: 23px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    flex-shrink: 0 !important;
                    border-radius: 50% !important;
                    background: #dc2626 !important;
                    color: white !important;
                    font-weight: 900 !important;
                }

                .dashboard-error button {
                    margin-left: auto !important;
                    border: 0 !important;
                    background: transparent !important;
                    color: inherit !important;
                    font-size: 20px !important;
                    cursor: pointer !important;
                }


                /* =====================================================
                   STAT GRID
                ===================================================== */

                .dashboard-stat-grid {
                    display: grid !important;
                    grid-template-columns:
                        repeat(4, minmax(0, 1fr)) !important;
                    gap: 16px !important;
                    margin-bottom: 20px !important;
                }

                .dashboard-modern-stat {
                    display: flex !important;
                    align-items: center !important;
                    gap: 15px !important;
                    min-width: 0 !important;
                    padding: 20px !important;
                    border: 1px solid var(--dm-border) !important;
                    border-radius: 16px !important;
                    background: var(--dm-surface) !important;
                    box-shadow: var(--dm-shadow) !important;
                }

                .dashboard-stat-icon {
                    width: 46px !important;
                    height: 46px !important;
                    flex: 0 0 46px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 13px !important;
                    font-size: 20px !important;
                    font-weight: 800 !important;
                }

                .dashboard-stat-icon.blue {
                    background: #eff6ff !important;
                    color: #2563eb !important;
                }

                .dashboard-stat-icon.violet {
                    background: #f5f3ff !important;
                    color: #7c3aed !important;
                }

                .dashboard-stat-icon.amber {
                    background: #fffbeb !important;
                    color: #d97706 !important;
                }

                .dashboard-stat-icon.emerald {
                    background: #ecfdf5 !important;
                    color: #059669 !important;
                }

                .dashboard-night-mode .dashboard-stat-icon.blue {
                    background: #172c4c !important;
                    color: #60a5fa !important;
                }

                .dashboard-night-mode .dashboard-stat-icon.violet {
                    background: #292043 !important;
                    color: #c4b5fd !important;
                }

                .dashboard-night-mode .dashboard-stat-icon.amber {
                    background: #3b2b12 !important;
                    color: #fbbf24 !important;
                }

                .dashboard-night-mode .dashboard-stat-icon.emerald {
                    background: #12372b !important;
                    color: #34d399 !important;
                }

                .dashboard-stat-content {
                    min-width: 0 !important;
                }

                .dashboard-stat-label {
                    display: block !important;
                    margin-bottom: 5px !important;
                    color: var(--dm-muted) !important;
                    font-size: 10px !important;
                    line-height: 1.3 !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.1em !important;
                }

                .dashboard-stat-content strong {
                    display: block !important;
                    color: var(--dm-heading) !important;
                    font-size: 25px !important;
                    line-height: 1.2 !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.02em !important;
                    overflow-wrap: anywhere !important;
                }

                .dashboard-stat-content .currency-value {
                    font-size: 21px !important;
                }

                .dashboard-stat-content small {
                    display: block !important;
                    margin-top: 4px !important;
                    color: var(--dm-muted) !important;
                    font-size: 11px !important;
                    line-height: 1.4 !important;
                }


                /* =====================================================
                   GENERAL CARDS
                ===================================================== */

                .dashboard-modern .dashboard-modern-card {
                    min-width: 0 !important;
                    border: 1px solid var(--dm-border) !important;
                    border-radius: 17px !important;
                    background: var(--dm-surface) !important;
                    color: var(--dm-text) !important;
                    box-shadow: var(--dm-shadow) !important;
                    overflow: hidden !important;
                }

                .dashboard-section-heading {
                    display: flex !important;
                    align-items: flex-start !important;
                    justify-content: space-between !important;
                    gap: 18px !important;
                    margin-bottom: 20px !important;
                }

                .dashboard-section-heading > div {
                    min-width: 0 !important;
                }

                .dashboard-section-heading > div > span {
                    display: block !important;
                    margin-bottom: 7px !important;
                    color: #2563eb !important;
                    font-size: 10px !important;
                    line-height: 1.2 !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.13em !important;
                }

                .dashboard-night-mode
                .dashboard-section-heading > div > span {
                    color: #60a5fa !important;
                }

                .dashboard-section-heading h2 {
                    margin: 0 !important;
                    color: var(--dm-heading) !important;
                    font-size: 20px !important;
                    line-height: 1.25 !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.02em !important;
                }

                .dashboard-section-heading p {
                    margin: 7px 0 0 !important;
                    color: var(--dm-muted) !important;
                    font-size: 12px !important;
                    line-height: 1.55 !important;
                }


                /* =====================================================
                   QUICK OPERATIONS
                ===================================================== */

                .quick-operations {
                    padding: 22px !important;
                    margin-bottom: 20px !important;
                }

                .dashboard-operation-grid {
                    display: grid !important;
                    grid-template-columns:
                        repeat(4, minmax(0, 1fr)) !important;
                    gap: 12px !important;
                }

                .dashboard-modern .dashboard-operation {
                    min-width: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    padding: 15px !important;
                    border: 1px solid var(--dm-border) !important;
                    border-radius: 13px !important;
                    background: var(--dm-surface-soft) !important;
                    color: var(--dm-heading) !important;
                    text-align: left !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                }

                .dashboard-operation:hover {
                    transform: translateY(-2px) !important;
                }

                .dashboard-operation.blue:hover {
                    border-color: #93c5fd !important;
                    background: #eff6ff !important;
                }

                .dashboard-operation.orange:hover {
                    border-color: #fdba74 !important;
                    background: #fff7ed !important;
                }

                .dashboard-operation.green:hover {
                    border-color: #86efac !important;
                    background: #f0fdf4 !important;
                }

                .dashboard-operation.purple:hover {
                    border-color: #c4b5fd !important;
                    background: #faf5ff !important;
                }

                .dashboard-night-mode .dashboard-operation:hover {
                    background: #1d293d !important;
                }

                .operation-icon {
                    width: 39px !important;
                    height: 39px !important;
                    flex: 0 0 39px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 10px !important;
                    font-size: 17px !important;
                    font-weight: 900 !important;
                }

                .dashboard-operation.blue .operation-icon {
                    background: #dbeafe !important;
                    color: #2563eb !important;
                }

                .dashboard-operation.orange .operation-icon {
                    background: #ffedd5 !important;
                    color: #ea580c !important;
                }

                .dashboard-operation.green .operation-icon {
                    background: #dcfce7 !important;
                    color: #16a34a !important;
                }

                .dashboard-operation.purple .operation-icon {
                    background: #ede9fe !important;
                    color: #7c3aed !important;
                }

                .dashboard-night-mode
                .dashboard-operation.blue .operation-icon {
                    background: #17365c !important;
                    color: #60a5fa !important;
                }

                .dashboard-night-mode
                .dashboard-operation.orange .operation-icon {
                    background: #4a2816 !important;
                    color: #fb923c !important;
                }

                .dashboard-night-mode
                .dashboard-operation.green .operation-icon {
                    background: #123d2c !important;
                    color: #4ade80 !important;
                }

                .dashboard-night-mode
                .dashboard-operation.purple .operation-icon {
                    background: #322354 !important;
                    color: #c4b5fd !important;
                }

                .operation-content {
                    min-width: 0 !important;
                    flex: 1 !important;
                }

                .operation-content strong {
                    display: block !important;
                    color: var(--dm-heading) !important;
                    font-size: 13px !important;
                    line-height: 1.3 !important;
                    font-weight: 800 !important;
                }

                .operation-content small {
                    display: block !important;
                    margin-top: 3px !important;
                    color: var(--dm-muted) !important;
                    font-size: 10px !important;
                    line-height: 1.4 !important;
                }

                .operation-arrow {
                    flex: 0 0 auto !important;
                    color: var(--dm-faint) !important;
                    font-size: 17px !important;
                    font-weight: 700 !important;
                }


                /* =====================================================
                   TWO COLUMN
                ===================================================== */

                .dashboard-two-column {
                    display: grid !important;
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr)) !important;
                    gap: 20px !important;
                    margin-bottom: 20px !important;
                }

                .dashboard-two-column
                .dashboard-modern-card {
                    padding: 22px !important;
                }


                /* =====================================================
                   HEALTH
                ===================================================== */

                .dashboard-health-list {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 10px !important;
                }

                .dashboard-health-row {
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    min-width: 0 !important;
                    padding: 13px !important;
                    border: 1px solid var(--dm-border-soft) !important;
                    border-radius: 12px !important;
                    background: var(--dm-surface-soft) !important;
                }

                .health-round {
                    width: 35px !important;
                    height: 35px !important;
                    flex: 0 0 35px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 10px !important;
                    font-size: 14px !important;
                    font-weight: 900 !important;
                }

                .health-round.green {
                    background: #dcfce7 !important;
                    color: #15803d !important;
                }

                .health-round.red {
                    background: #fee2e2 !important;
                    color: #dc2626 !important;
                }

                .dashboard-night-mode .health-round.green {
                    background: #123d2c !important;
                    color: #4ade80 !important;
                }

                .dashboard-night-mode .health-round.red {
                    background: #461c25 !important;
                    color: #f87171 !important;
                }

                .health-row-content {
                    flex: 1 !important;
                    min-width: 0 !important;
                }

                .health-row-content strong {
                    display: block !important;
                    color: var(--dm-heading) !important;
                    font-size: 17px !important;
                    font-weight: 800 !important;
                    line-height: 1.2 !important;
                }

                .health-row-content span {
                    display: block !important;
                    margin-top: 2px !important;
                    color: var(--dm-muted) !important;
                    font-size: 11px !important;
                }


                /* =====================================================
                   STATUS PILLS
                ===================================================== */

                .dashboard-modern
                .dashboard-status-pill {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    min-height: 25px !important;
                    padding: 0 9px !important;
                    border-radius: 999px !important;
                    font-size: 10px !important;
                    line-height: 1 !important;
                    font-weight: 800 !important;
                    white-space: nowrap !important;
                }

                .dashboard-status-pill.green {
                    background: #dcfce7 !important;
                    color: #166534 !important;
                }

                .dashboard-status-pill.red {
                    background: #fee2e2 !important;
                    color: #b91c1c !important;
                }

                .dashboard-night-mode
                .dashboard-status-pill.green {
                    background: #123d2c !important;
                    color: #86efac !important;
                }

                .dashboard-night-mode
                .dashboard-status-pill.red {
                    background: #461c25 !important;
                    color: #fca5a5 !important;
                }


                /* =====================================================
                   VALUE
                ===================================================== */

                .dashboard-value-display {
                    padding: 15px 0 18px !important;
                }

                .dashboard-value-display span {
                    display: block !important;
                    margin-bottom: 7px !important;
                    color: var(--dm-muted) !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.1em !important;
                }

                .dashboard-value-display strong {
                    display: block !important;
                    color: var(--dm-heading) !important;
                    font-size: clamp(24px, 3vw, 31px) !important;
                    line-height: 1.2 !important;
                    font-weight: 850 !important;
                    overflow-wrap: anywhere !important;
                }

                .dashboard-metric-grid {
                    display: grid !important;
                    grid-template-columns:
                        repeat(3, minmax(0, 1fr)) !important;
                    border-top: 1px solid var(--dm-border-soft) !important;
                    padding-top: 17px !important;
                    gap: 10px !important;
                }

                .dashboard-metric-grid > div {
                    min-width: 0 !important;
                }

                .dashboard-metric-grid strong {
                    display: block !important;
                    color: var(--dm-heading) !important;
                    font-size: 17px !important;
                    line-height: 1.2 !important;
                    font-weight: 800 !important;
                }

                .dashboard-metric-grid span {
                    display: block !important;
                    margin-top: 4px !important;
                    color: var(--dm-muted) !important;
                    font-size: 10px !important;
                    line-height: 1.4 !important;
                }


                /* =====================================================
                   TABLE CARD
                ===================================================== */

                .dashboard-table-card {
                    margin-bottom: 20px !important;
                    padding: 22px !important;
                }

                .dashboard-heading-with-action {
                    align-items: center !important;
                }

                .dashboard-view-button {
                    flex: 0 0 auto !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 7px !important;
                    min-height: 36px !important;
                    padding: 0 12px !important;
                    border: 1px solid var(--dm-border) !important;
                    border-radius: 9px !important;
                    background: var(--dm-surface) !important;
                    color: #2563eb !important;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    cursor: pointer !important;
                }

                .dashboard-night-mode .dashboard-view-button {
                    color: #60a5fa !important;
                }

                .dashboard-view-button:hover {
                    border-color: #93c5fd !important;
                    background: var(--dm-surface-soft) !important;
                }


                /* =====================================================
                   TABLE WRAPPER
                ===================================================== */

                .dashboard-table-wrapper {
                    width: 100% !important;
                    overflow-x: auto !important;
                    border: 1px solid var(--dm-border-soft) !important;
                    border-radius: 12px !important;
                }

                .dashboard-modern-table {
                    width: 100% !important;
                    min-width: 760px !important;
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    background: var(--dm-surface) !important;
                    color: var(--dm-text) !important;
                }

                .dashboard-modern-table thead th {
                    padding: 12px 14px !important;
                    background: var(--dm-surface-soft) !important;
                    border-bottom: 1px solid var(--dm-border) !important;
                    color: var(--dm-muted) !important;
                    font-size: 10px !important;
                    line-height: 1.3 !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.07em !important;
                    text-align: left !important;
                    white-space: nowrap !important;
                }

                .dashboard-modern-table tbody td {
                    padding: 13px 14px !important;
                    border-bottom: 1px solid var(--dm-border-soft) !important;
                    color: var(--dm-text) !important;
                    background: var(--dm-surface) !important;
                    font-size: 12px !important;
                    line-height: 1.4 !important;
                    vertical-align: middle !important;
                }

                .dashboard-modern-table tbody tr:last-child td {
                    border-bottom: 0 !important;
                }

                .dashboard-modern-table tbody tr:hover td {
                    background: var(--dm-surface-soft) !important;
                }

                .dashboard-modern-table strong {
                    color: var(--dm-heading) !important;
                }

                .dashboard-table-item {
                    display: inline-block !important;
                    max-width: 230px !important;
                    color: var(--dm-heading) !important;
                    font-size: 12px !important;
                    font-weight: 750 !important;
                    overflow-wrap: anywhere !important;
                }

                .dashboard-number {
                    color: var(--dm-heading) !important;
                    font-weight: 800 !important;
                }

                .table-money {
                    color: var(--dm-heading) !important;
                    font-weight: 700 !important;
                    white-space: nowrap !important;
                }


                /* =====================================================
                   SKU
                ===================================================== */

                .dashboard-modern .dashboard-sku {
                    display: inline-flex !important;
                    align-items: center !important;
                    padding: 5px 8px !important;
                    border-radius: 7px !important;
                    background: #f1f5f9 !important;
                    color: #475569 !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.03em !important;
                    white-space: nowrap !important;
                }

                .dashboard-night-mode .dashboard-sku {
                    background: #1e293b !important;
                    color: #cbd5e1 !important;
                }


                /* =====================================================
                   CATEGORY BADGE
                ===================================================== */

                .dashboard-modern
                .dashboard-category-badge {
                    display: inline-flex !important;
                    align-items: center !important;
                    max-width: 150px !important;
                    padding: 5px 9px !important;
                    border: 1px solid #dbeafe !important;
                    border-radius: 7px !important;
                    background: #eff6ff !important;
                    color: #1d4ed8 !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }

                .dashboard-night-mode
                .dashboard-category-badge {
                    border-color: #244b78 !important;
                    background: #162f4f !important;
                    color: #93c5fd !important;
                }


                /* =====================================================
                   TRANSACTION PILL
                ===================================================== */

                .dashboard-modern
                .dashboard-transaction-pill {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 5px !important;
                    min-height: 25px !important;
                    padding: 0 9px !important;
                    border-radius: 999px !important;
                    font-size: 9px !important;
                    font-weight: 900 !important;
                    letter-spacing: 0.04em !important;
                    white-space: nowrap !important;
                }

                .dashboard-transaction-pill.in {
                    background: #dcfce7 !important;
                    color: #166534 !important;
                }

                .dashboard-transaction-pill.out {
                    background: #ffedd5 !important;
                    color: #c2410c !important;
                }

                .dashboard-night-mode
                .dashboard-transaction-pill.in {
                    background: #123d2c !important;
                    color: #86efac !important;
                }

                .dashboard-night-mode
                .dashboard-transaction-pill.out {
                    background: #452315 !important;
                    color: #fdba74 !important;
                }


                /* =====================================================
                   ACTIVITY SUMMARY
                ===================================================== */

                .dashboard-activity-summary {
                    display: grid !important;
                    grid-template-columns:
                        repeat(4, minmax(0, 1fr)) !important;
                    gap: 10px !important;
                    margin-bottom: 18px !important;
                }

                .dashboard-activity-summary > div {
                    min-width: 0 !important;
                    padding: 13px !important;
                    border: 1px solid var(--dm-border-soft) !important;
                    border-radius: 10px !important;
                    background: var(--dm-surface-soft) !important;
                }

                .dashboard-activity-summary strong {
                    display: block !important;
                    color: var(--dm-heading) !important;
                    font-size: 17px !important;
                    line-height: 1.2 !important;
                    font-weight: 800 !important;
                }

                .dashboard-activity-summary span {
                    display: block !important;
                    margin-top: 4px !important;
                    color: var(--dm-muted) !important;
                    font-size: 9px !important;
                    line-height: 1.35 !important;
                }


                /* =====================================================
                   LOW STOCK ALERT
                ===================================================== */

                .dashboard-alert-card {
                    margin-bottom: 20px !important;
                    padding: 22px !important;
                }

                .dashboard-alert-card
                .alert-heading {
                    color: #dc2626 !important;
                }

                .dashboard-night-mode
                .dashboard-alert-card
                .alert-heading {
                    color: #f87171 !important;
                }

                .dashboard-alert-list {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 9px !important;
                }

                .dashboard-alert-row {
                    display: grid !important;
                    grid-template-columns:
                        minmax(0, 1fr)
                        auto
                        auto !important;
                    align-items: center !important;
                    gap: 15px !important;
                    padding: 13px 14px !important;
                    border: 1px solid #fee2e2 !important;
                    border-radius: 11px !important;
                    background: #fffafa !important;
                }

                .dashboard-night-mode
                .dashboard-alert-row {
                    border-color: #4b242d !important;
                    background: #1d1419 !important;
                }

                .alert-item-info {
                    min-width: 0 !important;
                }

                .alert-item-info strong {
                    display: block !important;
                    color: var(--dm-heading) !important;
                    font-size: 12px !important;
                    font-weight: 800 !important;
                }

                .alert-item-info span {
                    display: block !important;
                    margin-top: 3px !important;
                    color: var(--dm-muted) !important;
                    font-size: 10px !important;
                }

                .alert-stock {
                    text-align: right !important;
                    white-space: nowrap !important;
                }

                .alert-stock strong {
                    color: #dc2626 !important;
                    font-size: 16px !important;
                    font-weight: 800 !important;
                }

                .dashboard-night-mode
                .alert-stock strong {
                    color: #f87171 !important;
                }

                .alert-stock span {
                    color: var(--dm-muted) !important;
                    font-size: 10px !important;
                }

                .dashboard-restock-button {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 5px !important;
                    min-height: 34px !important;
                    padding: 0 11px !important;
                    border: 1px solid #fecaca !important;
                    border-radius: 8px !important;
                    background: #ffffff !important;
                    color: #dc2626 !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    cursor: pointer !important;
                }

                .dashboard-night-mode
                .dashboard-restock-button {
                    border-color: #6b3039 !important;
                    background: #29151a !important;
                    color: #fca5a5 !important;
                }


                /* =====================================================
                   HEALTHY MESSAGE
                ===================================================== */

                .dashboard-healthy-message {
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    padding: 15px !important;
                    border: 1px solid #bbf7d0 !important;
                    border-radius: 11px !important;
                    background: #f0fdf4 !important;
                }

                .dashboard-night-mode
                .dashboard-healthy-message {
                    border-color: #20543b !important;
                    background: #10281e !important;
                }

                .dashboard-healthy-message > span {
                    width: 34px !important;
                    height: 34px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 50% !important;
                    background: #16a34a !important;
                    color: white !important;
                    font-weight: 900 !important;
                }

                .dashboard-healthy-message strong {
                    display: block !important;
                    color: #166534 !important;
                    font-size: 12px !important;
                    font-weight: 800 !important;
                }

                .dashboard-night-mode
                .dashboard-healthy-message strong {
                    color: #86efac !important;
                }

                .dashboard-healthy-message small {
                    display: block !important;
                    margin-top: 3px !important;
                    color: #4b7a5c !important;
                    font-size: 10px !important;
                }

                .dashboard-night-mode
                .dashboard-healthy-message small {
                    color: #86a895 !important;
                }


                /* =====================================================
                   EMPTY STATE
                ===================================================== */

                .dashboard-empty-state {
                    min-height: 145px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 5px !important;
                    padding: 25px !important;
                    border: 1px dashed var(--dm-border) !important;
                    border-radius: 12px !important;
                    background: var(--dm-surface-soft) !important;
                    text-align: center !important;
                }

                .dashboard-empty-state > div {
                    margin-bottom: 3px !important;
                    font-size: 24px !important;
                }

                .dashboard-empty-state strong {
                    color: var(--dm-heading) !important;
                    font-size: 13px !important;
                    font-weight: 800 !important;
                }

                .dashboard-empty-state span {
                    color: var(--dm-muted) !important;
                    font-size: 11px !important;
                }


                /* =====================================================
                   LOADING
                ===================================================== */

                .dashboard-loading-box {
                    display: flex !important;
                    align-items: flex-start !important;
                    justify-content: space-between !important;
                    gap: 20px !important;
                }

                .dashboard-loading {
                    min-height: 240px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 10px !important;
                    color: var(--dm-muted) !important;
                    font-size: 13px !important;
                }

                .dashboard-spinner {
                    width: 18px !important;
                    height: 18px !important;
                    border: 2px solid var(--dm-border) !important;
                    border-top-color: #2563eb !important;
                    border-radius: 50% !important;
                    animation: dashboard-spin 0.8s linear infinite !important;
                }

                @keyframes dashboard-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }


                /* =====================================================
                   BOTTOM METRICS
                ===================================================== */

                .bottom-metrics {
                    padding-top: 4px !important;
                    border-top: 0 !important;
                }


                /* =====================================================
                   DARK MODE HARD OVERRIDES
                   These are deliberately explicit to prevent
                   old App.css rules from making text invisible.
                ===================================================== */

                .dashboard-night-mode,
                .dashboard-night-mode .dashboard-modern-card,
                .dashboard-night-mode .dashboard-modern-stat,
                .dashboard-night-mode .dashboard-operation,
                .dashboard-night-mode .dashboard-health-row,
                .dashboard-night-mode .dashboard-table-wrapper,
                .dashboard-night-mode .dashboard-modern-table,
                .dashboard-night-mode .dashboard-modern-table tbody td,
                .dashboard-night-mode .dashboard-modern-table thead th,
                .dashboard-night-mode .dashboard-activity-summary > div {
                    color: #d5deeb !important;
                }

                .dashboard-night-mode h1,
                .dashboard-night-mode h2,
                .dashboard-night-mode h3,
                .dashboard-night-mode strong,
                .dashboard-night-mode .dashboard-table-item,
                .dashboard-night-mode .dashboard-number,
                .dashboard-night-mode .table-money,
                .dashboard-night-mode .dashboard-value-display strong,
                .dashboard-night-mode .health-row-content strong,
                .dashboard-night-mode .dashboard-metric-grid strong,
                .dashboard-night-mode .dashboard-stat-content strong,
                .dashboard-night-mode .operation-content strong,
                .dashboard-night-mode .dashboard-activity-summary strong {
                    color: #f8fafc !important;
                }

                .dashboard-night-mode p,
                .dashboard-night-mode small,
                .dashboard-night-mode
                .dashboard-modern-header p,
                .dashboard-night-mode
                .dashboard-section-heading p,
                .dashboard-night-mode
                .dashboard-stat-content small,
                .dashboard-night-mode
                .operation-content small,
                .dashboard-night-mode
                .health-row-content span,
                .dashboard-night-mode
                .dashboard-metric-grid span,
                .dashboard-night-mode
                .dashboard-activity-summary span,
                .dashboard-night-mode
                .alert-item-info span,
                .dashboard-night-mode
                .alert-stock span {
                    color: #9aa9bd !important;
                }

                .dashboard-night-mode
                .dashboard-modern-table tbody td {
                    background: #111827 !important;
                }

                .dashboard-night-mode
                .dashboard-modern-table thead th {
                    background: #182235 !important;
                }

                .dashboard-night-mode
                .dashboard-modern-table tbody tr:hover td {
                    background: #182235 !important;
                }


                /* =====================================================
                   RESPONSIVE
                ===================================================== */

                @media (max-width: 1200px) {

                    .dashboard-stat-grid {
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr)) !important;
                    }

                    .dashboard-operation-grid {
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr)) !important;
                    }

                }


                @media (max-width: 900px) {

                    .dashboard-modern-header {
                        flex-direction: column !important;
                    }

                    .dashboard-modern-actions {
                        width: 100% !important;
                        justify-content: flex-start !important;
                    }

                    .dashboard-two-column {
                        grid-template-columns:
                            1fr !important;
                    }

                }


                @media (max-width: 650px) {

                    .dashboard-modern {
                        padding-bottom: 25px !important;
                    }

                    .dashboard-stat-grid {
                        grid-template-columns:
                            1fr !important;
                    }

                    .dashboard-operation-grid {
                        grid-template-columns:
                            1fr !important;
                    }

                    .dashboard-modern-actions {
                        width: 100% !important;
                    }

                    .dashboard-modern-actions
                    .dashboard-theme-toggle,
                    .dashboard-modern-actions
                    .dashboard-modern-button {
                        flex: 1 !important;
                    }

                    .dashboard-heading-with-action {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }

                    .dashboard-activity-summary {
                        grid-template-columns:
                            repeat(2, minmax(0, 1fr)) !important;
                    }

                    .dashboard-alert-row {
                        grid-template-columns: 1fr !important;
                    }

                    .alert-stock {
                        text-align: left !important;
                    }

                    .dashboard-restock-button {
                        width: 100% !important;
                        justify-content: center !important;
                    }

                    .dashboard-metric-grid {
                        grid-template-columns:
                            repeat(3, minmax(0, 1fr)) !important;
                    }

                }


                @media (max-width: 430px) {

                    .dashboard-modern-header h1 {
                        font-size: 27px !important;
                    }

                    .dashboard-section-heading h2 {
                        font-size: 18px !important;
                    }

                    .dashboard-table-card,
                    .dashboard-two-column
                    .dashboard-modern-card,
                    .quick-operations,
                    .dashboard-alert-card {
                        padding: 16px !important;
                    }

                    .dashboard-activity-summary {
                        grid-template-columns:
                            1fr !important;
                    }

                    .dashboard-metric-grid {
                        grid-template-columns:
                            1fr !important;
                    }

                }

            `}</style>

        </div>
    );
}

export default Dashboard;