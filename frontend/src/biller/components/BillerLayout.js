import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Receipt, ShoppingCart, LogOut, Printer, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import MankathaBanner from "../../components/Brand/MankathaBanner";
import "../../admin.css";

const BillerLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-shell">
      <div 
        className={`admin-sidebar-overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={() => setIsSidebarOpen(false)}
        onMouseEnter={() => setIsSidebarOpen(false)}
      />
      <aside 
        className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="admin-brand">
          <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <MankathaBanner variant="strip" className="!rounded-none !border-0 !shadow-none" />
          </div>
          <h2 className="admin-logo">Mankatha Spices</h2>
          <p className="admin-subtitle">Biller portal</p>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-group">
            <p className="admin-nav-group-title">Menu</p>
            <ul>
              <li>
                <NavLink
                  to="/biller/dashboard"
                  className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                >
                  <LayoutDashboard size={18} strokeWidth={1.75} className="admin-nav-icon" aria-hidden />
                  <span className="admin-nav-label">Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/biller/orders"
                  className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                >
                  <ShoppingCart size={18} strokeWidth={1.75} className="admin-nav-icon" aria-hidden />
                  <span className="admin-nav-label">Billing Orders</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/biller/new-bill"
                  className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                >
                  <Receipt size={18} strokeWidth={1.75} className="admin-nav-icon" aria-hidden />
                  <span className="admin-nav-label">New Bill</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/biller/print"
                  className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                >
                  <Printer size={18} strokeWidth={1.75} className="admin-nav-icon" aria-hidden />
                  <span className="admin-nav-label">Print Bill</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-[#3d2f26]">
              <Receipt size={22} className="text-primary-600" aria-hidden />
              Biller workspace
            </h1>
          </div>
          <div className="topbar-right flex items-center gap-2">
            <span className="hidden text-sm text-gray-600 sm:inline">{user?.name}</span>
            <button className="admin-btn" type="button" onClick={onLogout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </section>
    </div>
  );
};

export default BillerLayout;
