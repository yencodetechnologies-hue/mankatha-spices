import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, ChevronDown, Minus, Plus, Trash2, Bell, MapPin, Clock } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import categories from '../../data/categories.json';
import { formatMoney } from '../../utils/formatMoney';
import { categoryApi } from '../../api/categoryApi';
import { notificationApi } from '../../api/notificationApi';
import LocationModal from '../LocationModal';

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const accountRef = React.useRef(null);
  const notificationsRef = React.useRef(null);
  const navigate = useNavigate();
  const { items, getCartCount, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [categoriesList, setCategoriesList] = useState([]);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      if (!isAuthenticated) {
        setNotifications([]);
        return;
      }
      try {
        const data = await notificationApi.getNotifications();
        if (!cancelled) {
          setNotifications(data || []);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    }
    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => (n._id || n.id) === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };
  
  const savedCity = localStorage.getItem("appCity");
  const [userLocation, setUserLocation] = useState({ 
    city: savedCity ? savedCity.split(',')[0] : "Select Location", 
    region: savedCity ? savedCity.split(',')[1]?.trim() : "Click to set area" 
  });

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
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
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

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`);
            const data = await response.json();
            
            if (data && data.features && data.features.length > 0) {
              const props = data.features[0].properties;
              const pin = props.postcode || props.city || "Unknown";
              const desc = props.name || props.locality || props.street || props.city || "Serviceable Area";
              
              setUserLocation({
                city: pin,
                region: desc
              });
              localStorage.setItem("appCity", `${pin}, ${desc}`);
              localStorage.setItem("appPincode", pin !== "Unknown" ? pin : "");
            }
          } catch (err) {
            console.error("Geocoding error", err);
          }
          
          // Do NOT open the Location Modal after successfully getting location
          // setLocationModalOpen(true);
        },
        (err) => {
          console.warn("Location permission denied", err);
          // If they block or deny, show this strict alert and DO NOT open the modal
          alert("Please allow the location permission before continuing");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Please allow the location permission before continuing");
    }
  };

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

            {/* Location - Amazon Style */}
            <div 
              onClick={handleLocationClick}
              className="hidden md:flex items-center gap-1 cursor-pointer hover:ring-1 hover:ring-gray-200 p-1.5 rounded transition-all border border-gray-100 shadow-sm px-3 shrink-0"
            >
              <MapPin size={20} className="text-gray-800 mt-1.5" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-500 leading-none">Delivering to {userLocation.city}</span>
                <div className="text-[14px] font-bold text-gray-900 leading-tight truncate max-w-[140px]">
                  {userLocation.region}
                </div>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="hidden lg:flex flex-col shrink-0">
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
                        {user?.role === 'admin' && (
                          <Link
                            to="/adminpanel/overview"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-green-50 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                            onClick={() => setAccountOpen(false)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            Admin Panel
                          </Link>
                        )}
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

              {/* Notification Bell — dynamic */}
              {isAuthenticated && (
                <div 
                  ref={notificationsRef}
                  className="hidden md:block relative cursor-pointer" 
                  title="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell size={22} className="text-gray-600 hover:text-primary-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-gray-200 shadow-xl z-50 rounded-lg overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-sm">Notifications</span>
                      <span 
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 font-semibold cursor-pointer hover:underline"
                      >
                        Mark all as read
                      </span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map(notif => (
                        <div 
                          key={notif._id || notif.id}
                          onClick={() => markAsRead(notif._id || notif.id)}
                          className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`${notif.color} p-2 rounded-full h-fit mt-1 opacity-${notif.read ? '60' : '100'}`}>
                            <span className="text-lg leading-none">{notif.icon}</span>
                          </div>
                          <div className={notif.read ? 'opacity-60' : ''}>
                            <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                          </div>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-600 self-center ml-auto shrink-0"></div>}
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                      <span className="text-xs text-gray-500 hover:text-primary-600 font-semibold cursor-pointer">View all notifications</span>
                    </div>
                  </div>
                )}
              </div>
              )}

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
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">My Account</span>
                {isAuthenticated ? (
                  <div className="space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-sm font-bold text-primary-600 mb-2 border-b border-gray-200 pb-2">
                      {user?.name}
                    </div>
                    {user?.role === 'admin' && (
                      <Link to="/adminpanel/overview" className="block text-gray-700 hover:text-primary-600 py-2 font-semibold text-sm" onClick={() => setIsMobileMenuOpen(false)}>📊 Admin Panel</Link>
                    )}
                    {user?.role === 'vendor' && (
                      <Link to="/vendor/dashboard" className="block text-gray-700 hover:text-primary-600 py-2 font-semibold text-sm" onClick={() => setIsMobileMenuOpen(false)}>🏪 Vendor Portal</Link>
                    )}
                    <Link to="/profile" className="block text-gray-700 hover:text-primary-600 py-2 font-semibold text-sm" onClick={() => setIsMobileMenuOpen(false)}>👤 My Profile</Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block text-red-600 hover:underline py-2 font-semibold text-left w-full text-sm mt-1 border-t border-gray-200 pt-3">🚪 Logout</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" className="flex-1 bg-white border-2 border-primary-600 text-primary-600 text-center py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/register" className="flex-1 bg-primary-600 text-white text-center py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors border-2 border-primary-600" onClick={() => setIsMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Categories</span>
                <div className="grid grid-cols-3 gap-2">
                  {categoriesList.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="flex flex-col items-center text-center gap-1.5 text-sm text-gray-700 hover:text-primary-600 p-3 rounded-xl border border-gray-100 bg-gray-50 font-semibold hover:bg-primary-50 hover:border-primary-200 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="truncate w-full text-xs leading-tight">{category.name}</span>
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

      <LocationModal 
        isOpen={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)} 
        onLocationSet={(pincode, city, desc) => {
          let displayCity = city;
          let displayRegion = "Serviceable Area";
          
          if (pincode) {
            displayCity = pincode;
          }
          if (desc) {
            displayRegion = desc.split(',')[0];
          } else if (city && city !== "Serviceable Area") {
             displayRegion = city;
          }
          
          setUserLocation({ city: displayCity, region: displayRegion });
          localStorage.setItem("appCity", `${displayCity}, ${displayRegion}`);
          localStorage.setItem("appPincode", pincode || "");
        }} 
      />
    </>
  );
};

export default Header;
