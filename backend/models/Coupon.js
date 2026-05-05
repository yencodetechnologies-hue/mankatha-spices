const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: {
    type: String,
    enum: ["percentage", "fixed_amount", "free_shipping"],
    required: true,
  },
  /** Percent = whole number (e.g. 20 → 20%). Fixed = rupee amount. Free shipping ignores display. */
  value: { type: Number, required: true, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },
  /** null = unlimited redemptions */
  usageLimit: { type: Number, default: null },
  expiresAt: { type: Date, required: true },
  isVipOnly: { type: Boolean, default: false },
  /** Manual off switch; list view still marks past expiresAt as expired. */
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

couponSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
