import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Truck, LogOut, Store } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import MankathaBanner from "../../components/Brand/MankathaBanner";
import "../../admin.css";

const VendorLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <MankathaBanner variant="strip" className="!rounded-none !border-0 !shadow-none" />
          </div>
          <h2 className="admin-logo">Mankatha Spices</h2>
          <p className="admin-subtitle">Vendor portal</p>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-group">
            <p className="admin-nav-group-title">Menu</p>
            <ul>
              <li>
                <NavLink
                  to="/vendor/dashboard"
                  className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                >
                  <LayoutDashboard size={18} strokeWidth={1.75} className="admin-nav-icon" aria-hidden />
                  <span className="admin-nav-label">Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/vendor/products"
                  className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                >
                  <Truck size={18} strokeWidth={1.75} className="admin-nav-icon" aria-hidden />
                  <span className="admin-nav-label">Create Distributor</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="flex items-center gap-2 text-lg font-semibold text-[#3d2f26]">
              <Store size={22} className="text-primary-600" aria-hidden />
              Vendor workspace
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

export default VendorLayout;
