import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Box,
  Users,
  BarChart3,
  Warehouse,
  MessageSquare,
  Ticket,
  Settings,
  Home,
  LogOut,
  Truck,
  Layers,
  Image,
  Sliders,
} from "lucide-react";
import { SIDEBAR_GROUPS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import MankathaBanner from "./Brand/MankathaBanner";

const ICON_MAP = {
  overview: LayoutDashboard,
  orders: Package,
  products: Box,
  customers: Users,
  analytics: BarChart3,
  inventory: Warehouse,
  reviews: MessageSquare,
  coupons: Ticket,
  distributors: Truck,
  settings: Settings,
  category: Layers,
  banners: Image,
  sliders: Sliders,
};


const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <MankathaBanner variant="strip" className="!rounded-none !border-0 !shadow-none" />
          </div>
          <h2 className="admin-logo">Mankatha Spices</h2>
          <p className="admin-subtitle">Admin dashboard</p>
        </div>
        <nav className="admin-nav">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.title} className="admin-nav-group">
              <p className="admin-nav-group-title">{group.title}</p>
              <ul>
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.id] || Package;
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={`/adminpanel/${item.path}`}
                        className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                      >
                        <Icon size={18} strokeWidth={1.75} className="admin-nav-icon" aria-hidden />
                        <span className="admin-nav-label">{item.label}</span>
                        {item.badge != null ? (
                          <span className="admin-nav-badge" aria-label={`${item.badge} notifications`}>
                            {item.badge}
                          </span>
                        ) : null}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="topbar-right flex items-center gap-2">
            <span className="hidden text-sm text-gray-600 sm:inline">{user?.name}</span>
            <Link
              to="/"
              className="icon-btn inline-flex items-center justify-center rounded-lg hover:bg-black/5"
              aria-label="View storefront"
              title="View storefront"
            >
              <Home size={18} />
            </Link>
            <button className="admin-btn" type="button" onClick={handleLogout}>
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

export default AdminLayout;
