const mongoose = require("mongoose");

const weightSchema = new mongoose.Schema(
  {
    weight: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    original_price: { type: Number, min: 0 },
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, enum: ["Sri Lanka", "India", "UAE", "USA"] },
    currency: { type: String, required: true, enum: ["LKR", "INR", "AED", "USD"] },
    weights: { type: [weightSchema], default: [] },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true, unique: true },
  category: { type: String, required: true, trim: true },
  origin: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0 },
  minStock: { type: Number, required: true, min: 0 },
  /** Default batch size when placing a supplier reorder from Inventory. */
  reorderQty: { type: Number, default: 100, min: 0 },
  supplier: { type: String, default: "", trim: true },
  barcode: { type: String, default: "", trim: true },
  image: { type: String, default: "" },
  sales: { type: Number, default: 0, min: 0 },
  pricing: { type: [pricingSchema], default: [] },
  vatPercent: { type: Number, default: 0, min: 0, max: 100 },
  dietaryPreference: { type: String, default: "" },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviews_count: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
