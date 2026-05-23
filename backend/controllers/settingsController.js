const StoreSettings = require("../models/StoreSettings");

const EDITABLE_KEYS = new Set([
  "storeName",
  "contactEmail",
  "phone",
  "currency",
  "storeAddress",
  "newOrderAlerts",
  "lowStockWarnings",
  "customerReviewNotifications",
  "dailyRevenueReport",
  "showProductReviews",
  "enableWishlists",
  "whatsappChatButton",
]);

function toBool(v) {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "1" || v === 1) return true;
  if (v === "false" || v === "0" || v === 0) return false;
  return undefined;
}

function publicShape(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.singletonKey;
  delete o.__v;
  return {
    storeName: o.storeName,
    contactEmail: o.contactEmail,
    phone: o.phone,
    currency: o.currency,
    storeAddress: o.storeAddress,
    newOrderAlerts: o.newOrderAlerts,
    lowStockWarnings: o.lowStockWarnings,
    customerReviewNotifications: o.customerReviewNotifications,
    dailyRevenueReport: o.dailyRevenueReport,
    showProductReviews: o.showProductReviews,
    enableWishlists: o.enableWishlists,
    whatsappChatButton: o.whatsappChatButton,
    updatedAt: o.updatedAt,
  };
}

async function getOrCreateDoc() {
  let doc = await StoreSettings.findOne({ singletonKey: "global" });
  if (!doc) {
    doc = await StoreSettings.create({ singletonKey: "global" });
  }
  return doc;
}

/** GET /api/settings */
exports.getSettings = async (_req, res) => {
  try {
    const doc = await getOrCreateDoc();
    res.json(publicShape(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to load settings" });
  }
};

function buildPatch(body) {
  const patch = {};
  if (!body || typeof body !== "object") return patch;
  for (const key of EDITABLE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const raw = body[key];
    if (
      key === "newOrderAlerts" ||
      key === "lowStockWarnings" ||
      key === "customerReviewNotifications" ||
      key === "dailyRevenueReport" ||
      key === "showProductReviews" ||
      key === "enableWishlists" ||
      key === "whatsappChatButton"
    ) {
      const b = toBool(raw);
      if (b !== undefined) patch[key] = b;
      continue;
    }
    if (key === "currency" && typeof raw === "string") {
      const c = raw.toUpperCase();
      if (["INR", "USD", "AED", "GBP", "EUR"].includes(c)) patch[key] = c;
      continue;
    }
    if (typeof raw === "string") {
      patch[key] = raw.trim();
    }
  }
  return patch;
}

/** PUT /api/settings — replace provided keys (merge). */
exports.putSettings = async (req, res) => {
  try {
    const patch = buildPatch(req.body);
    if (Object.keys(patch).length === 0) {
      const doc = await getOrCreateDoc();
      return res.json(publicShape(doc));
    }
    const doc = await StoreSettings.findOneAndUpdate(
      { singletonKey: "global" },
      { $set: patch, $setOnInsert: { singletonKey: "global" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(publicShape(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to save settings" });
  }
};

/** PATCH /api/settings — same merge semantics as PUT (partial update). */
exports.patchSettings = async (req, res) => {
  return exports.putSettings(req, res);
};
