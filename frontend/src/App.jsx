import { useEffect, useState } from "react";
import { getItems } from "./services/api";

import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import StockTransactions from "./pages/StockTransactions";
import TransactionHistory from "./pages/TransactionHistory";
import Suppliers from "./pages/Suppliers";
import LowStock from "./pages/LowStock";
import ReorderSuggestions from "./pages/ReorderSuggestions";

import "./App.css";


function App() {

    /* =========================================================
       APPLICATION STATE
       ========================================================= */

    const [currentPage, setCurrentPage] =
        useState("dashboard");

    const [items, setItems] =
        useState([]);

    const [stockTransactionItem, setStockTransactionItem] =
        useState(null);

    /*
     * Used to tell Dashboard that something changed
     * and it should reload its data.
     */
    const [refreshTrigger, setRefreshTrigger] =
        useState(0);


    /* =========================================================
       LOAD ITEMS
       ========================================================= */

    useEffect(() => {
        loadItems();
    }, []);


    const loadItems = async () => {

        try {

            const data = await getItems();

            setItems(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load inventory items:",
                err
            );

            setItems([]);

        }
    };


    /* =========================================================
       REFRESH APPLICATION DATA
       ========================================================= */

    const refreshApplicationData = async () => {

        await loadItems();

        /*
         * Increase trigger so Dashboard reloads:
         *
         * getItems()
         * getTransactionHistory()
         * getLowStockItems()
         */
        setRefreshTrigger(
            (previous) => previous + 1
        );
    };


    /* =========================================================
       NAVIGATION
       ========================================================= */

    const navigateTo = (page) => {

        setCurrentPage(page);

    };


    /* =========================================================
       STOCK TRANSACTION NAVIGATION
       ========================================================= */

    const handleAddStock = (itemOrType) => {

        /*
         * Dashboard can send:
         *
         * "STOCK_IN"
         * "STOCK_OUT"
         *
         * while LowStock/Reorder may send an item object.
         */

        if (
            itemOrType === "STOCK_IN" ||
            itemOrType === "STOCK_OUT"
        ) {

            setStockTransactionItem({
                transactionType:
                itemOrType
            });

        } else {

            setStockTransactionItem(
                itemOrType || null
            );

        }

        navigateTo("transactions");

    };


    /* =========================================================
       TRANSACTION SUCCESS
       ========================================================= */

    const handleTransactionSuccess =
        async () => {

            await refreshApplicationData();

        };


    /* =========================================================
       ITEM CHANGES
       ========================================================= */

    const handleItemChange =
        async () => {

            await refreshApplicationData();

        };


    /* =========================================================
       SUPPLIER CHANGES
       ========================================================= */

    const handleSupplierChange =
        async () => {

            await refreshApplicationData();

        };


    /* =========================================================
       PAGE TITLE
       ========================================================= */

    const getPageTitle = () => {

        switch (currentPage) {

            case "dashboard":
                return "Dashboard";

            case "items":
                return "Items";

            case "transactions":
                return "Stock Transactions";

            case "transaction-history":
                return "Transaction History";

            case "suppliers":
                return "Suppliers";

            case "low-stock":
                return "Low Stock";

            case "reorder":
                return "Reorder Suggestions";

            default:
                return "Inventory Management";

        }

    };


    /* =========================================================
       MAIN APPLICATION
       ========================================================= */

    return (

        <div className="app">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">


                {/* ================= BRAND ================= */}

                <div className="brand">

                    <div className="brand-icon">
                        📦
                    </div>


                    <div>

                        <h2>
                            Inventory
                        </h2>

                        <span>
                            Management System
                        </span>

                    </div>

                </div>


                {/* ================= NAVIGATION ================= */}

                <nav className="navigation">


                    {/* DASHBOARD */}

                    <button
                        type="button"
                        className={`nav-item ${
                            currentPage === "dashboard"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigateTo(
                                "dashboard"
                            )
                        }
                    >

                        <span>
                            📊
                        </span>

                        Dashboard

                    </button>


                    {/* ITEMS */}

                    <button
                        type="button"
                        className={`nav-item ${
                            currentPage === "items"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigateTo(
                                "items"
                            )
                        }
                    >

                        <span>
                            📦
                        </span>

                        Items

                    </button>


                    {/* STOCK TRANSACTIONS */}

                    <button
                        type="button"
                        className={`nav-item ${
                            currentPage === "transactions"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigateTo(
                                "transactions"
                            )
                        }
                    >

                        <span>
                            🔄
                        </span>

                        Stock Transactions

                    </button>


                    {/* TRANSACTION HISTORY */}

                    <button
                        type="button"
                        className={`nav-item ${
                            currentPage ===
                            "transaction-history"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigateTo(
                                "transaction-history"
                            )
                        }
                    >

                        <span>
                            📋
                        </span>

                        Transaction History

                    </button>


                    {/* SUPPLIERS */}

                    <button
                        type="button"
                        className={`nav-item ${
                            currentPage === "suppliers"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigateTo(
                                "suppliers"
                            )
                        }
                    >

                        <span>
                            🏢
                        </span>

                        Suppliers

                    </button>


                    {/* LOW STOCK */}

                    <button
                        type="button"
                        className={`nav-item ${
                            currentPage === "low-stock"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigateTo(
                                "low-stock"
                            )
                        }
                    >

                        <span>
                            ⚠️
                        </span>

                        Low Stock

                    </button>


                    {/* REORDER SUGGESTIONS */}

                    <button
                        type="button"
                        className={`nav-item ${
                            currentPage === "reorder"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            navigateTo(
                                "reorder"
                            )
                        }
                    >

                        <span>
                            🔔
                        </span>

                        Reorder Suggestions

                    </button>

                </nav>


                {/* ================= SIDEBAR FOOTER ================= */}

                <div className="sidebar-footer">

                    <span>
                        Java Full Stack Project
                    </span>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="main-content">


                {/* ================= DASHBOARD ================= */}

                {currentPage === "dashboard" && (

                    <Dashboard
                        onNavigate={navigateTo}
                        onAddStock={handleAddStock}
                        refreshTrigger={
                            refreshTrigger
                        }
                    />

                )}


                {/* ================= ITEMS ================= */}

                {currentPage === "items" && (

                    <Items
                        onNavigate={navigateTo}
                        onDataChange={
                            handleItemChange
                        }
                    />

                )}


                {/* ================= STOCK TRANSACTIONS ================= */}

                {currentPage === "transactions" && (

                    <StockTransactions
                        initialItem={
                            stockTransactionItem
                        }
                        onTransactionSuccess={
                            handleTransactionSuccess
                        }
                    />

                )}


                {/* ================= TRANSACTION HISTORY ================= */}

                {currentPage ===
                    "transaction-history" && (

                        <TransactionHistory />

                    )}


                {/* ================= SUPPLIERS ================= */}

                {currentPage === "suppliers" && (

                    <Suppliers
                        onDataChange={
                            handleSupplierChange
                        }
                    />

                )}


                {/* ================= LOW STOCK ================= */}

                {currentPage === "low-stock" && (

                    <LowStock
                        onAddStock={
                            handleAddStock
                        }
                    />

                )}


                {/* ================= REORDER SUGGESTIONS ================= */}

                {currentPage === "reorder" && (

                    <ReorderSuggestions
                        onAddStock={
                            handleAddStock
                        }
                    />

                )}

            </main>

        </div>

    );
}


export default App;