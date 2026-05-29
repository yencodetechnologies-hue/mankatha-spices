import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Receipt,
  Printer,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Eye,
  X
} from "lucide-react";
import { orderApi } from "../../api/orderApi";
import { formatMoney } from "../../utils/formatMoney";
import MankathaBanner from "../../components/Brand/MankathaBanner";

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


/* ─── main component ───────────────────────────────────────── */
const BillerDashboardPanel = () => {
  const { user } = useAuth();

  const [stats, setStats]     = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [printOrder, setPrintOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const handlePrint = (order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, ordersRes] = await Promise.all([
        orderApi.getStats(), // Ideally getBillerStats, but keeping for now
        orderApi.getBillerOrders({ limit: 20 }),
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
    <>
    <div className={`space-y-8 ${printOrder ? 'print:hidden' : ''}`}>

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
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? null : filtered.length === 0 ? (
                <tr>
               
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
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#dcfce7] text-[#166534]">
                        Paid
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {fmtTime(o.orderDate || o.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewOrder(o)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(o)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition"
                        >
                          <Printer size={12} />
                          Print
                        </button>
                      </div>
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
    
    {printOrder && (
      <div
        className="hidden print:block w-full max-w-md mx-auto bg-white p-4"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        <div className="text-center mb-4 border-b border-[#91521f] pb-4">
          <MankathaBanner variant="strip" className="mb-2 !border-0 !shadow-none !bg-transparent" />
          <h1 className="text-xl font-bold tracking-wider mb-1 text-[#91521f] font-serif uppercase">Mankatha Spices</h1>
          <p className="text-sm text-gray-700 font-medium">No 11, Modern Market, Valvettithurai</p>
          <p className="text-sm text-gray-700 font-medium">Jaffna, SriLanka</p>
          <p className="text-sm text-gray-700 font-medium mt-1 font-mono">Ph: 009 4771164071</p>
        </div>

        <div className="mb-4 bg-[#fdfaf6] p-3 rounded-lg border border-[#f2d4bb]">
          <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
            <span className="font-semibold text-gray-500">Date:</span>
            <span className="font-bold">{new Date(printOrder.orderDate || printOrder.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
            <span className="font-semibold text-gray-500">Time:</span>
            <span className="font-bold">{new Date(printOrder.orderDate || printOrder.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
            <span className="font-semibold text-gray-500">Order ID:</span>
            <span className="font-mono font-bold text-[#b45309]">{printOrder.orderId}</span>
          </div>
          <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
            <span className="font-semibold text-gray-500">Payment:</span>
            <span className="font-bold text-[#6b9312]">{printOrder.paymentMethod || "Cash"}</span>
          </div>
          <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
            <span className="font-semibold text-gray-500">Cashier:</span>
            <span className="font-bold">Biller Desk</span>
          </div>
          {printOrder.customerName && printOrder.customerName !== "Walk-in Customer" && (
            <div className="flex justify-between mt-2 pt-2 border-t border-[#f2d4bb] text-sm text-[#3d2f26]">
              <span className="font-semibold text-gray-500">Customer:</span>
              <span className="font-bold text-[#6b9312]">{printOrder.customerName}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[#91521f] text-[#91521f]">
                <th className="font-bold pb-1 w-1/2 uppercase tracking-wide text-xs">Item</th>
                <th className="font-bold pb-1 text-center w-1/6 uppercase tracking-wide text-xs">Qty</th>
                <th className="font-bold pb-1 text-right w-1/3 uppercase tracking-wide text-xs">Price</th>
              </tr>
            </thead>
            <tbody className="text-[#3d2f26]">
              {printOrder.lineItems?.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-2 font-medium">{item.name}</td>
                  <td className="py-2 text-center bg-gray-50/50 font-bold">{item.quantity}</td>
                  <td className="py-2 text-right font-bold">{formatMoney((item.price || 0) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center font-bold text-lg border-t border-[#91521f] pt-3 mb-4 text-[#91521f]">
          <span className="uppercase tracking-wide">Total Amount:</span>
          <span className="text-xl">{formatMoney(printOrder.total)}</span>
        </div>

        <div className="text-center text-sm text-gray-600 bg-gray-50 py-3 rounded-lg border border-gray-100">
          <p className="font-semibold text-[#6b9312] mb-1">Thank you for shopping with us!</p>
          <p className="italic text-xs">Pure spices, rich flavour, trusted quality.</p>
          <p className="mt-1 text-[10px] font-mono text-gray-400 uppercase">Visit again</p>
        </div>
        </div>

    )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">Order #{viewOrder.orderId}</h3>
              <button onClick={() => setViewOrder(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-800">{viewOrder.customerName || "Walk-in Customer"}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date & Time</p>
                  <p className="font-medium text-gray-800">{new Date(viewOrder.orderDate || viewOrder.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Payment</p>
                  <p className="font-medium text-green-600">{viewOrder.paymentMethod || "Cash"}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <p className="font-medium text-blue-600 capitalize">{viewOrder.status || "Completed"}</p>
                </div>
              </div>

              <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">Order Items</h4>
              <div className="space-y-3 mb-6">
                {viewOrder.lineItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800">{formatMoney((item.price || 0) * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-600">Total Amount</span>
                <span className="text-xl font-bold text-primary-600">{formatMoney(viewOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BillerDashboardPanel;
