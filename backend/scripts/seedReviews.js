/**
 * Sample reviews for admin Reviews page. Run: npm run seed:reviews (from backend folder).
 */
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const Review = require(path.join(__dirname, "..", "models", "Review"));

const samples = [
  {
    customerName: "Priya R.",
    productName: "Kashmir Saffron",
    rating: 5,
    body: "The saffron is absolutely divine — rich color and aroma. Worth every rupee.",
    status: "pending",
    createdAt: new Date(2026, 3, 22),
  },
  {
    customerName: "Arjun M.",
    productName: "Malabar Pepper",
    rating: 3,
    body: "Good heat but a few stems in the pack. Packaging could be better.",
    status: "pending",
    createdAt: new Date(2026, 3, 20),
  },
  {
    customerName: "Sunita K.",
    productName: "Green Cardamom",
    rating: 5,
    body: "Fresh pods, intense fragrance. My chai has never tasted better.",
    status: "approved",
    createdAt: new Date(2026, 3, 18),
  },
  {
    customerName: "Ravi V.",
    productName: "Ceylon Cinnamon",
    rating: 4,
    body: "Sweet bark rolls, consistent quality across the bag.",
    status: "approved",
    createdAt: new Date(2026, 3, 15),
  },
  {
    customerName: "Meera L.",
    productName: "Kashmir Saffron",
    rating: 5,
    body: "Gifted to family abroad — they loved it. Fast delivery too.",
    status: "approved",
    createdAt: new Date(2026, 3, 10),
  },
];

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Set MONGO_URI in backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const n = await Review.countDocuments();
  if (n > 0) {
    console.log(`Reviews collection already has ${n} document(s). Skipping seed.`);
    await mongoose.disconnect();
    return;
  }
  await Review.insertMany(samples);
  console.log(`Inserted ${samples.length} sample reviews.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
