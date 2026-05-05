const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { getOverview } = require("./controllers/overviewController");
const { getCustomers, getStats } = require("./controllers/customerController");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { getReviewStats, getReviews, approveReview, deleteReview } = require("./controllers/reviewController");
const { getInventory, postReorder, postBulkRestock } = require("./controllers/inventoryController");
const { getCouponStats, getCoupons, createCoupon, updateCoupon } = require("./controllers/couponController");
const { getSettings, putSettings, patchSettings } = require("./controllers/settingsController");
const authRoutes = require("./routes/authRoutes");
const { requireAuth, requireRoles } = require("./middleware/auth");
const distributorRoutes = require("./routes/distributorRoutes");

dotenv.config();

const app = express();

const adminOnly = [requireAuth, requireRoles("admin")];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
/** Store settings — register early so nothing can shadow `/api/settings`. */
app.get("/api/settings", ...adminOnly, getSettings);
app.put("/api/settings", ...adminOnly, putSettings);
app.patch("/api/settings", ...adminOnly, patchSettings);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    message: "SpiceEmpire API running",
    serverMeta: { bundle: "react-frontend/backend" },
    routes: {
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      overview: "/api/overview",
      customers: "/api/customers",
      analytics: "/api/analytics",
      inventory: "/api/products/inventory",
      reviews: "/api/reviews",
      coupons: "/api/coupons",
      settings: "/api/settings",
      distributors: "/api/distributors",
    },
  });
});
/** Coupons first (single GET returns list + stats) — register before other `/api/*` handlers. */
app.get("/api/coupons/stats", ...adminOnly, getCouponStats);
app.get("/api/coupons", ...adminOnly, getCoupons);
app.post("/api/coupons", ...adminOnly, createCoupon);
app.put("/api/coupons/:id", ...adminOnly, updateCoupon);
/** Reviews on `app` (same pattern as `/api/overview`) so routes always match after restart. */
app.get("/api/reviews/stats", ...adminOnly, getReviewStats);
app.get("/api/reviews", ...adminOnly, getReviews);
app.patch("/api/reviews/:id/approve", ...adminOnly, approveReview);
app.post("/api/reviews/:id/approve", ...adminOnly, approveReview);
app.delete("/api/reviews/:id", ...adminOnly, deleteReview);
/** Inventory must register before `app.use("/api/products", …)` so these paths are not swallowed by the router. */
app.get("/api/products/inventory", ...adminOnly, getInventory);
app.post("/api/products/inventory/reorder/:id", ...adminOnly, postReorder);
app.post("/api/products/inventory/restock-bulk", ...adminOnly, postBulkRestock);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
/** Register on `app` so these GET routes always match (same pattern as `/api/overview`). */
app.get("/api/overview", ...adminOnly, getOverview);
app.use("/api/analytics", analyticsRoutes);
app.get("/api/customers/stats", ...adminOnly, getStats);
app.get("/api/customers", ...adminOnly, getCustomers);
app.use("/api/distributors", distributorRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found", path: req.path, method: req.method });
});

app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log("Admin API: /api/overview, /api/settings, /api/coupons, /api/reviews, /api/products/inventory, /api/customers, …");
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Another backend instance is already running. Stop it first, then restart.`
        );
        return;
      }
      console.error("Server startup error", error);
    });
  })
  .catch((error) => {
    console.error("DB connection failed", error);
    process.exit(1);
  });
