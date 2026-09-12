import { useEffect, useMemo, useState } from "react";
import { getLowStockItems } from "../services/api";

function LowStock({ onAddStock }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const loadLowStockItems = async (showRefresh = false) => {
        try {
            setError("");

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await getLowStockItems();
            setItems(data);
        } catch (err) {
            setError(
                err.message || "Failed to load low stock items"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadLowStockItems();
    }, []);

    const filteredItems = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return items;
        }

        return items.filter(
            (item) =>
                item.sku?.toLowerCase().includes(value) ||
                item.name?.toLowerCase().includes(value) ||
                item.category?.toLowerCase().includes(value)
        );
    }, [items, search]);

    const getStockLevel = (quantity, threshold) => {
        if (quantity === 0) {
            return "Out of Stock";
        }

        if (quantity <= threshold / 2) {
            return "Critical";
        }

        return "Low Stock";
    };

    const getStockPercentage = (quantity, threshold) => {
        if (!threshold || threshold <= 0) {
            return 0;
        }

        return Math.min(
            (quantity / threshold) * 100,
            100
        );
    };

    const totalLowStockUnits = items.reduce(
        (total, item) =>
            total + (item.quantity || 0),
        0
    );

    const criticalItems = items.filter(
        (item) =>
            item.quantity === 0 ||
            item.quantity <= item.threshold / 2
    ).length;

    const outOfStockItems = items.filter(
        (item) => item.quantity === 0
    ).length;

    return (
        <div className="low-stock-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header low-stock-page-header">

                <div>

                    <span className="page-eyebrow">
                        INVENTORY MONITORING
                    </span>

                    <h1>
                        Low Stock Alerts
                    </h1>

                    <p>
                        Monitor items that have reached or
                        fallen below their minimum stock threshold.
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={() =>
                        loadLowStockItems(true)
                    }
                    disabled={refreshing}
                >

                    <span
                        className={
                            refreshing
                                ? "refresh-icon spinning"
                                : "refresh-icon"
                        }
                    >
                        ↻
                    </span>

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =========================
                SUMMARY CARDS
            ========================= */}

            <div className="low-stock-summary-grid">

                <div className="low-stock-summary-card">

                    <div className="low-stock-summary-icon warning">
                        ⚠
                    </div>

                    <div>

                        <span>
                            Total Alerts
                        </span>

                        <strong>
                            {items.length}
                        </strong>

                        <small>
                            Items requiring attention
                        </small>

                    </div>

                </div>


                <div className="low-stock-summary-card">

                    <div className="low-stock-summary-icon critical">
                        !
                    </div>

                    <div>

                        <span>
                            Critical Items
                        </span>

                        <strong>
                            {criticalItems}
                        </strong>

                        <small>
                            Very low stock level
                        </small>

                    </div>

                </div>


                <div className="low-stock-summary-card">

                    <div className="low-stock-summary-icon danger">
                        ⛔
                    </div>

                    <div>

                        <span>
                            Out of Stock
                        </span>

                        <strong>
                            {outOfStockItems}
                        </strong>

                        <small>
                            Immediate action required
                        </small>

                    </div>

                </div>


                <div className="low-stock-summary-card">

                    <div className="low-stock-summary-icon units">
                        📦
                    </div>

                    <div>

                        <span>
                            Available Units
                        </span>

                        <strong>
                            {totalLowStockUnits}
                        </strong>

                        <small>
                            Across low-stock items
                        </small>

                    </div>

                </div>

            </div>


            {/* =========================
                MAIN CARD
            ========================= */}

            <div className="content-card low-stock-content-card">

                <div className="low-stock-toolbar">

                    <div>

                        <h2>
                            Items Requiring Attention
                        </h2>

                        <p>
                            {items.length === 0
                                ? "No low-stock items found."
                                : `${filteredItems.length} of ${items.length} items displayed`}
                        </p>

                    </div>


                    <div className="low-stock-search-wrapper">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search SKU, name or category..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        {search && (
                            <button
                                className="clear-search-button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                ×
                            </button>
                        )}

                    </div>

                </div>


                {/* =========================
                    LOADING
                ========================= */}

                {loading && (
                    <div className="low-stock-state">

                        <div className="loading-spinner"></div>

                        <h3>
                            Loading low-stock items...
                        </h3>

                        <p>
                            Please wait while inventory
                            data is loaded.
                        </p>

                    </div>
                )}


                {/* =========================
                    ERROR
                ========================= */}

                {!loading && error && (
                    <div className="low-stock-state error-state">

                        <div className="state-icon">
                            ⚠
                        </div>

                        <h3>
                            Unable to load alerts
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            className="primary-action-button"
                            onClick={() =>
                                loadLowStockItems()
                            }
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {/* =========================
                    EMPTY
                ========================= */}

                {!loading &&
                    !error &&
                    filteredItems.length === 0 && (

                        <div className="low-stock-state success-empty-state">

                            <div className="state-icon">
                                ✓
                            </div>

                            <h3>
                                {items.length === 0
                                    ? "All stock levels are healthy"
                                    : "No matching items"}
                            </h3>

                            <p>
                                {items.length === 0
                                    ? "There are currently no items below their configured stock threshold."
                                    : "Try searching with a different SKU, item name or category."}
                            </p>

                        </div>
                    )}


                {/* =========================
                    TABLE
                ========================= */}

                {!loading &&
                    !error &&
                    filteredItems.length > 0 && (

                        <div className="table-wrapper">

                            <table className="low-stock-table">

                                <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        ITEM
                                    </th>

                                    <th>
                                        SKU
                                    </th>

                                    <th>
                                        CATEGORY
                                    </th>

                                    <th>
                                        CURRENT STOCK
                                    </th>

                                    <th>
                                        THRESHOLD
                                    </th>

                                    <th>
                                        STOCK LEVEL
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {filteredItems.map(
                                    (item, index) => {

                                        const level =
                                            getStockLevel(
                                                item.quantity,
                                                item.threshold
                                            );

                                        const percentage =
                                            getStockPercentage(
                                                item.quantity,
                                                item.threshold
                                            );

                                        return (

                                            <tr
                                                key={item.id}
                                            >

                                                {/* NUMBER */}

                                                <td>

                                                    <span className="row-number">
                                                        {index + 1}
                                                    </span>

                                                </td>


                                                {/* ITEM */}

                                                <td>

                                                    <div className="low-stock-item-info">

                                                        <div className="low-stock-item-icon">
                                                            📦
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {item.name}
                                                            </strong>

                                                            <span>
                                                                ₹
                                                                {Number(
                                                                    item.unitPrice || 0
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                                {" "}per unit
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* SKU */}

                                                <td>

                                                    <span className="sku-badge">
                                                        {item.sku}
                                                    </span>

                                                </td>


                                                {/* CATEGORY */}

                                                <td>

                                                    <span className="category-badge">
                                                        {item.category}
                                                    </span>

                                                </td>


                                                {/* CURRENT STOCK */}

                                                <td>

                                                    <div className="current-stock-cell">

                                                        <strong
                                                            className={
                                                                item.quantity === 0
                                                                    ? "stock-zero"
                                                                    : "stock-low"
                                                            }
                                                        >
                                                            {item.quantity}
                                                        </strong>

                                                        <div className="stock-progress">

                                                            <div
                                                                className="stock-progress-bar"
                                                                style={{
                                                                    width: `${percentage}%`
                                                                }}
                                                            ></div>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* THRESHOLD */}

                                                <td>

                                                    <span className="threshold-value">
                                                        {item.threshold}
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`stock-status-badge ${
                                                            level === "Out of Stock"
                                                                ? "out"
                                                                : level === "Critical"
                                                                    ? "critical"
                                                                    : "low"
                                                        }`}
                                                    >

                                                        <span className="status-dot"></span>

                                                        {level}

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="stock-action-button"
                                                        onClick={() => {

                                                            if (onAddStock) {
                                                                onAddStock(item);
                                                            }

                                                        }}
                                                    >

                                                        + Add Stock

                                                    </button>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                                </tbody>

                            </table>

                        </div>
                    )}

            </div>

        </div>
    );
}

export default LowStock;