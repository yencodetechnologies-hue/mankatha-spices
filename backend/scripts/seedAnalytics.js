/**
 * Seed sample analytics events (pageviews + add_to_cart) for the admin Analytics page.
 * Run from backend: npm run seed:analytics
 */
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const AnalyticsEvent = require(path.join(__dirname, "..", "models", "AnalyticsEvent"));

const WEIGHTED_SOURCES = [
  ["organic", 42],
  ["social", 28],
  ["direct", 18],
  ["email", 8],
  ["referral", 4],
];

const CITIES = [
  ["Chennai", 22],
  ["Mumbai", 19],
  ["Bangalore", 17],
  ["Delhi", 14],
  ["Hyderabad", 12],
  ["Kochi", 9],
  ["Pune", 7],
];

function pickWeighted(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function randomDateBetween(start, end) {
  const t0 = start.getTime();
  const t1 = end.getTime();
  return new Date(t0 + Math.random() * (t1 - t0));
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Set MONGO_URI in backend/.env (same as other seed scripts).");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await AnalyticsEvent.countDocuments();
  if (existing > 2000) {
    console.log(`Skipping seed: ${existing} analytics events already exist.`);
    await mongoose.disconnect();
    return;
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 120);

  const batch = [];
  const targetPv = 8500 + Math.floor(Math.random() * 1500);
  for (let i = 0; i < targetPv; i += 1) {
    batch.push({
      eventType: "pageview",
      source: pickWeighted(WEIGHTED_SOURCES),
      city: pickWeighted(CITIES),
      occurredAt: randomDateBetween(start, end),
    });
  }
  const targetAtc = 3200 + Math.floor(Math.random() * 800);
  for (let i = 0; i < targetAtc; i += 1) {
    batch.push({
      eventType: "add_to_cart",
      source: "direct",
      city: "",
      occurredAt: randomDateBetween(start, end),
    });
  }

  await AnalyticsEvent.insertMany(batch, { ordered: false });
  console.log(`Inserted ${batch.length} analytics events (${targetPv} pageviews, ${targetAtc} add_to_cart).`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
