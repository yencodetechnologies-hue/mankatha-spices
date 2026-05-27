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
  <section className="mt-8">
    <div className="flex justify-between items-center mb-6">
      <div className="h-6 bg-gray-200 rounded w-40" />
      <div className="h-10 bg-gray-200 rounded w-24" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse bg-white border border-[#ede6dc] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between mb-4">
             <div className="h-5 bg-gray-200 rounded w-20" />
             <div className="h-6 bg-gray-200 rounded-full w-24" />
          </div>
          <div className="flex gap-3 items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between">
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-16 mt-2" />
          </div>
        </div>
      ))}
    </div>
  </section>
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

          <section className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Recent Orders</h3>
              <Link to="/adminpanel/orders" className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                View All →
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="bg-white border border-[#ede6dc] rounded-2xl p-8 text-center text-gray-500 shadow-sm">
                No recent orders found.
              </div>
            ) : (
              <div className="bg-white border border-[#ede6dc] rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {recentOrders.map((o) => (
                    <div key={o.orderId} className="p-4 sm:p-5 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                      {/* Customer Info & Order ID */}
                      <div className="flex items-center gap-3 w-full md:w-[25%] shrink-0">
                        <span
                          className="flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-xs shadow-sm flex-shrink-0"
                          style={{ background: `hsl(${hueFromName(o.customerName)} 55% 42%)` }}
                        >
                          {initialsFromName(o.customerName)}
                        </span>
                        <div>
                           <p className="font-semibold text-gray-900 text-sm truncate">{o.customerName}</p>
                           <p className="text-xs text-gray-500 font-medium">#{o.orderId}</p>
                        </div>
                      </div>
                      
                      {/* Products Summary */}
                      <div className="text-sm text-gray-500 line-clamp-1 flex-grow hidden lg:block">
                        {o.productsLabel}
                      </div>

                      {/* Status, Amount, Date */}
                      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-8 shrink-0">
                         <div className={statusPill(o.status) + " !py-1 !px-2"}>
                           <span className={statusDot(o.status)} />
                           {o.status}
                         </div>
                         
                         <div className="text-right">
                           <p className="font-bold text-gray-900">{formatMoneyWhole(o.amount)}</p>
                           <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{recentDateShort(o.orderDate)}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminOverviewPanel;
