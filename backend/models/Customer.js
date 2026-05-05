const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  orderCount: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0, min: 0 },
  tier: {
    type: String,
    enum: ["VIP", "Gold", "Regular", "New"],
    default: "Regular",
  },
  joinedAt: { type: Date, default: Date.now },
  /** Used for “active this month” headline stat */
  lastActivityAt: { type: Date },
});

module.exports = mongoose.model("Customer", customerSchema);
