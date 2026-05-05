/**
 * Populate MongoDB with sample orders (skipped if orders already exist).
 * Run from backend folder: npm run seed:orders
 */
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const Order = require(path.join(__dirname, "..", "models", "Order"));

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const monthsAgo = (m, dayOfMonth = 12) => {
  const d = new Date();
  d.setMonth(d.getMonth() - m);
  d.setDate(dayOfMonth);
  return d;
};

const samples = [
  {
    orderId: "SE4821",
    customerName: "Priya Raghavan",
    itemCount: 1,
    total: 2499,
    payment: "Paid",
    status: "Delivered",
    orderDate: daysAgo(1),
    lineItems: [{ name: "Kashmir Saffron", quantity: 1, category: "Saffron & Floral" }],
  },
  {
    orderId: "SE4820",
    customerName: "Arjun Mehta",
    itemCount: 4,
    total: 1944,
    payment: "Paid",
    status: "Processing",
    orderDate: daysAgo(1),
    lineItems: [
      { name: "Black Pepper", quantity: 3, category: "Whole Spices" },
      { name: "Cardamom", quantity: 1, category: "Pods" },
    ],
  },
  {
    orderId: "SE4819",
    customerName: "Sunita K",
    itemCount: 1,
    total: 1299,
    payment: "Pending",
    status: "Pending",
    orderDate: daysAgo(2),
    lineItems: [{ name: "Herb Blend Gift Set", quantity: 1, category: "Herb Blends" }],
  },
  {
    orderId: "SE4818",
    customerName: "Ravi Varma",
    itemCount: 3,
    total: 847,
    payment: "Paid",
    status: "Delivered",
    orderDate: daysAgo(2),
    lineItems: [
      { name: "Cinnamon", quantity: 2, category: "Barks" },
      { name: "Star Anise", quantity: 1, category: "Whole Spices" },
    ],
  },
  {
    orderId: "SE4815",
    customerName: "Sneha Kulkarni",
    itemCount: 2,
    total: 899,
    payment: "Paid",
    status: "Pending",
    orderDate: daysAgo(3),
    lineItems: [
      { name: "Turmeric Powder", quantity: 1, category: "Ground Spices" },
      { name: "Cumin Seeds", quantity: 1, category: "Whole Spices" },
    ],
  },
  {
    orderId: "SE4812",
    customerName: "David Chen",
    itemCount: 1,
    total: 450,
    payment: "Refunded",
    status: "Cancelled",
    orderDate: daysAgo(5),
    lineItems: [{ name: "Bay Leaves", quantity: 2, category: "Herbs" }],
  },
  {
    orderId: "SE4808",
    customerName: "Lakshmi Iyer",
    itemCount: 3,
    total: 3200,
    payment: "Paid",
    status: "Delivered",
    orderDate: daysAgo(6),
    lineItems: [{ name: "Premium Saffron Pack", quantity: 2, category: "Saffron & Floral" }],
  },
  {
    orderId: "SE4799",
    customerName: "Rahul Verma",
    itemCount: 2,
    total: 1299,
    payment: "Paid",
    status: "Processing",
    orderDate: daysAgo(0),
    lineItems: [
      { name: "Garam Masala", quantity: 1, category: "Blended Masala" },
      { name: "Coriander Powder", quantity: 1, category: "Ground Spices" },
    ],
  },
  {
    orderId: "SE4788",
    customerName: "Ananya Bose",
    itemCount: 5,
    total: 4100,
    payment: "Paid",
    status: "Delivered",
    orderDate: daysAgo(45),
    lineItems: [{ name: "Signature Spice Bundle", quantity: 5, category: "Whole Spices" }],
  },
  { orderId: "SE4701", customerName: "Bulk Buyer A", itemCount: 10, total: 450000, payment: "Paid", status: "Delivered", orderDate: monthsAgo(6, 8), lineItems: [{ name: "Wholesale Mix", quantity: 10, category: "Whole Spices" }] },
  { orderId: "SE4702", customerName: "Bulk Buyer B", itemCount: 8, total: 380000, payment: "Paid", status: "Delivered", orderDate: monthsAgo(6, 18), lineItems: [{ name: "Wholesale Mix", quantity: 8, category: "Whole Spices" }] },
  { orderId: "SE4710", customerName: "Retail East", itemCount: 4, total: 520000, payment: "Paid", status: "Delivered", orderDate: monthsAgo(5, 10), lineItems: [{ name: "Festive Crate", quantity: 4, category: "Saffron & Floral" }] },
  { orderId: "SE4720", customerName: "Retail West", itemCount: 6, total: 610000, payment: "Paid", status: "Delivered", orderDate: monthsAgo(4, 14), lineItems: [{ name: "Holiday Bundle", quantity: 6, category: "Herb Blends" }] },
  { orderId: "SE4730", customerName: "Coastal Mart", itemCount: 3, total: 380000, payment: "Paid", status: "Delivered", orderDate: monthsAgo(3, 9), lineItems: [{ name: "Coastal Masala", quantity: 3, category: "Blended Masala" }] },
  { orderId: "SE4740", customerName: "Hills Store", itemCount: 5, total: 490000, payment: "Paid", status: "Delivered", orderDate: monthsAgo(2, 11), lineItems: [{ name: "Premium Pack", quantity: 5, category: "Saffron & Floral" }] },
  { orderId: "SE4750", customerName: "City Foods", itemCount: 4, total: 550000, payment: "Paid", status: "Delivered", orderDate: monthsAgo(1, 16), lineItems: [{ name: "City Spice Box", quantity: 4, category: "Ground Spices" }] },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const existing = await Order.countDocuments();
  if (existing > 0) {
    console.log(`Orders collection already has ${existing} document(s). Skipping seed.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  await Order.insertMany(samples);
  console.log(`Inserted ${samples.length} sample orders.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
