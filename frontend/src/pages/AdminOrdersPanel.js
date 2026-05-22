import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { orderApi } from "../api/orderApi";
import { formatMoney } from "../utils/formatMoney";

const formatOrderDate = (iso) =>
  new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric" }).format(new Date(iso));

const initialsFromName = (name) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const hueFromName = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
};

const toRow = (o) => ({
  id: o.orderId,
  customer: o.customerName,
  initials: initialsFromName(o.customerName),
  avatarHue: hueFromName(o.customerName),
  itemCount: o.itemCount,
  total: o.total,
  payment: o.payment,
  status: o.status,
  date: formatOrderDate(o.orderDate),
  items: o.lineItems || [],
});

const paymentClass = (p) => {
  if (p === "Paid") return "order-pill payment-paid";
  if (p === "Pending") return "order-pill payment-pending";
  return "order-pill payment-refunded";
};

const statusClass = (s) => {
  if (s === "Delivered") return "order-pill status-delivered";
  if (s === "Processing") return "order-pill status-processing";
  if (s === "Pending") return "order-pill status-pending";
  return "order-pill status-cancelled";
};

const statusDotClass = (s) => {
  if (s === "Delivered") return "order-status-dot dot-green";
  if (s === "Processing") return "order-status-dot dot-blue";
  if (s === "Pending") return "order-status-dot dot-amber";
  return "order-status-dot dot-red";
};

const PERIOD_API = {
  "This Month": "this-month",
  "Last Month": "last-month",
  "All Time": "all",
};

const AdminOrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    delivered: 0,
    processing: 0,
    pending: 0,
    cancelled: 0,
    pendingAction: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [periodFilter, setPeriodFilter] = useState("This Month");
  const [customerFilter, setCustomerFilter] = useState("All Customers");

  const loadData = useCallback(async () => {
    // 1. Populate immediately from cache if available
    const cachedOrders = orderApi.getCachedOrders();
    const cachedStats = orderApi.getCachedStats();
    if (cachedOrders) {
      setOrders(cachedOrders.orders || []);
    }
    if (cachedStats) {
      setStats({
        totalOrders: cachedStats.totalOrders ?? 0,
        delivered: cachedStats.delivered ?? 0,
        processing: cachedStats.processing ?? 0,
        pending: cachedStats.pending ?? 0,
        cancelled: cachedStats.cancelled ?? 0,
        pendingAction: cachedStats.pendingAction ?? 0,
      });
    }

    // 2. Silently fetch from server in background
    try {
      setErrorMessage("");
      const period = PERIOD_API[periodFilter] || "all";
      const [listRes, statsRes] = await Promise.all([
        orderApi.getOrders({ period }),
        orderApi.getStats({ period }),
      ]);
      setOrders(listRes.orders || []);
      setStats({
        totalOrders: statsRes.totalOrders ?? 0,
        delivered: statsRes.delivered ?? 0,
        processing: statsRes.processing ?? 0,
        pending: statsRes.pending ?? 0,
        cancelled: statsRes.cancelled ?? 0,
        pendingAction: statsRes.pendingAction ?? 0,
      });
    } catch (error) {
      const status = error.response?.status;
      const isNetwork =
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error" ||
        !error.response;
      const detail = error.response?.data?.message;
      setErrorMessage(
        detail ||
          (status === 404
            ? "Orders API not found (404). Restart the backend so it loads /api/orders, or run the backend from react-frontend/backend (not an older copy without order routes)."
            : isNetwork
              ? "Cannot reach the API. Start the backend (cd backend, npm start), then restart the React dev server."
              : error.message || "Request failed.")
      );
      setOrders([]);
    }
  }, [periodFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rows = useMemo(() => orders.map(toRow), [orders]);

  const filtered = useMemo(() => {
    return rows.filter((o) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        `#${o.id}`.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Delivered" && o.status === "Delivered") ||
        (statusFilter === "Processing" && o.status === "Processing") ||
        (statusFilter === "Pending" && o.status === "Pending") ||
        (statusFilter === "Cancelled" && o.status === "Cancelled");
      const matchesCustomer = 
        customerFilter === "All Customers" ||
        o.customer === customerFilter;
      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [rows, search, statusFilter, customerFilter]);

  const uniqueCustomers = useMemo(() => {
    const customers = new Set(rows.map(o => o.customer));
    return ["All Customers", ...Array.from(customers).sort()];
  }, [rows]);

  const handleExport = () => {
    const header = ["Order ID", "Customer", "Items", "Total (£)", "Payment", "Status", "Date"];
    const rowsCsv = filtered.map((o) => [o.id, o.customer, o.itemCount, o.total, o.payment, o.status, o.date]);
    const csv = [header.join(","), ...rowsCsv.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spice-empire-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="products-head orders-head">
        <div>
          <h2>Orders</h2>
          <p>
            {stats.totalOrders.toLocaleString("en-GB")} total orders ·{" "}
            <span className="orders-pending-hint">{stats.pendingAction} pending action</span>
          </p>
        </div>
        <button type="button" className="export-csv-btn" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      <div className="orders-stats-row">
        <div className="order-stat-card stat-delivered">
          <span className="order-stat-value">{stats.delivered.toLocaleString("en-GB")}</span>
          <span className="order-stat-label">Delivered</span>
        </div>
        <div className="order-stat-card stat-processing">
          <span className="order-stat-value">{stats.processing.toLocaleString("en-GB")}</span>
          <span className="order-stat-label">Processing</span>
        </div>
        <div className="order-stat-card stat-pending">
          <span className="order-stat-value">{stats.pending.toLocaleString("en-GB")}</span>
          <span className="order-stat-label">Pending</span>
        </div>
        <div className="order-stat-card stat-cancelled">
          <span className="order-stat-value">{stats.cancelled.toLocaleString("en-GB")}</span>
          <span className="order-stat-label">Cancelled</span>
        </div>
      </div>

      {errorMessage && (
        <div className="status-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="orders-table-card">
        <div className="orders-toolbar">
          <div className="search-field orders-search">
            <Search size={16} />
            <input
              className="search-input"
              placeholder="Search order ID, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="orders-filters">
            <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} aria-label="Customer filter">
              {uniqueCustomers.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Order status">
              <option>All Status</option>
              <option>Delivered</option>
              <option>Processing</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} aria-label="Time period">
              <option>This Month</option>
              <option>Last Month</option>
              <option>All Time</option>
            </select>
          </div>
        </div>

        <div className="table-wrap orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="orders-empty-cell">
                      No orders for this period{search.trim() ? " matching your search" : ""}. Run{" "}
                      <code>npm run seed:orders</code> in the <code>backend</code> folder if the database is empty.
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <span className="order-id-link">#{o.id}</span>
                      </td>
                      <td>
                        <div className="order-customer-cell">
                          <span
                            className="order-avatar"
                            style={{ background: `hsl(${o.avatarHue} 55% 42%)` }}
                            aria-hidden
                          >
                            {o.initials}
                          </span>
                          <span>{o.customer}</span>
                        </div>
                      </td>
                      <td>
                        {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                      </td>
                      <td className="order-total-cell">{formatMoney(o.total)}</td>
                      <td>
                        <span className={paymentClass(o.payment)}>{o.payment}</span>
                      </td>
                      <td>
                        <span className={statusClass(o.status)}>
                          <span className={statusDotClass(o.status)} />
                          {o.status}
                        </span>
                      </td>
                      <td>{o.date}</td>
                      <td>
                        <button type="button" className="order-view-btn" onClick={() => setSelectedOrder(o)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedOrder(null)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f8ec', margin: '-24px -24px 20px -24px', padding: '24px', borderBottom: '1px solid #d3e1b7', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#52720d' }}>Order #{selectedOrder.id} Details</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b9312', fontWeight: '500' }}>{selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: '#e1ecd0', cursor: 'pointer', fontSize: '14px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52720d' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Customer</span>
                <div style={{ fontWeight: '500', color: '#111827', marginTop: '4px' }}>{selectedOrder.customer}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Status</span>
                <div style={{ marginTop: '4px' }}><span className={statusClass(selectedOrder.status)} style={{ marginLeft: 0 }}>{selectedOrder.status}</span></div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Purchased Items</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', padding: '12px 0', alignItems: 'center' }}>
                      <div style={{ flex: 1, paddingRight: '16px' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', marginBottom: '4px' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Qty: {item.quantity} × {formatMoney(item.price)}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>
                        {formatMoney((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280', fontSize: '14px' }}>
                  No item details found for this order.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', color: '#111827' }}>
              <span>Total Amount</span>
              <span style={{ fontSize: '18px', color: '#059669' }}>{formatMoney(selectedOrder.total)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOrdersPanel;
