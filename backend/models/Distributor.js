const mongoose = require("mongoose");

const distributorSchema = new mongoose.Schema(
  {
    distributorId: { type: String, required: true, unique: true, trim: true, index: true },
    businessType: { type: String, default: "Distributor", trim: true },
    companyName: { type: String, required: true, trim: true },
    payableName: { type: String, required: true, trim: true },
    fullOfficeAddress: { type: String, required: true, trim: true },
    areaCity: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },

    contactPersonName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    officePhoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },

    gstRegistrationNo: { type: String, default: "", trim: true },
    drugLicenseNo: { type: String, default: "", trim: true },
    panNumber: { type: String, default: "", trim: true },
    fssaiLicenseNo: { type: String, default: "", trim: true },

    paymentType: {
      type: String,
      enum: ["Credit", "Cash", "Prepaid"],
      default: "Credit",
    },
    creditLimitDays: { type: Number, required: true, min: 0, default: 0 },
    openingBalance: { type: Number, default: 0 },

    accountStatus: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    notesSpecialRemarks: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Distributor", distributorSchema);
