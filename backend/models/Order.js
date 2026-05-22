const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, default: 0, min: 0 },
    category: { type: String, default: "Whole Spices", trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: /^SE[A-Z0-9]+$/,
  },
  customerName: { type: String, required: true, trim: true },
  itemCount: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
  payment: {
    type: String,
    enum: ["Paid", "Pending", "Refunded"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card", "Bank Transfer", "UPI"],
    default: "Cash",
  },
  status: {
    type: String,
    enum: ["Delivered", "Processing", "Pending", "Cancelled"],
    default: "Pending",
  },
  /** Cart lines for overview “products” column & category charts */
  lineItems: { type: [lineItemSchema], default: [] },
  billerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  billerName: { type: String, trim: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  couponCode: { type: String, trim: true },
  discountAmount: { type: Number, default: 0, min: 0 },
  orderDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
