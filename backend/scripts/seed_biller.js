/**
 * seed_biller.js
 * Run once: node scripts/seed_biller.js
 * Creates the demo biller account if it does not already exist.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const BILLER = {
  name: "Mankatha Biller",
  email: "biller@mankathaspices.com",
  password: "BillerDemo123!",
  phone: "+1-555-0200",
  role: "biller",
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: BILLER.email });
    if (existing) {
      console.log(`ℹ️  Biller account already exists (${BILLER.email}). Skipping.`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(BILLER.password, 10);
    await User.create({
      name: BILLER.name,
      email: BILLER.email,
      password: hashed,
      phone: BILLER.phone,
      role: BILLER.role,
      isActive: true,
    });

    console.log(`🎉 Biller account created!`);
    console.log(`   Email   : ${BILLER.email}`);
    console.log(`   Password: ${BILLER.password}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
})();
