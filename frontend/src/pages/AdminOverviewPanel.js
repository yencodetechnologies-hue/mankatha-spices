import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Wallet, Package, Users, ArrowUpRight } from "lucide-react";
import { overviewApi } from "../api/overviewApi";
import { formatMoneyWhole } from "../utils/formatMoney";

const fmtDay = (d) =>
  new Intl.DateTimeFormat("en-LK", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    d instanceof Date ? d : new Date(d)
  );

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

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const DONUT_COLORS = ["#EAB308", "#EA580C", "#16A34A", "#2563EB", "#9333EA", "#78716C"];

const statusPill = (status) => {
  if (status === "Delivered") return "order-pill status-delivered";
  if (status === "Processing") return "order-pill status-processing";
  if (status === "Cancelled") return "order-pill status-cancelled";
  return "order-pill status-pending";
};

const statusDot = (status) => {
  if (status === "Delivered") return "order-status-dot dot-green";
  if (status === "Processing") return "order-status-dot dot-blue";
  if (status === "Cancelled") return "order-status-dot dot-red";
  return "order-status-dot dot-amber";
};

const SkeletonCard = () => (
  <div className="overview-kpi-card animate-pulse bg-white border border-[#ede6dc]">
    <div className="h-10 w-10 rounded-lg bg-gray-200 mb-4" />
    <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
    <div className="h-7 bg-gray-200 rounded w-28 mb-3" />
    <div className="h-3 bg-gray-200 rounded w-24" />
  </div>
);

