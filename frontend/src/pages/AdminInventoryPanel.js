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
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

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

  const onReorder = async (row, urgent) => {
    if (readOnlyInventory) {
      setToast("Restart the backend to enable reorder logging.");
      return;
    }
    try {
      setBusyId(row.id);
      setToast("");
      const res = await inventoryApi.reorder(row.id, { urgent, qty: row.reorderQty });
      setToast(res.message || "Reorder placed.");
    } catch (error) {
      setToast(error.response?.data?.message || error.message || "Reorder failed.");
    } finally {
      setBusyId(null);
    }
  };

  const onBulkRestock = async () => {
    if (readOnlyInventory) {
      setToast("Restart the backend to enable bulk restock.");
      return;
    }
    try {
      setBulkBusy(true);
      setToast("");
      const res = await inventoryApi.restockBulk();
      setToast(res.message || "Done.");
    } catch (error) {
      setToast(error.response?.data?.message || error.message || "Bulk restock failed.");
    } finally {
      setBulkBusy(false);
    }
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
          disabled={bulkBusy || readOnlyInventory}
          onClick={onBulkRestock}
          title={readOnlyInventory ? "Restart the backend with the latest server.js to log restock orders." : undefined}
        >
          {bulkBusy ? "Placing…" : "+ Place Restock Order"}
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
                  const busy = busyId === row.id;
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
                            disabled={busy || readOnlyInventory}
                            onClick={() => onReorder(row, false)}
                          >
                            {busy ? "…" : "Reorder"}
                          </button>
                        ) : null}
                        {row.status === "low_stock" ? (
                          <button
                            type="button"
                            className="inv-btn-warn"
                            disabled={busy || readOnlyInventory}
                            onClick={() => onReorder(row, false)}
                          >
                            {busy ? "…" : "Reorder Now"}
                          </button>
                        ) : null}
                        {row.status === "out_of_stock" ? (
                          <button
                            type="button"
                            className="inv-btn-urgent"
                            disabled={busy || readOnlyInventory}
                            onClick={() => onReorder(row, true)}
                          >
                            {busy ? "…" : "Urgent Reorder"}
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
    </div>
  );
};

export default AdminInventoryPanel;
