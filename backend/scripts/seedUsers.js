/**
 * Seeds admin & vendor demo users (customers register via POST /api/auth/register).
 *
 * Usage: from backend/, `npm run seed:users`
 * Requires MONGO_URI (same as server).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = require("../config/db");

const DEMO_USERS = [
  {
    email: "admin@gmail.com",
    password: "Admin123",
    name: "Mankatha Admin",
    phone: "+1-555-0100",
    role: "admin",
  },
  {
    email: "vendor@mankathaspices.com",
    password: "VendorDemo123!",
    name: "Mankatha Vendor",
    phone: "+1-555-0199",
    role: "vendor",
  },
  {
    email: "nithyagopalsamy2020@gmail.com",
    password: "Welcome@100",
    name: "Nithya Gopalsamy",
    phone: "+91-9876543210",
    role: "customer",
  },
  {
    email: "user@mankathaspices.com",
    password: "UserDemo123!",
    name: "Mankatha Customer",
    phone: "+91-9000000001",
    role: "customer",
  },
];

async function seed() {
  await connectDB();

  let created = 0;
  let updated = 0;
  const hashedPairs = [];

  for (const u of DEMO_USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    hashedPairs.push({ ...u, password: hashed });
  }

  for (const u of hashedPairs) {
    const doc = await User.findOne({ email: u.email });
    if (doc) {
      doc.name = u.name;
      doc.phone = u.phone;
      doc.role = u.role;
      doc.password = u.password;
      doc.isActive = true;
      await doc.save();
      updated += 1;
    } else {
      await User.create({
        email: u.email,
        password: u.password,
        name: u.name,
        phone: u.phone,
        role: u.role,
        isActive: true,
      });
      created += 1;
    }
  }

  console.log(`Users seeded: ${created} created, ${updated} reset/updated`);
  DEMO_USERS.forEach((u) =>
    console.log(`  • ${u.role}: ${u.email} / ${u.password}`)
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
