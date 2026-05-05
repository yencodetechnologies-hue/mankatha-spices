/**
 * Sample coupons for admin. Run: npm run seed:coupons (from backend).
 */
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const Coupon = require(path.join(__dirname, "..", "models", "Coupon"));

const future = (m, d, y = 2026) => new Date(y, m - 1, d, 23, 59, 59);
const past = (m, d, y = 2025) => new Date(y, m - 1, d);

const samples = [
  { code: "SPICE20", type: "percentage", value: 20, usedCount: 142, usageLimit: 500, expiresAt: future(5, 31), isVipOnly: false, status: "active" },
  { code: "FIRST100", type: "fixed_amount", value: 100, usedCount: 89, usageLimit: null, expiresAt: future(6, 30), isVipOnly: false, status: "active" },
  { code: "FREESHIP", type: "free_shipping", value: 0, usedCount: 1204, usageLimit: 5000, expiresAt: future(12, 31), isVipOnly: false, status: "active" },
  { code: "VIP25", type: "percentage", value: 25, usedCount: 56, usageLimit: null, expiresAt: future(4, 15), isVipOnly: true, status: "active" },
  { code: "MASALA15", type: "percentage", value: 15, usedCount: 310, usageLimit: 1000, expiresAt: future(8, 1), isVipOnly: false, status: "active" },
  { code: "WELCOME50", type: "fixed_amount", value: 50, usedCount: 0, usageLimit: 200, expiresAt: future(7, 20), isVipOnly: false, status: "active" },
  { code: "BULK10", type: "percentage", value: 10, usedCount: 44, usageLimit: 300, expiresAt: future(9, 10), isVipOnly: false, status: "active" },
  { code: "OLD10", type: "percentage", value: 10, usedCount: 999, usageLimit: 100, expiresAt: past(1, 10), isVipOnly: false, status: "active" },
];

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Set MONGO_URI in backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const n = await Coupon.countDocuments();
  if (n > 0) {
    console.log(`Coupons collection already has ${n} document(s). Skipping seed.`);
    await mongoose.disconnect();
    return;
  }
  await Coupon.insertMany(samples);
  console.log(`Inserted ${samples.length} sample coupons.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
