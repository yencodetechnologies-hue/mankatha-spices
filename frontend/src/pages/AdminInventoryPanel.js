import React, { useCallback, useEffect, useState } from "react";
import { inventoryApi } from "../api/inventoryApi";
import { getBackendOrigin } from "../api/adminApiBase";

const initialsFromName = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 1) return parts[0].slice(0, 2).toUpperCase();
  return "??";
};

const hueFromName = (name) => {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i += 1) {
    h = s.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
};

const stockClass = (status) => {
  if (status === "out_of_stock") return "inv-stock out";
  if (status === "low_stock") return "inv-stock low";
  return "inv-stock ok";
};

const statusPill = (status) => {
  if (status === "healthy") return "inv-pill healthy";
  if (status === "low_stock") return "inv-pill low";
  return "inv-pill out";
};

const statusDot = (status) => {
  if (status === "healthy") return "inv-dot green";
  if (status === "low_stock") return "inv-dot amber";
  return "inv-dot red";
};

const statusLabel = (status) => {
  if (status === "healthy") return "Healthy";
  if (status === "low_stock") return "Low Stock";
  return "Out of Stock";
};

const AdminInventoryPanel = () => {
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({ productId: "", qty: "" });

  const origin = getBackendOrigin();
  const readOnlyInventory = data?._meta?.source === "products-fallback";
  const summary = data?.summary;
  const items = data?.items || [];

  const load = useCallback(async () => {
    const cached = inventoryApi.getCached();
    if (cached) {
      setData(cached);
    }
    try {
      setErrorMessage("");
      const res = await inventoryApi.getInventory();
      setData(res);
    } catch (error) {
      const detail = error.response?.data?.message;
      let msg = detail || error.message || "Failed to load inventory.";
      setErrorMessage(msg);
      if (!cached) {
        setData(null);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const imageSrc = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${p}`;
  };



  return (
    <div className="admin-inventory">
      <div className="products-head inv-head">
        <div>
          <h2>Inventory</h2>
          <p>
            {summary != null ? (
              <>
                <span className="customers-sub-highlight">{summary.needRestocking}</span>{" "}
                {summary.needRestocking === 1 ? "product needs" : "products need"} restocking
              </>
            ) : (
              ""
            )}
          </p>
        </div>
        <button
          type="button"
          className="top-add-btn"
          disabled={readOnlyInventory}
          onClick={() => {
            if (readOnlyInventory) {
              setToast("Restart the backend to enable restock.");
              return;
            }
            setShowRestockModal(true);
            setRestockForm({ productId: items[0]?.id || "", qty: items[0]?.reorderQty || 50 });
          }}
          title={readOnlyInventory ? "Restart the backend with the latest server.js to log restock orders." : undefined}
        >
          + Place Restock Order
        </button>
      </div>

      {readOnlyInventory ? (
        <div className="status-info inv-toast" role="status">
          Showing stock from the <strong>Products</strong> API — the dedicated inventory route is missing on the server.
          Restart the backend from this project&apos;s <code>backend</code> folder after saving <code>server.js</code>, then refresh to enable reorder logging.
        </div>
      ) : null}

      {toast ? (
        <div className="status-info inv-toast" role="status">
          {toast}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="status-error" role="alert">
          {errorMessage}
          <button type="button" className="overview-btn-primary overview-retry inv-retry" onClick={load}>
            Retry
          </button>
        </div>
      ) : null}

      {summary ? (
        <div className="inv-kpi-row">
          <div className="inv-kpi-card">
            <p className="inv-kpi-value">{summary.productsInStock}</p>
            <p className="inv-kpi-label">Products in stock</p>
          </div>
          <div className="inv-kpi-card">
            <p className="inv-kpi-value">{summary.lowStockAlerts}</p>
            <p className="inv-kpi-label">Low stock alerts</p>
          </div>
          <div className="inv-kpi-card">
            <p className="inv-kpi-value">{summary.outOfStock}</p>
            <p className="inv-kpi-label">Out of stock</p>
          </div>
        </div>
      ) : null}



      {data ? (
        <div className="inv-table-card">
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current stock</th>
                  <th>Min. level</th>
                  <th>Reorder qty</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const src = imageSrc(row.image);
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className="inv-product-cell">
                          {src ? (
                            <img className="inv-thumb" src={src} alt="" width={40} height={40} />
                          ) : (
                            <span
                              className="inv-thumb-fallback"
                              style={{ background: `hsl(${hueFromName(row.name)} 42% 42%)` }}
                              aria-hidden
                            >
                              {initialsFromName(row.name)}
                            </span>
                          )}
                          <span className="inv-product-name">{row.name}</span>
                        </div>
                      </td>
                      <td className={stockClass(row.status)}>
                        {row.currentStock} units
                      </td>
                      <td>{row.minLevel} units</td>
                      <td>{row.reorderQty} units</td>
                      <td>{row.supplier}</td>
                      <td>
                        <span className={statusPill(row.status)}>
                          <span className={statusDot(row.status)} aria-hidden />
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td>
                        {row.status === "healthy" ? (
                          <button
                            type="button"
                            className="inv-btn-outline"
                            disabled={readOnlyInventory}
                            onClick={() => {
                              setShowRestockModal(true);
                              setRestockForm({ productId: row.id, qty: row.reorderQty });
                            }}
                          >
                            Reorder
                          </button>
                        ) : null}
                        {row.status === "low_stock" ? (
                          <button
                            type="button"
                            className="inv-btn-warn"
                            disabled={readOnlyInventory}
                            onClick={() => {
                              setShowRestockModal(true);
                              setRestockForm({ productId: row.id, qty: row.reorderQty });
                            }}
                          >
                            Reorder Now
                          </button>
                        ) : null}
                        {row.status === "out_of_stock" ? (
                          <button
                            type="button"
                            className="inv-btn-urgent"
                            disabled={readOnlyInventory}
                            onClick={() => {
                              setShowRestockModal(true);
                              setRestockForm({ productId: row.id, qty: row.reorderQty });
                            }}
                          >
                            Urgent Reorder
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {items.length === 0 ? <p className="inv-empty">No products yet. Add products under Products.</p> : null}
        </div>
      ) : null}

      {/* Manual Restock Modal */}
      {showRestockModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowRestockModal(false)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Place Restock Order</h3>
              <button onClick={() => setShowRestockModal(false)} style={{ border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: '14px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Select Product</label>
                <select 
                  value={restockForm.productId}
                  onChange={(e) => {
                    const sel = items.find(i => i.id === e.target.value);
                    setRestockForm({ productId: e.target.value, qty: sel ? sel.reorderQty : 50 });
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  {items.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.currentStock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Restock Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={restockForm.qty}
                  onChange={(e) => setRestockForm({ ...restockForm, qty: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowRestockModal(false)}
                style={{ padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', color: '#374151', fontWeight: '500', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                disabled={bulkBusy || !restockForm.productId || !restockForm.qty}
                onClick={async () => {
                  setBulkBusy(true);
                  try {
                    const row = items.find(i => i.id === restockForm.productId);
                    if (!row) throw new Error("Product not found");
                    await inventoryApi.reorder(row.id, { urgent: false, qty: Number(restockForm.qty) });
                    setToast(`Restocked ${restockForm.qty} units of ${row.name}`);
                    setShowRestockModal(false);
                    load();
                  } catch (err) {
                    setToast(err.message || "Failed to restock");
                  } finally {
                    setBulkBusy(false);
                  }
                }}
                style={{ padding: '10px 16px', background: '#6b9312', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '500', cursor: 'pointer', opacity: (bulkBusy || !restockForm.qty) ? 0.7 : 1 }}
              >
                {bulkBusy ? 'Processing...' : 'Submit Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPanel;
