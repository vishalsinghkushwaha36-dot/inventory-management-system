import { useEffect, useMemo, useState } from "react";
import { getTransactionHistory } from "../services/api";

function TransactionHistory() {

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");


    // =========================
    // LOAD TRANSACTIONS
    // =========================

    useEffect(() => {
        loadTransactions();
    }, []);


    const loadTransactions = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getTransactionHistory();

            setTransactions(data);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load transaction history."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // REFRESH
    // =========================

    const handleRefresh = async () => {

        try {

            setRefreshing(true);
            setError("");

            const data = await getTransactionHistory();

            setTransactions(data);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to refresh transaction history."
            );

        } finally {

            setRefreshing(false);

        }

    };


    // =========================
    // FILTER TRANSACTIONS
    // =========================

    const filteredTransactions = useMemo(() => {

        const search = searchTerm
            .trim()
            .toLowerCase();

        return transactions.filter((transaction) => {

            const item = transaction?.item;

            const supplier = transaction?.supplier;

            const searchValue =
                `${item?.sku || ""} ` +
                `${item?.name || ""} ` +
                `${item?.category || ""} ` +
                `${supplier?.name || ""} ` +
                `${supplier?.company || ""} ` +
                `${transaction?.remarks || ""}`
                    .toLowerCase();

            const matchesSearch =
                search === "" ||
                searchValue.includes(search);

            const matchesType =
                filterType === "ALL" ||
                transaction.type === filterType;

            return (
                matchesSearch &&
                matchesType
            );

        });

    }, [
        transactions,
        searchTerm,
        filterType
    ]);


    // =========================
    // SUMMARY
    // =========================

    const totalTransactions =
        transactions.length;


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


    const totalStockIn =
        stockInTransactions.reduce(
            (total, transaction) =>
                total +
                Number(transaction.quantity || 0),
            0
        );


    const totalStockOut =
        stockOutTransactions.reduce(
            (total, transaction) =>
                total +
                Number(transaction.quantity || 0),
            0
        );


    const totalUnitsMoved =
        totalStockIn +
        totalStockOut;


    // =========================
    // DATE FORMAT
    // =========================

    const formatDateTime = (dateTime) => {

        if (!dateTime) {
            return "—";
        }

        const date = new Date(dateTime);

        if (Number.isNaN(date.getTime())) {
            return dateTime;
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =========================
    // CLEAR SEARCH
    // =========================

    const clearSearch = () => {
        setSearchTerm("");
    };


    // =========================
    // CLEAR FILTERS
    // =========================

    const clearFilters = () => {

        setSearchTerm("");
        setFilterType("ALL");

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="transactions-history-page">

                <div className="top-header">

                    <div className="page-title-row">

                        <div className="page-title-icon history-title-icon">
                            ⟳
                        </div>

                        <div>

                            <h1>
                                Transaction History
                            </h1>

                            <p>
                                Track all inventory stock movements
                            </p>

                        </div>

                    </div>

                </div>


                <div className="history-loading-card">

                    <div className="history-loading-spinner"></div>

                    <strong>
                        Loading transaction history...
                    </strong>

                    <span>
                        Please wait while records are being loaded.
                    </span>

                </div>

            </div>

        );

    }


    return (

        <div className="transactions-history-page">


            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="top-header history-page-header">

                <div className="page-title-row">

                    <div className="page-title-icon history-title-icon">
                        ⟳
                    </div>

                    <div>

                        <h1>
                            Transaction History
                        </h1>

                        <p>
                            Track and monitor all inventory stock movements
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="premium-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    {refreshing ? (

                        <>
                            <span className="refresh-spinner"></span>
                            Refreshing...
                        </>

                    ) : (

                        <>
                            <span className="refresh-icon">
                                ↻
                            </span>

                            Refresh
                        </>

                    )}

                </button>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div className="history-error-alert">

                    <div className="history-alert-icon">
                        !
                    </div>

                    <div className="history-alert-content">

                        <strong>
                            Unable to load history
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        className="history-alert-close"
                        onClick={() => setError("")}
                    >
                        ×
                    </button>

                </div>

            )}


            {!error && (

                <>


                    {/* =================================================
                        SUMMARY CARDS
                    ================================================= */}

                    <section className="transaction-summary-grid">


                        {/* TOTAL TRANSACTIONS */}

                        <div className="transaction-summary-card premium-summary-card">

                            <div className="transaction-summary-icon blue">
                                📋
                            </div>

                            <div className="summary-card-content">

                                <span>
                                    Total Transactions
                                </span>

                                <strong>
                                    {totalTransactions}
                                </strong>

                                <small>
                                    All recorded movements
                                </small>

                            </div>

                        </div>


                        {/* STOCK IN */}

                        <div className="transaction-summary-card premium-summary-card">

                            <div className="transaction-summary-icon green">
                                ↓
                            </div>

                            <div className="summary-card-content">

                                <span>
                                    Stock-IN
                                </span>

                                <strong>
                                    {totalStockIn}
                                </strong>

                                <small>
                                    Units received
                                </small>

                            </div>

                        </div>


                        {/* STOCK OUT */}

                        <div className="transaction-summary-card premium-summary-card">

                            <div className="transaction-summary-icon red">
                                ↑
                            </div>

                            <div className="summary-card-content">

                                <span>
                                    Stock-OUT
                                </span>

                                <strong>
                                    {totalStockOut}
                                </strong>

                                <small>
                                    Units issued
                                </small>

                            </div>

                        </div>


                        {/* TOTAL MOVEMENT */}

                        <div className="transaction-summary-card premium-summary-card">

                            <div className="transaction-summary-icon purple">
                                📦
                            </div>

                            <div className="summary-card-content">

                                <span>
                                    Total Units Moved
                                </span>

                                <strong>
                                    {totalUnitsMoved}
                                </strong>

                                <small>
                                    Inventory movement
                                </small>

                            </div>

                        </div>


                    </section>


                    {/* =================================================
                        HISTORY CARD
                    ================================================= */}

                    <section className="content-card transaction-history-card premium-history-card">


                        {/* HEADER */}

                        <div className="transaction-history-header premium-history-header">

                            <div>

                                <span className="history-eyebrow">
                                    AUDIT TRAIL
                                </span>

                                <h2>
                                    All Transactions
                                </h2>

                                <p>
                                    Complete inventory movement records
                                </p>

                            </div>


                            <div className="transaction-count premium-transaction-count">

                                <strong>
                                    {filteredTransactions.length}
                                </strong>

                                <span>
                                    {filteredTransactions.length === 1
                                        ? "record"
                                        : "records"}
                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            FILTER BAR
                        ================================================= */}

                        <div className="transaction-filters premium-history-filters">


                            {/* SEARCH */}

                            <div className="transaction-search premium-transaction-search">

                                <span className="search-icon">
                                    🔎
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search SKU, item, category, supplier or remarks..."
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                />

                                {searchTerm && (

                                    <button
                                        type="button"
                                        className="history-search-clear"
                                        onClick={clearSearch}
                                        title="Clear search"
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>

                                )}

                            </div>


                            {/* FILTER BUTTONS */}

                            <div className="transaction-filter-buttons premium-filter-buttons">

                                <button
                                    type="button"
                                    className={
                                        filterType === "ALL"
                                            ? "history-filter active"
                                            : "history-filter"
                                    }
                                    onClick={() =>
                                        setFilterType("ALL")
                                    }
                                >
                                    All
                                </button>


                                <button
                                    type="button"
                                    className={
                                        filterType === "STOCK_IN"
                                            ? "history-filter stock-in-filter active"
                                            : "history-filter stock-in-filter"
                                    }
                                    onClick={() =>
                                        setFilterType("STOCK_IN")
                                    }
                                >
                                    ↓ Stock-IN
                                </button>


                                <button
                                    type="button"
                                    className={
                                        filterType === "STOCK_OUT"
                                            ? "history-filter stock-out-filter active"
                                            : "history-filter stock-out-filter"
                                    }
                                    onClick={() =>
                                        setFilterType("STOCK_OUT")
                                    }
                                >
                                    ↑ Stock-OUT
                                </button>


                                {(searchTerm ||
                                    filterType !== "ALL") && (

                                    <button
                                        type="button"
                                        className="clear-history-filters"
                                        onClick={clearFilters}
                                        title="Clear all filters"
                                    >
                                        × Clear
                                    </button>

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            EMPTY STATE
                        ================================================= */}

                        {filteredTransactions.length === 0 ? (

                            <div className="transaction-empty-state premium-empty-state">

                                <div className="transaction-empty-icon">
                                    📋
                                </div>

                                <h3>
                                    No transactions found
                                </h3>

                                <p>
                                    No records match your current search or filter.
                                </p>

                                {(searchTerm ||
                                    filterType !== "ALL") && (

                                    <button
                                        type="button"
                                        className="empty-clear-button"
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </button>

                                )}

                            </div>

                        ) : (

                            /* =================================================
                               TABLE
                            ================================================= */

                            <div className="table-container premium-table-container">

                                <table className="transaction-history-table premium-history-table">

                                    <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Date & Time
                                        </th>

                                        <th>
                                            Item
                                        </th>

                                        <th>
                                            SKU
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Supplier
                                        </th>

                                        <th>
                                            Remarks
                                        </th>

                                    </tr>

                                    </thead>


                                    <tbody>

                                    {filteredTransactions.map(
                                        (transaction, index) => {

                                            const item =
                                                transaction?.item;

                                            const supplier =
                                                transaction?.supplier;

                                            const isStockIn =
                                                transaction?.type ===
                                                "STOCK_IN";

                                            return (

                                                <tr
                                                    key={
                                                        transaction.id
                                                    }
                                                >


                                                    {/* NUMBER */}

                                                    <td>

                                                        <span className="transaction-number premium-row-number">
                                                            {index + 1}
                                                        </span>

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        <div className="transaction-date premium-date">

                                                            <strong>
                                                                {formatDateTime(
                                                                    transaction.transactionDate
                                                                )}
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    {/* ITEM */}

                                                    <td>

                                                        <div className="transaction-item-info premium-item-info">

                                                            <div className="transaction-item-icon">
                                                                📦
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {item?.name ||
                                                                        "Unknown Item"}
                                                                </strong>

                                                                <span>
                                                                    {item?.category ||
                                                                        "—"}
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* SKU */}

                                                    <td>

                                                        <span className="transaction-sku premium-sku">
                                                            {item?.sku ||
                                                                "—"}
                                                        </span>

                                                    </td>


                                                    {/* TYPE */}

                                                    <td>

                                                        {isStockIn ? (

                                                            <span className="transaction-type-badge stock-in premium-type-badge">

                                                                <span className="badge-arrow">
                                                                    ↓
                                                                </span>

                                                                Stock-IN

                                                            </span>

                                                        ) : (

                                                            <span className="transaction-type-badge stock-out premium-type-badge">

                                                                <span className="badge-arrow">
                                                                    ↑
                                                                </span>

                                                                Stock-OUT

                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* QUANTITY */}

                                                    <td>

                                                        <span
                                                            className={
                                                                isStockIn
                                                                    ? "transaction-quantity stock-in-quantity premium-quantity"
                                                                    : "transaction-quantity stock-out-quantity premium-quantity"
                                                            }
                                                        >

                                                            {isStockIn
                                                                ? "+"
                                                                : "-"}

                                                            {transaction.quantity}

                                                        </span>

                                                    </td>


                                                    {/* SUPPLIER */}

                                                    <td>

                                                        {supplier ? (

                                                            <div className="supplier-info premium-supplier-info">

                                                                <strong>
                                                                    {
                                                                        supplier.company
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        supplier.name
                                                                    }
                                                                </span>

                                                            </div>

                                                        ) : (

                                                            <span className="not-available premium-not-available">
                                                                No supplier
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* REMARKS */}

                                                    <td>

                                                        <span className="transaction-remarks premium-remarks">

                                                            {
                                                                transaction.remarks ||
                                                                "No remarks"
                                                            }

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

                </>

            )}

        </div>

    );

}

export default TransactionHistory;