import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, ChevronDown, Minus, Plus, Trash2, Bell, MapPin, Clock } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import categories from '../../data/categories.json';
import { formatMoney } from '../../utils/formatMoney';
import { categoryApi } from '../../api/categoryApi';

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
    herbs: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop",
    "blended-masalas": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop"
  };
  return images[slug] || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop";
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [tempCurrency, setTempCurrency] = useState(localStorage.getItem("appCurrency") || "INR");
  const accountRef = React.useRef(null);
  const navigate = useNavigate();
  const { items, getCartCount, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [categoriesList, setCategoriesList] = useState([]);
  
  const savedCity = localStorage.getItem("appCity");
  const [userLocation, setUserLocation] = useState({ 
    city: savedCity ? savedCity.split(',')[0] : "Detecting...", 
    region: savedCity ? savedCity.split(',')[1]?.trim() : "Please wait" 
  });

  useEffect(() => {
    if (localStorage.getItem("appCity")) return; // Skip if manually set
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data && data.city) {
          setUserLocation({
            city: data.city,
            region: `${data.region_code || data.region}, ${data.country_code || data.country_name}`
          });
        } else {
          setUserLocation({ city: "Chennai", region: "Tamil Nadu, IN" });
        }
      })
      .catch(err => {
        console.warn("Could not fetch IP location", err);
        setUserLocation({ city: "Chennai", region: "Tamil Nadu, IN" });
      });
  }, []);

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

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Savings = sum of (original_price - price) * qty for items that have original_price
  const totalSavings = items.reduce((acc, item) => {
    const orig = item.original_price || item.price;
    return acc + Math.max(0, (orig - item.price) * item.quantity);
  }, 0);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top Bar */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 md:py-3 gap-2 md:gap-4">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="/brand/mankatha-spices.png"
                alt="Mankatha Spices"
                className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </Link>

            {/* Location */}
            <div 
              onClick={() => setLocationModalOpen(true)}
              className="hidden lg:flex flex-col bg-gray-50 px-3 py-1 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors min-w-[120px]"
            >
              <div className="flex items-center text-sm font-semibold text-gray-800 gap-1">
                <MapPin size={13} className="text-primary-600" />
                <span className="truncate max-w-[100px]" title={userLocation.city}>{userLocation.city}</span>
                <ChevronDown size={13} className="text-gray-500 shrink-0" />
              </div>
              <div className="text-xs text-gray-500 pl-4 truncate max-w-[120px]" title={userLocation.region}>{userLocation.region}</div>
            </div>

            {/* Delivery Time */}
            <div className="hidden xl:flex flex-col">
              <div className="text-xs text-gray-500">Earliest <span className="text-primary-600 font-semibold">Home Delivery</span></div>
              <div className="text-sm font-bold text-gray-800 flex items-center mt-0.5 gap-1">
                <Clock size={13} className="text-orange-500" />
                Today 03:00 PM – 06:00 PM
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full shadow-sm rounded overflow-hidden border border-gray-300">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-2.5 bg-gray-50 focus:outline-none focus:bg-white text-sm"
                />
                <button
                  type="submit"
                  className="px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm tracking-wide transition-colors flex items-center gap-1.5"
                >
                  <Search size={16} />
                  SEARCH
                </button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center space-x-3 md:space-x-5 shrink-0">

              {/* Account */}
              <div
                ref={accountRef}
                className="hidden md:flex items-center text-gray-700 font-medium cursor-pointer hover:text-primary-600 transition-colors relative gap-1.5"
                onClick={() => setAccountOpen(prev => !prev)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b9312" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                {isAuthenticated ? (
                  <>
                    <span className="text-sm select-none">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
                    {accountOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-xl z-50 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                        </div>
                        <Link
                          to="/adminpanel/overview"
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-green-50 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                          Admin Panel
                        </Link>
                        {user?.role === 'vendor' && (
                          <Link
                            to="/vendor/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-green-50 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                            onClick={() => setAccountOpen(false)}
                          >
                            🏪 Vendor Portal
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-green-50 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                          onClick={() => setAccountOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          My Profile
                        </Link>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => { handleLogout(); setAccountOpen(false); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm" onClick={(e) => e.stopPropagation()}>
                    <Link to="/login" className="hover:text-primary-600 transition-colors font-semibold">Sign In</Link>
                    <span className="text-gray-300 select-none">/</span>
                    <Link to="/register" className="hover:text-primary-600 transition-colors font-semibold">Register</Link>
                  </div>
                )}
              </div>

              {/* Notification Bell — static, DMart style */}
              <div className="hidden md:block relative cursor-pointer" title="Notifications">
                <Bell size={22} className="text-gray-600 hover:text-primary-600 transition-colors" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </div>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity gap-1.5"
              >
                <div className="relative">
                  <ShoppingCart size={24} className="text-primary-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-[10px] text-gray-500 leading-none">My Cart</span>
                  <span className="font-bold text-gray-800 text-sm leading-tight">{formatMoney(cartTotal)}</span>
                </div>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="flex w-full shadow-sm rounded overflow-hidden border border-gray-300">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-2.5 bg-gray-50 focus:outline-none focus:bg-white text-sm"
              />
              <button
                type="submit"
                className="px-5 bg-primary-600 text-white flex items-center justify-center"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Categories Bar (Bottom Row) */}
        <div className="hidden md:block border-t border-b border-gray-200 bg-white">
          <div className="container mx-auto">
            <div className="flex items-stretch text-[13px]">
              {/* All Categories Dropdown Trigger */}
              <div 
                className="relative flex items-center gap-2 px-5 py-2.5 font-semibold text-gray-800 border-r border-gray-200 cursor-pointer hover:bg-gray-50"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <Menu size={16} />
                <span>All Categories</span>
                
                {/* Mega Menu / Dropdown */}
                {isCategoriesOpen && (
                  <div
                    className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-200 py-2 z-50 rounded-b-md"
                  >
                    {categoriesList.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${encodeURIComponent(category.slug)}`}
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-gray-700 text-sm">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Horizontal Category Links */}
              <div className="flex items-center overflow-x-auto hide-scrollbar font-medium">
                {categoriesList.slice(0, 7).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${encodeURIComponent(cat.slug)}`}
                    className="px-5 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-50 whitespace-nowrap transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 py-4 space-y-5">
              {/* Account Links */}
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">My Account</span>
                {isAuthenticated ? (
                  <div className="space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-sm font-bold text-primary-600 mb-2 border-b border-gray-200 pb-2">
                      {user?.name}
                    </div>
                    <Link to="/adminpanel/overview" className="block text-gray-700 hover:text-primary-600 py-1.5 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                    {user?.role === 'vendor' && (
                      <Link to="/vendor/dashboard" className="block text-gray-700 hover:text-primary-600 py-1.5 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>Vendor Portal</Link>
                    )}
                    <Link to="/profile" className="block text-gray-700 hover:text-primary-600 py-1.5 font-medium text-sm" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block text-red-600 hover:underline py-1.5 font-medium text-left w-full text-sm">Logout</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1 bg-white border-2 border-primary-600 text-primary-600 text-center py-2.5 rounded font-bold hover:bg-green-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/register" className="flex-1 bg-primary-600 text-white text-center py-2.5 rounded font-bold hover:bg-primary-700 transition-colors border-2 border-primary-600" onClick={() => setIsMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Categories</span>
                <div className="grid grid-cols-2 gap-2">
                  {categoriesList.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600 p-2.5 rounded border border-gray-100 bg-gray-50 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="truncate">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Cart Drawer ───────────────────────────────────────── */}
      {/* Backdrop */}
      {cartOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.4)',
            transition: 'opacity 0.3s'
          }}
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '420px',
          background: '#fff', zIndex: 1001,
          display: 'flex', flexDirection: 'column',
          transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-4px 0 40px rgba(0,0,0,0.12)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#111827' }}>My cart</span>
            <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            aria-label="Close cart"
          >
            <X size={22} color="#374151" />
          </button>
        </div>

        {/* Savings + Total bar */}
        {cartCount > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            padding: '0.75rem 1.25rem',
            background: '#f8fdf3',
            borderBottom: '1px solid #e5f0d0'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Savings</div>
              <div style={{ fontWeight: 700, color: '#6b9312', fontSize: '1.05rem' }}>
                {formatMoney(totalSavings)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Cart Total</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem' }}>
                {formatMoney(cartTotal)}
              </div>
            </div>
          </div>
        )}

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', color: '#9ca3af', gap: '1rem'
            }}>
              <ShoppingCart size={56} strokeWidth={1.2} />
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>Your cart is empty</p>
              <button
                onClick={() => { setCartOpen(false); navigate('/products'); }}
                style={{
                  padding: '0.65rem 1.5rem', background: '#6b9312',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem'
                }}
              >
                Shop Now
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemKey = item.cartItemId || item.id;
              const orig = item.original_price || item.price;
              const saving = Math.max(0, (orig - item.price) * item.quantity);
              return (
                <div key={itemKey} style={{
                  display: 'flex', gap: '0.75rem',
                  padding: '0.9rem 0.25rem',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'flex-start'
                }}>
                  {/* Image */}
                  <div style={{
                    width: '70px', height: '70px', flexShrink: 0,
                    borderRadius: '8px', overflow: 'hidden',
                    background: '#f9f9f9', border: '1px solid #eee'
                  }}>
                    {item.featured_image || item.image ? (
                      <img
                        src={item.featured_image || item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', color: '#ccc'
                      }}>🌿</div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: '0.9rem', color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                      {item.weight ? ` : ${item.weight}${item.unit ? ' ' + item.unit : ''}` : ''}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.3rem 0' }}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                        {formatMoney(item.price * item.quantity)}
                      </span>
                      {saving > 0 && (
                        <span style={{
                          fontSize: '0.75rem', color: '#6b9312',
                          background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', fontWeight: 600
                        }}>
                          You Save {formatMoney(saving)}
                        </span>
                      )}
                    </div>

                    {/* Stepper row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                      <button
                        onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          background: item.quantity === 1 ? '#fee2e2' : '#6b9312',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {item.quantity === 1
                          ? <Trash2 size={14} color="#ef4444" />
                          : <Minus size={14} color="#fff" />}
                      </button>
                      <span style={{
                        minWidth: '32px', textAlign: 'center',
                        fontWeight: 700, fontSize: '0.95rem', color: '#111827'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          background: '#6b9312', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Plus size={14} color="#fff" />
                      </button>
                      {/* Remove entirely */}
                      <button
                        onClick={() => removeFromCart(itemKey)}
                        style={{
                          marginLeft: 'auto', width: '28px', height: '28px',
                          background: 'none', border: '1px solid #e5e7eb',
                          borderRadius: '6px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Remove item"
                      >
                        <X size={13} color="#9ca3af" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — View Full Cart */}
        {items.length > 0 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f0f0f0' }}>
            <button
              onClick={() => {
                setCartOpen(false);
                navigate('/cart');
              }}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                padding: '0.9rem', borderRadius: '10px',
                border: '2px solid #6b9312', color: '#6b9312',
                background: 'transparent',
                fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#6b9312'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b9312'; }}
            >
              VIEW FULL CART
            </button>
          </div>
        )}
      </div>
      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in fade-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Choose Delivery Location & Currency</h2>
              <button onClick={() => setLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5">
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Country/Region</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  value={tempCurrency}
                  onChange={(e) => setTempCurrency(e.target.value)}
                >
                  <option value="INR">India (₹ INR)</option>
                  <option value="LKR">Sri Lanka (Rs LKR)</option>
                  <option value="USD">USA ($ USD)</option>
                  <option value="GBP">UK (£ GBP)</option>
                  <option value="AED">UAE (د.إ AED)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Selecting a region will update the product pricing to the respective currency.
                </p>
              </div>
              <button 
                className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                onClick={() => {
                   const cityMap = { LKR: "Colombo, LK", INR: "Chennai, IN", USD: "New York, US", GBP: "London, UK", AED: "Dubai, AE" };
                   localStorage.setItem("appCurrency", tempCurrency);
                   localStorage.setItem("appCity", cityMap[tempCurrency] || "Detecting...");
                   window.location.reload();
                }}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
