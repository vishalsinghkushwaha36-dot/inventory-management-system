import { useEffect, useState } from "react";
import {
    getItems,
    getSuppliers,
    stockIn,
    stockOut
} from "../services/api";

function StockTransactions({
                               initialItem,
                               onTransactionSuccess
                           }) {

    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [transactionType, setTransactionType] =
        useState("STOCK_IN");

    const [sku, setSku] = useState("");
    const [quantity, setQuantity] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [remarks, setRemarks] = useState("");

    // Search states
    const [itemSearch, setItemSearch] = useState("");
    const [supplierSearch, setSupplierSearch] = useState("");
    const [showItemSearch, setShowItemSearch] = useState(false);
    const [showSupplierSearch, setShowSupplierSearch] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =========================
    // LOAD ITEMS & SUPPLIERS
    // =========================

    useEffect(() => {
        loadData();
    }, []);


    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [itemsData, suppliersData] =
                await Promise.all([
                    getItems(),
                    getSuppliers()
                ]);

            setItems(itemsData);
            setSuppliers(suppliersData);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load transaction data."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // AUTO SELECT REORDER ITEM
    // =========================

    useEffect(() => {

        if (initialItem) {

            setTransactionType("STOCK_IN");
            setSku(initialItem.sku);
            setQuantity("");
            setSupplierId("");
            setRemarks("");

            setItemSearch(
                `${initialItem.sku} - ${initialItem.name}`
            );

            setSupplierSearch("");

            setShowItemSearch(false);
            setShowSupplierSearch(false);

            setError("");
            setSuccess("");

        }

    }, [initialItem]);


    // =========================
    // SELECT ITEM
    // =========================

    const selectItem = (item) => {

        setSku(item.sku);

        setItemSearch(
            `${item.sku} - ${item.name}`
        );

        setShowItemSearch(false);

        setError("");
        setSuccess("");

    };


    // =========================
    // CLEAR ITEM
    // =========================

    const clearItem = () => {

        setSku("");
        setItemSearch("");
        setShowItemSearch(false);

        setError("");
        setSuccess("");

    };


    // =========================
    // SELECT SUPPLIER
    // =========================

    const selectSupplier = (supplier) => {

        setSupplierId(String(supplier.id));

        setSupplierSearch(
            `${supplier.company} - ${supplier.name}`
        );

        setShowSupplierSearch(false);

        setError("");
        setSuccess("");

    };


    // =========================
    // CLEAR SUPPLIER
    // =========================

    const clearSupplier = () => {

        setSupplierId("");
        setSupplierSearch("");
        setShowSupplierSearch(false);

        setError("");
        setSuccess("");

    };


    // =========================
    // FILTER ITEMS
    // =========================

    const filteredItems = items.filter((item) => {

        const search = itemSearch
            .trim()
            .toLowerCase();

        if (!search) {
            return true;
        }

        return (
            String(item.sku || "")
                .toLowerCase()
                .includes(search) ||

            String(item.name || "")
                .toLowerCase()
                .includes(search) ||

            String(item.category || "")
                .toLowerCase()
                .includes(search)
        );

    });


    // =========================
    // FILTER SUPPLIERS
    // =========================

    const filteredSuppliers = suppliers.filter((supplier) => {

        const search = supplierSearch
            .trim()
            .toLowerCase();

        if (!search) {
            return true;
        }

        return (
            String(supplier.company || "")
                .toLowerCase()
                .includes(search) ||

            String(supplier.name || "")
                .toLowerCase()
                .includes(search) ||

            String(supplier.email || "")
                .toLowerCase()
                .includes(search) ||

            String(supplier.contact || "")
                .toLowerCase()
                .includes(search)
        );

    });


    // =========================
    // SUBMIT TRANSACTION
    // =========================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (!sku) {

            setError("Please select an item.");
            return;

        }


        if (!quantity || Number(quantity) <= 0) {

            setError("Quantity must be greater than 0.");
            return;

        }


        if (
            transactionType === "STOCK_IN" &&
            !supplierId
        ) {

            setError(
                "Please select a supplier for Stock-IN."
            );

            return;

        }


        try {

            setSubmitting(true);

            let updatedItem;


            // =========================
            // STOCK-IN
            // =========================

            if (transactionType === "STOCK_IN") {

                updatedItem = await stockIn(
                    sku,
                    Number(quantity),
                    remarks,
                    Number(supplierId)
                );

                setSuccess(
                    `Stock-IN successful. Current stock: ${updatedItem.quantity}`
                );

            }


            // =========================
            // STOCK-OUT
            // =========================

            else {

                updatedItem = await stockOut(
                    sku,
                    Number(quantity),
                    remarks
                );

                setSuccess(
                    `Stock-OUT successful. Current stock: ${updatedItem.quantity}`
                );

            }


            // =========================
            // REFRESH ITEMS
            // =========================

            const updatedItems = await getItems();

            setItems(updatedItems);


            // =========================
            // REFRESH DASHBOARD
            // =========================

            if (onTransactionSuccess) {

                await onTransactionSuccess();

            }


            // =========================
            // RESET FORM
            // =========================

            setQuantity("");
            setSupplierId("");
            setSupplierSearch("");
            setRemarks("");

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Transaction failed."
            );

        } finally {

            setSubmitting(false);

        }

    };


    // =========================
    // SELECTED ITEM
    // =========================

    const selectedItem = items.find(
        (item) => item.sku === sku
    );


    // =========================
    // TRANSACTION TYPE
    // =========================

    const changeTransactionType = (type) => {

        setTransactionType(type);

        setError("");
        setSuccess("");

        if (type === "STOCK_OUT") {

            setSupplierId("");
            setSupplierSearch("");
            setShowSupplierSearch(false);

        }

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div>

                <div className="top-header">

                    <div>

                        <h1>
                            Stock Transactions
                        </h1>

                        <p>
                            Manage stock-in and stock-out transactions
                        </p>

                    </div>

                </div>


                <div className="transaction-loading-card">

                    <div className="transaction-loading-spinner"></div>

                    <span>
                        Loading transaction data...
                    </span>

                </div>

            </div>

        );

    }


    return (

        <div className="transactions-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="top-header transaction-page-header">

                <div>

                    <div className="page-title-row">

                        <div className="page-title-icon">
                            ⇄
                        </div>

                        <div>

                            <h1>
                                Stock Transactions
                            </h1>

                            <p>
                                Manage stock-in and stock-out transactions
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                ALERTS
            ========================= */}

            {success && (

                <div className="transaction-alert success-alert">

                    <div className="alert-icon">
                        ✓
                    </div>

                    <div className="alert-content">

                        <strong>
                            Transaction Successful
                        </strong>

                        <span>
                            {success}
                        </span>

                    </div>

                    <button
                        type="button"
                        className="alert-close"
                        onClick={() => setSuccess("")}
                        aria-label="Close success message"
                    >
                        ×
                    </button>

                </div>

            )}


            {error && (

                <div className="transaction-alert error-alert">

                    <div className="alert-icon">
                        !
                    </div>

                    <div className="alert-content">

                        <strong>
                            Transaction Failed
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        className="alert-close"
                        onClick={() => setError("")}
                        aria-label="Close error message"
                    >
                        ×
                    </button>

                </div>

            )}


            {/* =========================
                MAIN TRANSACTION CARD
            ========================= */}

            <section className="content-card premium-transaction-card">


                {/* CARD HEADER */}

                <div className="card-header transaction-card-header">

                    <div>

                        <span className="section-eyebrow">
                            INVENTORY MOVEMENT
                        </span>

                        <h2>
                            New Stock Transaction
                        </h2>

                        <p>
                            Record inventory stock movement accurately
                            and keep your stock levels updated.
                        </p>

                    </div>

                    <div className="transaction-header-badge">
                        ● Live Inventory
                    </div>

                </div>


                {/* FORM */}

                <form
                    className="transaction-form premium-transaction-form"
                    onSubmit={handleSubmit}
                >


                    {/* =========================
                        TRANSACTION TYPE
                    ========================= */}

                    <div className="form-group transaction-type-group">

                        <label>
                            Transaction Type
                        </label>

                        <div className="premium-type-selector">

                            <button
                                type="button"
                                className={
                                    transactionType === "STOCK_IN"
                                        ? "premium-type-card active-stock-in"
                                        : "premium-type-card"
                                }
                                onClick={() =>
                                    changeTransactionType("STOCK_IN")
                                }
                            >

                                <span className="type-icon stock-in-icon">
                                    ↓
                                </span>

                                <span className="type-card-content">

                                    <strong>
                                        Stock-IN
                                    </strong>

                                    <small>
                                        Add inventory
                                    </small>

                                </span>

                                {transactionType === "STOCK_IN" && (

                                    <span className="type-check">
                                        ✓
                                    </span>

                                )}

                            </button>


                            <button
                                type="button"
                                className={
                                    transactionType === "STOCK_OUT"
                                        ? "premium-type-card active-stock-out"
                                        : "premium-type-card"
                                }
                                onClick={() =>
                                    changeTransactionType("STOCK_OUT")
                                }
                            >

                                <span className="type-icon stock-out-icon">
                                    ↑
                                </span>

                                <span className="type-card-content">

                                    <strong>
                                        Stock-OUT
                                    </strong>

                                    <small>
                                        Remove inventory
                                    </small>

                                </span>

                                {transactionType === "STOCK_OUT" && (

                                    <span className="type-check">
                                        ✓
                                    </span>

                                )}

                            </button>

                        </div>

                    </div>


                    {/* =========================
                        SEARCHABLE ITEM
                    ========================= */}

                    <div className="form-group">

                        <label htmlFor="item-search">
                            Item
                        </label>

                        <div
                            className="searchable-select-container"
                            style={{
                                position: "relative"
                            }}
                        >

                            <div
                                className="select-with-clear"
                                style={{
                                    position: "relative"
                                }}
                            >

                                <span
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        fontSize: "16px",
                                        pointerEvents: "none",
                                        zIndex: 2
                                    }}
                                >
                                    🔍
                                </span>

                                <input
                                    id="item-search"
                                    type="text"
                                    value={itemSearch}
                                    onChange={(event) => {

                                        setItemSearch(
                                            event.target.value
                                        );

                                        setSku("");

                                        setShowItemSearch(true);

                                        setError("");
                                        setSuccess("");

                                    }}
                                    onFocus={() =>
                                        setShowItemSearch(true)
                                    }
                                    placeholder="Search item by SKU, name or category..."
                                    autoComplete="off"
                                    style={{
                                        width: "100%",
                                        paddingLeft: "42px",
                                        paddingRight: sku ? "42px" : "16px",
                                        boxSizing: "border-box"
                                    }}
                                />

                                {sku && (

                                    <button
                                        type="button"
                                        className="clear-select-button"
                                        onClick={clearItem}
                                        title="Clear item selection"
                                        aria-label="Clear item selection"
                                    >
                                        ×
                                    </button>

                                )}

                            </div>


                            {showItemSearch && (

                                <div
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 6px)",
                                        left: 0,
                                        right: 0,
                                        background: "#ffffff",
                                        border: "1px solid #dbe3ec",
                                        borderRadius: "12px",
                                        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.14)",
                                        maxHeight: "260px",
                                        overflowY: "auto",
                                        zIndex: 1000
                                    }}
                                >

                                    {filteredItems.length > 0 ? (

                                        filteredItems.map((item) => (

                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() =>
                                                    selectItem(item)
                                                }
                                                style={{
                                                    display: "block",
                                                    width: "100%",
                                                    border: "none",
                                                    background: "transparent",
                                                    textAlign: "left",
                                                    padding: "12px 16px",
                                                    cursor: "pointer",
                                                    borderBottom: "1px solid #eef2f7"
                                                }}
                                                onMouseEnter={(event) => {
                                                    event.currentTarget.style.background =
                                                        "#f5f8fc";
                                                }}
                                                onMouseLeave={(event) => {
                                                    event.currentTarget.style.background =
                                                        "transparent";
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        color: "#172033"
                                                    }}
                                                >
                                                    {item.sku} - {item.name}
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#64748b",
                                                        marginTop: "3px"
                                                    }}
                                                >
                                                    {item.category} • Stock: {item.quantity}
                                                </div>

                                            </button>

                                        ))

                                    ) : (

                                        <div
                                            style={{
                                                padding: "18px",
                                                textAlign: "center",
                                                color: "#64748b",
                                                fontSize: "14px"
                                            }}
                                        >
                                            No matching items found
                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =========================
                        CURRENT STOCK
                    ========================= */}

                    {selectedItem && (

                        <div className="current-stock-premium">

                            <div className="current-stock-icon">
                                📦
                            </div>

                            <div className="current-stock-info">

                                <span>
                                    Current Stock
                                </span>

                                <strong>
                                    {selectedItem.quantity}
                                </strong>

                            </div>

                            <div className="current-stock-unit">
                                units
                            </div>

                            <div
                                className={
                                    selectedItem.quantity <= selectedItem.threshold
                                        ? "stock-status low-stock-status"
                                        : "stock-status healthy-stock-status"
                                }
                            >

                                {selectedItem.quantity <= selectedItem.threshold
                                    ? "Low Stock"
                                    : "Healthy Stock"
                                }

                            </div>

                        </div>

                    )}


                    {/* =========================
                        QUANTITY
                    ========================= */}

                    <div className="form-group">

                        <label htmlFor="quantity">
                            Quantity
                        </label>

                        <div className="quantity-input-wrapper">

                            <span className="quantity-icon">
                                #
                            </span>

                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(event) =>
                                    setQuantity(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter quantity"
                            />

                            <span className="quantity-unit">
                                Units
                            </span>

                        </div>

                    </div>


                    {/* =========================
                        SEARCHABLE SUPPLIER
                    ========================= */}

                    {transactionType === "STOCK_IN" && (

                        <div className="form-group">

                            <label htmlFor="supplier-search">
                                Supplier
                            </label>

                            <div
                                className="searchable-select-container"
                                style={{
                                    position: "relative"
                                }}
                            >

                                <div
                                    className="select-with-clear"
                                    style={{
                                        position: "relative"
                                    }}
                                >

                                    <span
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            fontSize: "16px",
                                            pointerEvents: "none",
                                            zIndex: 2
                                        }}
                                    >
                                        🔍
                                    </span>

                                    <input
                                        id="supplier-search"
                                        type="text"
                                        value={supplierSearch}
                                        onChange={(event) => {

                                            setSupplierSearch(
                                                event.target.value
                                            );

                                            setSupplierId("");

                                            setShowSupplierSearch(true);

                                            setError("");
                                            setSuccess("");

                                        }}
                                        onFocus={() =>
                                            setShowSupplierSearch(true)
                                        }
                                        placeholder="Search supplier by company or name..."
                                        autoComplete="off"
                                        style={{
                                            width: "100%",
                                            paddingLeft: "42px",
                                            paddingRight: supplierId ? "42px" : "16px",
                                            boxSizing: "border-box"
                                        }}
                                    />

                                    {supplierId && (

                                        <button
                                            type="button"
                                            className="clear-select-button"
                                            onClick={clearSupplier}
                                            title="Clear supplier selection"
                                            aria-label="Clear supplier selection"
                                        >
                                            ×
                                        </button>

                                    )}

                                </div>


                                {showSupplierSearch && (

                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "calc(100% + 6px)",
                                            left: 0,
                                            right: 0,
                                            background: "#ffffff",
                                            border: "1px solid #dbe3ec",
                                            borderRadius: "12px",
                                            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.14)",
                                            maxHeight: "260px",
                                            overflowY: "auto",
                                            zIndex: 1000
                                        }}
                                    >

                                        {filteredSuppliers.length > 0 ? (

                                            filteredSuppliers.map((supplier) => (

                                                <button
                                                    key={supplier.id}
                                                    type="button"
                                                    onClick={() =>
                                                        selectSupplier(supplier)
                                                    }
                                                    style={{
                                                        display: "block",
                                                        width: "100%",
                                                        border: "none",
                                                        background: "transparent",
                                                        textAlign: "left",
                                                        padding: "12px 16px",
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid #eef2f7"
                                                    }}
                                                    onMouseEnter={(event) => {
                                                        event.currentTarget.style.background =
                                                            "#f5f8fc";
                                                    }}
                                                    onMouseLeave={(event) => {
                                                        event.currentTarget.style.background =
                                                            "transparent";
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "#172033"
                                                        }}
                                                    >
                                                        {supplier.company} - {supplier.name}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#64748b",
                                                            marginTop: "3px"
                                                        }}
                                                    >
                                                        {supplier.contact} • {supplier.email}
                                                    </div>

                                                </button>

                                            ))

                                        ) : (

                                            <div
                                                style={{
                                                    padding: "18px",
                                                    textAlign: "center",
                                                    color: "#64748b",
                                                    fontSize: "14px"
                                                }}
                                            >
                                                No matching suppliers found
                                            </div>

                                        )}

                                    </div>

                                )}

                            </div>

                        </div>

                    )}


                    {/* =========================
                        REMARKS
                    ========================= */}

                    <div className="form-group">

                        <div className="label-with-hint">

                            <label htmlFor="remarks">
                                Remarks
                            </label>

                            <span>
                                Optional
                            </span>

                        </div>

                        <textarea
                            id="remarks"
                            rows="4"
                            value={remarks}
                            onChange={(event) =>
                                setRemarks(
                                    event.target.value
                                )
                            }
                            placeholder="Add notes about this transaction..."
                        />

                    </div>


                    {/* =========================
                        SUBMIT
                    ========================= */}

                    <button
                        type="submit"
                        className={
                            transactionType === "STOCK_IN"
                                ? "premium-submit-button premium-stock-in-submit"
                                : "premium-submit-button premium-stock-out-submit"
                        }
                        disabled={submitting}
                    >

                        {submitting ? (

                            <>
                                <span className="submit-spinner"></span>

                                <span>
                                    Processing Transaction...
                                </span>
                            </>

                        ) : (

                            <>

                                <span className="submit-main-icon">

                                    {transactionType === "STOCK_IN"
                                        ? "↓"
                                        : "↑"}

                                </span>

                                <span>

                                    {transactionType === "STOCK_IN"
                                        ? "Record Stock-IN"
                                        : "Record Stock-OUT"}

                                </span>

                            </>

                        )}

                    </button>


                </form>

            </section>

        </div>

    );

}

export default StockTransactions;