/**
 * Seed demo customers (skipped if collection already has documents).
 * Run: npm run seed:customers
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const Customer = require(path.join(__dirname, "..", "models", "Customer"));

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const samples = [
  {
    name: "Priya Raghavan",
    email: "priya.r@gmail.com",
    phone: "+91 98765 43210",
    city: "Chennai",
    orderCount: 24,
    totalSpent: 54821,
    tier: "VIP",
    joinedAt: daysAgo(400),
    lastActivityAt: daysAgo(2),
  },
  {
    name: "Arjun Mehta",
    email: "arjun.m@gmail.com",
    phone: "+91 87654 32109",
    city: "Mumbai",
    orderCount: 18,
    totalSpent: 38244,
    tier: "Gold",
    joinedAt: daysAgo(300),
    lastActivityAt: daysAgo(5),
  },
  {
    name: "Sunita Krishnan",
    email: "sunita.k@hotmail.com",
    phone: "+91 76543 21098",
    city: "Bangalore",
    orderCount: 11,
    totalSpent: 19880,
    tier: "Regular",
    joinedAt: daysAgo(200),
    lastActivityAt: daysAgo(1),
  },
  {
    name: "Ravi Varma",
    email: "ravi.v@gmail.com",
    phone: "+91 65432 10987",
    city: "Delhi",
    orderCount: 7,
    totalSpent: 12455,
    tier: "Regular",
    joinedAt: daysAgo(150),
    lastActivityAt: daysAgo(10),
  },
  {
    name: "Nila Kannan",
    email: "nila.k@gmail.com",
    phone: "+91 54321 09876",
    city: "Chennai",
    orderCount: 1,
    totalSpent: 898,
    tier: "New",
    joinedAt: daysAgo(14),
    lastActivityAt: daysAgo(3),
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const existing = await Customer.countDocuments();
  if (existing > 0) {
    console.log(`Customers collection already has ${existing} document(s). Skipping seed.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  await Customer.insertMany(samples);
  console.log(`Inserted ${samples.length} customers.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
