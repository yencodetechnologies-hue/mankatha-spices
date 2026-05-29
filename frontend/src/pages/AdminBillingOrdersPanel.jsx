import React, { useState, useEffect, useCallback } from "react";
import { Search, Printer, RefreshCw, ShoppingCart, Eye } from "lucide-react";
import { orderApi } from "../api/orderApi";
import { formatMoney } from "../utils/formatMoney";
import MankathaBanner from "../components/Brand/MankathaBanner";

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

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const AdminBillingOrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [billerFilter, setBillerFilter] = useState("All Billers");
  const [printOrder, setPrintOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await orderApi.getOrders({ period: "all" });
      const billerOrders = (res.orders || []).filter(o => o.billerId || o.billerName || o.isPOS);
      setOrders(billerOrders);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load billing orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Safety timeout: stop loading after 8s even if API hangs
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const uniqueBillers = Array.from(new Set(orders.map(o => o.billerName).filter(Boolean))).sort();

  const filtered = orders.filter((o) => {
    const matchesSearch = !search ||
      (o.orderId || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchesBiller = billerFilter === "All Billers" || o.billerName === billerFilter;
    return matchesSearch && matchesBiller;
  }).sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));

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
            <h2 className="text-xl font-bold text-[#3d2f26]">Billing Lists</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} total bill{filtered.length !== 1 ? "s" : ""}
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
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white w-full sm:max-w-xs shadow-sm">
          <select 
            className="flex-1 text-sm bg-transparent outline-none"
            value={billerFilter} 
            onChange={(e) => setBillerFilter(e.target.value)}
          >
            <option value="All Billers">All Billers</option>
            {uniqueBillers.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#ede6dc] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-left text-gray-600">
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
                {loading ? null : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300" />
                     
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3 font-mono font-bold text-[#b45309] whitespace-nowrap">
                        #{o.orderId}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {o.customerName || "Walk-in Customer"}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {o.itemCount || (o.lineItems?.length ?? "—")} item{o.itemCount !== 1 ? "s" : ""}
                      </td>
                      <td className="px-5 py-3 font-bold text-[#6b9312] whitespace-nowrap">
                        {formatMoney(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center w-max text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#dcfce7] text-[#166534]">
                          Paid
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {fmtDate(o.orderDate || o.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewOrder(o)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition"
                          >
                            <Eye size={12} />
                            View
                          </button>
                          <button
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
            <p className="text-sm text-gray-700 font-medium">No 11, Modern Market, Valvettithurai</p>
            <p className="text-sm text-gray-700 font-medium">Jaffna, SriLanka</p>
            <p className="text-sm text-gray-700 font-medium mt-1 font-mono">Ph: 009 4771164071</p>
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

          <div className="mb-4">
            <h3 className="font-bold text-[#91521f] text-sm uppercase tracking-wider mb-2 border-b border-[#91521f] pb-1">Order Items</h3>
            <div className="space-y-3">
              {printOrder.lineItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white shadow-sm">
                  <div>
                    <div className="font-bold text-[#3d2f26] text-sm">{item.name}</div>
                    <div className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-lg text-[#3d2f26]">
                    {formatMoney((item.price || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

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

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-[#f4f8ec] p-5 border-b border-[#d3e1b7]">
              <div>
                <h3 className="m-0 text-lg md:text-xl font-bold text-[#52720d]">Order #{viewOrder.orderId} Details</h3>
                <p className="m-0 mt-1 text-xs md:text-sm color-[#6b9312] font-medium">{fmtDate(viewOrder.orderDate || viewOrder.createdAt)}</p>
              </div>
              <button 
                onClick={() => setViewOrder(null)} 
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
                  <div className="font-medium text-gray-900 mt-1">{viewOrder.customerName || "Walk-in Customer"}</div>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Order Status</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                      {viewOrder.status || "Completed"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Payment Status</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 capitalize">
                      {viewOrder.payment || "Paid"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Payment Method</span>
                  <div className="font-medium text-gray-900 mt-1">{viewOrder.paymentMethod || "Cash"}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-4">
                <h4 className="m-0 mb-3 text-sm font-bold text-gray-700">Purchased Items</h4>
                {viewOrder.lineItems && viewOrder.lineItems.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {viewOrder.lineItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg bg-gray-100 bg-cover bg-center shrink-0" 
                            style={{ backgroundImage: `url(${getCategoryImg(item.category || item.name)})` }}
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
                  <div className="text-gray-500 text-sm italic">No items found.</div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-5 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Amount</span>
                <span className="text-2xl font-black text-[#6b9312]">
                  {formatMoney(viewOrder.total || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminBillingOrdersPanel;
