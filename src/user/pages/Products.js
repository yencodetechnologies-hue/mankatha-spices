import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, ChevronDown, X, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import products from '../../data/products.json';
import { formatMoney } from '../../utils/formatMoney';
import categories from '../../data/categories.json';
import { catalogApi } from '../api/catalogApi';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState(products);
  const { addToCart } = useCart();

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
      filtered = filtered.filter(product => product.category === categoryParam);
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
    const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    };

    return (
      <div className="product-card bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden group relative">
        {/* Animated Badge */}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xl font-bold text-primary-600">{formatMoney(product.price)}</span>
              {product.original_price > product.price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatMoney(product.original_price)}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.weight} {product.unit}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 ${
              isAdded 
                ? 'bg-primary-600 text-white' 
                : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg'
            }`}
          >
            {isAdded ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
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
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.slug}
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


