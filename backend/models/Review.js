const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  productName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  body: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("Review", reviewSchema);
