export const COUNTRY_OPTIONS = [
  { country: "United Kingdom", currency: "GBP", symbol: "£" },
  { country: "India", currency: "INR", symbol: "\u20b9" },
  { country: "UAE", currency: "AED", symbol: "AED" },
  { country: "USA", currency: "USD", symbol: "$" },
];

export const WEIGHT_OPTIONS = ["100g", "250g", "500g", "1kg"];

export const CATEGORY_OPTIONS = [
  "Whole Spices",
  "Ground Spices",
  "Blended Masala",
  "Herbs",
  "Seasoning",
];

/** Sidebar nav: `path` is the segment under `/adminpanel/`. */
export const SIDEBAR_GROUPS = [
  {
    title: "MAIN",
    items: [
      { id: "overview", label: "Overview", path: "overview" },
      { id: "billers", label: "Billing Orders", path: "billers" },
      // { id: "distributors", label: "Vendors", path: "distributors" },
      // { id: "general", label: "General", path: "general" },
      { id: "inventory", label: "Inventory", path: "inventory" },
      { id: "category", label: "Category", path: "category" },
      { id: "products", label: "Products", path: "products" },
      { id: "orders", label: "Online Billing", path: "orders" },
      { id: "customers", label: "Customers", path: "customers" },
    ],
  },
  {
    title: "MANAGE",
    items: [
      { id: "coupons", label: "Coupons", path: "coupons" },
      { id: "analytics", label: "Analytics", path: "analytics" },
      { id: "settings", label: "Settings", path: "settings" },
      { id: "banners", label: "Banners", path: "banners" },
      { id: "sliders", label: "Sliders", path: "sliders" },
      { id: "reviews", label: "Reviews", path: "reviews" },
    ],
  },
];

