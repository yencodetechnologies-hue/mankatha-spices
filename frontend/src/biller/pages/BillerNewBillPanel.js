import React, { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, IndianRupee, Printer, CheckCircle, Trash2 } from "lucide-react";
import { productApi } from "../../api/productApi";
import { orderApi } from "../../api/orderApi";
import { formatMoneyWhole } from "../../utils/formatMoney";
import { getBackendOrigin } from "../../api/adminApiBase";
import MankathaLoader from "../../components/Brand/MankathaLoader";
import MankathaBanner from "../../components/Brand/MankathaBanner";

import heroBlendedMasala from "../../assets/hero_blended_masala.png";
import heroOrganicSpices from "../../assets/hero_organic_spices.png";
import heroWholeSpices from "../../assets/hero_whole_spices.png";

const slugify = (input) => {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

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

const BillerNewBillPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    productApi
      .getProducts()
      .then((res) => {
        setProducts(res.products || res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getProductPrice = (p) => {
    if (typeof p.price === 'number') return p.price;
    if (p.pricing && p.pricing.length > 0) {
      // Try to find LKR/Sri Lanka pricing, else default to first
      const targetPricing = p.pricing.find(pr => pr.currency === "LKR") || p.pricing[0];
      if (targetPricing && targetPricing.weights && targetPricing.weights.length > 0) {
        return targetPricing.weights[0].price;
      }
    }
    return 0;
  };

  const addToCart = (product) => {
    const price = getProductPrice(product);
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, price, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === id) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    
    try {
      const lineItems = cart.map(item => ({
        name: item.name,
        quantity: item.qty,
        category: item.category,
        price: item.price
      }));
      
      const newOrder = await orderApi.createOrder({
        customerName: customerName.trim() || "Walk-in Customer",
        total: total,
        payment: "Paid",
        paymentMethod: paymentMethod,
        status: "Delivered",
        lineItems: lineItems,
        itemCount: lineItems.reduce((acc, item) => acc + item.quantity, 0)
      });
      
      setSuccess(newOrder);
      setCart([]);
      setCustomerName("");
      setShowCheckout(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to generate bill.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#ede6dc] shadow-sm">
        <div className="print:hidden flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#3d2f26] mb-2">Bill Generated Successfully</h2>
          <p className="text-gray-500 mb-6">Order ID: <span className="font-mono font-bold text-primary-700">{success.orderId}</span></p>
          
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
            >
              <Printer size={18} />
              Print Receipt
            </button>
            <button 
              type="button"
              onClick={() => setSuccess(null)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition"
            >
              <Plus size={18} />
              New Bill
            </button>
          </div>
        </div>

        {/* Printable Receipt Area */}
        <div 
          className="hidden print:block w-full max-w-md mx-auto bg-white p-4"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <div className="text-center mb-4 border-b border-[#91521f] pb-4">
            <MankathaBanner variant="strip" className="mb-2 !border-0 !shadow-none !bg-transparent" />
            <h1 className="text-xl font-bold tracking-wider mb-1 text-[#91521f] font-serif uppercase">Mankatha Spices</h1>
            <p className="text-sm text-gray-700 font-medium">123 Spice Market, Bazaar Road</p>
            <p className="text-sm text-gray-700 font-medium">Chennai - 600001</p>
            <p className="text-sm text-gray-700 font-medium mt-1 font-mono">Ph: +91 98765 43210</p>
          </div>
          
          <div className="mb-4 bg-[#fdfaf6] p-3 rounded-lg border border-[#f2d4bb]">
            <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
              <span className="font-semibold text-gray-500">Date:</span>
              <span className="font-bold">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
              <span className="font-semibold text-gray-500">Time:</span>
              <span className="font-bold">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
              <span className="font-semibold text-gray-500">Order ID:</span>
              <span className="font-mono font-bold text-[#b45309]">{success.orderId}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
              <span className="font-semibold text-gray-500">Payment:</span>
              <span className="font-bold text-[#6b9312]">{success.paymentMethod || "Cash"}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm text-[#3d2f26]">
              <span className="font-semibold text-gray-500">Cashier:</span>
              <span className="font-bold">Biller Desk</span>
            </div>
            {success.customerName && success.customerName !== "Walk-in Customer" && (
              <div className="flex justify-between mt-2 pt-2 border-t border-[#f2d4bb] text-sm text-[#3d2f26]">
                <span className="font-semibold text-gray-500">Customer:</span>
                <span className="font-bold text-[#6b9312]">{success.customerName}</span>
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
                {success.lineItems?.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-2 font-medium">{item.name}</td>
                    <td className="py-2 text-center bg-gray-50/50 font-bold">{item.quantity}</td>
                    <td className="py-2 text-right font-bold">{formatMoneyWhole((item.price || 0) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center font-bold text-lg border-t border-[#91521f] pt-3 mb-4 text-[#91521f]">
            <span className="uppercase tracking-wide">Total Amount:</span>
            <span className="text-xl">{formatMoneyWhole(success.total)}</span>
          </div>

          <div className="text-center text-sm text-gray-600 bg-gray-50 py-3 rounded-lg border border-gray-100">
            <p className="font-semibold text-[#6b9312] mb-1">Thank you for shopping with us!</p>
            <p className="italic text-xs">Pure spices, rich flavour, trusted quality.</p>
            <p className="mt-1 text-[10px] font-mono text-gray-400 uppercase">Visit again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* ── Products List ── */}
      <div className="lg:col-span-2 flex flex-col bg-white border border-[#ede6dc] rounded-2xl shadow-sm overflow-hidden h-full">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ede6dc] overflow-x-auto bg-white custom-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === c
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-[#ede6dc] bg-gray-50/50 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {/* Hide select on larger screens since we have pills, show on mobile if pills are too small, actually just keep it */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/20">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <MankathaLoader />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                const imgUrl = p.images?.[0] ? `${getBackendOrigin()}${p.images[0]}` : null;
                return (
                  <button
                    key={p._id}
                    onClick={() => addToCart(p)}
                    className="flex flex-col items-center text-center p-4 bg-white border border-[#ede6dc] rounded-xl hover:border-primary-400 hover:shadow-md transition group"
                  >
                    <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <img src={getCategoryImg(p.category)} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#3d2f26] mb-1 line-clamp-2 leading-tight">
                      {p.name}
                    </h4>
                    <p className="text-primary-600 font-bold mt-auto">
                      {formatMoneyWhole(getProductPrice(p))}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Cart / Bill ── */}
      <div className="flex flex-col bg-white border border-[#ede6dc] rounded-2xl shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b border-[#ede6dc] bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-[#3d2f26] flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary-600" />
            Current Bill
          </h3>
          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-bold rounded-md">
            {cart.reduce((sum, item) => sum + item.qty, 0)} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <ShoppingCart size={40} className="text-gray-300" />
              <p className="text-sm">Cart is empty. Add products to bill.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#3d2f26] truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{formatMoneyWhole(item.price)} each</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQty(item._id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item._id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className="text-sm font-bold text-[#3d2f26]">{formatMoneyWhole(item.price * item.qty)}</span>
                    <button onClick={() => removeFromCart(item._id)} className="text-xs text-red-500 hover:text-red-700">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-[#ede6dc]">
          <form onSubmit={handleCheckoutClick} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-lg font-bold text-[#3d2f26] mb-4">
                <span>Total Amount:</span>
                <span className="flex items-center text-primary-700">
                  {formatMoneyWhole(total)}
                </span>
              </div>
              
              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold shadow-md hover:from-primary-600 hover:to-primary-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                Proceed to Pay
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Checkout Modal ── */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#3d2f26]">Confirm Payment</h2>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-primary-50 rounded-xl p-4 text-center border border-primary-100">
                <p className="text-sm text-primary-700 font-semibold mb-1 uppercase tracking-wider">Total Amount to Pay</p>
                <div className="text-4xl font-bold text-primary-800 flex items-center justify-center">
                  {formatMoneyWhole(total)}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#3d2f26] font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Cash", "Card", "Bank Transfer", "UPI"].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                        paymentMethod === method 
                          ? "bg-primary-600 border-primary-600 text-white shadow-md" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {submitting ? "Processing..." : `Confirm ${formatMoneyWhole(total)} Payment`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillerNewBillPanel;
