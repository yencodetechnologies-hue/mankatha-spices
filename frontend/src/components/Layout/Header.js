import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, ChevronDown, Minus, Plus, Trash2 } from 'lucide-react';
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
    herbs: "https://images.unsplash.com/photo-1515002246390-7bf7e8f87b54?w=400&h=300&fit=crop",
    "blended-masalas": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop"
  };
  return images[slug] || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop";
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const { items, getCartCount, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
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
        <div className="hidden md:block bg-primary-600 text-white py-2 text-sm">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="hidden md:flex items-center space-x-4">
              <span>📞 +1-555-0123</span>
              <span>✉️ info@yencodestore.com</span>
            </div>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/adminpanel/overview" className="hover:text-primary-200 transition-colors">
                  Admin panel
                </Link>
              )}
              {isAuthenticated && user?.role === 'vendor' && (
                <Link to="/vendor/dashboard" className="hover:text-primary-200 transition-colors">
                  Vendor portal
                </Link>
              )}
              <Link to="/profile" className="hover:text-primary-200 transition-colors">
                {isAuthenticated ? `Welcome, ${user?.name}` : 'My Account'}
              </Link>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="hover:text-primary-200 transition-colors">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="hover:text-primary-200 transition-colors">Login</Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/brand/mankatha-spices.png"
                alt="Mankatha Spices"
                className="h-12 md:h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart icon — opens drawer */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="lg:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:block border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                  <span className="font-medium">All Categories</span>
                  <ChevronDown size={16} />
                </button>
                {isCategoriesOpen && (
                  <div
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                    className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50"
                  >
                    {categoriesList.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${encodeURIComponent(category.slug)}`}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">Home</Link>
                <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors">All Products</Link>
                <Link to="/deals" className="text-gray-700 hover:text-primary-600 transition-colors">Deals</Link>
                <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">About</Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 py-4 space-y-5">
              {/* Navigation Links */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Navigation</span>
                <div className="space-y-1">
                  {['/', '/products', '/deals', '/about', '/contact'].map((path, i) => (
                    <Link
                      key={path}
                      to={path}
                      className="block text-gray-700 hover:text-primary-600 transition-colors py-1.5 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {['Home', 'All Products', 'Deals', 'About', 'Contact'][i]}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Categories</span>
                <div className="grid grid-cols-2 gap-2">
                  {categoriesList.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 p-2.5 rounded-lg bg-gray-50 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="truncate">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Links */}
              <div className="border-t border-gray-100 pt-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">My Account</span>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded inline-block">
                      {user?.name}
                    </div>
                    {user?.role === 'admin' && (
                      <Link
                        to="/adminpanel/overview"
                        className="block text-gray-700 hover:text-primary-600 py-1 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    {user?.role === 'vendor' && (
                      <Link
                        to="/vendor/dashboard"
                        className="block text-gray-700 hover:text-primary-600 py-1 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Vendor Portal
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="block text-gray-700 hover:text-primary-600 py-1 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block text-red-600 hover:underline py-1 font-medium text-left w-full"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block bg-primary-600 text-white text-center py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login / Register
                  </Link>
                )}
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
    </>
  );
};

export default Header;
