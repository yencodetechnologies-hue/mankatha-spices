require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const connectDB = require("./config/db");

const items = [
  { name: "மிளகாய்த் தூள்", stock: 125, price: 152, weight: "400g" },
  { name: "மல்லித்தூள்", stock: 50, price: 200, weight: "200g" },
  { name: "கறித்தூள்", stock: 50, price: 200, weight: "200g" },
  { name: "மசாலாத் தூள்", stock: 20, price: 250, weight: "200g" },
  { name: "கொத்தமல்லித் தூள்", stock: 20, price: 250, weight: "200g" },
  { name: "வேப்பம்பூ வடகம்", stock: 25, price: 100, weight: "100g" },
  { name: "ஆவாரம்பூ வடகம்", stock: 25, price: 100, weight: "100g" },
  { name: "பனங்காய் வடகம்", stock: 25, price: 100, weight: "100g" },
  { name: "வல்லாரைப் பொடி", stock: 50, price: 400, weight: "40g" },
  { name: "முருங்கை இலைப் பொடி", stock: 50, price: 400, weight: "40g" },
  { name: "கறிவேப்பிலைப் பொடி", stock: 50, price: 400, weight: "40g" },
  { name: "நெல்லிக்காய் பொடி", stock: 50, price: 400, weight: "40g" },
  { name: "ஊறுகாய்", stock: 30, price: 100, weight: "100g" },
  { name: "மோர் மிளகாய்", stock: 40, price: 50, weight: "50g" },
  { name: "பனங்கற்கண்டு", stock: 5, price: 5000, weight: "1kg" },
  { name: "ஒடியல் மா", stock: 15, price: 200, weight: "200g" },
  { name: "புழுக்கொடியல் மா", stock: 20, price: 200, weight: "200g" },
  { name: "பனாட்டு", stock: 5, price: 1000, weight: "1kg" },
  { name: "நீத்துப் பெட்டி", stock: 25, price: 100, weight: "1 nos" },
  { name: "பனை ஓலைப் பெட்டி", stock: 25, price: 100, weight: "1 nos" },
];

async function seed() {
  await connectDB();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const sku = `TM-${Date.now()}-${i}`;
    
    await Product.create({
      name: item.name,
      sku: sku,
      category: "Tamil Spices",
      origin: "Jaffna, SriLanka",
      description: item.name,
      stock: item.stock,
      minStock: 5,
      reorderQty: 20,
      pricing: [
        {
          country: "United Kingdom",
          currency: "GBP",
          weights: [{ weight: item.weight, price: item.price }]
        }
      ]
    });
    console.log(`Added ${item.name}`);
  }
  console.log("Done!");
  process.exit(0);
}

seed().catch(console.error);
