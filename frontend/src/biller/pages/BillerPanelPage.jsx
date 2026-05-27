import React from "react";
import { Outlet } from "react-router-dom";
import BillerLayout from "../components/BillerLayout";

const BillerPanelPage = () => (
  <BillerLayout>
    <Outlet />
  </BillerLayout>
);

export default BillerPanelPage;
