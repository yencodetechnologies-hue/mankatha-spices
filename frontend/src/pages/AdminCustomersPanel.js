import React, { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { customerApi } from "../api/customerApi";
import { formatMoneyWhole, formatMoney } from "../utils/formatMoney";

import heroBlendedMasala from "../assets/hero_blended_masala.png";
import heroOrganicSpices from "../assets/hero_organic_spices.png";
import heroWholeSpices from "../assets/hero_whole_spices.png";

const PAGE_SIZE = 8;

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

const fmtJoined = (iso) =>
  new Intl.DateTimeFormat("en-LK", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));

const initialsFromName = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return String(name || "??")
    .slice(0, 2)
    .toUpperCase();
};

const hueFromName = (name) => {
  let h = 0;
  const s = String(name || "");
  for (let i = 0; i < s.length; i += 1) {
    h = s.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
};



const AdminCustomersPanel = () => {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Modal state for viewing customer orders
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadStats = useCallback(async () => {
    const cachedStats = customerApi.getCachedStats();
    if (cachedStats) {
      setStats(cachedStats);
    }
    const data = await customerApi.getStats();
    setStats(data);
  }, []);

  const loadCustomers = useCallback(async () => {
    const cachedCusts = customerApi.getCachedCustomers();
    if (cachedCusts) {
      setCustomers(cachedCusts.customers || []);
      setPagination(cachedCusts.pagination || { total: 0, page: 1, pages: 1 });
    }

    try {
      setErrorMessage("");
      const data = await customerApi.getCustomers({
        search,
        city: cityFilter,
        page,
        limit: PAGE_SIZE,
      });
      setCustomers(data.customers || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (error) {
      const detail = error.response?.data?.message;
      let msg = detail || error.message || "Failed to load customers.";
      if (error.response?.status === 404) {
        msg =
          "Customer list API returned 404. Stop any process using port 5000, then start the backend from the project root with npm run api (or cd backend && npm start), then refresh this page.";
      }
      setErrorMessage(msg);
      if (!cachedCusts) {
        setCustomers([]);
      }
    }
  }, [search, cityFilter, page]);

  useEffect(() => {
    loadStats().catch(() => setStats(null));
  }, [loadStats]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    setPage(1);
  }, [search, cityFilter]);

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    setCustomerOrders([]);
    try {
      // Use the orderApi to fetch orders matching the customer's name
      // Use dynamic import or assume orderApi is globally available or imported if I add it.
      // Wait, I need to import orderApi at the top!
      const { orderApi } = await import('../api/orderApi');
      const res = await orderApi.getOrders({ search: customer.name, period: 'all' });
      // Filter exactly to this customer to be safe (in case of partial matches)
      const exactMatches = (res.orders || []).filter(
        o => o.customerName && o.customerName.toLowerCase() === customer.name.toLowerCase()
      );
      setCustomerOrders(exactMatches);
    } catch (err) {
      console.error("Failed to load customer orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the customer "${name}"?`)) return;
    try {
      await customerApi.deleteCustomer(id);
      setCustomers(customers.filter(c => c._id !== id));
      loadStats().catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete customer.");
    }
  };

  const exportCsv = () => {
    const header = ["Name", "Email", "Phone", "City", "Orders", "Spent", "Tier", "Joined"];
    const rows = customers.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.city,
      c.orderCount,
      c.totalSpent,
      c.tier,
      fmtJoined(c.joinedAt),
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cities = stats?.cities?.length ? ["All Cities", ...stats.cities] : ["All Cities"];

  return (
    <>
      <div className="products-head customers-head">
        <div>
          <h2>Customers</h2>
          <p>
            {stats ? (
              <>
                {stats.totalRegistered.toLocaleString("en-LK")} registered ·{" "}
                <span className="customers-sub-highlight">{stats.activeThisMonth.toLocaleString("en-LK")} active this month</span>
              </>
            ) : (
              "—"
            )}
          </p>
        </div>
        <div className="customers-head-actions">
          {/* <button type="button" className="customers-btn-outline" onClick={() => window.alert("Connect your email provider to send campaigns.")}>
            Email Campaign
          </button> */}
          <button type="button" className="export-csv-btn" onClick={exportCsv} disabled={!customers.length}>
            Export
          </button>
        </div>
      </div>

      {stats && (
        <div className="customers-kpi-row">
          <div className="customers-kpi-card">
            <div>
              <p className="customers-kpi-value">{formatMoneyWhole(stats.avgLifetimeValue)}</p>
              <p className="customers-kpi-label">Avg. Lifetime Value</p>
            </div>
          </div>
          <div className="customers-kpi-card plain">
            <p className="customers-kpi-value">{stats.repeatPurchaseRate}%</p>
            <p className="customers-kpi-label">Repeat Purchase Rate</p>
          </div>
          <div className="customers-kpi-card plain">
            <p className="customers-kpi-value">{stats.avgOrdersPerCustomer}</p>
            <p className="customers-kpi-label">Avg. Orders per Customer</p>
          </div>
        </div>
      )}

      {errorMessage && !errorMessage.toLowerCase().includes("not found") && (
        <div className="status-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="customers-table-shell">
        <div className="customers-toolbar">
          <div className="search-field customers-search">
            <Search size={16} />
            <input
              className="search-input"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="customers-filters">
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} aria-label="City">
              {cities.map((c) => (
                <option key={c} value={c === "All Cities" ? "All" : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="customers-table-inner overflow-x-auto w-full">
            <table className="customers-table w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Orders</th>
                  <th>Spent</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="orders-empty-cell">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="order-customer-cell">
                          <span
                            className="order-avatar"
                            style={{ background: `hsl(${hueFromName(c.name)} 55% 42%)` }}
                            aria-hidden
                          >
                            {initialsFromName(c.name)}
                          </span>
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="customers-email-cell">{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.city}</td>
                      <td>{c.orderCount}</td>
                      <td className="order-total-cell">{formatMoneyWhole(c.totalSpent)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button type="button" className="order-view-btn" onClick={() => handleViewCustomer(c)}>
                            View Orders
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(c._id, c.name)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                            title="Delete Customer"
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

            {pagination.pages > 1 && (
              <div className="pager customers-pager">
                {Array.from({ length: pagination.pages }).map((_, idx) => {
                  const n = idx + 1;
                  return (
                    <button
                      type="button"
                      key={n}
                      className={n === page ? "page-chip active" : "page-chip"}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="page-chip"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                >
                  →
                </button>
              </div>
            )}
          </div>
      </div>

      {/* Customer Orders Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-[#f4f8ec] p-5 border-b border-[#d3e1b7]">
              <div>
                <h3 className="m-0 text-lg md:text-xl font-bold text-[#52720d]">{selectedCustomer.name}'s Orders</h3>
                <p className="m-0 mt-1 text-xs md:text-sm text-[#6b9312] font-medium">
                  {selectedCustomer.email} • {selectedCustomer.phone}
                </p>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className="border-none bg-[#e1ecd0] cursor-pointer text-sm w-8 h-8 rounded-full flex items-center justify-center text-[#52720d] hover:bg-[#d3e1b7] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-gray-50">
              {loadingOrders ? null : customerOrders.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-xl text-gray-500 shadow-sm border border-gray-100">
                  No orders found for this customer.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {customerOrders.map((o) => (
                    <div key={o._id || o.orderId} className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                        <div>
                          <div className="font-bold text-gray-900">Order #{o.orderId}</div>
                          <div className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">
                            {new Date(o.orderDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <div className="font-bold text-emerald-600 text-lg">{formatMoneyWhole(o.total)}</div>
                          <div className="text-xs text-gray-500 mt-1 capitalize font-medium">
                            {o.status} • {o.paymentMethod || o.payment}
                          </div>
                        </div>
                      </div>
                      
                      {o.lineItems && o.lineItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Items Purchased</div>
                          <div className="flex flex-col gap-3">
                            {o.lineItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 md:gap-4">
                                <div 
                                  className="w-12 h-12 rounded-lg bg-gray-100 bg-cover bg-center shrink-0 border border-gray-100"
                                  style={{ backgroundImage: `url(${getCategoryImg(item.category)})` }}
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">Qty: {item.quantity} x {formatMoney(item.price)}</div>
                                </div>
                                <div className="font-bold text-gray-900 text-sm">
                                  {formatMoney((item.price || 0) * (item.quantity || 1))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCustomersPanel;
