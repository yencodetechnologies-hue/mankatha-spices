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

      {errorMessage && (
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

        <div className="customers-table-inner">
            <table className="customers-table">
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
                      No customers found. Run <code>npm run seed:customers</code> in the <code>backend</code> folder.
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
                        <button type="button" className="order-view-btn" onClick={() => handleViewCustomer(c)}>
                          View Orders
                        </button>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedCustomer(null)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '600px', maxWidth: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f8ec', margin: '-24px -24px 20px -24px', padding: '24px', borderBottom: '1px solid #d3e1b7', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#52720d' }}>{selectedCustomer.name}'s Orders</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b9312', fontWeight: '500' }}>
                  {selectedCustomer.email} • {selectedCustomer.phone}
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: '#e1ecd0', cursor: 'pointer', fontSize: '14px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52720d' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingOrders ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading orders...</div>
              ) : customerOrders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {customerOrders.map((o) => (
                    <div key={o._id || o.orderId} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#111827' }}>Order #{o.orderId}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {new Date(o.orderDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#6b9312', fontSize: '16px' }}>{formatMoneyWhole(o.total)}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', textTransform: 'capitalize' }}>
                            {o.status} • {o.paymentMethod || o.payment}
                          </div>
                        </div>
                      </div>
                      
                      {o.lineItems && o.lineItems.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Items Purchased</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {o.lineItems.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: idx !== o.lineItems.length - 1 ? '1px solid #f3f4f6' : 'none', paddingBottom: idx !== o.lineItems.length - 1 ? '12px' : 0 }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundImage: `url(${getCategoryImg(item.category)})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, backgroundColor: '#f3f4f6' }}></div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>{item.name}</div>
                                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Qty: {item.quantity} x {formatMoney(item.price)}</div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>
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
