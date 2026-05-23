const mongoose = require("mongoose");

/**
 * Singleton store configuration (one document with singletonKey "global").
 */
const storeSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "global", unique: true, immutable: true },
    storeName: { type: String, default: "SpiceEmpire", trim: true },
    contactEmail: { type: String, default: "admin@spiceempire.in", trim: true },
    phone: { type: String, default: "+91 44 2345 6789", trim: true },
    currency: {
      type: String,
      enum: ["INR", "USD", "AED", "GBP", "EUR"],
      default: "INR",
    },
    storeAddress: {
      type: String,
      default: "23, Spice Market Road, Chennai 600001, Tamil Nadu",
      trim: true,
    },
    newOrderAlerts: { type: Boolean, default: true },
    lowStockWarnings: { type: Boolean, default: true },
    customerReviewNotifications: { type: Boolean, default: false },
    dailyRevenueReport: { type: Boolean, default: true },
    showProductReviews: { type: Boolean, default: true },
    enableWishlists: { type: Boolean, default: true },
    whatsappChatButton: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
