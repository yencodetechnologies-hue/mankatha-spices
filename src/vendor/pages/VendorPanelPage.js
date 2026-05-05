import React from "react";
import { Outlet } from "react-router-dom";
import VendorLayout from "../components/VendorLayout";

const VendorPanelPage = () => (
  <VendorLayout>
    <Outlet />
  </VendorLayout>
);

export default VendorPanelPage;
