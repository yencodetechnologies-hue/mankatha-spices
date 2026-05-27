import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MankathaBanner from "../../components/Brand/MankathaBanner";

const VendorDashboardPanel = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#3d2f26]">Welcome, {user?.name || "partner"}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          This vendor workspace uses the same secure login as the storefront. Connect your catalog and
          fulfilment flows here as you grow the Mankatha Spices network.
        </p>
      </div>

      <MankathaBanner variant="hero" className="shadow-md" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/vendor/products"
          className="rounded-xl border border-[#ede6dc] bg-[#fffefb] p-5 transition hover:border-[#c9a227]/50"
        >
          <h3 className="font-semibold text-primary-800">Create Distributor</h3>
          <p className="mt-1 text-sm text-gray-600">
            Open the full distributor onboarding form with legal, payment, and contact sections.
          </p>
        </Link>
        <Link
          to="/"
          className="rounded-xl border border-secondary-200 bg-white p-5 transition hover:border-primary-300"
        >
          <h3 className="font-semibold text-primary-700">View live store</h3>
          <p className="mt-1 text-sm text-gray-600">Open the customer site in a new context to review branding.</p>
        </Link>
      </div>
    </div>
  );
};

export default VendorDashboardPanel;
