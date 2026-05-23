const mongoose = require("mongoose");
const Order = require("./models/Order");
const Product = require("./models/Product");
const connectDB = require("./config/db");
require("dotenv").config();

async function syncSales() {
  try {
    await connectDB();
    console.log("Connected to DB, syncing sales...");

    // Reset all to 0 first
    await Product.updateMany({}, { $set: { sales: 0 } });

    // Fetch all non-cancelled orders
    const orders = await Order.find({ status: { $ne: "Cancelled" } });
    
    const salesMap = {};
    for (const order of orders) {
      if (order.lineItems) {
        for (const item of order.lineItems) {
          if (!item.name) continue;
          const baseName = item.name.split(" - ")[0].trim();
          salesMap[baseName] = (salesMap[baseName] || 0) + (item.quantity || 1);
        }
      }
    }

    console.log("Calculated sales from past orders:", salesMap);

    let updatedCount = 0;
    for (const [name, qty] of Object.entries(salesMap)) {
      const result = await Product.updateMany(
        { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") },
        { $inc: { sales: qty } }
      );
      if (result.modifiedCount > 0) {
        updatedCount += result.modifiedCount;
      }
    }

    console.log(`Successfully updated sales for ${updatedCount} products!`);
    process.exit(0);
  } catch (error) {
    console.error("Error syncing sales:", error);
    process.exit(1);
  }
}

syncSales();
