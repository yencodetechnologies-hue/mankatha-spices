import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { orderApi } from "../api/orderApi";
import { formatMoney } from "../utils/formatMoney";
import { getBackendOrigin } from "../api/adminApiBase";

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
  slipUrl: o.slipUrl,
  userBankName: o.userBankName,
  transactionRef: o.transactionRef,
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
  const [viewSlip, setViewSlip] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [periodFilter, setPeriodFilter] = useState("This Month");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const sourceFilter = "Online Orders";
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
    try {
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
      await orderApi.deleteOrder(orderId);
      loadData();
    } catch (err) {
      alert("Failed to delete order");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, customerFilter, sourceFilter, periodFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / pageSize);

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
          <h2>Online Orders</h2>
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

        <div className="table-wrap orders-table-wrap overflow-x-auto w-full">
            <table className="orders-table w-full min-w-[900px]">
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
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="orders-empty-cell">
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => (
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
                      <td style={{ whiteSpace: "nowrap" }}>{o.date}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button type="button" className="order-view-btn" onClick={() => setSelectedOrder(o)}>
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                            title="Delete order"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-100 bg-white rounded-b-xl">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-[#f4f8ec] p-5 border-b border-[#d3e1b7]">
              <div>
                <h3 className="m-0 text-lg md:text-xl font-bold text-[#52720d]">Order #{selectedOrder.id} Details</h3>
                <p className="m-0 mt-1 text-xs md:text-sm color-[#6b9312] font-medium">{selectedOrder.date}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="border-none bg-[#e1ecd0] cursor-pointer text-sm w-8 h-8 rounded-full flex items-center justify-center text-[#52720d] hover:bg-[#d3e1b7] transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto flex-1">
              
              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 items-start">
                <div>
                  <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Customer</span>
                  <div className="font-medium text-gray-900 mt-1">{selectedOrder.customer}</div>
                  {(selectedOrder.email !== "N/A" || selectedOrder.phone !== "N/A") && (
                    <div className="text-xs text-gray-500 mt-1.5 leading-relaxed break-all">
                      {selectedOrder.phone !== "N/A" && <div>{selectedOrder.phone}</div>}
                      {selectedOrder.email !== "N/A" && <div>{selectedOrder.email}</div>}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Order Status</span>
                  <div className="mt-1"><span className={statusClass(selectedOrder.status)} style={{ marginLeft: 0 }}>{selectedOrder.status}</span></div>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Payment Status</span>
                  <div className="mt-1"><span className={paymentClass(selectedOrder.payment)} style={{ marginLeft: 0 }}>{selectedOrder.payment}</span></div>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Payment Method</span>
                  <div className="font-medium text-gray-900 mt-1">{selectedOrder.paymentMethod}</div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              {selectedOrder.paymentMethod === 'Bank Transfer' && (selectedOrder.userBankName || selectedOrder.transactionRef || selectedOrder.slipUrl) && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                  <h4 className="m-0 mb-3 text-xs uppercase text-slate-500 font-bold tracking-wider">Bank Transfer Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedOrder.userBankName && (
                      <div><span className="text-slate-500">Bank:</span> <span className="font-semibold text-slate-700">{selectedOrder.userBankName}</span></div>
                    )}
                    {selectedOrder.transactionRef && (
                      <div><span className="text-slate-500">Ref:</span> <span className="font-semibold text-slate-700">{selectedOrder.transactionRef}</span></div>
                    )}
                    {selectedOrder.slipUrl && (
                      <div className="col-span-1 sm:col-span-2 mt-1">
                        <button 
                          type="button" 
                          onClick={() => setViewSlip(selectedOrder.slipUrl?.startsWith('http') ? selectedOrder.slipUrl : `${getBackendOrigin()}${selectedOrder.slipUrl?.startsWith('/') ? '' : '/'}${selectedOrder.slipUrl}`)} 
                          className="inline-flex items-center gap-1 text-blue-600 font-medium px-3 py-1.5 bg-blue-50 rounded-md border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          View Passbook
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="mb-4">
                <h4 className="m-0 mb-3 text-sm font-bold text-gray-700">Purchased Items</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg bg-gray-100 bg-cover bg-center shrink-0" 
                            style={{ backgroundImage: `url(${getCategoryImg(item.category)})` }}
                          />
                          <div>
                            <div className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} x {formatMoney(item.price || 0)}</div>
                          </div>
                        </div>
                        <div className="font-bold text-gray-900 text-sm md:text-base">
                          {formatMoney((item.price || 0) * (item.quantity || 1))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-xl text-gray-500 text-sm">
                    No item details found for this order.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (Total) */}
            <div className="flex justify-between items-center p-5 bg-gray-50 border-t border-gray-200">
              <span className="font-bold text-gray-700">Total Amount</span>
              <span className="text-xl font-bold text-emerald-600">{formatMoney(selectedOrder.total)}</span>
            </div>
          </div>
        </div>
      )}
      {viewSlip && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewSlip(null)}>
          <div style={{ position: 'relative', background: '#fff', borderRadius: '8px', padding: '8px', maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewSlip(null)} style={{ position: 'absolute', top: '-16px', right: '-16px', border: 'none', background: '#fff', cursor: 'pointer', fontSize: '16px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 2 }}>✕</button>
            <div style={{ overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={viewSlip} alt="Passbook/Slip" style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 16px)', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOrdersPanel;
