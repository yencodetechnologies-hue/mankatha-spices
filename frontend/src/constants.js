export const COUNTRY_OPTIONS = [
  { country: "Sri Lanka", currency: "LKR", symbol: "Rs." },
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
      { id: "orders", label: "Orders", path: "orders", badge: 12 },
      { id: "products", label: "Products", path: "products" },
      { id: "customers", label: "Customers", path: "customers" },
      { id: "analytics", label: "Analytics", path: "analytics" },
    ],
  },
  {
    title: "MANAGE",
    items: [
      { id: "inventory", label: "Inventory", path: "inventory" },
      { id: "reviews", label: "Reviews", path: "reviews" },
      { id: "coupons", label: "Coupons", path: "coupons" },
      { id: "distributors", label: "Distributors", path: "distributors" },
      { id: "settings", label: "Settings", path: "settings" },
    ],
  },
];
