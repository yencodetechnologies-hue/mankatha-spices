import React, { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, Printer, CheckCircle, Trash2, Star, ChevronDown, X } from "lucide-react";
import { productApi } from "../../api/productApi";
import { orderApi } from "../../api/orderApi";
import { formatMoney } from "../../utils/formatMoney";
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

const makeVariantKey = (product, variantIndex) => {
  const baseId = product.slug || product._id || product.id || product.name || 'item';
  return `${baseId}||variant-${variantIndex}`;
};

const BillerProductCard = ({ product, cart, addToCart, updateQty, removeFromCart }) => {
  const hasVariants = product.pricing && product.pricing.length > 0 && product.pricing[0].weights && product.pricing[0].weights.length > 0;
  const variants = hasVariants ? product.pricing[0].weights.map(w => ({
    weight: w.weight,
    price: w.price,
    original_price: w.original_price || w.price
  })) : [{
    weight: `${product.weight || ''} ${product.unit || ''}`.trim() || '1 pc',
    price: product.price,
    original_price: product.original_price || product.price
  }];

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const currentVariant = variants[selectedVariantIndex] || variants[0];
  const currentPrice = currentVariant.price;
  const currentOriginalPrice = currentVariant.original_price;

  const discount = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;
  const imagePath = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);
  const imgUrl = imagePath ? `${getBackendOrigin()}${imagePath}` : null;
  const variantCartItemId = makeVariantKey(product, selectedVariantIndex);
  const cartItem = cart.find(i => (i.cartItemId || i._id) === variantCartItemId);
  const qty = cartItem ? cartItem.qty : 0;

  const handleAdd = () => addToCart({
    ...product,
    cartItemId: variantCartItemId,
    price: currentPrice,
    original_price: currentOriginalPrice,
    weight: currentVariant.weight,
    variantIndex: selectedVariantIndex
  }, 1);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQty, setBulkQty] = useState(5);

  const handleIncrease = () => {
    if (qty === 0) { handleAdd(); return; }
    const nextQty = qty + 1;
    if (product.stock !== undefined && nextQty > product.stock) {
      alert(`Only ${product.stock} units available in stock`);
      return;
    }
    if (nextQty >= 5) {
      setBulkQty(nextQty);
      setBulkOpen(true);
    } else {
      updateQty(variantCartItemId, 1);
    }
  };

  const handleBulkConfirm = () => {
    let n = Math.min(99, Math.max(1, Number(bulkQty) || 1));
    if (product.stock !== undefined && n > product.stock) {
      n = product.stock;
      alert(`Only ${product.stock} units available in stock`);
    }
    const delta = n - qty;
    updateQty(variantCartItemId, delta);
    setBulkOpen(false);
  };

  return (
    <div className="flex flex-col bg-white border border-[#ede6dc] rounded-xl hover:border-primary-400 hover:shadow-md transition group overflow-hidden">
      {/* Image */}
      <div className="w-full h-32 bg-gray-100 overflow-hidden relative cursor-pointer" onClick={handleIncrease}>
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <img src={getCategoryImg(product.category)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="bg-green-50 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">ORGANIC</span>
          <div className="flex items-center gap-0.5 text-xs text-gray-500">
            <Star size={10} className="text-yellow-400 fill-current" />
            <span>{product.rating || "4.5"}</span>
          </div>
        </div>

        <h4 className="text-sm font-bold text-[#3d2f26] mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-primary-600 transition-colors" onClick={handleIncrease}>
          {product.name}
        </h4>

        {/* Pricing block */}
        <div className="flex flex-col mt-auto">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-2.5">
              <div className="flex flex-col text-center">
                <span className="text-[9px] text-gray-500 mb-0.5">MRP</span>
                {currentOriginalPrice > currentPrice ? (
                  <span className="text-[10px] text-gray-500 line-through leading-none">{formatMoney(currentOriginalPrice)}</span>
                ) : (
                  <span className="text-[10px] text-transparent leading-none">-</span>
                )}
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] text-gray-800 mb-0.5">Mankatha</span>
                <span className="font-bold text-[13px] text-gray-900 leading-none">{formatMoney(currentPrice)}</span>
              </div>
            </div>
            {discount > 0 && (
              <div className="bg-green-50 text-green-700 px-1.5 py-1 rounded text-center border border-green-100 flex flex-col justify-center">
                <span className="font-bold text-[10px] leading-tight">{formatMoney(currentOriginalPrice - currentPrice)}</span>
                <span className="text-[8px] font-semibold uppercase leading-tight">OFF</span>
              </div>
            )}
          </div>
          <div className="text-[8px] text-gray-500 mt-1 italic mb-2">(Inclusive of all taxes)</div>

          {/* Variant Dropdown */}
          <div className="relative w-full mb-3">
            <select
              value={selectedVariantIndex}
              onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
              className="w-full border border-gray-200 rounded p-1.5 text-xs appearance-none bg-white cursor-pointer hover:border-primary-500 transition-colors focus:outline-none"
            >
              {variants.map((v, i) => (
                <option key={i} value={i}>{v.weight} ({formatMoney(v.price)})</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Add/Cart Controls */}
        <div className="flex items-center gap-2 w-full mt-1 h-8">
          {product.stock <= 0 ? (
            <button
              disabled
              className="w-full h-full bg-gray-300 text-gray-500 rounded font-bold text-xs uppercase tracking-wide cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={14} />
              Out of Stock
            </button>
          ) : qty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full h-full bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white rounded border border-primary-200 font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={14} />
              Add to Bill
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full h-full">
              <div className="flex items-center border border-gray-300 rounded flex-1 h-full overflow-hidden">
                <button onClick={() => updateQty(variantCartItemId, -1)} className="bg-gray-100 text-gray-600 w-8 h-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Minus size={12} />
                </button>
                <div className="flex-1 flex items-center justify-center font-bold text-gray-800 text-sm">{qty}</div>
                <button 
                  onClick={handleIncrease} 
                  disabled={product.stock !== undefined && qty >= product.stock}
                  className={`w-8 h-full flex items-center justify-center transition-colors ${
                    product.stock !== undefined && qty >= product.stock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  }`}
                >
                  <Plus size={12} />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(variantCartItemId)}
                className="border border-gray-300 rounded w-8 h-full flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors bg-white flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Quantity Popup */}
      {bulkOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setBulkOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px',
              padding: '2rem', width: '340px', maxWidth: '92vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)', position: 'relative'
            }}
          >
            {/* Close */}
            <button
              onClick={() => setBulkOpen(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                color: '#374151', lineHeight: 1
              }}
            >✕</button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShoppingCart size={18} color="#6b9312" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
                Available in Bulk Quantity
              </h3>
            </div>

            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {product.name}{product.weight ? ` : ${product.weight}${product.unit ? ' ' + product.unit : ''}` : ''}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Enter Quantities</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Max allowed quantity: 99</div>
              </div>
              <input
                type="number"
                min={1}
                max={99}
                value={bulkQty}
                onChange={e => setBulkQty(e.target.value)}
                style={{
                  width: '80px', padding: '0.5rem 0.75rem',
                  border: '1.5px solid #d1b97a', borderRadius: '8px',
                  fontSize: '1rem', fontWeight: 700, textAlign: 'center',
                  background: '#fffbef', color: '#111827', outline: 'none'
                }}
              />
            </div>

            <button
              onClick={handleBulkConfirm}
              style={{
                width: '100%', padding: '0.85rem',
                background: '#6b9312', color: '#fff',
                border: 'none', borderRadius: '10px',
                fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', letterSpacing: '0.04em'
              }}
            >
              ADD TO BILL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BillerNewBillPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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

  const addToCart = (productWithVariant, initialQty = 1) => {
    setCart((prev) => {
      const stockLimit = productWithVariant.stock !== undefined ? productWithVariant.stock : Infinity;
      const validInitialQty = Math.min(initialQty, stockLimit);
      
      const existing = prev.find((item) => (item.cartItemId || item._id) === productWithVariant.cartItemId);
      if (existing) {
        return prev.map((item) =>
          (item.cartItemId || item._id) === productWithVariant.cartItemId 
            ? { ...item, qty: Math.min(item.qty + initialQty, stockLimit) } 
            : item
        );
      }
      return [...prev, {
        ...productWithVariant,
        _id: productWithVariant.cartItemId, // Compatibility with backend
        name: `${productWithVariant.name} - ${productWithVariant.weight}`,
        qty: validInitialQty
      }];
    });
  };

  const updateQty = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if ((item.cartItemId || item._id) === cartItemId) {
            const stockLimit = item.stock !== undefined ? item.stock : Infinity;
            return { ...item, qty: Math.min(item.qty + delta, stockLimit) };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => (item.cartItemId || item._id) !== cartItemId));
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Customer Name and Phone Number are mandatory.");
      return;
    }
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
        customerName: customerName.trim() || "",
        phone: customerPhone.trim() || "",
        total: total,
        payment: "Paid",
        paymentMethod: paymentMethod,
        status: "Delivered",
        lineItems: lineItems,
        itemCount: lineItems.reduce((acc, item) => acc + item.quantity, 0),
        isPOS: true
      });

      setSuccess(newOrder);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setShowCheckout(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to generate bill.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-green-50 to-white rounded-2xl border border-[#ede6dc] shadow-sm p-8">
        {/* On-screen success card — hidden when printing */}
        <div className="print:hidden flex flex-col items-center w-full max-w-sm">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-5 shadow-md">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[#3d2f26] mb-1">Bill Generated!</h2>
          <p className="text-gray-500 text-sm mb-1">Order ID: <span className="font-mono font-bold text-primary-700">{success.orderId}</span></p>
          <p className="text-gray-400 text-xs mb-6">Payment: <span className="font-semibold text-green-600">{success.paymentMethod || "Cash"}</span> &nbsp;·&nbsp; Total: <span className="font-semibold text-gray-700">{formatMoney(success.total)}</span></p>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50 text-gray-700 rounded-xl font-semibold transition shadow-sm"
            >
              <Printer size={18} />
              Print Receipt
            </button>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition shadow-md"
            >
              <Plus size={18} />
              New Bill
            </button>
          </div>
        </div>

        {/* ═══ Printable Thermal Receipt ═══ */}
        <div
          className="hidden print:block w-full max-w-[320px] mx-auto bg-white"
          style={{ fontFamily: "'Courier New', Courier, monospace", WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
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
            <h3 className="font-bold text-[#91521f] text-sm uppercase tracking-wider mb-2 border-b border-[#91521f] pb-1">Order Items</h3>
            <div className="space-y-3">
              {success.lineItems?.map((item, idx) => (
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
            <span className="text-xl">{formatMoney(success.total)}</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-140px)]">
      {/* ── Products List ── */}
      <div className="lg:col-span-2 flex flex-col bg-white border border-[#ede6dc] rounded-2xl shadow-sm overflow-hidden h-[60vh] lg:h-full lg:min-h-0">
        {/* Category Tabs */}
        <div 
          className="flex items-center gap-2 px-4 py-3 border-b border-[#ede6dc] overflow-x-auto bg-white"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${category === c
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
              {filteredProducts.map((p) => (
                <BillerProductCard
                  key={p._id}
                  product={p}
                  cart={cart}
                  addToCart={addToCart}
                  updateQty={updateQty}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Cart / Bill ── */}
      <div className="flex flex-col bg-white border border-[#ede6dc] rounded-2xl shadow-sm overflow-hidden min-h-[500px] lg:h-full lg:min-h-0">
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
                <div key={item.cartItemId || item._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#3d2f26] truncate" title={item.name}>{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{formatMoney(item.price)} each</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.cartItemId || item._id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => {
                        if (item.stock !== undefined && item.qty + 1 > item.stock) {
                           alert(`Only ${item.stock} units available in stock`);
                        } else {
                           updateQty(item.cartItemId || item._id, 1);
                        }
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className="text-sm font-bold text-[#3d2f26]">{formatMoney(item.price * item.qty)}</span>
                    <button onClick={() => removeFromCart(item.cartItemId || item._id)} className="text-xs text-red-500 hover:text-red-700">
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
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
              />
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Customer Phone *
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                placeholder="XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>



            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-lg font-bold text-[#3d2f26] mb-4">
                <span>Total Amount:</span>
                <span className="flex items-center text-primary-700">
                  {formatMoney(total)}
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
                  {formatMoney(total)}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Walk-in Customer"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#3d2f26] font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone No. *</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="XXXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[#3d2f26] font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Cash", "Card", "Bank Transfer", "UPI"].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${paymentMethod === method
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
                {submitting ? "Processing..." : `Confirm ${formatMoney(total)} Payment`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillerNewBillPanel;
