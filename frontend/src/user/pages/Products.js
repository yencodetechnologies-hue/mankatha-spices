import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, Heart, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import products from '../../data/products.json';
import { formatMoney } from '../../utils/formatMoney';
import categories from '../../data/categories.json';
import { catalogApi } from '../api/catalogApi';
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

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState(products);
  const { addToCart, updateQuantity, items: cartItems } = useCart();
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
        if (!cancelled && apiProducts.length > 0) {
          setAllProducts(apiProducts);
        }
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
    let filtered = [...allProducts];

    // Filter by search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      filtered = filtered.filter(product =>
        String(product.category || "").toLowerCase() === categoryParam.toLowerCase()
      );
      setSelectedCategory(categoryParam);
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort products
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [allProducts, searchParams, sortBy, priceRange]);

  const ProductCard = ({ product }) => {
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
      <div className="product-card bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden group relative">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce shadow-lg">
              -{discount}%
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-2">
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-50 transition-colors transform hover:scale-110">
            <Heart size={18} className="text-gray-600 hover:text-red-500" />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative image-zoom h-48 cursor-pointer" onClick={() => window.location.href = `/product/${product.slug}`}>
          <img
            src={product.featured_image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3
            className="font-semibold text-gray-800 mb-2 hover:text-primary-600 transition-colors line-clamp-2 cursor-pointer group-hover:text-primary-600"
            onClick={() => window.location.href = `/product/${product.slug}`}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.reviews_count})</span>
          </div>

          {/* Price and Weight */}
          <div className="flex items-center justify-between mb-4" style={{minWidth:0}}>
            <div style={{minWidth:0, overflow:'hidden'}}>
              <span className="text-xl font-bold text-primary-600" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%',display:'block'}}>{formatMoney(product.price)}</span>
              {product.original_price > product.price && (
                <span className="text-sm text-gray-500 line-through ml-2" style={{whiteSpace:'nowrap'}}>
                  {formatMoney(product.original_price)}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full" style={{whiteSpace:'nowrap',flexShrink:0,marginLeft:'0.5rem'}}>
              {product.weight} {product.unit}
            </span>
          </div>

          {/* D-Mart style cart control */}
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg"
            >
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full">
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

              <div style={{
                flex: 1, height: '40px', background: '#6b9312', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1rem'
              }}>
                {qty}
              </div>

              <button
                onClick={handleIncrease}
                style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: '#6b9312', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}
                aria-label="Increase"
              >
                <Plus size={16} color="#fff" />
              </button>
            </div>
          )}
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
              <button
                onClick={() => setBulkOpen(false)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '1.2rem', color: '#374151', lineHeight: 1
                }}
              >✕</button>
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
                  min={1} max={99}
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

  const handleCategoryChange = (categorySlug) => {
    const newParams = new URLSearchParams(searchParams);
    if (categorySlug) {
      newParams.set('category', categorySlug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
    setSelectedCategory(categorySlug);
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
  };

  const clearFilters = () => {
    setPriceRange({ min: 0, max: 100 });
    setSelectedCategory('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchParams.get('search') || ''}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    newParams.set('search', e.target.value);
                  } else {
                    newParams.delete('search');
                  }
                  setSearchParams(newParams);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64`}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={!selectedCategory}
                      onChange={() => handleCategoryChange('')}
                      className="mr-2"
                    />
                    <span>All Categories</span>
                  </label>
                  {categoriesList.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory?.toLowerCase() === category.slug?.toLowerCase()}
                        onChange={() => handleCategoryChange(category.slug)}
                        className="mr-2"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Min: {formatMoney(priceRange.min)}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max: {formatMoney(priceRange.max)}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {allProducts.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;


