import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import CartNotification from './components/Notifications/CartNotification';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Deals from './pages/Deals';
import Contact from './pages/Contact';
import AdminPanelPage from './admin/pages/AdminPanelPage';
import './index.css';

function AppContent() {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    productName: ''
  });
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/adminpanel');

  useEffect(() => {
    const handleCartNotification = (event) => {
      setNotification(event.detail);
    };

    window.addEventListener('cartNotification', handleCartNotification);
    return () => window.removeEventListener('cartNotification', handleCartNotification);
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {!isAdminPanel && <Header />}
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
            <Route path="/adminpanel" element={<AdminPanelPage />} />
          </Routes>
        </main>
        {!isAdminPanel && <Footer />}
      </div>

      {!isAdminPanel && (
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
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