const SkeletonChart = () => (
  <div className="overview-chart-card animate-pulse bg-white border border-[#ede6dc] p-6">
    <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-3 bg-gray-200 rounded w-12" />
          <div className="h-3.5 bg-gray-100 rounded flex-1" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonRecentOrders = () => (
  <div className="overview-recent-card animate-pulse bg-white border border-[#ede6dc] p-6">
    <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
          <div className="flex gap-4 items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-2.5 bg-gray-150 rounded w-32" />
            </div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  </div>
);

const AdminOverviewPanel = () => {
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem("admin_overview_data");
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(!data);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setErrorMessage("");
      const res = await overviewApi.getOverview();
      setData(res);
      try {
        localStorage.setItem("admin_overview_data", JSON.stringify(res));
      } catch (_) {}
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.message;
      let msg = detail || error.message || "Failed to load overview.";
      if (status === 404) {
        msg =
          "Overview API endpoint was not found (404). Please verify that the backend server is running and configured correctly.";
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const exportReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overview-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = data?.kpis;
  const revenueByMonth = data?.revenueByMonth || [];
  const salesByCategory = data?.salesByCategory || [];
  const donutCenter = data?.donutCenter || { percent: 0, label: "—" };
  const recentOrders = data?.recentOrders || [];

  const maxRev = Math.max(...revenueByMonth.map((m) => m.revenue), 1);

  let donutGradient = "#e7e5e4";
  if (salesByCategory.length > 0) {
    let deg = 0;
    const parts = salesByCategory.slice(0, 6).map((seg, i) => {
      const span = (seg.percent / 100) * 360;
      const start = deg;
      deg += span;
      const col = DONUT_COLORS[i % DONUT_COLORS.length];
      return `${col} ${start.toFixed(2)}deg ${deg.toFixed(2)}deg`;
    });
    donutGradient = `conic-gradient(${parts.join(", ")})`;
  }

  const recentDateShort = (iso) =>
    new Intl.DateTimeFormat("en-LK", { month: "short", day: "numeric" }).format(new Date(iso));

  return (
    <div className="admin-overview">
      <header className="overview-hero">
        <div>
          <h2 className="overview-greeting">
            {greeting()}, Admin <span aria-hidden>👋</span>
          </h2>
          <p className="overview-sub">
            {fmtDay(new Date())} · Here&apos;s what&apos;s happening today
          </p>
        </div>
        <div className="overview-hero-actions">
          <button type="button" className="overview-btn-outline" onClick={exportReport} disabled={!data}>
            Export Report
          </button>
          <Link to="/adminpanel/products" className="overview-btn-primary">
            + Add Product
          </Link>
        </div>
      </header>

      {loading && !data ? (
        <>
          <section className="overview-kpi-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </section>
          <section className="overview-charts-row">
            <SkeletonChart />
            <SkeletonChart />
          </section>
          <SkeletonRecentOrders />
        </>
      ) : errorMessage ? (
        <div className="overview-fail-state" role="alert">
          <p className="overview-fail-title">Couldn&apos;t load dashboard data</p>
          <p className="overview-fail-msg">{errorMessage}</p>
          <button type="button" className="overview-btn-primary overview-retry" onClick={load}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className="overview-kpi-grid">
            <div className="overview-kpi-card">
              <div className="overview-kpi-icon wallet">
                <Wallet size={22} strokeWidth={1.75} />
              </div>
              <p className="overview-kpi-label">Total Revenue</p>
              <p className="overview-kpi-value">{kpis?.totalRevenue?.display ?? "—"}</p>
              <p className="overview-kpi-trend up">
                <ArrowUpRight size={14} /> {kpis?.totalRevenue?.changePct ?? 0}% vs last month
              </p>
            </div>
            <div className="overview-kpi-card">
              <div className="overview-kpi-icon package">
                <Package size={22} strokeWidth={1.75} />
              </div>
              <p className="overview-kpi-label">Total Orders</p>
              <p className="overview-kpi-value">{(kpis?.totalOrders?.value ?? 0).toLocaleString("en-LK")}</p>
              <p className="overview-kpi-trend up">
                <ArrowUpRight size={14} /> {kpis?.totalOrders?.changePct ?? 0}% vs last month
              </p>
            </div>
            <div className="overview-kpi-card">
              <div className="overview-kpi-icon users">
                <Users size={22} strokeWidth={1.75} />
              </div>
              <p className="overview-kpi-label">Customers</p>
              <p className="overview-kpi-value">{(kpis?.customers?.value ?? 0).toLocaleString("en-LK")}</p>
              <p className="overview-kpi-trend up">
                <ArrowUpRight size={14} /> {kpis?.customers?.changePct ?? 0}% vs last month
              </p>
            </div>
          </section>

          <section className="overview-charts-row">
            <div className="overview-chart-card">
              <h3 className="overview-chart-title">Revenue — Last 7 Months</h3>
              <div className="overview-bar-list">
                {revenueByMonth.map((m) => (
                  <div key={m.key} className="overview-bar-row">
                    <span className="overview-bar-label">{m.month}</span>
                    <div className="overview-bar-track">
                      <div
                        className={`overview-bar-fill ${m.month === revenueByMonth[revenueByMonth.length - 1]?.month ? "current" : ""}`}
                        style={{ width: `${Math.max(8, (m.revenue / maxRev) * 100)}%` }}
                      />
                    </div>
                    <span className="overview-bar-value">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-chart-card">
              <h3 className="overview-chart-title">Sales by Category</h3>
              <div className="overview-donut-wrap">
                <div className="overview-donut" style={{ background: donutGradient }}>
                  <div className="overview-donut-hole">
                    <strong>{donutCenter.percent}%</strong>
                    <span>{donutCenter.label}</span>
                  </div>
                </div>
              </div>
              <ul className="overview-donut-legend">
                {salesByCategory.slice(0, 5).map((s, i) => (
                  <li key={s.category}>
                    <span className="legend-swatch" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    <span className="legend-name">{s.category}</span>
                    <span className="legend-pct">{s.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="overview-recent-card">
            <div className="overview-recent-head">
              <h3 className="overview-recent-title">Recent Orders</h3>
              <Link to="/adminpanel/orders" className="overview-view-all">
                View All →
              </Link>
            </div>
            <div className="table-wrap overview-recent-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="orders-empty-cell">
                       
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((o, idx) => (
                      <tr key={o.orderId} className={idx === 0 ? "overview-recent-highlight" : ""}>
                        <td>
                          <span className="order-id-link">#{o.orderId}</span>
                        </td>
                        <td>
                          <div className="order-customer-cell">
                            <span
                              className="order-avatar"
                              style={{ background: `hsl(${hueFromName(o.customerName)} 55% 42%)` }}
                              aria-hidden
                            >
                              {initialsFromName(o.customerName)}
                            </span>
                            {o.customerName}
                          </div>
                        </td>
                        <td className="overview-products-cell">{o.productsLabel}</td>
                        <td className="order-total-cell">{formatMoneyWhole(o.amount)}</td>
                        <td>
                          <span className={statusPill(o.status)}>
                            <span className={statusDot(o.status)} />
                            {o.status}
                          </span>
                        </td>
                        <td>{recentDateShort(o.orderDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminOverviewPanel;
