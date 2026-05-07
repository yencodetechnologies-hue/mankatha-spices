import React, { useState, useEffect } from 'react';
import { Timer, Tag, Flame, Percent, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import products from '../../data/products.json';
import { formatMoney } from '../../utils/formatMoney';
import { catalogApi } from '../../api/catalogApi';

const Deals = () => {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [allProducts, setAllProducts] = useState(products);
  const [dealProducts, setDealProducts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59, minutes: prev.minutes - 1 };
        return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      try {
        const apiProducts = await catalogApi.getProducts();
        if (!cancelled && apiProducts.length > 0) setAllProducts(apiProducts);
      } catch {
        if (!cancelled) setAllProducts(products);
      }
    }
    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const discounted = allProducts.filter((p) => p.original_price > p.price);
    setDealProducts(discounted.length > 0 ? discounted : allProducts.slice(0, 8));
  }, [allProducts]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Flash Sale Header */}
      <section className="bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-500/10 blur-[120px] rounded-full" />
        <div className="container-custom py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold animate-bounce mb-6">
                <Flame size={16} /> HOT DEALS OF THE DAY
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                Flash <span className="text-primary-400">Sale</span> is On!
              </h1>
              <p className="text-gray-400 text-xl mb-10 leading-relaxed">
                Grab your favorite organic groceries at unbeatable prices. Limited time only, while stocks last.
              </p>
              
              {/* Countdown Timer */}
              <div className="flex gap-4 justify-center lg:justify-start">
                {[
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Mins", value: timeLeft.minutes },
                  { label: "Secs", value: timeLeft.seconds }
                ].map((t, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-24 text-center">
                    <div className="text-3xl font-black text-white leading-none mb-1">{t.value.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-primary-400 uppercase font-bold tracking-widest">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-orange-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-[3rem] p-8 max-w-sm shadow-2xl overflow-hidden">
                <div className="absolute top-4 right-4 bg-red-500 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center font-black shadow-lg">
                  <span className="text-xs">SAVE</span>
                  <span className="text-lg">40%</span>
                </div>
                <img src={allProducts[0]?.featured_image} alt="Featured Deal" className="w-full h-64 object-cover rounded-2xl mb-6 hover:scale-105 transition-transform duration-500" />
                <h3 className="text-2xl font-black text-gray-900 mb-2 truncate">{allProducts[0]?.name || "Featured deal"}</h3>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-black text-primary-600">$4.99</span>
                  <span className="text-lg text-gray-400 line-through">$8.99</span>
                </div>
                <button 
                  onClick={() => allProducts[0] && addToCart(allProducts[0])}
                  className="w-full btn-premium py-4 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="section-padding container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Weekly <span className="text-gradient-primary">Special Offers</span></h2>
            <p className="text-gray-500 text-lg">Don't miss out on these limited-time discounts.</p>
          </div>
          <div className="flex gap-4 mt-8 md:mt-0">
            {['All', 'Fruits', 'Vegetables', 'Dairy'].map((cat, i) => (
              <button key={i} className={`px-6 py-2 rounded-full font-bold transition-all ${i === 0 ? 'bg-primary-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-primary-50'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {dealProducts.map((product, i) => (
            <div key={i} className="product-card bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden border border-gray-100 relative">
              <div className="absolute top-4 left-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-black z-10">
                LTD OFFER
              </div>
              <div className="image-zoom h-48 rounded-2xl mb-4">
                <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 h-12 line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="text-2xl font-black text-primary-600">{formatMoney(product.price)}</span>
                  <p className="text-sm text-gray-400 line-through">{formatMoney(product.original_price)}</p>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary-500 transition-colors shadow-lg"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coupons Section */}
      <section className="section-padding container-custom pt-0">
        <div className="bg-primary-600 rounded-[3rem] p-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-md text-center lg:text-left">
            <h2 className="text-4xl font-black mb-4">Extra <span className="text-primary-200">20% OFF</span></h2>
            <p className="text-primary-100 mb-0 leading-relaxed font-light">Use this coupon on your first order over $50. Cannot be combined with other offers.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border-2 border-dashed border-white/30 px-10 py-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-primary-100 text-sm font-bold tracking-widest uppercase mb-1">PROMO CODE</p>
              <div className="text-3xl font-black tracking-tighter">HELLOORGANIC20</div>
            </div>
            <button className="bg-white text-primary-600 px-8 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
              COPY CODE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Deals;

