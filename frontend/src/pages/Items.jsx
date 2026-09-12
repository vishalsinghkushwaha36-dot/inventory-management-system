import { useEffect, useMemo, useState } from "react";
import {
    addItem,
    getItems,
    updateItem,
    deleteItem
} from "../services/api";

function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    // =========================
    // ADD ITEM MODAL
    // =========================

    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState({
        sku: "",
        name: "",
        category: "",
        quantity: "",
        threshold: "",
        unitPrice: ""
    });

    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    // =========================
    // EDIT ITEM MODAL
    // =========================

    const [editingItem, setEditingItem] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    // =========================
    // DELETE ITEM MODAL
    // =========================

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // =========================
    // ACTION MESSAGE
    // =========================

    const [actionSuccess, setActionSuccess] = useState("");
    const [actionError, setActionError] = useState("");

    // =========================
    // LOAD ITEMS
    // =========================

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getItems();
            setItems(data);
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "Unable to load items."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CATEGORIES
    // =========================

    const categories = useMemo(() => {
        return [
            "All",
            ...new Set(
                items
                    .map((item) => item.category)
                    .filter(Boolean)
            )
        ];
    }, [items]);

    // =========================
    // FILTER ITEMS
    // =========================

    const filteredItems = useMemo(() => {
        return items.filter((item) => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                !search ||
                item.sku
                    ?.toLowerCase()
                    .includes(search) ||
                item.name
                    ?.toLowerCase()
                    .includes(search) ||
                item.category
                    ?.toLowerCase()
                    .includes(search);

            const matchesCategory =
                categoryFilter === "All" ||
                item.category === categoryFilter;

            const quantity =
                Number(item.quantity || 0);

            const threshold =
                Number(item.threshold || 0);

            const matchesStatus =
                statusFilter === "All" ||
                (
                    statusFilter === "Low Stock" &&
                    quantity <= threshold
                ) ||
                (
                    statusFilter === "Available" &&
                    quantity > threshold
                );

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [
        items,
        searchTerm,
        categoryFilter,
        statusFilter
    ]);

    // =========================
    // SUMMARY
    // =========================

    const totalUnits = items.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );

    const lowStockCount = items.filter(
        (item) =>
            Number(item.quantity || 0) <=
            Number(item.threshold || 0)
    ).length;

    const totalCategories =
        categories.length - 1;

    // =========================
    // PRICE FORMAT
    // =========================

    const formatPrice = (price) =>
        Number(price || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    // ==================================================
    // ADD ITEM
    // ==================================================

    const openAddModal = () => {

        setFormData({
            sku: "",
            name: "",
            category: "",
            quantity: "",
            threshold: "",
            unitPrice: ""
        });

        setFormError("");
        setFormSuccess("");
        setActionError("");
        setActionSuccess("");

        setShowAddModal(true);
    };

    const closeAddModal = () => {

        if (saving) {
            return;
        }

        setShowAddModal(false);

        setFormData({
            sku: "",
            name: "",
            category: "",
            quantity: "",
            threshold: "",
            unitPrice: ""
        });

        setFormError("");
        setFormSuccess("");
    };

    const handleFormChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setFormError("");
        setFormSuccess("");
    };

    const handleAddItem = async (e) => {

        e.preventDefault();

        setFormError("");
        setFormSuccess("");

        const sku =
            formData.sku.trim();

        const name =
            formData.name.trim();

        const category =
            formData.category.trim();

        const quantity =
            Number(formData.quantity);

        const threshold =
            Number(formData.threshold);

        const unitPrice =
            Number(formData.unitPrice);

        // =========================
        // VALIDATION
        // =========================

        if (!sku) {
            setFormError(
                "SKU is required."
            );
            return;
        }

        if (!name) {
            setFormError(
                "Item name is required."
            );
            return;
        }

        if (!category) {
            setFormError(
                "Category is required."
            );
            return;
        }

        if (
            formData.quantity === "" ||
            !Number.isFinite(quantity) ||
            quantity < 0
        ) {
            setFormError(
                "Quantity must be 0 or greater."
            );
            return;
        }

        if (
            formData.threshold === "" ||
            !Number.isFinite(threshold) ||
            threshold < 0
        ) {
            setFormError(
                "Threshold must be 0 or greater."
            );
            return;
        }

        if (
            formData.unitPrice === "" ||
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
        ) {
            setFormError(
                "Unit price must be 0 or greater."
            );
            return;
        }

        // =========================
        // DUPLICATE SKU
        // =========================

        const duplicateSku =
            items.some(
                (item) =>
                    item.sku
                        ?.trim()
                        .toLowerCase() ===
                    sku.toLowerCase()
            );

        if (duplicateSku) {
            setFormError(
                "SKU already exists. Please use a different SKU."
            );
            return;
        }

        // =========================
        // PREPARE ITEM
        // =========================

        const newItem = {
            sku,
            name,
            category,
            quantity,
            threshold,
            unitPrice
        };

        // =========================
        // SAVE ITEM
        // =========================

        try {

            setSaving(true);

            await addItem(newItem);

            setFormSuccess(
                "Item added successfully."
            );

            await loadItems();

            setTimeout(() => {

                setShowAddModal(false);

                setFormData({
                    sku: "",
                    name: "",
                    category: "",
                    quantity: "",
                    threshold: "",
                    unitPrice: ""
                });

                setFormSuccess("");

            }, 700);

        } catch (err) {

            console.error(err);

            setFormError(
                err.message ||
                "Unable to add item."
            );

        } finally {

            setSaving(false);
        }
    };

    // ==================================================
    // EDIT ITEM
    // ==================================================

    const openEditModal = (item) => {

        setEditingItem({
            id: item.id,
            sku: item.sku || "",
            name: item.name || "",
            category: item.category || "",
            quantity: item.quantity ?? "",
            threshold: item.threshold ?? "",
            unitPrice: item.unitPrice ?? ""
        });

        setEditError("");
        setEditSuccess("");
        setActionError("");
        setActionSuccess("");
    };

    const closeEditModal = () => {

        if (savingEdit) {
            return;
        }

        setEditingItem(null);
        setEditError("");
        setEditSuccess("");
    };

    const handleEditChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setEditingItem((previous) => ({
            ...previous,
            [name]: value
        }));

        setEditError("");
        setEditSuccess("");
    };

    const handleUpdateItem = async (e) => {

        e.preventDefault();

        setEditError("");
        setEditSuccess("");

        if (!editingItem) {
            return;
        }

        const sku =
            editingItem.sku.trim();

        const name =
            editingItem.name.trim();

        const category =
            editingItem.category.trim();

        const quantity =
            Number(editingItem.quantity);

        const threshold =
            Number(editingItem.threshold);

        const unitPrice =
            Number(editingItem.unitPrice);

        // =========================
        // VALIDATION
        // =========================

        if (!sku) {
            setEditError(
                "SKU is required."
            );
            return;
        }

        if (!name) {
            setEditError(
                "Item name is required."
            );
            return;
        }

        if (!category) {
            setEditError(
                "Category is required."
            );
            return;
        }

        if (
            editingItem.quantity === "" ||
            !Number.isFinite(quantity) ||
            quantity < 0
        ) {
            setEditError(
                "Quantity must be 0 or greater."
            );
            return;
        }

        if (
            editingItem.threshold === "" ||
            !Number.isFinite(threshold) ||
            threshold < 0
        ) {
            setEditError(
                "Threshold must be 0 or greater."
            );
            return;
        }

        if (
            editingItem.unitPrice === "" ||
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
        ) {
            setEditError(
                "Unit price must be 0 or greater."
            );
            return;
        }

        // =========================
        // DUPLICATE SKU
        // =========================

        const duplicateSku =
            items.some(
                (item) =>
                    item.id !== editingItem.id &&
                    item.sku
                        ?.trim()
                        .toLowerCase() ===
                    sku.toLowerCase()
            );

        if (duplicateSku) {
            setEditError(
                "SKU already exists. Please use a different SKU."
            );
            return;
        }

        // =========================
        // PREPARE UPDATED ITEM
        // =========================

        const updatedItem = {
            sku,
            name,
            category,
            quantity,
            threshold,
            unitPrice
        };

        // =========================
        // UPDATE ITEM
        // =========================

        try {

            setSavingEdit(true);

            await updateItem(
                editingItem.id,
                updatedItem
            );

            await loadItems();

            setEditSuccess(
                "Item updated successfully."
            );

            setActionSuccess(
                "Item updated successfully."
            );

            setTimeout(() => {

                setEditingItem(null);
                setEditSuccess("");

            }, 700);

        } catch (err) {

            console.error(err);

            setEditError(
                err.message ||
                "Unable to update item."
            );

        } finally {

            setSavingEdit(false);
        }
    };

    // ==================================================
    // DELETE ITEM
    // ==================================================

    const openDeleteModal = (item) => {

        setDeletingItem(item);
        setShowDeleteModal(true);

        setActionError("");
        setActionSuccess("");

        setEditError("");
        setEditSuccess("");
    };

    const closeDeleteModal = () => {

        if (deleting) {
            return;
        }

        setShowDeleteModal(false);
        setDeletingItem(null);
    };

    const handleDeleteItem = async () => {

        if (!deletingItem) {
            return;
        }

        try {

            setDeleting(true);

            setActionError("");
            setActionSuccess("");

            await deleteItem(
                deletingItem.id
            );

            await loadItems();

            setShowDeleteModal(false);
            setDeletingItem(null);

            setActionSuccess(
                "Item deleted successfully."
            );

        } catch (err) {

            console.error(err);

            setShowDeleteModal(false);

            setActionError(
                err.message ||
                "Unable to delete item."
            );

        } finally {

            setDeleting(false);
        }
    };

    return (
        <div className="items-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="top-header items-header">

                <div>
                    <span className="section-eyebrow">
                        INVENTORY CATALOGUE
                    </span>

                    <h1>
                        Items
                    </h1>

                    <p>
                        Manage inventory items and
                        monitor stock levels
                    </p>
                </div>

                <div className="items-header-actions">

                    <button
                        type="button"
                        className="refresh-button"
                        onClick={loadItems}
                        disabled={loading}
                    >
                        <span>
                            ↻
                        </span>

                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="add-item-button"
                        onClick={openAddModal}
                    >
                        <span className="add-item-icon">
                            +
                        </span>

                        Add New Item
                    </button>

                </div>

            </div>

            {/* =========================
                ACTION SUCCESS
            ========================= */}

            {actionSuccess && (
                <div className="item-action-success">
                    ✓ {actionSuccess}
                </div>
            )}

            {/* =========================
                ACTION ERROR
            ========================= */}

            {actionError && (
                <div className="item-action-error">
                    ⚠️ {actionError}
                </div>
            )}

            {/* =========================
                PAGE ERROR
            ========================= */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* =========================
                LOADING
            ========================= */}

            {loading && (
                <div className="loading">
                    Loading inventory items...
                </div>
            )}

            {!loading && !error && (
                <>

                    {/* =========================
                        SUMMARY CARDS
                    ========================= */}

                    <section className="stats-grid">

                        <div className="stat-card">

                            <div className="stat-icon blue">
                                📦
                            </div>

                            <div>
                                <p>
                                    Total Items
                                </p>

                                <h2>
                                    {items.length}
                                </h2>
                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon green">
                                📊
                            </div>

                            <div>
                                <p>
                                    Total Units
                                </p>

                                <h2>
                                    {totalUnits}
                                </h2>
                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon orange">
                                ⚠️
                            </div>

                            <div>
                                <p>
                                    Low Stock
                                </p>

                                <h2>
                                    {lowStockCount}
                                </h2>
                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-icon purple">
                                🗂️
                            </div>

                            <div>
                                <p>
                                    Categories
                                </p>

                                <h2>
                                    {totalCategories}
                                </h2>
                            </div>

                        </div>

                    </section>


                    {/* =========================
                        INVENTORY TABLE CARD
                    ========================= */}

                    <section className="content-card">

                        <div className="card-header">

                            <div>
                                <h2>
                                    All Inventory Items
                                </h2>

                                <p>
                                    Showing{" "}
                                    {filteredItems.length}{" "}
                                    of{" "}
                                    {items.length}{" "}
                                    item(s)
                                </p>
                            </div>

                        </div>


                        {/* =========================
                            SEARCH & FILTER
                        ========================= */}

                        <div className="items-toolbar">

                            <div className="search-box">

                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search by SKU, item name or category..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="filter-group">

                                <select
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category === "All"
                                                    ? "All Categories"
                                                    : category}
                                            </option>
                                        )
                                    )}

                                </select>


                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Available">
                                        Available
                                    </option>

                                    <option value="Low Stock">
                                        Low Stock
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* =========================
                            EMPTY SEARCH RESULT
                        ========================= */}

                        {filteredItems.length === 0 ? (

                            <div className="empty-state">

                                <div
                                    style={{
                                        fontSize: "42px",
                                        marginBottom: "10px"
                                    }}
                                >
                                    🔍
                                </div>

                                <strong>
                                    No items found
                                </strong>

                                <p>
                                    Try changing your
                                    search or filter
                                    criteria.
                                </p>

                            </div>

                        ) : (

                            <div className="table-container">

                                <table>

                                    <thead>

                                    <tr>

                                        <th>
                                            SKU
                                        </th>

                                        <th>
                                            Item Name
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Threshold
                                        </th>

                                        <th>
                                            Unit Price
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                    </thead>


                                    <tbody>

                                    {filteredItems.map(
                                        (item) => {

                                            const quantity =
                                                Number(
                                                    item.quantity || 0
                                                );

                                            const threshold =
                                                Number(
                                                    item.threshold || 0
                                                );

                                            const isLowStock =
                                                quantity <=
                                                threshold;

                                            return (

                                                <tr
                                                    key={item.id}
                                                >

                                                    <td>
                                                        <strong>
                                                            {item.sku}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {item.name}
                                                    </td>

                                                    <td>
                                                        <span className="category-badge">
                                                            {item.category}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {quantity}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {threshold}
                                                    </td>

                                                    <td>
                                                        ₹
                                                        {formatPrice(
                                                            item.unitPrice
                                                        )}
                                                    </td>

                                                    <td>

                                                        {isLowStock ? (

                                                            <span className="status-badge low">
                                                                Low Stock
                                                            </span>

                                                        ) : (

                                                            <span className="status-badge available">
                                                                Available
                                                            </span>

                                                        )}

                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="item-actions">

                                                            <button
                                                                type="button"
                                                                className="edit-item-button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        item
                                                                    )
                                                                }
                                                                title="Edit item"
                                                            >
                                                                ✏️ Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delete-item-button"
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        item
                                                                    )
                                                                }
                                                                title="Delete item"
                                                            >
                                                                🗑️ Delete
                                                            </button>

                                                        </div>

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


            {/* ==================================================
                ADD NEW ITEM MODAL
            ================================================== */}

            {showAddModal && (

                <div
                    className="add-item-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !saving
                        ) {
                            closeAddModal();
                        }

                    }}
                >

                    <div
                        className="add-item-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="add-item-modal-header">

                            <div>

                                <span className="section-eyebrow">
                                    INVENTORY MANAGEMENT
                                </span>

                                <h2>
                                    Add New Inventory Item
                                </h2>

                                <p>
                                    Enter the item details
                                    to add it to your
                                    inventory catalogue.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={closeAddModal}
                                disabled={saving}
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="add-item-form"
                            onSubmit={handleAddItem}
                        >

                            {/* SKU */}

                            <div className="form-field">

                                <label htmlFor="sku">
                                    SKU
                                    <span>*</span>
                                </label>

                                <input
                                    id="sku"
                                    name="sku"
                                    type="text"
                                    placeholder="e.g. MAT004"
                                    value={formData.sku}
                                    onChange={handleFormChange}
                                    disabled={saving}
                                    autoComplete="off"
                                />

                            </div>


                            {/* ITEM NAME */}

                            <div className="form-field">

                                <label htmlFor="name">
                                    Item Name
                                    <span>*</span>
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g. Steel Gear"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* CATEGORY */}

                            <div className="form-field">

                                <label htmlFor="category">
                                    Category
                                    <span>*</span>
                                </label>

                                <input
                                    id="category"
                                    name="category"
                                    type="text"
                                    placeholder="e.g. Mechanical"
                                    value={formData.category}
                                    onChange={handleFormChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* QUANTITY */}

                            <div className="form-field">

                                <label htmlFor="quantity">
                                    Quantity
                                    <span>*</span>
                                </label>

                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Enter quantity"
                                    value={formData.quantity}
                                    onChange={handleFormChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* THRESHOLD */}

                            <div className="form-field">

                                <label htmlFor="threshold">
                                    Threshold
                                    <span>*</span>
                                </label>

                                <input
                                    id="threshold"
                                    name="threshold"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Enter minimum stock level"
                                    value={formData.threshold}
                                    onChange={handleFormChange}
                                    disabled={saving}
                                />

                            </div>


                            {/* UNIT PRICE */}

                            <div className="form-field">

                                <label htmlFor="unitPrice">
                                    Unit Price
                                    <span>*</span>
                                </label>

                                <div className="price-input-wrapper">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="unitPrice"
                                        name="unitPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter unit price"
                                        value={formData.unitPrice}
                                        onChange={handleFormChange}
                                        disabled={saving}
                                    />

                                </div>

                            </div>


                            {/* FORM ERROR */}

                            {formError && (

                                <div className="form-alert form-alert-error">

                                    <span>
                                        ⚠️
                                    </span>

                                    <p>
                                        {formError}
                                    </p>

                                </div>

                            )}


                            {/* FORM SUCCESS */}

                            {formSuccess && (

                                <div className="form-alert form-alert-success">

                                    <span>
                                        ✓
                                    </span>

                                    <p>
                                        {formSuccess}
                                    </p>

                                </div>

                            )}


                            {/* FORM ACTIONS */}

                            <div className="add-item-form-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeAddModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-item-button"
                                    disabled={saving}
                                >

                                    {saving ? (
                                        <>
                                            <span className="button-spinner">
                                                ⟳
                                            </span>

                                            Adding Item...
                                        </>
                                    ) : (
                                        <>
                                            <span>
                                                ✓
                                            </span>

                                            Add Item
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==================================================
                EDIT ITEM MODAL
            ================================================== */}

            {editingItem && (

                <div
                    className="add-item-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !savingEdit
                        ) {
                            closeEditModal();
                        }

                    }}
                >

                    <div
                        className="add-item-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* EDIT HEADER */}

                        <div className="add-item-modal-header">

                            <div>

                                <span className="section-eyebrow">
                                    INVENTORY MANAGEMENT
                                </span>

                                <h2>
                                    Edit Inventory Item
                                </h2>

                                <p>
                                    Update the details of
                                    the selected inventory item.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={closeEditModal}
                                disabled={savingEdit}
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        {/* EDIT FORM */}

                        <form
                            className="add-item-form"
                            onSubmit={handleUpdateItem}
                        >

                            {/* SKU */}

                            <div className="form-field">

                                <label htmlFor="edit-sku">
                                    SKU
                                    <span>*</span>
                                </label>

                                <input
                                    id="edit-sku"
                                    name="sku"
                                    type="text"
                                    value={editingItem.sku}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                    autoComplete="off"
                                />

                            </div>


                            {/* NAME */}

                            <div className="form-field">

                                <label htmlFor="edit-name">
                                    Item Name
                                    <span>*</span>
                                </label>

                                <input
                                    id="edit-name"
                                    name="name"
                                    type="text"
                                    value={editingItem.name}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />

                            </div>


                            {/* CATEGORY */}

                            <div className="form-field">

                                <label htmlFor="edit-category">
                                    Category
                                    <span>*</span>
                                </label>

                                <input
                                    id="edit-category"
                                    name="category"
                                    type="text"
                                    value={editingItem.category}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />

                            </div>


                            {/* QUANTITY */}

                            <div className="form-field">

                                <label htmlFor="edit-quantity">
                                    Quantity
                                    <span>*</span>
                                </label>

                                <input
                                    id="edit-quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={editingItem.quantity}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />

                            </div>


                            {/* THRESHOLD */}

                            <div className="form-field">

                                <label htmlFor="edit-threshold">
                                    Threshold
                                    <span>*</span>
                                </label>

                                <input
                                    id="edit-threshold"
                                    name="threshold"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={editingItem.threshold}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />

                            </div>


                            {/* UNIT PRICE */}

                            <div className="form-field">

                                <label htmlFor="edit-unitPrice">
                                    Unit Price
                                    <span>*</span>
                                </label>

                                <div className="price-input-wrapper">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="edit-unitPrice"
                                        name="unitPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editingItem.unitPrice}
                                        onChange={handleEditChange}
                                        disabled={savingEdit}
                                    />

                                </div>

                            </div>


                            {/* EDIT ERROR */}

                            {editError && (

                                <div className="form-alert form-alert-error">

                                    <span>
                                        ⚠️
                                    </span>

                                    <p>
                                        {editError}
                                    </p>

                                </div>

                            )}


                            {/* EDIT SUCCESS */}

                            {editSuccess && (

                                <div className="form-alert form-alert-success">

                                    <span>
                                        ✓
                                    </span>

                                    <p>
                                        {editSuccess}
                                    </p>

                                </div>

                            )}


                            {/* EDIT ACTIONS */}

                            <div className="add-item-form-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeEditModal}
                                    disabled={savingEdit}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-item-button"
                                    disabled={savingEdit}
                                >

                                    {savingEdit ? (
                                        <>
                                            <span className="button-spinner">
                                                ⟳
                                            </span>

                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <span>
                                                ✓
                                            </span>

                                            Update Item
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==================================================
                DELETE CONFIRMATION MODAL
            ================================================== */}

            {showDeleteModal && deletingItem && (

                <div
                    className="add-item-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target === e.currentTarget &&
                            !deleting
                        ) {
                            closeDeleteModal();
                        }

                    }}
                >

                    <div
                        className="delete-confirm-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="delete-confirm-icon">
                            🗑️
                        </div>

                        <h2>
                            Delete Item?
                        </h2>

                        <p>
                            Are you sure you want to
                            delete{" "}
                            <strong>
                                {deletingItem.name}
                            </strong>
                            ?
                        </p>

                        <div className="delete-item-details">

                            <span>
                                SKU
                            </span>

                            <strong>
                                {deletingItem.sku}
                            </strong>

                        </div>

                        <p className="delete-warning-text">
                            This action cannot be undone.
                        </p>

                        <div className="delete-confirm-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="confirm-delete-button"
                                onClick={handleDeleteItem}
                                disabled={deleting}
                            >

                                {deleting
                                    ? "Deleting..."
                                    : "Yes, Delete"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Items;