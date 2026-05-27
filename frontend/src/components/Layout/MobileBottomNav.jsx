import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const tabs = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/products', icon: ShoppingBag, label: 'Shop' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { to: '/profile', icon: User, label: 'Account' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-md border-t border-gray-100"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map(({ to, icon: Icon, label, badge }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 relative transition-all duration-200"
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-primary-100' : ''}`}>
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${active ? 'text-primary-600' : 'text-gray-400'}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${active ? 'text-primary-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
