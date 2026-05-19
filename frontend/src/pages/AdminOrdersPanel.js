import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { orderApi } from "../api/orderApi";
import { formatMoneyWhole } from "../utils/formatMoney";

const formatOrderDate = (iso) =>
  new Intl.DateTimeFormat("en-LK", { month: "short", day: "numeric" }).format(new Date(iso));

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
  items: o.itemCount,
  total: o.total,
  payment: o.payment,
  status: o.status,
  date: formatOrderDate(o.orderDate),
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [periodFilter, setPeriodFilter] = useState("This Month");

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
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const handleExport = () => {
    const header = ["Order ID", "Customer", "Items", "Total (LKR)", "Payment", "Status", "Date"];
    const rowsCsv = filtered.map((o) => [o.id, o.customer, o.items, o.total, o.payment, o.status, o.date]);
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
            {stats.totalOrders.toLocaleString("en-LK")} total orders ·{" "}
            <span className="orders-pending-hint">{stats.pendingAction} pending action</span>
          </p>
        </div>
        <button type="button" className="export-csv-btn" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      <div className="orders-stats-row">
        <div className="order-stat-card stat-delivered">
          <span className="order-stat-value">{stats.delivered.toLocaleString("en-LK")}</span>
          <span className="order-stat-label">Delivered</span>
        </div>
        <div className="order-stat-card stat-processing">
          <span className="order-stat-value">{stats.processing.toLocaleString("en-LK")}</span>
          <span className="order-stat-label">Processing</span>
        </div>
        <div className="order-stat-card stat-pending">
          <span className="order-stat-value">{stats.pending.toLocaleString("en-LK")}</span>
          <span className="order-stat-label">Pending</span>
        </div>
        <div className="order-stat-card stat-cancelled">
          <span className="order-stat-value">{stats.cancelled.toLocaleString("en-LK")}</span>
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
                        {o.items} item{o.items === 1 ? "" : "s"}
                      </td>
                      <td className="order-total-cell">{formatMoneyWhole(o.total)}</td>
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
                        <button type="button" className="order-view-btn">
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
    </>
  );
};

export default AdminOrdersPanel;
