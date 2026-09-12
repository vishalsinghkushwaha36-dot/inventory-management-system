import { useEffect, useState } from "react";
import { getReorderSuggestions } from "../services/api";

function ReorderSuggestions({ onAddStock }) {

    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getReorderSuggestions();
            setSuggestions(data);
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "Unable to load reorder suggestions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuggestions();
    }, []);

    const totalItems = suggestions.length;

    const totalReorderQuantity = suggestions.reduce(
        (total, item) =>
            total +
            Number(item.suggestedReorderQuantity || 0),
        0
    );

    return (
        <div>
            <header className="top-header">
                <div>
                    <h1>Reorder Suggestions</h1>
                    <p>
                        Recommended quantities for low-stock inventory
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadSuggestions}
                    disabled={loading}
                >
                    ↻ {loading ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading">
                    Loading reorder suggestions...
                </div>
            ) : (
                <>
                    <section className="stats-grid">

                        <div className="stat-card">
                            <div className="stat-icon orange">
                                ⚠️
                            </div>

                            <div>
                                <p>Items to Reorder</p>
                                <h2>{totalItems}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">
                                📦
                            </div>

                            <div>
                                <p>Suggested Units</p>
                                <h2>{totalReorderQuantity}</h2>
                            </div>
                        </div>

                    </section>

                    <section className="content-card">

                        <div className="card-header">
                            <div>
                                <h2>Recommended Reorders</h2>
                                <p>
                                    Items that need additional stock
                                </p>
                            </div>
                        </div>

                        {suggestions.length === 0 ? (

                            <div className="empty-state">

                                <div
                                    style={{
                                        fontSize: "40px",
                                        marginBottom: "10px"
                                    }}
                                >
                                    ✅
                                </div>

                                <strong>
                                    Inventory is well stocked
                                </strong>

                                <p>
                                    No reorder suggestions are currently available.
                                </p>

                            </div>

                        ) : (

                            <div className="table-container">

                                <table>

                                    <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Item Name</th>
                                        <th>Current Stock</th>
                                        <th>Threshold</th>
                                        <th>Suggested Reorder</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>

                                    <tbody>

                                    {suggestions.map((item) => (

                                        <tr key={item.sku}>

                                            <td>
                                                <strong>
                                                    {item.sku}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.name}
                                            </td>

                                            <td>
                                                <strong>
                                                    {item.currentQuantity}
                                                </strong>
                                            </td>

                                            <td>
                                                {item.threshold}
                                            </td>

                                            <td>
                                                <strong className="reorder-quantity">
                                                    +{item.suggestedReorderQuantity}
                                                </strong>
                                            </td>

                                            <td>
                                                    <span className="status-badge low">
                                                        Reorder Required
                                                    </span>
                                            </td>

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

                                    ))}

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

export default ReorderSuggestions;