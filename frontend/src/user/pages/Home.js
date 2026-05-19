import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Truck, Shield, RefreshCw, Heart, ArrowRight, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import products from '../../data/products.json';
import categories from '../../data/categories.json';
import { formatMoney } from '../../utils/formatMoney';
import { catalogApi } from '../api/catalogApi';
import { categoryApi } from '../../api/categoryApi';
import heroBlendedMasala from '../../assets/hero_blended_masala.png';
import heroOrganicSpices from '../../assets/hero_organic_spices.png';
import heroWholeSpices from '../../assets/hero_whole_spices.png';

const ProductCard = ({ product, index, addToCart, removeFromCart, updateQuantity, cartItems }) => {
  const discount = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const cartItem = cartItems?.find(i => (i.cartItemId || i.id) === product.id);
  const qty = cartItem?.quantity || 0;

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQty, setBulkQty] = useState(qty || 5);

  const handleAdd = () => addToCart({ ...product, quantity: 1 });
  const handleIncrease = () => {
    if (qty >= 5) {
      setBulkQty(qty + 1);
      setBulkOpen(true);
    } else {
      updateQuantity(product.id, qty + 1);
    }
  };
  const handleDecrease = () => updateQuantity(product.id, qty - 1);
  const handleBulkConfirm = () => {
    const n = Math.min(99, Math.max(1, Number(bulkQty) || 1));
    updateQuantity(product.id, n);
    setBulkOpen(false);
  };

  return (
    <div
      className={`product-card group relative shine-effect reveal reveal-up stagger-${(index % 4) + 1}`}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            -{discount}%
          </div>
        </div>
      )}

      {/* Quick Wishlist */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
        <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors">
          <Heart size={18} className="text-gray-600 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative image-zoom h-56 cursor-pointer overflow-hidden rounded-t-2xl" onClick={() => window.location.href = `/product/${product.slug}`}>
        <img
          src={product.featured_image}
          alt={product.name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider bg-primary-50 px-2 py-1 rounded">
            Organic
          </span>
          <div className="flex items-center">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-xs font-bold text-gray-700 ml-1">{product.rating}</span>
          </div>
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-bold text-gray-800 mb-2 hover:text-primary-600 transition-colors line-clamp-2 h-12">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-5" style={{minWidth:0}}>
          <div style={{minWidth:0, overflow:'hidden'}}>
            <div className="flex items-baseline gap-2" style={{flexWrap:'nowrap', overflow:'hidden'}}>
              <span className="text-2xl font-extrabold text-gray-900" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%',display:'block'}}>{formatMoney(product.price)}</span>
              {product.original_price > product.price && (
                <span className="text-sm text-gray-400 line-through" style={{whiteSpace:'nowrap'}}>
                  {formatMoney(product.original_price)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{product.weight} {product.unit}</p>
          </div>
        </div>

        {/* D-Mart style cart control */}
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            className="w-full btn-premium py-3 flex items-center justify-center gap-2 group/btn"
          >
            <ShoppingCart size={18} className="transition-transform group-hover/btn:-translate-y-1" />
            <span>Add to Cart</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full">
            {/* Trash / decrease to 0 */}
            <button
              onClick={handleDecrease}
              style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: qty === 1 ? '#fee2e2' : '#f3f4f6',
                border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 0.2s'
              }}
              aria-label="Decrease"
            >
              {qty === 1
                ? <Trash2 size={16} color="#ef4444" />
                : <Minus size={16} color="#374151" />}
            </button>

            {/* Quantity display */}
            <div style={{
              flex: 1, height: '40px', background: '#6b9312', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '1rem'
            }}>
              {qty}
            </div>

            {/* Increase */}
            <button
              onClick={handleIncrease}
              style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: '#6b9312', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.2s'
              }}
              aria-label="Increase"
            >
              <Plus size={16} color="#fff" />
            </button>
          </div>
        )}
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
    "ground-spices": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop",
    "whole-spices": "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&h=300&fit=crop",
    herbs: "https://images.unsplash.com/photo-1515002246390-7bf7e8f87b54?w=400&h=300&fit=crop",
    "blended-masalas": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop"
  };
  return images[slug] || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop";
};

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allProducts, setAllProducts] = useState(products);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const { addToCart, removeFromCart, updateQuantity, items: cartItems } = useCart();
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
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
            image: getCategoryImg(cat.name),
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
        setFeaturedProducts(apiProducts.filter((product) => product.is_featured));
      } catch {
        if (!cancelled) {
          setAllProducts(products);
          setFeaturedProducts(products.filter((product) => product.is_featured));
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
    setFeaturedProducts(allProducts.filter((product) => product.is_featured).slice(0, 8));
  }, [allProducts, featuredProducts.length]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const slides = [
    {
      id: 1,
      title: "Mankatha Blended Masalas",
      subtitle: "Authentic Flavors, Rich Tradition",
      description: "Experience the premium taste of our handcrafted spice blends, perfect for enhancing your traditional home cooking.",
      image: heroBlendedMasala,
      cta: "Explore Blends",
      ctaLink: "/products"
    },
    {
      id: 2,
      title: "Pure & Organic Spices",
      subtitle: "100% Certified Organic Spice Powders",
      description: "Sourced directly from the finest organic farms, packed with natural flavor, color, and rich aromatics.",
      image: heroOrganicSpices,
      cta: "Shop Pure Powders",
      ctaLink: "/products"
    },
    {
      id: 3,
      title: "Traditional Whole Spices",
      subtitle: "Gourmet Aromatics for Fine Culinary Art",
      description: "Carefully selected whole cardamom, cloves, cinnamon, and pepper to bring gourmet level depth to your kitchen.",
      image: heroWholeSpices,
      cta: "Shop Whole Spices",
      ctaLink: "/products"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const features = [
    {
      icon: <Truck className="text-primary-500" size={32} />,
      title: "Free Delivery",
      description: "Free delivery on orders over $50"
    },
    {
      icon: <Shield className="text-primary-500" size={32} />,
      title: "100% Organic",
      description: "All products certified organic"
    },
    {
      icon: <RefreshCw className="text-primary-500" size={32} />,
      title: "Easy Returns",
      description: "30-day return policy"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Hero Slider with Parallax */}
      <section className="relative overflow-hidden h-[600px]">
        <div className="relative h-full">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
          
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
            >
              <div
                className="parallax-bg"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                  transform: `translateY(${scrollY * 0.3}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </div>
              
              <div className="relative container-custom h-full flex items-center pb-20 md:pb-28">
                <div className={`max-w-2xl text-white px-4 transition-all duration-1000 delay-300 ${
                  index === currentSlide ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                }`}>
                  <span className="inline-block text-primary-400 font-bold tracking-widest uppercase mb-4 reveal reveal-up active">
                    Best Organic Market
                  </span>
                  <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white drop-shadow-2xl">
                    {slide.title.split(' ').map((word, i) => (
                      <span key={i} className={i === 1 ? 'text-primary-400' : ''}>{word} </span>
                    ))}
                  </h1>
                  <p className="text-xl md:text-2xl mb-10 text-gray-200 leading-relaxed max-w-xl">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={slide.ctaLink}
                      className="btn-premium flex items-center gap-3 px-10 py-5 text-lg"
                    >
                      {slide.cta}
                      <ArrowRight size={20} />
                    </Link>
                    <button className="glass px-10 py-5 rounded-xl text-white font-bold hover:bg-white/20 transition-all">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Navigation Icons */}
          <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 glass px-6 py-3 rounded-2xl">
            <button onClick={prevSlide} className="text-white hover:text-primary-400 transition-colors">
              <ChevronLeft size={28} />
            </button>
            <div className="flex gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === currentSlide ? 'w-10 bg-primary-400' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="text-white hover:text-primary-400 transition-colors">
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-40 container-custom -mt-16 sm:-mt-24 mb-8 reveal reveal-up">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {features.map((feature, i) => (
            <React.Fragment key={i}>
              <div className="flex-1 flex items-center gap-6 w-full px-4">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{feature.description}</p>
                </div>
              </div>
              {i < features.length - 1 && (
                <div className="hidden md:block w-px bg-gray-200/80 self-stretch my-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

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
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categoriesList.slice(0, 8).map((category, i) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className={`group reveal reveal-scale stagger-${(i % 4) + 1}`}
              >
                <div className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 text-center border border-gray-100 group-hover:border-primary-100 group-hover:-translate-y-2">
                  <div className="relative w-20 h-20 mx-auto mb-4 bg-primary-50 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner border border-gray-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop";
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm group-hover:text-primary-600">{category.name}</h3>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index}
                addToCart={addToCart} removeFromCart={removeFromCart}
                updateQuantity={updateQuantity} cartItems={cartItems} />
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


