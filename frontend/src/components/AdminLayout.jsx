import React, { useState } from "react";
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
  Menu,
  Store,
  Receipt,
} from "lucide-react";
import { SIDEBAR_GROUPS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import MankathaBanner from "./Brand/MankathaBanner";
import { angadi_logo } from "../assets";

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
  general: Store,
  settings: Settings,
  category: Layers,
  banners: Image,
  sliders: Sliders,
  new_bill: Receipt,
};


const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <div 
        className={`admin-sidebar-overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside 
        className={`admin-sidebar sticky-sidebar ${isSidebarOpen ? "open" : ""}`}
      >
        <div className="admin-brand">
          <div className="mb-3 overflow-hidden rounded-xl bg-white shadow-sm flex justify-center items-center p-2">
            <img src={angadi_logo} alt="Angadi Logo" className="w-full h-auto max-h-32 object-contain" />
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
                        onClick={() => setIsSidebarOpen(false)}
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

        {/* Logout pinned at bottom of sidebar */}
        <div style={{ padding: "1rem 1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              width: "100%", padding: "0.65rem 0.85rem",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", color: "rgba(255,255,255,0.75)",
              fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
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
