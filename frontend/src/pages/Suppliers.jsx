import { useEffect, useMemo, useState } from "react";
import {
    getSuppliers
} from "../services/api";

function Suppliers() {

    const [suppliers, setSuppliers] = useState([]);

    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [editingId, setEditingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadSuppliers();
    }, []);

    // =========================
    // LOAD SUPPLIERS
    // =========================

    const loadSuppliers = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getSuppliers();

            setSuppliers(data);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load suppliers."
            );

        } finally {

            setLoading(false);

        }
    };

    // =========================
    // CLEAR FORM
    // =========================

    const clearForm = () => {

        setName("");
        setCompany("");
        setContact("");
        setEmail("");
        setEditingId(null);
    };

    // =========================
    // VALIDATE FORM
    // =========================

    const validateForm = () => {

        if (!name.trim()) {
            setError("Supplier name is required.");
            return false;
        }

        if (!company.trim()) {
            setError("Company name is required.");
            return false;
        }

        if (!contact.trim()) {
            setError("Contact number is required.");
            return false;
        }

        if (!email.trim()) {
            setError("Email address is required.");
            return false;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
            setError(
                "Please enter a valid email address."
            );
            return false;
        }

        return true;
    };

    // =========================
    // ADD / UPDATE SUPPLIER
    // =========================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        try {

            setSubmitting(true);

            const isEditing =
                editingId !== null;

            const url = isEditing
                ? `http://localhost:8080/api/suppliers/${editingId}`
                : "http://localhost:8080/api/suppliers";

            const method = isEditing
                ? "PUT"
                : "POST";

            const response = await fetch(
                url,
                {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        company: company.trim(),
                        contact: contact.trim(),
                        email: email.trim()
                    })
                }
            );

            const contentType =
                response.headers.get("content-type");

            let data;

            if (
                contentType &&
                contentType.includes("application/json")
            ) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {

                throw new Error(
                    typeof data === "object"
                        ? data.message ||
                        "Unable to save supplier."
                        : data ||
                        "Unable to save supplier."
                );
            }

            setSuccess(
                isEditing
                    ? "Supplier updated successfully."
                    : "Supplier added successfully."
            );

            clearForm();

            await loadSuppliers();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to save supplier."
            );

        } finally {

            setSubmitting(false);

        }
    };

    // =========================
    // START EDIT
    // =========================

    const handleEdit = (supplier) => {

        setError("");
        setSuccess("");

        setEditingId(supplier.id);

        setName(supplier.name || "");
        setCompany(supplier.company || "");
        setContact(supplier.contact || "");
        setEmail(supplier.email || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =========================
    // CANCEL EDIT
    // =========================

    const handleCancelEdit = () => {

        clearForm();

        setError("");
        setSuccess("");
    };

    // =========================
    // DELETE SUPPLIER
    // =========================

    const handleDelete = async (supplier) => {

        setError("");
        setSuccess("");

        const confirmed = window.confirm(
            `Are you sure you want to delete supplier "${supplier.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(supplier.id);

            const response = await fetch(
                `http://localhost:8080/api/suppliers/${supplier.id}`,
                {
                    method: "DELETE"
                }
            );

            const contentType =
                response.headers.get("content-type");

            let data;

            if (
                contentType &&
                contentType.includes("application/json")
            ) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {

                throw new Error(
                    typeof data === "object"
                        ? data.message ||
                        "Unable to delete supplier."
                        : data ||
                        "Unable to delete supplier."
                );
            }

            setSuccess(
                "Supplier deleted successfully."
            );

            // If deleted supplier was being edited
            if (editingId === supplier.id) {
                clearForm();
            }

            await loadSuppliers();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to delete supplier."
            );

        } finally {

            setDeletingId(null);

        }
    };

    // =========================
    // FILTER SUPPLIERS
    // =========================

    const filteredSuppliers = useMemo(() => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();

        if (!search) {
            return suppliers;
        }

        return suppliers.filter(
            (supplier) => {

                const searchableText =
                    `${supplier.name || ""}
                     ${supplier.company || ""}
                     ${supplier.contact || ""}
                     ${supplier.email || ""}`
                        .toLowerCase();

                return searchableText.includes(search);

            }
        );

    }, [suppliers, searchTerm]);


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div>

                <div className="top-header">

                    <div>

                        <h1>
                            Suppliers
                        </h1>

                        <p>
                            Manage supplier records and contacts
                        </p>

                    </div>

                </div>

                <div className="loading">
                    Loading suppliers...
                </div>

            </div>

        );

    }


    return (

        <div>

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="top-header">

                <div>

                    <h1>
                        Suppliers
                    </h1>

                    <p>
                        Manage supplier records and contacts
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={loadSuppliers}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =========================
                MESSAGES
            ========================= */}

            {success && (

                <div className="success-message">
                    ✓ {success}
                </div>

            )}

            {error && (

                <div className="error-message">
                    ⚠ {error}
                </div>

            )}


            {/* =========================
                SUMMARY
            ========================= */}

            <section className="supplier-summary-grid">

                <div className="supplier-summary-card">

                    <div className="supplier-summary-icon blue">
                        🏢
                    </div>

                    <div>

                        <span>
                            Total Suppliers
                        </span>

                        <strong>
                            {suppliers.length}
                        </strong>

                    </div>

                </div>


                <div className="supplier-summary-card">

                    <div className="supplier-summary-icon green">
                        ✓
                    </div>

                    <div>

                        <span>
                            Active Records
                        </span>

                        <strong>
                            {suppliers.length}
                        </strong>

                    </div>

                </div>


                <div className="supplier-summary-card">

                    <div className="supplier-summary-icon purple">
                        📋
                    </div>

                    <div>

                        <span>
                            Search Results
                        </span>

                        <strong>
                            {filteredSuppliers.length}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =========================
                ADD / EDIT SUPPLIER
            ========================= */}

            <section className="content-card supplier-form-card">

                <div className="card-header">

                    <div>

                        <h2>
                            {editingId !== null
                                ? "Edit Supplier"
                                : "Add New Supplier"}
                        </h2>

                        <p>
                            {editingId !== null
                                ? "Update supplier information"
                                : "Create a supplier record for inventory management"}
                        </p>

                    </div>

                </div>


                <form
                    className="supplier-form"
                    onSubmit={handleSubmit}
                >

                    {/* SUPPLIER NAME */}

                    <div className="form-group">

                        <label htmlFor="supplier-name">
                            Supplier Name
                        </label>

                        <input
                            id="supplier-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Enter supplier name"
                        />

                    </div>


                    {/* COMPANY */}

                    <div className="form-group">

                        <label htmlFor="supplier-company">
                            Company
                        </label>

                        <input
                            id="supplier-company"
                            type="text"
                            value={company}
                            onChange={(event) =>
                                setCompany(event.target.value)
                            }
                            placeholder="Enter company name"
                        />

                    </div>


                    {/* CONTACT */}

                    <div className="form-group">

                        <label htmlFor="supplier-contact">
                            Contact
                        </label>

                        <input
                            id="supplier-contact"
                            type="tel"
                            value={contact}
                            onChange={(event) =>
                                setContact(event.target.value)
                            }
                            placeholder="Enter contact number"
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="supplier-email">
                            Email
                        </label>

                        <input
                            id="supplier-email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="supplier@example.com"
                        />

                    </div>


                    {/* FORM ACTIONS */}

                    <div className="supplier-form-actions">

                        <button
                            type="submit"
                            className="submit-button supplier-submit-button"
                            disabled={submitting}
                        >

                            {submitting

                                ? editingId !== null
                                    ? "Updating Supplier..."
                                    : "Adding Supplier..."

                                : editingId !== null
                                    ? "✓ Update Supplier"
                                    : "+ Add Supplier"}

                        </button>


                        {editingId !== null && (

                            <button
                                type="button"
                                className="refresh-button"
                                onClick={handleCancelEdit}
                                disabled={submitting}
                            >
                                × Cancel Edit
                            </button>

                        )}

                    </div>

                </form>

            </section>


            {/* =========================
                SUPPLIER LIST
            ========================= */}

            <section className="content-card supplier-list-card">

                <div className="supplier-list-header">

                    <div>

                        <h2>
                            Supplier Directory
                        </h2>

                        <p>
                            View and search all registered suppliers
                        </p>

                    </div>

                    <div className="supplier-count">

                        {filteredSuppliers.length}
                        {" "}
                        record
                        {filteredSuppliers.length !== 1
                            ? "s"
                            : ""}

                    </div>

                </div>


                {/* SEARCH */}

                <div className="supplier-search">

                    <span>
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Search supplier, company, contact or email..."
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
                            className="clear-search-button"
                            onClick={() =>
                                setSearchTerm("")
                            }
                        >
                            ×
                        </button>

                    )}

                </div>


                {/* EMPTY STATE */}

                {filteredSuppliers.length === 0 ? (

                    <div className="supplier-empty-state">

                        <div className="supplier-empty-icon">
                            🏢
                        </div>

                        <h3>
                            No suppliers found
                        </h3>

                        <p>
                            Add a supplier or change your search.
                        </p>

                    </div>

                ) : (

                    <div className="table-container">

                        <table className="supplier-table">

                            <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    Supplier
                                </th>

                                <th>
                                    Company
                                </th>

                                <th>
                                    Contact
                                </th>

                                <th>
                                    Email
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

                            {filteredSuppliers.map(
                                (supplier, index) => (

                                    <tr
                                        key={supplier.id}
                                    >

                                        {/* NUMBER */}

                                        <td>

                                            <span className="supplier-number">
                                                {index + 1}
                                            </span>

                                        </td>


                                        {/* SUPPLIER */}

                                        <td>

                                            <div className="supplier-table-info">

                                                <div className="supplier-table-icon">
                                                    👤
                                                </div>

                                                <div>

                                                    <strong>
                                                        {supplier.name}
                                                    </strong>

                                                    <span>
                                                        Supplier ID: #{supplier.id}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* COMPANY */}

                                        <td>

                                            <span className="company-badge">
                                                🏢 {supplier.company}
                                            </span>

                                        </td>


                                        {/* CONTACT */}

                                        <td>

                                            <span className="supplier-contact">
                                                📞 {supplier.contact}
                                            </span>

                                        </td>


                                        {/* EMAIL */}

                                        <td>

                                            <span className="supplier-email">
                                                ✉ {supplier.email}
                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span className="supplier-status-badge">
                                                <span className="status-dot"></span>
                                                Active
                                            </span>

                                        </td>


                                        {/* PREMIUM ACTIONS */}

                                        <td>

                                            <div className="supplier-actions">

                                                {/* EDIT */}

                                                <button
                                                    type="button"
                                                    className="premium-action-button edit-action"
                                                    onClick={() =>
                                                        handleEdit(
                                                            supplier
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        supplier.id
                                                    }
                                                    title="Edit Supplier"
                                                    aria-label={`Edit ${supplier.name}`}
                                                >

                                                    <span className="action-icon">
                                                        ✎
                                                    </span>

                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    className="premium-action-button delete-action"
                                                    onClick={() =>
                                                        handleDelete(
                                                            supplier
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        supplier.id
                                                    }
                                                    title="Delete Supplier"
                                                    aria-label={`Delete ${supplier.name}`}
                                                >

                                                    {deletingId ===
                                                    supplier.id ? (

                                                        <span className="action-spinner"></span>

                                                    ) : (

                                                        <span className="action-icon">
                                                            ⌫
                                                        </span>

                                                    )}

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>

    );
}

export default Suppliers;