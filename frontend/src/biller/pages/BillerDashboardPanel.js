import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Receipt,
  ShoppingCart,
  Printer,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { orderApi } from "../../api/orderApi";
import { formatMoney } from "../../utils/formatMoney";

/* ─── helpers ──────────────────────────────────────────────── */
const fmtTime = (iso) => {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} min ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));
};

/* ─── stat card ────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color, loading }) => (
  <div
    className="rounded-2xl border border-[#ede6dc] bg-white p-5 shadow-sm flex items-start gap-4 transition hover:shadow-md"
    style={{ borderLeft: `4px solid ${color}` }}
  >
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{ background: `${color}18` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      {loading ? (
        <div className="mt-1 h-7 w-20 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="mt-0.5 text-2xl font-bold text-[#3d2f26]">{value}</p>
      )}
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

/* ─── status badge ─────────────────────────────────────────── */
const statusBadge = (s) => {
  const map = {
    Delivered: "bg-green-50 text-green-700 border-green-200",
    Paid:      "bg-green-50 text-green-700 border-green-200",
    Processing:"bg-blue-50  text-blue-700  border-blue-200",
    Pending:   "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-red-50   text-red-700   border-red-200",
  };
  return `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[s] ?? "bg-gray-50 text-gray-600 border-gray-200"}`;
};

/* ─── quick-action card ────────────────────────────────────── */
const ActionCard = ({ icon: Icon, title, desc, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-[#ede6dc] bg-[#fffefb] p-5 transition hover:border-primary-300 hover:shadow-md group"
  >
    <div
      className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
      style={{ background: `${color}18` }}
    >
      <Icon size={20} style={{ color }} className="transition group-hover:scale-110" />
    </div>
    <h3 className="font-semibold text-[#3d2f26]">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{desc}</p>
  </button>
);

/* ─── main component ───────────────────────────────────────── */
const BillerDashboardPanel = () => {
  const { user } = useAuth();

  const [stats, setStats]     = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, ordersRes] = await Promise.all([
        orderApi.getStats(),
        orderApi.getOrders({ limit: 20 }),
      ]);
      setStats(statsRes);
      setOrders(ordersRes.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── today's revenue: sum orders created today ── */
  const todayRevenue = React.useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return orders
      .filter((o) => new Date(o.orderDate || o.createdAt) >= start)
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  /* ── today's bill count ── */
  const todayCount = React.useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return orders.filter((o) => new Date(o.orderDate || o.createdAt) >= start).length;
  }, [orders]);

  /* ── filtered table ── */
  const filtered = orders.filter(
    (o) =>
      !search ||
      (o.orderId || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* ── Welcome banner ── */}
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-[#fffdf6] to-[#f0f7e6] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#3d2f26]">
            Welcome back, {user?.name || "Biller"} 👋
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Today's billing activity is shown below. Create, print or manage invoices from here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 py-2 shadow-sm">
            <Clock size={16} className="text-primary-500" />
            <span className="text-sm font-medium text-[#3d2f26]">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm hover:border-primary-400 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold hover:bg-red-50 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Today's Revenue"
          value={formatMoney(todayRevenue)}
          sub={`${todayCount} bill${todayCount !== 1 ? "s" : ""} today`}
          color="#8dbe20"
          loading={loading}
        />
        <StatCard
          icon={Receipt}
          label="Total Orders"
          value={(stats?.totalOrders ?? 0).toLocaleString("en-IN")}
          sub="All time"
          color="#f59e0b"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={(stats?.delivered ?? 0).toLocaleString("en-IN")}
          sub="Successfully fulfilled"
          color="#10b981"
          loading={loading}
        />
        <StatCard
          icon={AlertCircle}
          label="Pending"
          value={(stats?.pendingAction ?? 0).toLocaleString("en-IN")}
          sub="Needs attention"
          color="#ef4444"
          loading={loading}
        />
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            icon={FileText}
            title="New Bill"
            desc="Create a fresh invoice for walk-in or online orders."
            color="#8dbe20"
            onClick={() => window.location.href = "/biller/new-bill"}
          />
          <ActionCard
            icon={ShoppingCart}
            title="View Orders"
            desc="Browse all pending and completed customer orders."
            color="#f59e0b"
            onClick={() => alert("Orders — coming soon")}
          />
          <ActionCard
            icon={Printer}
            title="Print Bill"
            desc="Re-print any invoice directly from the print queue."
            color="#6366f1"
            onClick={() => window.print()}
          />
          <ActionCard
            icon={TrendingUp}
            title="Daily Report"
            desc="View collection summary for the current business day."
            color="#10b981"
            onClick={() => alert("Report — coming soon")}
          />
        </div>
      </div>

      {/* ── Recent orders table ── */}
      <div className="rounded-2xl border border-[#ede6dc] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-[#ede6dc]">
          <h3 className="font-semibold text-[#3d2f26]">Recent Orders</h3>
          <input
            type="search"
            placeholder="Search order ID or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-3 rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-gray-400">
                    {search
                      ? "No orders match your search."
                      : "No orders found. Once customers place orders they'll appear here."}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o._id || o.orderId} className="hover:bg-primary-50/30 transition-colors">
                    <td className="px-5 py-3 font-mono font-semibold text-primary-700">
                      #{o.orderId}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{o.customerName}</td>
                    <td className="px-5 py-3 text-gray-500">{o.itemCount}</td>
                    <td className="px-5 py-3 font-semibold text-[#3d2f26]">
                      {formatMoney(o.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={statusBadge(o.status)}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={statusBadge(o.payment)}>{o.payment}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {fmtTime(o.orderDate || o.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition"
                      >
                        <Printer size={12} />
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#ede6dc] text-xs text-gray-400 flex items-center gap-1">
            <Loader2 size={12} className="text-primary-400" />
            Showing {filtered.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  );
};

export default BillerDashboardPanel;
