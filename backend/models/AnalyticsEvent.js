const mongoose = require("mongoose");

const TRAFFIC_SOURCES = ["organic", "social", "direct", "email", "referral"];

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ["pageview", "add_to_cart"],
    required: true,
    index: true,
  },
  source: {
    type: String,
    enum: TRAFFIC_SOURCES,
    default: "direct",
  },
  city: { type: String, default: "", trim: true },
  occurredAt: { type: Date, default: Date.now, index: true },
});

analyticsEventSchema.index({ occurredAt: 1, eventType: 1 });
analyticsEventSchema.index({ occurredAt: 1, source: 1 });

module.exports = mongoose.model("AnalyticsEvent", analyticsEventSchema);
