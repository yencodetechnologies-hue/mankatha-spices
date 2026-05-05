const Distributor = require("../models/Distributor");

function generateDistributorId() {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `VND-${num}`;
}

async function suggestId(req, res) {
  let id = generateDistributorId();
  for (let i = 0; i < 5; i += 1) {
    const exists = await Distributor.exists({ distributorId: id });
    if (!exists) break;
    id = generateDistributorId();
  }
  res.json({ distributorId: id });
}

async function listDistributors(req, res) {
  const items = await Distributor.find().sort({ createdAt: -1 }).lean();
  res.json({ distributors: items });
}

async function createDistributor(req, res) {
  try {
    const body = req.body || {};
    const distributorId = (body.distributorId && String(body.distributorId).trim()) || generateDistributorId();
    const existing = await Distributor.findOne({ distributorId });
    if (existing) {
      return res.status(409).json({ message: "Distributor ID already exists. Refresh the form for a new ID." });
    }

    const doc = await Distributor.create({
      distributorId,
      businessType: body.businessType || "Distributor",
      companyName: body.companyName,
      payableName: body.payableName,
      fullOfficeAddress: body.fullOfficeAddress,
      areaCity: body.areaCity,
      state: body.state,
      pincode: body.pincode,
      contactPersonName: body.contactPersonName,
      mobileNumber: body.mobileNumber,
      officePhoneNumber: body.officePhoneNumber,
      email: body.email,
      gstRegistrationNo: body.gstRegistrationNo,
      drugLicenseNo: body.drugLicenseNo,
      panNumber: body.panNumber || "",
      fssaiLicenseNo: body.fssaiLicenseNo || "",
      paymentType: body.paymentType || "Credit",
      creditLimitDays: Number(body.creditLimitDays) || 0,
      openingBalance: Number(body.openingBalance) || 0,
      accountStatus: body.accountStatus || "Active",
      notesSpecialRemarks: body.notesSpecialRemarks || "",
    });

    res.status(201).json({ distributor: doc });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate key (email or distributor ID)." });
    }
    console.error(err);
    res.status(500).json({ message: "Could not create distributor." });
  }
}

module.exports = { suggestId, listDistributors, createDistributor };
