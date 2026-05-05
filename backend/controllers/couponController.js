const Coupon = require("../models/Coupon");

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function effectiveStatus(doc) {
  if (doc.status === "inactive") return "inactive";
  if (new Date(doc.expiresAt) < startOfToday()) return "expired";
  return "active";
}

function typeLabel(type) {
  if (type === "percentage") return "Percentage";
  if (type === "fixed_amount") return "Fixed Amount";
  return "Free Shipping";
}

function valueDisplay(type, value) {
  if (type === "percentage") return `${Math.round(value)}% off`;
  if (type === "fixed_amount") return `₹${Math.round(value)} off`;
  return "Free ship";
}

function limitDisplay(doc) {
  if (doc.isVipOnly) return "VIP only";
  if (doc.usageLimit == null) return "Unlimited";
  return String(doc.usageLimit);
}

function toRow(doc) {
  const eff = effectiveStatus(doc);
  return {
    id: doc._id.toString(),
    code: doc.code,
    type: doc.type,
    typeLabel: typeLabel(doc.type),
    valueDisplay: valueDisplay(doc.type, doc.value),
    usedCount: doc.usedCount,
    limitDisplay: limitDisplay(doc),
    expiresAt: doc.expiresAt,
    status: eff,
    isVipOnly: doc.isVipOnly,
    usageLimit: doc.usageLimit,
    value: doc.value,
  };
}

const getCouponStats = async (req, res) => {
  try {
    const coupons = await Coupon.find({ status: "active" }).lean();
    const activeCount = coupons.filter((c) => effectiveStatus(c) === "active").length;
    res.json({ activeCount });
  } catch (err) {
    res.status(500).json({ message: err.message || "Coupon stats failed" });
  }
};

const getCoupons = async (req, res) => {
  try {
    const rows = await Coupon.find().sort({ createdAt: -1 }).lean();
    const coupons = rows.map(toRow);
    const activeCount = rows.filter((c) => effectiveStatus(c) === "active").length;
    res.json({ coupons, stats: { activeCount } });
  } catch (err) {
    res.status(500).json({ message: err.message || "Coupons load failed" });
  }
};

const parseCouponBody = (body) => {
  const code = String(body.code || "")
    .trim()
    .toUpperCase();
  const type = body.type;
  const value = Number(body.value);
  const usedCount = body.usedCount != null ? Math.max(0, Number(body.usedCount)) : 0;
  let usageLimit = body.usageLimit;
  if (body.unlimited === true || body.unlimited === "true" || usageLimit === "" || usageLimit === "unlimited") {
    usageLimit = null;
  } else if (usageLimit != null && usageLimit !== "") {
    usageLimit = Math.max(1, Math.round(Number(usageLimit)));
  } else {
    usageLimit = null;
  }
  const expiresAt = new Date(body.expiresAt);
  const isVipOnly = !!body.isVipOnly;
  const status = body.status === "inactive" ? "inactive" : "active";
  return { code, type, value, usedCount, usageLimit, expiresAt, isVipOnly, status };
};

const createCoupon = async (req, res) => {
  try {
    const p = parseCouponBody(req.body);
    if (!p.code) return res.status(400).json({ message: "Code is required" });
    if (!["percentage", "fixed_amount", "free_shipping"].includes(p.type)) {
      return res.status(400).json({ message: "Invalid type" });
    }
    if (Number.isNaN(p.expiresAt.getTime())) {
      return res.status(400).json({ message: "Invalid expiration date" });
    }
    const coupon = await Coupon.create({
      code: p.code,
      type: p.type,
      value: Number.isFinite(p.value) ? p.value : 0,
      usedCount: 0,
      usageLimit: p.usageLimit,
      expiresAt: p.expiresAt,
      isVipOnly: p.isVipOnly,
      status: p.status,
    });
    return res.status(201).json({ message: "Coupon created", coupon: toRow(coupon.toObject()) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That coupon code already exists" });
    }
    return res.status(500).json({ message: err.message || "Create failed" });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const p = parseCouponBody(req.body);
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: p.code,
        type: p.type,
        value: Number.isFinite(p.value) ? p.value : 0,
        usedCount: p.usedCount,
        usageLimit: p.usageLimit,
        expiresAt: p.expiresAt,
        isVipOnly: p.isVipOnly,
        status: p.status,
      },
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    return res.json({ message: "Coupon updated", coupon: toRow(coupon.toObject()) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That coupon code already exists" });
    }
    return res.status(500).json({ message: err.message || "Update failed" });
  }
};

module.exports = { getCouponStats, getCoupons, createCoupon, updateCoupon };
