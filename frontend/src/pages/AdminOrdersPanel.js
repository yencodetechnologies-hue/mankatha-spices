import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { orderApi } from "../api/orderApi";
import { formatMoney } from "../utils/formatMoney";

import heroBlendedMasala from "../assets/hero_blended_masala.png";
import heroOrganicSpices from "../assets/hero_organic_spices.png";
import heroWholeSpices from "../assets/hero_whole_spices.png";

const slugify = (input) => String(input || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const getCategoryImg = (name) => {
  const slug = slugify(name);
  const images = {
    "ground-spices": heroOrganicSpices,
    "whole-spices": heroWholeSpices,
    "blended-masalas": heroBlendedMasala,
    "blended-masala": heroBlendedMasala,
  };
  return images[slug] || heroOrganicSpices;
};

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
  payment: o.payment || "Pending",
  paymentMethod: o.paymentMethod || "N/A",
  status: o.status || "Pending",
  date: formatOrderDate(o.orderDate || o.createdAt),
  items: o.lineItems || [],
  email: o.customerId ? o.customerId.email : "N/A",
  phone: o.customerId ? o.customerId.phone : "N/A",
  billerId: o.billerId,
  billerName: o.billerName,
});

const paymentClass = (p) => {
  if (p === "Paid") return "order-pill payment-paid";
  if (p === "Pending") return "order-pill payment-pending";
  if (p === "Awaiting Approval") return "order-pill payment-pending";
  return "order-pill payment-refunded";
};

const statusClass = (s) => {
  if (s === "Delivered") return "order-pill status-delivered";
  if (s === "Shipped" || s === "Out for Delivery") return "order-pill status-processing";
  if (s === "Processing" || s === "Ordered" || s === "Confirmed") return "order-pill status-processing";
  if (s === "Pending" || s === "Awaiting Bank Transfer") return "order-pill status-pending";
  return "order-pill status-cancelled";
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
  const [sourceFilter, setSourceFilter] = useState("Walk-in Orders");

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      await orderApi.updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      alert("Failed to update status");
      loadData(); // Revert on failure
    }
  };

  const handlePaymentChange = async (orderId, newPayment) => {
    try {
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, payment: newPayment } : o));
      await orderApi.updateOrderPayment(orderId, newPayment);
      loadData();
    } catch (err) {
      alert("Failed to update payment status");
      loadData();
    }
  };

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
        (statusFilter === "Ordered" && o.status === "Ordered") ||
        (statusFilter === "Shipped" && o.status === "Shipped") ||
        (statusFilter === "Out for Delivery" && o.status === "Out for Delivery") ||
        (statusFilter === "Delivered" && o.status === "Delivered");
      const matchesCustomer = 
        customerFilter === "All Customers" ||
        o.customer === customerFilter;
      const matchesSource =
        sourceFilter === "All Orders" ||
        (sourceFilter === "Walk-in Orders" && o.billerId) ||
        (sourceFilter === "Online Orders" && !o.billerId);
      return matchesSearch && matchesStatus && matchesCustomer && matchesSource;
    });
  }, [rows, search, statusFilter, customerFilter, sourceFilter]);

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
          <h2>Online Billing</h2>
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

      {errorMessage && !errorMessage.toLowerCase().includes("not found") && (
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
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} aria-label="Order source">
              <option value="All Orders">All Orders</option>
              <option value="Walk-in Orders">Walk-in Orders (Shop)</option>
              <option value="Online Orders">Online Orders</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Order status">
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Ordered</option>
              <option>Shipped</option>
              <option>Out for Delivery</option>
              <option>Delivered</option>
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
                  <th>Payment Status</th>
                  <th>Pay Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="orders-empty-cell">
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
                        <select
                          className={paymentClass(o.payment)}
                          value={o.payment}
                          onChange={(e) => handlePaymentChange(o.id, e.target.value)}
                          style={{ appearance: "auto", cursor: "pointer" }}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Awaiting Approval">Awaiting Approval</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                      <td>
                        <span className="text-[12px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wide border border-gray-200">
                          {o.paymentMethod || "N/A"}
                        </span>
                      </td>
                      <td>
                        <select
                          className={statusClass(o.status)}
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          style={{ appearance: "auto", cursor: "pointer" }}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Ordered">Ordered</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
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
            
            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Customer</span>
                <div style={{ fontWeight: '500', color: '#111827', marginTop: '4px' }}>{selectedOrder.customer}</div>
                {(selectedOrder.email !== "N/A" || selectedOrder.phone !== "N/A") && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', lineHeight: '1.4' }}>
                    {selectedOrder.phone !== "N/A" && <div>{selectedOrder.phone}</div>}
                    {selectedOrder.email !== "N/A" && <div style={{wordBreak: 'break-all'}}>{selectedOrder.email}</div>}
                  </div>
                )}
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Order Status</span>
                <div style={{ marginTop: '4px' }}><span className={statusClass(selectedOrder.status)} style={{ marginLeft: 0 }}>{selectedOrder.status}</span></div>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Payment Status</span>
                <div style={{ marginTop: '4px' }}><span className={paymentClass(selectedOrder.payment)} style={{ marginLeft: 0 }}>{selectedOrder.payment}</span></div>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Payment Method</span>
                <div style={{ fontWeight: '500', color: '#111827', marginTop: '4px' }}>{selectedOrder.paymentMethod}</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Purchased Items</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#f3f4f6', backgroundImage: `url(${getCategoryImg(item.category)})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}></div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px', lineHeight: '1.2' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Qty: {item.quantity} x {formatMoney(item.price || 0)}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                        {formatMoney((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
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
