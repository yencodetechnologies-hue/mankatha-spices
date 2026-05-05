/**
 * Adds lineItems + customer names to existing demo orders (safe to run multiple times).
 * Run from backend folder: npm run migrate:order-lineitems
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const Order = require(path.join(__dirname, "..", "models", "Order"));

const patches = [
  {
    orderId: "SE4821",
    customerName: "Priya Raghavan",
    lineItems: [{ name: "Kashmir Saffron", quantity: 1, category: "Saffron & Floral" }],
  },
  {
    orderId: "SE4820",
    customerName: "Arjun Mehta",
    lineItems: [
      { name: "Black Pepper", quantity: 3, category: "Whole Spices" },
      { name: "Cardamom", quantity: 1, category: "Pods" },
    ],
  },
  {
    orderId: "SE4819",
    customerName: "Sunita K",
    lineItems: [{ name: "Herb Blend Gift Set", quantity: 1, category: "Herb Blends" }],
  },
  {
    orderId: "SE4815",
    lineItems: [
      { name: "Turmeric Powder", quantity: 1, category: "Ground Spices" },
      { name: "Cumin Seeds", quantity: 1, category: "Whole Spices" },
    ],
  },
  {
    orderId: "SE4812",
    lineItems: [{ name: "Bay Leaves", quantity: 2, category: "Herbs" }],
  },
  {
    orderId: "SE4808",
    lineItems: [{ name: "Premium Saffron Pack", quantity: 2, category: "Saffron & Floral" }],
  },
  {
    orderId: "SE4799",
    lineItems: [
      { name: "Garam Masala", quantity: 1, category: "Blended Masala" },
      { name: "Coriander Powder", quantity: 1, category: "Ground Spices" },
    ],
  },
  {
    orderId: "SE4788",
    lineItems: [{ name: "Signature Spice Bundle", quantity: 5, category: "Whole Spices" }],
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  let n = 0;
  for (const p of patches) {
    const set = { lineItems: p.lineItems };
    if (p.customerName) set.customerName = p.customerName;
    const r = await Order.updateOne({ orderId: p.orderId }, { $set: set });
    if (r.modifiedCount) n += 1;
  }
  console.log(`Updated ${n} order(s) with line item details.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
