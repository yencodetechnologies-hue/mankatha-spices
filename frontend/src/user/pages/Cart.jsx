import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatMoney } from '../../utils/formatMoney';
import { couponsApi } from '../../api/couponsApi';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart, appliedCoupon, applyCoupon, removeCoupon, getDiscountAmount } = useCart();
  const [couponCode, setCouponCode] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [applyingCoupon, setApplyingCoupon] = React.useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const shipping = getCartTotal() > 50 ? 0 : 5.99;
  const tax = getCartTotal() * 0.08;
  const discount = getDiscountAmount();
  const total = Math.max(0, getCartTotal() + shipping + tax - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await couponsApi.validateCoupon(couponCode, getCartTotal());
      applyCoupon(res.coupon);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
          <Link
            to="/products"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex gap-4">
                      <img
                        src={item.featured_image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <div>
                            <Link
                              to={`/product/${item.slug}`}
                              className="font-medium text-gray-800 hover:text-primary-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-500">{item.weight} {item.unit}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-3 py-1 border-x border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <span className="text-sm text-gray-600">
                              {formatMoney(item.price * item.quantity)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-lg">
                              {formatMoney(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatMoney(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : formatMoney(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatMoney(tax)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium flex items-center gap-1">
                      <Tag size={16} /> Discount ({appliedCoupon.code})
                    </span>
                    <span className="font-medium">-{formatMoney(discount)}</span>
                  </div>
                )}
                {getCartTotal() < 50 && (
                  <div className="text-sm text-primary-600 bg-primary-50 p-2 rounded">
                    Add {formatMoney(50 - getCartTotal())} more for free shipping!
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatMoney(total)}
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="border-t pt-4 mb-6">
                {!appliedCoupon ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <Tag size={16} />
                      {appliedCoupon.code} applied
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Remove coupon"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold text-center block transition-colors mb-4"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center block transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Security Badge */}
          
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

