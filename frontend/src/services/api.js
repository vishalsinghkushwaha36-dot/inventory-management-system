const API_BASE_URL = "https://inventory-management-backend-17pi.onrender.com/api";

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

const parseResponse = async (response) => {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};


const getErrorMessage = (data, fallbackMessage) => {
    if (typeof data === "string" && data.trim()) {
        return data;
    }

    if (data?.message) {
        return data.message;
    }

    if (data?.error) {
        return data.error;
    }

    return fallbackMessage;
};


/* =========================================================
   ITEMS
   ========================================================= */


/* =========================
   GET ALL ITEMS
   ========================= */

export const getItems = async () => {

    const response = await fetch(
        `${API_BASE_URL}/items`
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to fetch items"
            )
        );
    }

    return Array.isArray(data)
        ? data
        : [];
};


/* =========================
   ADD NEW ITEM
   ========================= */

export const addItem = async (item) => {

    const response = await fetch(
        `${API_BASE_URL}/items`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(item),
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to add item"
            )
        );
    }

    return data;
};


/* =========================
   UPDATE ITEM
   ========================= */

export const updateItem = async (
    id,
    item
) => {

    const response = await fetch(
        `${API_BASE_URL}/items/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(item),
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to update item"
            )
        );
    }

    return data;
};


/* =========================
   DELETE ITEM
   ========================= */

export const deleteItem = async (id) => {

    const response = await fetch(
        `${API_BASE_URL}/items/${id}`,
        {
            method: "DELETE",
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to delete item"
            )
        );
    }

    return data;
};


/* =========================================================
   SUPPLIERS
   ========================================================= */


/* =========================
   GET ALL SUPPLIERS
   ========================= */

export const getSuppliers = async () => {

    const response = await fetch(
        `${API_BASE_URL}/suppliers`
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to fetch suppliers"
            )
        );
    }

    return Array.isArray(data)
        ? data
        : [];
};


/* =========================
   ADD SUPPLIER
   ========================= */

export const addSupplier = async (
    supplier
) => {

    const response = await fetch(
        `${API_BASE_URL}/suppliers`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(supplier),
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to add supplier"
            )
        );
    }

    return data;
};


/* =========================
   UPDATE SUPPLIER
   ========================= */

export const updateSupplier = async (
    id,
    supplier
) => {

    const response = await fetch(
        `${API_BASE_URL}/suppliers/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(supplier),
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to update supplier"
            )
        );
    }

    return data;
};


/* =========================
   DELETE SUPPLIER
   ========================= */

export const deleteSupplier = async (
    id
) => {

    const response = await fetch(
        `${API_BASE_URL}/suppliers/${id}`,
        {
            method: "DELETE",
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to delete supplier"
            )
        );
    }

    return data;
};


/* =========================================================
   STOCK TRANSACTIONS
   ========================================================= */


/* =========================
   STOCK-IN
   ========================= */

export const stockIn = async (
    sku,
    quantity,
    remarks,
    supplierId
) => {

    const params =
        new URLSearchParams();

    params.append(
        "sku",
        sku
    );

    params.append(
        "quantity",
        quantity
    );

    /*
     * Supplier is required for STOCK-IN.
     */
    if (
        supplierId !== undefined &&
        supplierId !== null &&
        supplierId !== ""
    ) {
        params.append(
            "supplierId",
            supplierId
        );
    }

    if (
        remarks !== undefined &&
        remarks !== null &&
        String(remarks).trim() !== ""
    ) {
        params.append(
            "remarks",
            remarks
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/items/stock-in?${params.toString()}`,
        {
            method: "POST",
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Stock-IN failed"
            )
        );
    }

    return data;
};


/* =========================
   STOCK-OUT
   ========================= */

export const stockOut = async (
    sku,
    quantity,
    remarks
) => {

    const params =
        new URLSearchParams();

    params.append(
        "sku",
        sku
    );

    params.append(
        "quantity",
        quantity
    );

    if (
        remarks !== undefined &&
        remarks !== null &&
        String(remarks).trim() !== ""
    ) {
        params.append(
            "remarks",
            remarks
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/items/stock-out?${params.toString()}`,
        {
            method: "POST",
        }
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Stock-OUT failed"
            )
        );
    }

    return data;
};


