import React, { useState, useEffect, useCallback } from "react";
import { Search, Printer, RefreshCw, ShoppingCart, Loader2 } from "lucide-react";
import { orderApi } from "../../api/orderApi";
import { formatMoney } from "../../utils/formatMoney";
import MankathaBanner from "../../components/Brand/MankathaBanner";

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};



const BillerOrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [printOrder, setPrintOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await orderApi.getBillerOrders({ limit: 200 });
      setOrders(res.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load billing orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(
    (o) =>
      !search ||
      (o.orderId || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = (order) => {
    setPrintOrder(order);
    setTimeout(() => { window.print(); }, 100);
  };



  return (
    <>
      <div className={`space-y-6 ${printOrder ? "print:hidden" : ""}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#3d2f26]">My Billing Lists</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {orders.length} total bill{orders.length !== 1 ? "s" : ""} placed by you
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white w-full sm:max-w-sm shadow-sm">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
            placeholder="Search order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#ede6dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Loading billing orders...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                     
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3 font-mono font-bold text-[#b45309]">
                        #{o.orderId}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {o.customerName || "Walk-in Customer"}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {o.itemCount || (o.lineItems?.length ?? "—")} item{o.itemCount !== 1 ? "s" : ""}
                      </td>
                      <td className="px-5 py-3 font-bold text-[#6b9312]">
                        {formatMoney(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#dcfce7] text-[#166534]">
                          Paid
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {fmtDate(o.orderDate || o.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handlePrint(o)}
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
        </div>
      </div>

      {/* Print Receipt */}
      {printOrder && (
        <div
          className="hidden print:block w-full max-w-md mx-auto bg-white p-4"
          style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          <div className="text-center mb-4 border-b border-[#91521f] pb-4">
            <MankathaBanner variant="strip" className="mb-2 !border-0 !shadow-none !bg-transparent" />
            <h1 className="text-xl font-bold tracking-wider mb-1 text-[#91521f] font-serif uppercase">
              Mankatha Spices
            </h1>
            <p className="text-sm text-gray-700 font-medium">123 Spice Market, Bazaar Road</p>
            <p className="text-sm text-gray-700 font-medium">Chennai - 600001</p>
            <p className="text-sm text-gray-700 font-medium mt-1 font-mono">Ph: +91 98765 43210</p>
          </div>

          <div className="mb-4 bg-[#fdfaf6] p-3 rounded-lg border border-[#f2d4bb]">
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-500 font-semibold">Date:</span>
              <span className="font-bold">{new Date(printOrder.orderDate || printOrder.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-500 font-semibold">Time:</span>
              <span className="font-bold">{new Date(printOrder.orderDate || printOrder.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-500 font-semibold">Order ID:</span>
              <span className="font-mono font-bold text-[#b45309]">{printOrder.orderId}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-500 font-semibold">Payment:</span>
              <span className="font-bold text-[#6b9312]">{printOrder.paymentMethod || "Cash"}</span>
            </div>
            {printOrder.customerName && printOrder.customerName !== "Walk-in Customer" && (
              <div className="flex justify-between mt-2 pt-2 border-t border-[#f2d4bb] text-sm">
                <span className="text-gray-500 font-semibold">Customer:</span>
                <span className="font-bold text-[#6b9312]">{printOrder.customerName}</span>
              </div>
            )}
          </div>

          <table className="w-full text-sm mb-4">
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
                  <td className="py-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-2 text-right font-bold">{formatMoney((item.price || 0) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center font-bold text-lg border-t border-[#91521f] pt-3 mb-4 text-[#91521f]">
            <span className="uppercase tracking-wide">Total Amount:</span>
            <span className="text-xl">{formatMoney(printOrder.total)}</span>
          </div>

          <div className="text-center text-sm text-gray-600 bg-gray-50 py-3 rounded-lg border border-gray-100">
            <p className="font-semibold text-[#6b9312] mb-1">Thank you for shopping with us!</p>
            <p className="italic text-xs">Pure spices, rich flavour, trusted quality.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default BillerOrdersPanel;
