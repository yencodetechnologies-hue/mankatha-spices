const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config()
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { getOverview } = require("./controllers/overviewController");
const { getCustomers, getStats } = require("./controllers/customerController");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { getReviewStats, getReviews, approveReview, deleteReview, createReview } = require("./controllers/reviewController");
const { getInventory, postReorder, postBulkRestock } = require("./controllers/inventoryController");
const { getCouponStats, getCoupons, createCoupon, updateCoupon, validateCoupon, deleteCoupon } = require("./controllers/couponController");
const { getSettings, putSettings, patchSettings } = require("./controllers/settingsController");
const authRoutes = require("./routes/authRoutes");
const { requireAuth, requireRoles } = require("./middleware/auth");
const distributorRoutes = require("./routes/distributorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

/** CORS: allow CLIENT_ORIGIN (from .env) plus local CRA dev when not in production. */
function corsOriginCallback() {
  const fromEnv = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const devOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ];
  const prodOrigins = [
    "https://mankatha-spices.vercel.app",
    "https://mankathaspi.octosofttechnologies.in"
  ];
  const allowed = [...new Set([...devOrigins, ...prodOrigins, ...fromEnv])].map(
    (origin) => origin.replace(/\/$/, "")
  );
  if (allowed.length === 0) return true;
  return (origin, cb) => {
    if (!origin) return cb(null, true);
    const normalized = origin.replace(/\/$/, "");
    if (allowed.includes(normalized)) return cb(null, true);
    // Allow all Vercel preview/production deployments
    if (normalized.endsWith(".vercel.app") || /^https?:\/\/[a-zA-Z0-9-]+\.vercel\.app$/i.test(normalized)) {
      return cb(null, true);
    }
    cb(null, false);
  };
}

const adminOnly = [requireAuth]; // Temporarily bypassed admin role check for testing

app.use(cors({ origin: corsOriginCallback(), credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
/** Store settings — register early so nothing can shadow `/api/settings`. */
app.get("/api/settings", getSettings);
app.put("/api/settings", ...adminOnly, putSettings);
app.patch("/api/settings", ...adminOnly, patchSettings);
const requestIp = require("request-ip");
const geoip = require("geoip-country");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/location", (req, res) => {
  const ip = requestIp.getClientIp(req);
  const geo = geoip.lookup(ip);

  let currency = "INR";
  let amount = 1000;

  if (geo && geo.country === "GB") {
    currency = "GBP";
    amount = 15;
  }

  if (geo && geo.country === "US") {
    currency = "USD";
    amount = 20;
  }

  res.json({
    ip,
    country: geo?.country,
    currency,
    amount
  });
});

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
app.post("/api/coupons/validate", validateCoupon); // No auth needed to check coupon validity
app.get("/api/coupons/stats", ...adminOnly, getCouponStats);
app.get("/api/coupons", ...adminOnly, getCoupons);
app.post("/api/coupons", ...adminOnly, createCoupon);
app.put("/api/coupons/:id", ...adminOnly, updateCoupon);
app.delete("/api/coupons/:id", ...adminOnly, deleteCoupon);
/** Reviews on `app` (same pattern as `/api/overview`) so routes always match after restart. */
app.get("/api/reviews/stats", ...adminOnly, getReviewStats);
app.get("/api/reviews", ...adminOnly, getReviews);
app.patch("/api/reviews/:id/approve", ...adminOnly, approveReview);
app.post("/api/reviews/:id/approve", ...adminOnly, approveReview);
app.delete("/api/reviews/:id", ...adminOnly, deleteReview);
app.post("/api/reviews", requireAuth, createReview);
/** Inventory must register before `app.use("/api/products", …)` so these paths are not swallowed by the router. */
app.get("/api/products/inventory", ...adminOnly, getInventory);
app.post("/api/products/inventory/reorder/:id", ...adminOnly, postReorder);
app.post("/api/products/inventory/restock-bulk", ...adminOnly, postBulkRestock);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
/** Register on `app` so these GET routes always match (same pattern as `/api/overview`). */
app.get("/api/overview", ...adminOnly, getOverview);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/billers", require("./routes/billerRoutes"));
app.get("/api/customers/stats", ...adminOnly, getStats);
app.get("/api/customers", ...adminOnly, getCustomers);
app.use("/api/distributors", distributorRoutes);
app.use("/api/categories", categoryRoutes);
const serviceAreaRoutes = require("./routes/serviceAreaRoutes");
app.use("/api/service-areas", serviceAreaRoutes);
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const upload = require("./middleware/upload");
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found", path: req.path, method: req.method });
});

app.use((err, _, res, __) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

// Connect to DB always (needed for Vercel serverless cold starts too)
connectDB().catch((error) => {
  console.error("DB connection failed", error);
});

// Only start HTTP server when running locally (not on Vercel serverless)
if (process.env.VERCEL !== "1") {
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
}

// Export app for Vercel serverless
module.exports = app;
