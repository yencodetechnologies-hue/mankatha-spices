import React from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import "../admin.css";

/**
 * Shell for /adminpanel/*. Child routes are declared in App.js so React Router
 * matches Products / Orders reliably via <Outlet />.
 */
const AdminPanelPage = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminPanelPage;
