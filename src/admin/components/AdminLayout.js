import React from "react";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import { SIDEBAR_ITEMS } from "../constants";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">SpiceEmpire</h2>
        <ul>
          {SIDEBAR_ITEMS.map((item) => (
            <li key={item} className={item === "Products" ? "active" : ""}>
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" type="button" aria-label="cart">
              <ShoppingCart size={18} />
            </button>
            <button className="admin-btn" type="button">
              <ShieldCheck size={16} />
              Admin
            </button>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </section>
    </div>
  );
};

export default AdminLayout;
