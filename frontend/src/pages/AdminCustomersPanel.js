import React, { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { customerApi } from "../api/customerApi";
import { formatMoneyWhole } from "../utils/formatMoney";

const PAGE_SIZE = 8;

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

const tierClass = (tier) => {
  if (tier === "VIP") return "tier-pill tier-vip";
  if (tier === "Gold") return "tier-pill tier-gold";
  if (tier === "New") return "tier-pill tier-new";
  return "tier-pill tier-regular";
};

const AdminCustomersPanel = () => {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [page, setPage] = useState(1);

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
        tier: tierFilter,
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
  }, [search, tierFilter, cityFilter, page]);

  useEffect(() => {
    loadStats().catch(() => setStats(null));
  }, [loadStats]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    setPage(1);
  }, [search, tierFilter, cityFilter]);

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
          <button type="button" className="customers-btn-outline" onClick={() => window.alert("Connect your email provider to send campaigns.")}>
            Email Campaign
          </button>
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
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} aria-label="Tier">
              <option value="All">All Customers</option>
              <option value="VIP">VIP</option>
              <option value="Gold">Gold</option>
              <option value="Regular">Regular</option>
              <option value="New">New</option>
            </select>
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
                  <th>City</th>
                  <th>Orders</th>
                  <th>Spent</th>
                  <th>Tier</th>
                  <th>Joined</th>
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
                      <td>{c.city}</td>
                      <td>{c.orderCount}</td>
                      <td className="order-total-cell">{formatMoneyWhole(c.totalSpent)}</td>
                      <td>
                        <span className={tierClass(c.tier)}>{c.tier}</span>
                      </td>
                      <td>{fmtJoined(c.joinedAt)}</td>
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
    </>
  );
};

export default AdminCustomersPanel;
