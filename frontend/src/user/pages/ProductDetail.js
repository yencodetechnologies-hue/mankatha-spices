import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Share2, Truck, Shield, RefreshCw, Plus, Minus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import products from '../../data/products.json';
import { formatMoney } from '../../utils/formatMoney';
import { catalogApi } from '../api/catalogApi';

const ProductDetail = () => {
  const { slug } = useParams();
  const [allProducts, setAllProducts] = useState(products);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedWeight, setSelectedWeight] = useState("");
  const { addToCart } = useCart();

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
    const foundProduct = allProducts.find(p => p.slug === slug);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(0);
      
      // Default to first weight if available
      const weights = foundProduct.pricing?.[0]?.weights || [];
      if (weights.length > 0) {
        setSelectedWeight(weights[0].weight);
      } else {
        const wLabel = foundProduct.weight ? `${foundProduct.weight}${foundProduct.unit || "g"}` : "100g";
        setSelectedWeight(wLabel);
      }

      // Get related products from same category
      const related = allProducts
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [slug, allProducts]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Resolve active pricing details
  const activeCountryPricing = product.pricing?.[0] || { country: "India", currency: "INR", weights: [] };
  const weightsList = activeCountryPricing.weights || [];
  
  const fallbackWeightLabel = product.weight ? `${product.weight}${product.unit || "g"}` : "100g";
  const activeWeightObj = weightsList.find(w => w.weight === selectedWeight) || {
    weight: fallbackWeightLabel,
    price: product.price || 0
  };

  const currentPrice = activeWeightObj.price || product.price || 0;
  const originalPrice = Math.max(currentPrice, Math.round(currentPrice * 1.15));
  const activeCurrency = activeCountryPricing.currency || "INR";
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const handleAddToCart = () => {
    const numWeight = parseFloat(selectedWeight) || product.weight || 100;
    const unitStr = selectedWeight.toLowerCase().includes("kg") ? "kg" : "g";
    const cartItem = {
      ...product,
      cartItemId: `${product.id}-${selectedWeight}`,
      weight: numWeight,
      unit: unitStr,
      price: currentPrice,
      original_price: originalPrice,
    };
    addToCart(cartItem, quantity);
  };

  const incrementQuantity = () => {
    if (quantity < product.max_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > product.min_quantity) {
      setQuantity(quantity - 1);
    }
  };

  const RelatedProductCard = ({ relatedProduct }) => {
    const relatedDiscount = Math.round(((relatedProduct.original_price - relatedProduct.price) / relatedProduct.original_price) * 100);

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="relative">
          <Link to={`/product/${relatedProduct.slug}`}>
            <img
              src={relatedProduct.featured_image}
              alt={relatedProduct.name}
              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
          {relatedDiscount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{relatedDiscount}%
            </span>
          )}
        </div>
        <div className="p-3">
          <Link to={`/product/${relatedProduct.slug}`}>
            <h4 className="font-medium text-gray-800 mb-1 hover:text-primary-600 transition-colors line-clamp-2 text-sm">
              {relatedProduct.name}
            </h4>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-primary-600">{formatMoney(relatedProduct.price)}</span>
              {relatedProduct.original_price > relatedProduct.price && (
                <span className="text-xs text-gray-500 line-through ml-1">
                  {formatMoney(relatedProduct.original_price)}
                </span>
              )}
            </div>
            <button
              onClick={() => addToCart(relatedProduct, 1)}
              className="bg-primary-500 hover:bg-primary-600 text-white p-1 rounded transition-colors"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-gray-600 hover:text-primary-600">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden transition-colors ${
                    selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {discount > 0 && (
                <span className="inline-block bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold mb-2">
                  -{discount}% OFF
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {product.rating} ({product.reviews_count} reviews)
                </span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col mb-4">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-primary-600">
                    {formatMoney(currentPrice, { currency: activeCurrency })}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="text-xl text-gray-500 line-through ml-3">
                      {formatMoney(originalPrice, { currency: activeCurrency })}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 italic mt-1">(Inclusive of all taxes)</span>
              </div>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Truck size={16} className="mr-2 text-primary-500" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield size={16} className="mr-2 text-primary-500" />
                  100% Organic Certified
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RefreshCw size={16} className="mr-2 text-primary-500" />
                  30-day return policy
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📦</span>
                  In Stock ({product.stock} available)
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= product.min_quantity}
                  >
                    <Minus size={20} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= product.min_quantity && val <= product.max_quantity) {
                        setQuantity(val);
                      }
                    }}
                    className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                    min={product.min_quantity}
                    max={product.max_quantity}
                  />
                  <button
                    onClick={incrementQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.max_quantity}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex-1 max-w-[280px]">
                  <select
                    value={selectedWeight}
                    onChange={(e) => setSelectedWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer font-medium text-gray-700"
                  >
                    {weightsList.length > 0 ? (
                      weightsList.map((w) => {
                        const num = parseFloat(w.weight) || 1;
                        const rawUnit = w.weight.replace(/[0-9.\s]/g, "").toLowerCase();
                        
                        let baseValue = num;
                        let baseUnit = "g";
                        
                        if (rawUnit === "kg" || rawUnit === "kilogram") {
                          baseValue = num * 1000;
                          baseUnit = "g";
                        } else if (rawUnit === "mg" || rawUnit === "milligram") {
                          baseValue = num / 1000;
                          baseUnit = "g";
                        } else if (rawUnit === "l" || rawUnit === "liter" || rawUnit === "litre") {
                          baseValue = num * 1000;
                          baseUnit = "ml";
                        } else if (rawUnit === "ml" || rawUnit === "milliliter") {
                          baseValue = num;
                          baseUnit = "ml";
                        } else {
                          baseValue = num;
                          baseUnit = "g";
                        }
                        
                        const unitPrice = w.price / baseValue;
                        
                        const currencySymbols = { INR: "₹", LKR: "Rs.", AED: "AED", USD: "$" };
                        const curSymbol = currencySymbols[activeCurrency] || activeCurrency;
                        
                        let displayUnit = rawUnit;
                        if (rawUnit === "kilogram") displayUnit = "kg";
                        else if (rawUnit === "milligram") displayUnit = "mg";
                        else if (rawUnit === "liter" || rawUnit === "litre") displayUnit = "l";
                        else if (rawUnit === "milliliter") displayUnit = "ml";
                        else if (rawUnit === "gram") displayUnit = "g";
                        
                        const formattedWeight = `${num} ${displayUnit}`;
                        return (
                          <option key={w.weight} value={w.weight}>
                            {formattedWeight} ({curSymbol} {unitPrice.toFixed(2)} / 1 {baseUnit})
                          </option>
                        );
                      })
                    ) : (
                      <option value={fallbackWeightLabel}>
                        {product.weight} {product.unit || "g"}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart size={20} />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <RelatedProductCard key={relatedProduct.id} relatedProduct={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;


