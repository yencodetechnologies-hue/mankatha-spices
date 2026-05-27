import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, Heart, Minus, Plus, ChevronDown, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import products from '../../data/products.json';
import { formatMoney } from '../../utils/formatMoney';
import categories from '../../data/categories.json';
import { catalogApi } from '../api/catalogApi';
import { categoryApi } from '../../api/categoryApi';
import { useWishlist } from '../../contexts/WishlistContext';
import heroBlendedMasala from '../../assets/hero_blended_masala.png';
import heroOrganicSpices from '../../assets/hero_organic_spices.png';
import heroWholeSpices from '../../assets/hero_whole_spices.png';
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
    herbs: "https://images.unsplash.com/photo-1515002246390-7bf7e8f87b54?w=400&h=300&fit=crop",
    "blended-masalas": heroBlendedMasala,
    "blended-masala": heroBlendedMasala
  };
  return images[slug] || heroOrganicSpices;
};


// ── Stable cart item key — uses slug so key is same for both JSON & API products ──
const makeVariantKey = (product, variantIndex) => {
  const baseId = product.slug || product._id || product.id || product.name || 'item';
  return `${baseId}||variant-${variantIndex}`;
};

// ProductCard uses useCart() directly — always-fresh cart state
const ProductCard = ({ product }) => {
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const hasVariants = product.pricing && product.pricing.length > 0 && product.pricing[0].weights && product.pricing[0].weights.length > 0;

  const variants = hasVariants ? product.pricing[0].weights.map(w => ({
    weight: w.weight,
    price: w.price,
    original_price: w.original_price || w.price,
    stock: w.stock !== undefined ? w.stock : product.stock
  })) : [{
    weight: `${product.weight || ''} ${product.unit || ''}`.trim() || '1 pc',
    price: product.price,
    original_price: product.original_price || product.price,
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

  // Always-fresh lookup from context
  const cartItem = cartItems.find(i => (i.cartItemId || i.id) === variantCartItemId);
  const qty = cartItem ? cartItem.quantity : 0;

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQty, setBulkQty] = useState(5);
  const [showDietTip, setShowDietTip] = useState(false);

  const handleAdd = () => addToCart({
    ...product,
    cartItemId: variantCartItemId,
    price: currentPrice,
    original_price: currentOriginalPrice,
    weight: currentVariant.weight,
    variantIndex: selectedVariantIndex
  }, 1);

  const handleIncrease = () => {
    if (qty === 0) { handleAdd(); return; }
    const nextQty = qty + 1;
    if (currentVariant.stock !== undefined && nextQty > currentVariant.stock) {
      alert(`Only ${currentVariant.stock} units available in stock`);
      return;
    }
    if (nextQty >= 5) { setBulkQty(nextQty); setBulkOpen(true); }
    else updateQuantity(variantCartItemId, nextQty);
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
    <div className="product-card bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden group relative">
      {/* Dietary Badge */}
      <div
        className="absolute top-2 right-2 z-20"
        onMouseEnter={() => setShowDietTip(true)}
        onMouseLeave={() => setShowDietTip(false)}
        style={{ cursor: 'default' }}
      >
        {product.dietaryPreference === 'non-vegetarian' ? (
          <div className="w-4 h-4 border-2 border-[#792C23] flex items-center justify-center bg-white rounded-sm shadow-sm">
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-[#792C23]"></div>
          </div>
        ) : (
          <div className="w-4 h-4 border-2 border-primary-500 flex items-center justify-center bg-white rounded-sm shadow-sm">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          </div>
        )}
        {showDietTip && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: '4px',
            background: '#1f2937', color: '#fff', fontSize: '10px',
            padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 50
          }}>
            {product.dietaryPreference === 'non-vegetarian' ? 'Non Veg' : 'Veg'}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="relative image-zoom h-32 md:h-48 cursor-pointer" onClick={() => window.location.href = `/product/${product.slug}`}>
        <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-2.5 md:p-4">
        <h3
          className="font-semibold text-gray-800 text-xs md:text-sm mb-1 md:mb-2 hover:text-primary-600 transition-colors line-clamp-2 cursor-pointer leading-tight"
          onClick={() => window.location.href = `/product/${product.slug}`}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
            ))}
          </div>
          <span className="text-[10px] text-gray-500 ml-1">({product.reviews_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5 md:gap-3">
              <div className="flex flex-col text-center">
                <span className="text-[9px] md:text-[11px] text-gray-500 mb-0.5">MRP</span>
                {currentOriginalPrice > currentPrice ? (
                  <span className="text-[10px] md:text-sm text-gray-500 line-through leading-none">{formatMoney(currentOriginalPrice)}</span>
                ) : (
                  <span className="text-[10px] md:text-sm text-transparent leading-none">-</span>
                )}
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] md:text-[11px] text-gray-800 mb-0.5">Mankatha</span>
                <span className="font-bold text-[13px] md:text-[17px] text-gray-900 leading-none">{formatMoney(currentPrice)}</span>
              </div>
            </div>
            <div className="text-[8px] md:text-[10px] text-gray-500 mt-0.5 italic">(Incl. taxes)</div>
          </div>
          {discount > 0 && (
            <div className="bg-green-50 text-green-700 px-1.5 py-1 md:px-3 md:py-1.5 rounded text-center flex flex-col justify-center border border-green-100">
              <span className="font-bold text-[10px] md:text-sm leading-tight">{formatMoney(currentOriginalPrice - currentPrice)}</span>
              <span className="text-[8px] md:text-xs font-semibold uppercase leading-tight">OFF</span>
            </div>
          )}
        </div>

        {/* Variant Dropdown */}
        <div className="relative w-full mb-2 md:mb-4">
          <select
            value={selectedVariantIndex}
            onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
            className="w-full border border-gray-200 rounded p-1.5 md:p-2 text-[10px] md:text-sm appearance-none bg-white cursor-pointer hover:border-primary-500 transition-colors focus:outline-none"
          >
            {variants.map((v, i) => (
              <option key={i} value={i}>{v.weight} - {formatMoney(v.price)}</option>
            ))}
          </select>
          <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown size={12} className="text-gray-400 md:w-4 md:h-4" />
          </div>
        </div>

        {/* Cart Control */}
        <div className="flex items-center gap-1 md:gap-2 w-full">
          <button
            onClick={() => toggleWishlist(product)}
            className={`border rounded w-7 h-7 md:w-[42px] md:h-[42px] flex items-center justify-center transition-colors bg-white flex-shrink-0 ${
              isInWishlist(product._id || product.id)
                ? "border-primary-400 text-primary-600 bg-primary-50/50"
                : "border-gray-300 text-gray-500 hover:text-primary-600 hover:border-primary-300"
            }`}
          >
            <Heart size={13} className={`md:w-5 md:h-5 ${isInWishlist(product._id || product.id) ? "fill-primary-500 text-primary-500" : ""}`} />
          </button>
          {currentVariant.stock <= 0 ? (
            <button
              disabled
              className="w-full h-7 md:h-[42px] flex items-center justify-center gap-1 bg-gray-400 text-white rounded font-bold uppercase tracking-wide cursor-not-allowed"
            >
              <ShoppingCart size={12} className="md:w-[18px] md:h-[18px]" />
              <span className="text-[9px] md:text-sm">Out of Stock</span>
            </button>
          ) : qty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full h-7 md:h-[42px] flex items-center justify-center gap-1 bg-primary-500 hover:bg-primary-600 text-white rounded font-bold uppercase tracking-wide transition-colors"
            >
              <ShoppingCart size={12} className="md:w-[18px] md:h-[18px]" />
              <span className="text-[9px] md:text-sm">Add to Cart</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 w-full">
              <div className="flex items-center border border-gray-300 rounded flex-1 h-7 md:h-[42px] overflow-hidden">
                <button onClick={handleDecrease} className="bg-gray-100 text-gray-600 w-7 md:w-12 h-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Minus size={12} className="md:w-4 md:h-4" />
                </button>
                <div className="flex-1 flex items-center justify-center font-bold text-gray-800 text-xs md:text-base">{qty}</div>
                <button
                  onClick={handleIncrease}
                  className={`w-7 md:w-12 h-full flex items-center justify-center transition-colors ${
                    currentVariant.stock !== undefined && qty >= currentVariant.stock
                      ? "bg-gray-300 text-gray-500 cursor-pointer"
                      : "bg-primary-500 text-white hover:bg-primary-600"
                  }`}
                >
                  <Plus size={12} className="md:w-4 md:h-4" />
                </button>
              </div>
              <button
                onClick={() => updateQuantity(variantCartItemId, 0)}
                className="border border-gray-300 rounded w-7 h-7 md:w-[42px] md:h-[42px] flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors bg-white flex-shrink-0"
              >
                <X size={12} className="md:w-5 md:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Bulk Popup */}
      {bulkOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setBulkOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '340px', maxWidth: '92vw', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', position: 'relative' }}>
            <button onClick={() => setBulkOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#374151' }}>✕</button>
            <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>Available in Bulk Quantity</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{product.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Enter Quantity</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Max: 99</div>
              </div>
              <input type="number" min={1} max={99} value={bulkQty} onChange={e => setBulkQty(e.target.value)}
                style={{ width: '80px', padding: '0.5rem 0.75rem', border: '1.5px solid #d1b97a', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, textAlign: 'center', background: '#fffbef', outline: 'none' }} />
            </div>
            <button onClick={handleBulkConfirm} style={{ width: '100%', padding: '0.85rem', background: '#6b9312', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
              ADD TO CART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState(products);
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
          <h1 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">All Products</h1>
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
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


