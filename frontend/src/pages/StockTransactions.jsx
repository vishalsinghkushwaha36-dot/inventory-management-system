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

            setError("");
            setSuccess("");

        }

    }, [initialItem]);


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
    // CLEAR ITEM
    // =========================

    const clearItem = () => {

        setSku("");
        setError("");
        setSuccess("");

    };


    // =========================
    // CLEAR SUPPLIER
    // =========================

    const clearSupplier = () => {

        setSupplierId("");
        setError("");
        setSuccess("");

    };


    // =========================
    // TRANSACTION TYPE
    // =========================

    const changeTransactionType = (type) => {

        setTransactionType(type);

        setError("");
        setSuccess("");

        if (type === "STOCK_OUT") {

            setSupplierId("");

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
                        ITEM
                    ========================= */}

                    <div className="form-group">

                        <label htmlFor="item">
                            Item
                        </label>

                        <div className="select-with-clear">

                            <select
                                id="item"
                                value={sku}
                                onChange={(event) =>
                                    setSku(event.target.value)
                                }
                            >

                                <option value="">
                                    Select Item
                                </option>

                                {items.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.sku}
                                    >
                                        {item.sku} - {item.name}
                                    </option>

                                ))}

                            </select>

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
                        SUPPLIER
                    ========================= */}

                    {transactionType === "STOCK_IN" && (

                        <div className="form-group">

                            <label htmlFor="supplier">
                                Supplier
                            </label>

                            <div className="select-with-clear">

                                <select
                                    id="supplier"
                                    value={supplierId}
                                    onChange={(event) =>
                                        setSupplierId(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select Supplier
                                    </option>

                                    {suppliers.map((supplier) => (

                                        <option
                                            key={supplier.id}
                                            value={supplier.id}
                                        >

                                            {supplier.company} -{" "}
                                            {supplier.name}

                                        </option>

                                    ))}

                                </select>

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