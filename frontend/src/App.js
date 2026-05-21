import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import CartNotification from './components/Notifications/CartNotification';
import Home from './user/pages/Home';
import Products from './user/pages/Products';
import ProductDetail from './user/pages/ProductDetail';
import Cart from './user/pages/Cart';
import Checkout from './user/pages/Checkout';
import Profile from './user/pages/Profile';
import Login from './user/pages/Login';
import Register from './user/pages/Register';
import About from './user/pages/About';
import Deals from './user/pages/Deals';
import Contact from './user/pages/Contact';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminProductsPanel from './pages/AdminProductsPanel';
import AdminOrdersPanel from './pages/AdminOrdersPanel';
import AdminPlaceholderPanel from './pages/AdminPlaceholderPanel';
import AdminOverviewPanel from './pages/AdminOverviewPanel';
import AdminCustomersPanel from './pages/AdminCustomersPanel';
import AdminAnalyticsPanel from './pages/AdminAnalyticsPanel';
import AdminInventoryPanel from './pages/AdminInventoryPanel';
import AdminReviewsPanel from './pages/AdminReviewsPanel';
import AdminCouponsPanel from './pages/AdminCouponsPanel';
import AdminSettingsPanel from './pages/AdminSettingsPanel';
import AdminDistributorsPanel from './pages/AdminDistributorsPanel';
import AdminCategoryPanel from './pages/AdminCategoryPanel';
import { SIDEBAR_GROUPS } from './constants';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import VendorPanelPage from './vendor/pages/VendorPanelPage';
import VendorDashboardPanel from './vendor/pages/VendorDashboardPanel';
import VendorProductsPanel from './vendor/pages/VendorProductsPanel';
import BillerPanelPage from './biller/pages/BillerPanelPage';
import BillerDashboardPanel from './biller/pages/BillerDashboardPanel';
import BillerNewBillPanel from './biller/pages/BillerNewBillPanel';
import BillerPlaceholderPanel from './biller/pages/BillerPlaceholderPanel';
import './index.css';

const adminPlaceholderRoutes = SIDEBAR_GROUPS.flatMap((g) => g.items)
  .filter(
    (item) =>
      item.path !== 'products' &&
      item.path !== 'orders' &&
      item.path !== 'overview' &&
      item.path !== 'customers' &&
      item.path !== 'analytics' &&
      item.path !== 'inventory' &&
      item.path !== 'reviews' &&
      item.path !== 'coupons' &&
      item.path !== 'distributors' &&
      item.path !== 'settings' &&
      item.path !== 'category'
  )
  .map((item) => (
    <Route
      key={item.path}
      path={item.path}
      element={<AdminPlaceholderPanel title={item.label} />}
    />
  ));

function AppContent() {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    productName: ''
  });
  const location = useLocation();
  const isStaffPortal =
    location.pathname.startsWith('/adminpanel') ||
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/biller');

  useEffect(() => {
    const handleCartNotification = (event) => {
      setNotification(event.detail);
    };

    window.addEventListener('cartNotification', handleCartNotification);
    return () => window.removeEventListener('cartNotification', handleCartNotification);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {!isStaffPortal && <Header />}
        <main className="flex-grow page-transition">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/adminpanel"
              element={
                <ProtectedRoute>
                  <AdminPanelPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/adminpanel/overview" replace />} />
              <Route path="overview" element={<AdminOverviewPanel />} />
              <Route path="products" element={<AdminProductsPanel />} />
              <Route path="orders" element={<AdminOrdersPanel />} />
              <Route path="customers" element={<AdminCustomersPanel />} />
              <Route path="analytics" element={<AdminAnalyticsPanel />} />
              <Route path="inventory" element={<AdminInventoryPanel />} />
              <Route path="reviews" element={<AdminReviewsPanel />} />
              <Route path="coupons" element={<AdminCouponsPanel />} />
              <Route path="distributors" element={<AdminDistributorsPanel />} />
              <Route path="settings" element={<AdminSettingsPanel />} />
              <Route path="category" element={<AdminCategoryPanel />} />
              {adminPlaceholderRoutes}
            </Route>
            <Route
              path="/vendor"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorPanelPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/vendor/dashboard" replace />} />
              <Route path="dashboard" element={<VendorDashboardPanel />} />
              <Route path="products" element={<VendorProductsPanel />} />
            </Route>
            <Route
              path="/biller"
              element={
                <ProtectedRoute allowedRoles={['biller']}>
                  <BillerPanelPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/biller/dashboard" replace />} />
              <Route path="dashboard" element={<BillerDashboardPanel />} />
              <Route path="orders" element={<BillerPlaceholderPanel title="Orders" />} />
              <Route path="new-bill" element={<BillerNewBillPanel />} />
              <Route path="print" element={<BillerPlaceholderPanel title="Print Bill" />} />
            </Route>
          </Routes>
        </main>
        {!isStaffPortal && <Footer />}
      </div>

      {!isStaffPortal && (
        <CartNotification
          show={notification.show}
          message={notification.message}
          productName={notification.productName}
          onClose={() => setNotification({ show: false, message: '', productName: '' })}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <AppContent />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

