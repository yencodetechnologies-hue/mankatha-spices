import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import MobileBottomNav from './components/Layout/MobileBottomNav';
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

import AdminOverviewPanel from './pages/AdminOverviewPanel';
import AdminCustomersPanel from './pages/AdminCustomersPanel';
import AdminAnalyticsPanel from './pages/AdminAnalyticsPanel';
import AdminInventoryPanel from './pages/AdminInventoryPanel';
import AdminReviewsPanel from './pages/AdminReviewsPanel';
import AdminCouponsPanel from './pages/AdminCouponsPanel';
import AdminSettingsPanel from './pages/AdminSettingsPanel';
import AdminBannersPanel from './pages/AdminBannersPanel';
import AdminSlidersPanel from './pages/AdminSlidersPanel';
import AdminDistributorsPanel from './pages/AdminDistributorsPanel';
import AdminGeneralPanel from './pages/AdminGeneralPanel';
import AdminCategoryPanel from './pages/AdminCategoryPanel';
import AdminBillersPanel from './pages/AdminBillersPanel';
import AdminBillingOrdersPanel from './pages/AdminBillingOrdersPanel';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import VendorPanelPage from './vendor/pages/VendorPanelPage';
import VendorDashboardPanel from './vendor/pages/VendorDashboardPanel';
import VendorProductsPanel from './vendor/pages/VendorProductsPanel';
import BillerPanelPage from './biller/pages/BillerPanelPage';
import BillerDashboardPanel from './biller/pages/BillerDashboardPanel';
import BillerNewBillPanel from './biller/pages/BillerNewBillPanel';
import BillerOrdersPanel from './biller/pages/BillerOrdersPanel';
import CareApp from './App.jsx';
import CareRoot from './routes/routes/root.jsx';
import CareAbout from './routes/routes/About.jsx';
import CareContact from './routes/routes/Contact.jsx';
import CareVolonteer from './routes/routes/Volonteer.jsx';
import CareCareer from './routes/routes/Career.jsx';
import CareServices from './routes/routes/Services_m.jsx';
import CareDonate from './routes/routes/Donate.jsx';
import './index.css';

function AppContent() {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    productName: ''
  });
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isStaffPortal =
    path === '/' ||
    path.startsWith('/care') ||
    path.startsWith('/adminpanel') ||
    path.startsWith('/vendor') ||
    path.startsWith('/biller') ||
    (path.startsWith('/mankathaspecies') && path !== '/mankathaspecies');

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
            <Route path="/" element={<CareRoot />}>
              <Route index element={<CareApp />} />
            </Route>
            <Route path="/mankathaspecies" element={<Home />} />
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
              <Route path="billers" element={<AdminBillersPanel />} />
              <Route path="billing-orders" element={<AdminBillingOrdersPanel />} />
              <Route path="products" element={<AdminProductsPanel />} />
              <Route path="orders" element={<AdminOrdersPanel />} />
              <Route path="customers" element={<AdminCustomersPanel />} />
              <Route path="analytics" element={<AdminAnalyticsPanel />} />
              <Route path="inventory" element={<AdminInventoryPanel />} />
              <Route path="reviews" element={<AdminReviewsPanel />} />
              <Route path="coupons" element={<AdminCouponsPanel />} />
              <Route path="distributors" element={<AdminDistributorsPanel />} />
              <Route path="general" element={<AdminGeneralPanel />} />
              <Route path="settings" element={<AdminSettingsPanel />} />
              <Route path="banners" element={<AdminBannersPanel />} />
              <Route path="sliders" element={<AdminSlidersPanel />} />
              <Route path="category" element={<AdminCategoryPanel />} />
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
              <Route path="orders" element={<BillerOrdersPanel />} />
              <Route path="new-bill" element={<BillerNewBillPanel />} />
            </Route>
            <Route path="/Care" element={<CareRoot />}>
              <Route path="about" element={<CareAbout />} />
              <Route path="contact" element={<CareContact />} />
              <Route path="services" element={<CareServices />} />
              <Route path="volunteer" element={<CareVolonteer />} />
              <Route path="Careerr" element={<CareCareer />} />
              <Route path="donate" element={<CareDonate />} />
            </Route>
          </Routes>
        </main>
        {!isStaffPortal && <Footer />}
        {!isStaffPortal && <MobileBottomNav />}
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
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

