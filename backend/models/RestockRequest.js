const mongoose = require("mongoose");

const restockRequestSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  qty: { type: Number, required: true, min: 1 },
  urgent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RestockRequest", restockRequestSchema);
