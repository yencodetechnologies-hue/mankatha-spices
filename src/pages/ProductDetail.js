import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Share2, Truck, Shield, RefreshCw, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import products from '../data/products.json';
import vendors from '../data/vendors.json';
import { formatMoney } from '../utils/formatMoney';
import { catalogApi } from '../api/catalogApi';

const ProductDetail = () => {
  const { slug } = useParams();
  const [allProducts, setAllProducts] = useState(products);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
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

  const vendor = vendors.find(v => v.id === product.vendor_id);
  const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);

  const handleAddToCart = () => {
    addToCart(product, quantity);
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
              <div className="flex items-center mb-4">
                <span className="text-3xl font-bold text-primary-600">{formatMoney(product.price)}</span>
                {product.original_price > product.price && (
                  <span className="text-xl text-gray-500 line-through ml-3">
                    {formatMoney(product.original_price)}
                  </span>
                )}
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
                <span className="text-sm text-gray-600">
                  {product.weight} {product.unit}
                </span>
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
