const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["admin", "vendor", "customer", "biller"],
      default: "customer",
      index: true,
    },
    isActive: { type: Boolean, default: true },
    registerOtp: { type: String, default: "" },
    registerOtpExpires: { type: Date },
    forgotOtp: { type: String, default: "" },
    forgotOtpExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);