/* =========================================================
   TRANSACTION HISTORY
   ========================================================= */


/* =========================
   GET TRANSACTION HISTORY
   ========================= */

export const getTransactionHistory =
    async () => {

        const response = await fetch(
            `${API_BASE_URL}/items/transactions`
        );

        const data =
            await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Failed to fetch transaction history"
                )
            );
        }

        return Array.isArray(data)
            ? data
            : [];
    };


/* =========================================================
   LOW STOCK
   ========================================================= */


/* =========================
   GET LOW STOCK ITEMS
   ========================= */

export const getLowStockItems =
    async () => {

        const response = await fetch(
            `${API_BASE_URL}/items/low-stock`
        );

        const data =
            await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Failed to fetch low stock items"
                )
            );
        }

        return Array.isArray(data)
            ? data
            : [];
    };


/* =========================================================
   REORDER SUGGESTIONS
   ========================================================= */


/* =========================
   GET REORDER SUGGESTIONS
   ========================= */

export const getReorderSuggestions =
    async () => {

        const response = await fetch(
            `${API_BASE_URL}/items/reorder-suggestions`
        );

        const data =
            await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Failed to fetch reorder suggestions"
                )
            );
        }

        return Array.isArray(data)
            ? data
            : [];
    };


/* =========================================================
   SEARCH & FILTER
   ========================================================= */


/* =========================
   SEARCH ITEMS BY NAME
   ========================= */

export const searchItems = async (
    name
) => {

    const params =
        new URLSearchParams();

    params.append(
        "name",
        name
    );

    const response = await fetch(
        `${API_BASE_URL}/items/search?${params.toString()}`
    );

    const data =
        await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            getErrorMessage(
                data,
                "Failed to search items"
            )
        );
    }

    return Array.isArray(data)
        ? data
        : [];
};


/* =========================
   FILTER ITEMS BY CATEGORY
   ========================= */

export const getItemsByCategory =
    async (category) => {

        const params =
            new URLSearchParams();

        params.append(
            "category",
            category
        );

        const response = await fetch(
            `${API_BASE_URL}/items/category?${params.toString()}`
        );

        const data =
            await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Failed to filter items by category"
                )
            );
        }

        return Array.isArray(data)
            ? data
            : [];
    };


/* =========================================================
   CATEGORY STOCK VALUE
   ========================================================= */


/* =========================
   GET CATEGORY STOCK VALUE
   ========================= */

export const getCategoryStockValue =
    async () => {

        const response = await fetch(
            `${API_BASE_URL}/items/category-stock-value`
        );

        const data =
            await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Failed to fetch category stock value"
                )
            );
        }

        return Array.isArray(data)
            ? data
            : [];
    };


/* =========================================================
   CSV EXPORT
   ========================================================= */


/* =========================
   EXPORT INVENTORY CSV
   ========================= */

export const exportInventoryCSV =
    async () => {

        const response = await fetch(
            `${API_BASE_URL}/items/export`
        );

        if (!response.ok) {

            const data =
                await parseResponse(response);

            throw new Error(
                getErrorMessage(
                    data,
                    "Failed to export inventory CSV"
                )
            );
        }

        const blob =
            await response.blob();

        const contentDisposition =
            response.headers.get(
                "Content-Disposition"
            );

        let filename =
            "inventory-report.csv";

        if (contentDisposition) {

            const filenameMatch =
                contentDisposition.match(
                    /filename="?([^"]+)"?/i
                );

            if (
                filenameMatch &&
                filenameMatch[1]
            ) {
                filename =
                    filenameMatch[1];
            }
        }

        const url =
            window.URL.createObjectURL(
                blob
            );

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            filename;

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        window.URL.revokeObjectURL(
            url
        );

        return true;
    };