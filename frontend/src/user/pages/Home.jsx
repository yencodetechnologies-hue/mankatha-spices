import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Truck, Shield, RefreshCw, Heart, ArrowRight, Minus, Plus, ChevronDown, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import products from '../../data/products.json';
import categories from '../../data/categories.json';
import { formatMoney } from '../../utils/formatMoney';
import { catalogApi } from '../api/catalogApi';
import { categoryApi } from '../../api/categoryApi';
import heroBlendedMasala from '../../assets/hero_blended_masala.png';
import heroOrganicSpices from '../../assets/hero_organic_spices.png';
import heroWholeSpices from '../../assets/hero_whole_spices.png';
import promoBannerImg from '../../assets/promo_banner.png';
import angadiLogo from '../../assets/mankatha_new_logo.png';

import { useWishlist } from '../../contexts/WishlistContext';
import { getBackendOrigin } from '../../api/adminApiBase';

// ── Stable cart item key — uses slug so key is same for both JSON & API products ──
const makeVariantKey = (product, variantIndex) => {
  // slug is consistent across static JSON and MongoDB API data
  const baseId = product.slug || product._id || product.id || product.name || 'item';
  return `${baseId}||variant-${variantIndex}`;
};

// ProductCard uses useCart() directly — no stale prop issues
const ProductCard = ({ product, index }) => {
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const hasVariants = product.pricing && product.pricing.length > 0 && product.pricing[0].weights && product.pricing[0].weights.length > 0;

  const variants = hasVariants ? product.pricing[0].weights.map(w => ({
    weight: w.weight,
    price: w.price,
    original_price: w.original_price || Math.round(w.price * 1.2),
    stock: w.stock !== undefined ? w.stock : product.stock
  })) : [{
    weight: `${product.weight || ''} ${product.unit || ''}`.trim() || '1 pc',
    price: product.price,
    original_price: product.original_price || (product.price ? Math.round(product.price * 1.2) : 0),
    stock: product.stock
  }];

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const currentVariant = variants[selectedVariantIndex] || variants[0];
  const currentPrice = currentVariant.price;
  const currentOriginalPrice = currentVariant.original_price;

  const variantCartItemId = makeVariantKey(product, selectedVariantIndex);

  const discount = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  // Always-fresh lookup directly from context
  const cartItem = cartItems.find(i => (i.cartItemId || i.id) === variantCartItemId);
  const qty = cartItem ? cartItem.quantity : 0;

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQty, setBulkQty] = useState(5);
  const [showDietTip, setShowDietTip] = useState(false);

  const handleAdd = () => addToCart({
    ...product,
    quantity: 1,
    weight: currentVariant.weight,
    price: currentPrice,
    original_price: currentOriginalPrice,
    cartItemId: variantCartItemId,
    variantIndex: selectedVariantIndex
  });
  const handleIncrease = () => {
    if (qty === 0) { handleAdd(); return; }
    const nextQty = qty + 1;
    if (currentVariant.stock !== undefined && nextQty > currentVariant.stock) {
      alert(`Only ${currentVariant.stock} units available in stock`);
      return;
    }
    if (nextQty >= 5) {
      setBulkQty(nextQty);
      setBulkOpen(true);
    } else {
      updateQuantity(variantCartItemId, nextQty);
    }
  };
  const handleDecrease = () => updateQuantity(variantCartItemId, qty - 1);
  const handleBulkConfirm = () => {
    let n = Math.min(99, Math.max(1, Number(bulkQty) || 1));
    if (currentVariant.stock !== undefined && n > currentVariant.stock) {
      n = currentVariant.stock;
      alert(`Only ${currentVariant.stock} units available in stock`);
    }
    updateQuantity(variantCartItemId, n);
    setBulkOpen(false);
  };

  return (
    <div
      className={`product-card group relative shine-effect reveal reveal-up stagger-${(index % 4) + 1}`}
    >


      {/* Dietary Preference Badge — state-based tooltip to avoid nested group conflict */}
      <div
        className="absolute top-4 right-4 z-20"
        onMouseEnter={() => setShowDietTip(true)}
        onMouseLeave={() => setShowDietTip(false)}
        style={{ cursor: 'default' }}
      >
        {product.dietaryPreference === 'non-vegetarian' ? (
          <div className="w-5 h-5 border-2 border-[#792C23] flex items-center justify-center bg-white rounded-sm shadow-sm">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#792C23] mt-[1px]"></div>
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-primary-500 flex items-center justify-center bg-white rounded-sm shadow-sm">
            <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
          </div>
        )}
        {showDietTip && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: '4px',
            background: '#1f2937', color: '#fff', fontSize: '11px',
            padding: '3px 8px', borderRadius: '5px', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 50
          }}>
            {product.dietaryPreference === 'non-vegetarian' ? 'Non Vegetarian' : 'Vegetarian'}
          </div>
        )}
      </div>


      {/* Product Image */}
      <div className="relative image-zoom h-36 md:h-56 cursor-pointer overflow-hidden rounded-t-xl md:rounded-t-2xl" onClick={() => window.location.href = `/product/${product.slug}`}>
        <img
          src={product.featured_image}
          alt={product.name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3 md:p-5">
        <div className="flex items-center justify-end mb-2">
          <div className="flex items-center">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-xs font-bold text-gray-700 ml-1">{product.rating}</span>
          </div>
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1 md:mb-2 hover:text-primary-600 transition-colors line-clamp-2 h-10 md:h-12">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-start justify-between mt-2 mb-3">
          <div className="flex flex-col">
            <div className="flex items-end gap-3">
              <div className="flex flex-col text-center">
                {/* <span className="text-[10px] md:text-[11px] text-gray-500 mb-0.5">MRP</span> */}
                {currentOriginalPrice > currentPrice ? (
                  <span className="text-xs md:text-sm text-gray-500 line-through leading-none">{formatMoney(currentOriginalPrice)}</span>
                ) : (
                  <span className="text-xs md:text-sm text-transparent leading-none">-</span>
                )}
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] md:text-[11px] text-gray-800 mb-0.5">Mankatha</span>
                <span className="font-bold text-[13px] md:text-[17px] text-gray-900 leading-none">{formatMoney(currentPrice)}</span>
              </div>
            </div>
            <div className="text-[10px] text-gray-500 mt-1 italic tracking-tight">(Inclusive of all taxes)</div>
          </div>

          {/* OFF Box */}
          {discount > 0 && (
            <div className="bg-green-50 text-green-700 px-2 py-1 md:px-3 md:py-1.5 rounded-md text-center flex flex-col justify-center border border-green-100">
              <span className="font-bold text-xs md:text-sm leading-tight text-green-700">{formatMoney(currentOriginalPrice - currentPrice)}</span>
              <span className="text-[10px] md:text-xs font-semibold uppercase text-green-600 leading-tight">OFF</span>
            </div>
          )}
        </div>

        {/* Dropdown for weight variants */}
        <div className="relative w-full mb-3 md:mb-4">
          <select
            value={selectedVariantIndex}
            onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
            className="w-full border border-gray-200 rounded p-1.5 md:p-2 text-[11px] md:text-sm appearance-none bg-white cursor-pointer hover:border-primary-500 transition-colors focus:outline-none"
          >
            {variants.map((v, i) => (
              <option key={i} value={i}>
                {v.weight} - {formatMoney(v.price)}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown size={14} className="text-gray-400 md:w-4 md:h-4" />
          </div>
        </div>

        {/* DMart style cart control */}
        <div className="flex items-center gap-1.5 md:gap-2 mt-2 w-full">
          <button
            onClick={() => toggleWishlist(product)}
            className={`border rounded w-8 h-8 md:w-[42px] md:h-[42px] flex items-center justify-center transition-colors bg-white flex-shrink-0 ${isInWishlist(product._id || product.id)
              ? "border-primary-400 text-primary-600 bg-primary-50/50"
              : "border-gray-300 text-gray-500 hover:text-primary-600 hover:border-primary-300"
              }`}
          >
            <Heart size={16} className={isInWishlist(product._id || product.id) ? "fill-primary-500 text-primary-500" : "md:w-5 md:h-5"} />
          </button>
          {currentVariant.stock <= 0 ? (
            <button
              disabled
              className="w-full h-8 md:h-[42px] flex items-center justify-center gap-1 md:gap-2 bg-gray-400 text-white rounded font-bold uppercase tracking-wide cursor-not-allowed"
            >
              <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
              <span className="text-[10px] md:text-sm">Out of Stock</span>
            </button>
          ) : qty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full h-8 md:h-[42px] flex items-center justify-center gap-1 md:gap-2 bg-primary-500 hover:bg-primary-600 text-white rounded font-bold uppercase tracking-wide transition-colors"
            >
              <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
              <span className="text-[10px] md:text-sm">Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 md:gap-2 w-full">
              <div className="flex items-center border border-gray-300 rounded flex-1 h-8 md:h-[42px] overflow-hidden">
                <button
                  onClick={handleDecrease}
                  className="bg-gray-100 text-gray-600 w-8 md:w-12 h-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus size={14} className="md:w-4 md:h-4" />
                </button>
                <div className="flex-1 flex items-center justify-center font-bold text-gray-800 text-sm md:text-base">
                  {qty}
                </div>
                <button
                  onClick={handleIncrease}
                  className={`w-8 md:w-12 h-full flex items-center justify-center transition-colors ${currentVariant.stock !== undefined && qty >= currentVariant.stock
                    ? "bg-gray-300 text-gray-500 cursor-pointer"
                    : "bg-primary-500 text-white hover:bg-primary-600"
                    }`}
                >
                  <Plus size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
              <button
                onClick={() => updateQuantity(variantCartItemId, 0)}
                className="border border-gray-300 rounded w-8 h-8 md:w-[42px] md:h-[42px] flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors bg-white flex-shrink-0"
              >
                <X size={16} className="md:w-5 md:h-5" />
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
              ADD TO CART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const slugify = (input) => {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getCategoryIcon = (name, staticIcon) => {
  if (staticIcon) return staticIcon;
  const slug = slugify(name);
  const icons = {
    fruits: "🍎", vegetables: "🥬", dairy: "🥛", bakery: "🍞", "meat-fish": "🥩",
    pantry: "🥫", beverages: "🧃", snacks: "🍿", "ground-spices": "🌶️",
    "whole-spices": "🌰", herbs: "🌿", "blended-masalas": "🥣"
  };
  return icons[slug] || "🏷️";
};

const getCategoryImg = (name, staticImg) => {
  if (staticImg) return staticImg;
  const slug = slugify(name);
  const images = {
    fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop",
    vegetables: "https://images.unsplash.com/photo-1540420775628-1e6b0d6b4dc0?w=400&h=300&fit=crop",
    dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
    bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    "meat-fish": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
    pantry: "https://images.unsplash.com/photo-1525373612132-b3e820b87cea?w=400&h=300&fit=crop",
    beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop",
    snacks: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
    "ground-spices": heroOrganicSpices,
    "whole-spices": heroWholeSpices,
    herbs: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop",
    "blended-masalas": heroBlendedMasala,
    "blended-masala": heroBlendedMasala
  };
  return images[slug] || heroOrganicSpices;
};

const defaultSlides = [
  {
    id: 1,
    title: "",
    subtitle: "Authentic Flavors, Rich Tradition",
    image: heroBlendedMasala,
    cta: "Shop Now",
    ctaLink: "/products"
  },
  {
    id: 2,
    title: "",
    subtitle: "100% Certified Organic Spice Powders",
    image: heroOrganicSpices,
    cta: "Shop Now",
    ctaLink: "/products"
  },
  {
    id: 3,
    title: "",
    subtitle: "Gourmet Aromatics for Fine Culinary Art",
  
    image: heroWholeSpices,
    cta: "Shop Now",
    ctaLink: "/products"
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts, setAllProducts] = useState(products);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [slides, setSlides] = useState(defaultSlides);
  const [promoBanner, setPromoBanner] = useState(null);
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 50);

    let cancelled = false;
    async function loadCats() {
      try {
        const res = await categoryApi.list();
        if (cancelled) return;
        const list = res.categories || [];
        if (list.length > 0) {
            const formatted = list.map(cat => ({
              id: cat._id,
              name: cat.name,
              slug: cat.name,
              icon: getCategoryIcon(cat.name),
              image: cat.image ? `${getBackendOrigin()}${cat.image}` : getCategoryImg(cat.name),
              description: `Explore our high quality ${cat.name}`
            }));
            setCategoriesList(formatted);
          } else {
            setCategoriesList(categories.map(c => ({
              ...c,
              slug: c.name,
              image: getCategoryImg(c.name, c.image)
            })));
          }
      } catch {
        if (!cancelled) {
          setCategoriesList(categories.map(c => ({
            ...c,
            slug: c.name,
            image: getCategoryImg(c.name, c.image)
          })));
        }
      }
    }
    loadCats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      try {
        const apiProducts = await catalogApi.getProducts();
        if (cancelled || apiProducts.length === 0) return;
        setAllProducts(apiProducts);
        
        // Show the 8 newest products (reversing the list)
        const newest = [...apiProducts].reverse();
        setFeaturedProducts(newest.slice(0, 8));
      } catch {
        if (!cancelled) {
          setAllProducts(products);
          const newest = [...products].reverse();
          setFeaturedProducts(newest.slice(0, 8));
        }
      }
    }
    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (featuredProducts.length > 0) return;
    const newest = [...allProducts].reverse();
    setFeaturedProducts(newest.slice(0, 8));
  }, [allProducts, featuredProducts.length]);

  // Intersection Observer for Reveal Animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all elements with the reveal class
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    // Fallback timer: force all reveal elements to show after a delay
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('active');
      });
    }, 1500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [featuredProducts]); // Re-run when products are loaded

  useEffect(() => {
    // Disabled local storage override to ensure correct Vite image imports are used
    /*
    try {
      const stored = localStorage.getItem("mankatha_sliders_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        const activeSliders = parsed.filter(s => s.isActive === true).sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
        if (activeSliders.length > 0) {
          const mappedSlides = activeSliders.map(s => ({
            id: s.id,
            title: s.title || "Mankatha Special",
            subtitle: "",
            description: "",
            image: s.imageUrl || s.image,
            cta: "Shop Now",
            ctaLink: s.link || "/products"
          }));
          setSlides(mappedSlides);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load custom sliders", e);
    }
    */
    setSlides(defaultSlides);
  }, []);

  useEffect(() => {
    try {
      const storedBanners = localStorage.getItem("mankatha_promo_banners");
      if (storedBanners) {
        const banners = JSON.parse(storedBanners);
        if (banners.length > 0 && banners[0].isActive) {
          setPromoBanner(banners[0]);

          // Temporarily bypassing the 'seen once' logic so you can test it easily
          // const hasSeen = sessionStorage.getItem(`seen_promo_${banners[0].id}`);
          // if (!hasSeen) {
          setShowPromoPopup(true);
          // }
        }
      } else {
        // Default promotional banner if none configured
        setPromoBanner({
          title: "Promo Banner",
          link: "/products",
          imageUrl: promoBannerImg,
          isActive: true
        });
      }
    } catch (e) {
      console.error("Failed to load promo banners", e);
    }
  }, []);

  const closePromoPopup = () => {
    setShowPromoPopup(false);
    if (promoBanner) {
      sessionStorage.setItem(`seen_promo_${promoBanner.id}`, "true");
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const features = [
    {
      icon: <Truck className="text-primary-500 w-4 h-4 md:w-8 md:h-8" />,
      title: "Free Delivery",
      description: "Free delivery on orders over $50"
    },
    {
      icon: <Shield className="text-primary-500 w-4 h-4 md:w-8 md:h-8" />,
      title: "100% Organic",
      description: "All products certified organic"
    },
    {
      icon: <RefreshCw className="text-primary-500 w-4 h-4 md:w-8 md:h-8" />,
      title: "Easy Returns",
      description: "30-day return policy"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Hero Slider */}
      <section className="relative overflow-hidden h-[500px] sm:h-[550px] md:h-[600px]">
        <div className="relative h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                }`}
            >
              {/* Background Image — z-0 */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              {/* Dark overlay — z-[1] */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[1]" />

              {/* Text Content — z-[2] always on top */}
              <div className="absolute inset-0 z-[2] flex items-center pt-0 pb-16 md:pb-24">
                <div className="container-custom w-full flex items-center justify-between relative">
                  {/* LEFT: Slide text, and Shop Now */}
                  <div className={`w-full text-white px-4 transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                    <h1 className="text-2xl sm:text-3xl md:text-7xl font-extrabold mb-2 md:mb-6 leading-tight text-white drop-shadow-2xl">
                      {slide.title.split(' ').map((word, i) => (
                        <span key={i} className={i % 2 !== 0 ? 'text-primary-400' : ''}>{word} </span>
                      ))}
                    </h1>
                    {slide.description && (
                      <p className="text-xs sm:text-sm md:text-2xl mb-3 md:mb-8 text-gray-200 leading-relaxed max-w-xl line-clamp-2 md:line-clamp-none">
                        {slide.description}
                      </p>
                    )}
                      {/* Logo, Shop Now Button, and Tamil Text */}
                      <div className="mb-4 md:mb-8 flex flex-col md:flex-row items-center justify-center w-full gap-8 md:gap-16">
                      
                        {/* Logo and Shop Now Button Container */}
                        <div className="flex flex-col items-center justify-center">
                          <img
                            src={angadiLogo}
                            alt="Mankatha Angadi Logo"
                            className="w-[160px] h-[160px] md:w-[100%] md:h-auto object-contain rounded-full drop-shadow-2xl hover:scale-105 transition-transform duration-300 pointer-events-auto"
                            style={{ maxWidth: '280px', maxHeight: '280px' }}
                          />
                          
                          {/* Buttons Container */}
                          <div className="mt-3 md:mt-5 pointer-events-auto z-10 flex items-center justify-center w-full">
                            <div className="hidden md:flex">
                              <Link
                                to={slide.ctaLink}
                                className="btn-premium flex items-center gap-1.5 px-4 py-1.5 md:px-5 md:py-2 text-[14px] md:text-lg font-bold rounded-full w-max shadow-md"
                              >
                                {slide.cta}
                                <ArrowRight size={18} className="w-4 h-4 md:w-5 md:h-5" />
                              </Link>
                            </div>

                            {/* Desktop Slider Navigation (Aligned Horizontally) */}
                            <div className="hidden md:flex items-center justify-center md:h-[48px] absolute right-4 md:right-8 lg:right-12 gap-4 glass px-6 rounded-full pointer-events-auto z-30">
                              <button onClick={prevSlide} className="text-white hover:text-primary-400 transition-colors">
                                <ChevronLeft size={20} className="w-5 h-5" />
                              </button>
                              <div className="flex gap-2.5">
                                {slides.map((_, i) => (
                                  <button
                                    key={`nav-${i}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentSlide(i);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-6 bg-primary-400' : 'w-1.5 bg-white/30'}`}
                                  />
                                ))}
                              </div>
                              <button onClick={nextSlide} className="text-white hover:text-primary-400 transition-colors">
                                <ChevronRight size={20} className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Tamil Text Container */}
                        <div className="flex flex-col items-center md:items-center justify-center text-center pointer-events-auto mt-4 md:mt-0">
                          <p className="text-white font-extrabold text-[16px] md:text-[18px] lg:text-[36px] leading-[1.2] drop-shadow-[0_4px_8px_rgba(0,0,0,1)] tracking-wide whitespace-nowrap" style={{ textShadow: '2px 2px 4px #000, -2px -2px 4px #000, 2px -2px 4px #000, -2px 2px 4px #000' }}>
                            மங்காத்தா அங்காடி வல்வெட்டித்துறை
                            <br/>
                            <span className="text-[14px] md:text-[20px] lg:text-[32px] text-[#A6D13A] font-bold mt-2 md:mt-4 block" style={{ textShadow: '1px 1px 2px #000' }}>
                              Mankatha Angadi - Valvettithurai
                            </span>
                          </p>
                          
                          {/* Mobile-only Shop Now Button (Displayed below text) */}
                          <div className="flex md:hidden mt-3 md:mt-5 pointer-events-auto z-10 items-center justify-center w-full">
                            <Link
                              to={slide.ctaLink}
                              className="btn-premium flex items-center justify-center gap-1.5 px-4 text-[14px] font-bold rounded-full w-[160px] h-[40px] shadow-md"
                            >
                              {slide.cta}
                              <ArrowRight size={18} className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>

                      </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Slider Navigation — always on top */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex md:hidden items-center justify-between glass px-4 rounded-full w-[160px] h-[40px] shadow-md">
            <button onClick={prevSlide} className="text-white hover:text-primary-400 transition-colors flex items-center justify-center">
              <ChevronLeft size={22} />
            </button>
            <div className="flex gap-2 items-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-primary-400' : 'w-1.5 bg-white/30'}`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="text-white hover:text-primary-400 transition-colors flex items-center justify-center">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </section>



      {/* Promo Banner Popup */}
      {showPromoPopup && promoBanner && promoBanner.imageUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Blurred Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closePromoPopup}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-fit mx-auto max-w-3xl bg-transparent rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100 animate-scale-up">
            <button
              onClick={closePromoPopup}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <Link to={promoBanner.link || "/products"} onClick={closePromoPopup} className="block group">
              <img
                src={promoBanner.imageUrl}
                alt={promoBanner.title || "Promotional Banner"}
                className="w-auto h-auto max-w-full max-h-[80vh] rounded-3xl object-contain"
              />
            </Link>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="section-padding overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal reveal-up">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                Shop by <span className="text-gradient-primary">Category</span>
              </h2>
              <p className="text-gray-500 text-lg">Check out our most popular categories and find the freshest organic products.</p>
            </div>
            <Link to="/products" className="mt-8 md:mt-0 flex items-center gap-2 text-primary-600 font-bold hover:gap-4 transition-all">
              View All Categories <ArrowRight size={20} />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {categoriesList.slice(0, 7).map((category, i) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className={`group reveal reveal-scale stagger-${(i % 4) + 1} w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)] max-w-[280px]`}
              >
                <div className="bg-white h-full flex flex-row items-center justify-start p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left border border-gray-100 group-hover:border-primary-100 group-hover:-translate-y-1">
                  <div className="relative w-16 h-16 mr-4 shrink-0 bg-primary-50 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner border border-gray-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop";
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm group-hover:text-primary-600 leading-snug">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-white/50 relative">
        <div className="container-custom">
          <div className="text-center mb-16 reveal reveal-up">
            <span className="bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
              OUR SELECTIONS
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-6 mb-4 leading-tight">
              Featured <span className="text-gradient-primary">Products</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Our most popular organic picks, hand-selected for quality and nutritional value.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product._id || product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="section-padding container-custom reveal reveal-up">
        <div className="relative h-[400px] rounded-[3rem] overflow-hidden group">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=600&fit=crop"
            alt="Promo"
            className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-transparent flex items-center px-12 md:px-24">
            <div className="max-w-lg text-white">
              <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">Limited Offer</span>
              <h2 className="text-4xl md:text-6xl font-black mt-6 mb-4 leading-tight">Save up to 30% on Organic Seasonal Fruit</h2>
              <p className="text-xl text-primary-50 mb-10">Get fresh, organic seasonal fruits delivered and save big this week.</p>
              <Link to="/products" className="btn-premium inline-flex px-12 py-5 text-xl">
                Get Deal Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


