import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, Tag, Trash2, Eye, EyeOff } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatMoney } from '../../utils/formatMoney';
import { authApi } from '../api/authApi';
import { couponsApi } from '../../api/couponsApi';
import { orderApi } from '../../api/orderApi';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart, appliedCoupon, applyCoupon, removeCoupon, getDiscountAmount } = useCart();
  const { user, loginWithSession } = useAuth();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const savedAppCity = localStorage.getItem("appCity") || "";
  const savedAppPincode = localStorage.getItem("appPincode") || "";
  const regionName = savedAppCity.includes(',') ? savedAppCity.split(',').slice(1).join(',').trim() : savedAppCity;

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: regionName || '',
    city: '',
    state: '',
    zipCode: savedAppPincode || '',
    country: 'United Kingdom'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bankInfo, setBankInfo] = useState({
    userBankName: '',
    transactionRef: '',
    slipFileName: ''
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

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

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section === 'shipping') {
      setShippingInfo(prev => ({ ...prev, [name]: value }));
    } else {
      setPaymentInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    setOrderError('');

    try {
      let slipUrl = undefined;
      if (paymentMethod === 'bank' && bankInfo.slipFile) {
        const uploadRes = await orderApi.uploadFile(bankInfo.slipFile);
        slipUrl = uploadRes.url;
      }

      const payload = {
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        password: shippingInfo.password,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        total: total,
        payment: paymentMethod === 'card' ? 'Paid' : 'Pending',
        paymentMethod: paymentMethod === 'card' ? 'Card' : 'Bank Transfer',
        status: paymentMethod === 'card' ? 'Confirmed' : 'Pending',
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: discount,
        itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
        lineItems: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'Whole Spices'
        })),
        slipUrl: slipUrl,
        userBankName: paymentMethod === 'bank' ? bankInfo.userBankName : undefined,
        transactionRef: paymentMethod === 'bank' ? bankInfo.transactionRef : undefined
      };

      const response = await orderApi.createOrder(payload);
      
      setPlacedOrderDetails({
        orderId: response?.orderId || 'PENDING',
        items: [...items],
        total: total,
        customerName: payload.customerName
      });

      setOrderPlaced(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      clearCart();
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleAutoLogin = async () => {
    if (user) {
      navigate('/profile?tab=orders');
      return;
    }
    if (shippingInfo.email && shippingInfo.password) {
      try {
        const { token, user: nextUser } = await authApi.login(
          shippingInfo.email,
          shippingInfo.password
        );
        loginWithSession(token, nextUser);
        navigate('/profile?tab=orders');
      } catch (err) {
        // If auto-login fails, fallback to manual login page
        navigate('/login', { state: { from: '/profile?tab=orders' } });
      }
    } else {
      navigate('/login', { state: { from: '/profile?tab=orders' } });
    }
  };

  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h2>
            <p className="text-gray-500 mt-2">Order #{placedOrderDetails.orderId}</p>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-lg mb-4">Order Details</h3>
            <div className="space-y-4 mb-6">
              {placedOrderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-gray-500 ml-2">x {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{formatMoney(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center font-bold text-lg">
              <span>Total Paid</span>
              <span className="text-primary-600">{formatMoney(placedOrderDetails.total)}</span>
            </div>
          </div>
          <div className="mt-8 text-center flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={handleAutoLogin}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
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
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Truck size={20} className="mr-2 text-primary-500" />
                  <h2 className="text-xl font-semibold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={shippingInfo.password}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        placeholder="To create an account"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <CreditCard size={20} className="mr-2 text-primary-500" />
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                </div>

                {/* Switcher Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-4 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    💳 Card Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`py-3 px-4 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    🏦 Bank Transfer
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        placeholder="1234 5678 9012 3456"
                        required={paymentMethod === 'card'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        placeholder="John Doe"
                        required={paymentMethod === 'card'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => handleInputChange(e, 'payment')}
                          placeholder="MM/YY"
                          required={paymentMethod === 'card'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => handleInputChange(e, 'payment')}
                          placeholder="123"
                          required={paymentMethod === 'card'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bank Transfer Details Display */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2.5">
                      <h3 className="font-bold text-gray-800 text-sm border-b pb-1.5 flex items-center gap-1.5 text-primary-700">
                        <span>Our Bank Details</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <span className="text-gray-500 font-medium">Bank Name:</span>
                        <span className="font-semibold text-gray-800">Mankatha Commercial Bank</span>

                        <span className="text-gray-500 font-medium">Account Name:</span>
                        <span className="font-semibold text-gray-800">Mankatha Spices Pvt Ltd</span>

                        <span className="text-gray-500 font-medium">Account Number:</span>
                        <span className="font-bold text-primary-600">1002 4589 1256</span>

                        <span className="text-gray-500 font-medium">Branch:</span>
                        <span className="font-semibold text-gray-800">London Main (UK)</span>

                        <span className="text-gray-500 font-medium">SWIFT / BIC:</span>
                        <span className="font-semibold text-gray-800">MANKLK2X</span>
                      </div>
                      <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded p-2 font-medium mt-2">
                        ⚠️ Please transfer the exact order amount to the bank account above, then fill in your payment details below.
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankInfo.userBankName}
                          onChange={(e) => setBankInfo(prev => ({ ...prev, userBankName: e.target.value }))}
                          placeholder="e.g. Bank of Ceylon / Hatton National Bank"
                          required={paymentMethod === 'bank'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transaction Reference / Slip ID
                        </label>
                        <input
                          type="text"
                          value={bankInfo.transactionRef}
                          onChange={(e) => setBankInfo(prev => ({ ...prev, transactionRef: e.target.value }))}
                          placeholder="e.g. TXN987654321"
                          required={paymentMethod === 'bank'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Deposit Slip / Passbook Photo
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 hover:bg-gray-50/50 transition-all cursor-pointer relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setBankInfo(prev => ({ ...prev, slipFileName: e.target.files[0].name, slipFile: e.target.files[0] }));
                              }
                            }}
                            required={paymentMethod === 'bank'}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="space-y-1 text-center">
                            <span className="text-3xl inline-block mb-1">📂</span>
                            <div className="flex text-sm text-gray-600 justify-center">
                              <span className="font-semibold text-primary-600 hover:text-primary-500">
                                Click to upload passbook copy
                              </span>
                              <p className="pl-1 text-gray-500">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            {bankInfo.slipFileName ? (
                              <div className="text-sm font-bold text-green-600 mt-2 bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-flex items-center gap-1.5 animate-fadeIn">
                                <span>📎 {bankInfo.slipFileName}</span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-red-500 font-medium mt-1">* This file copy is required for bank verification</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {orderError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  {orderError}
                </div>
              )}
              <button
                type="submit"
                disabled={placingOrder}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {placingOrder ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
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
              </div>

              {/* Coupon Section */}
              <div className="border-t pt-4 mb-4">
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

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatMoney(total)}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

