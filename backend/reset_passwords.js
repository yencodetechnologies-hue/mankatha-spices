/**
 * Reset default user accounts & credentials.
 * Run this from the backend directory: node reset_passwords.js
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const DEFAULT_USERS = [
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

async function run() {
  console.log("Connecting to Database...");
  await connectDB();

  let updatedCount = 0;
  let createdCount = 0;

  for (const userDetails of DEFAULT_USERS) {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10);
    const existingUser = await User.findOne({ email: userDetails.email });

    if (existingUser) {
      existingUser.name = userDetails.name;
      existingUser.phone = userDetails.phone;
      existingUser.role = userDetails.role;
      existingUser.password = hashedPassword;
      existingUser.isActive = true;
      await existingUser.save();
      updatedCount++;
    } else {
      await User.create({
        email: userDetails.email,
        password: hashedPassword,
        name: userDetails.name,
        phone: userDetails.phone,
        role: userDetails.role,
        isActive: true,
      });
      createdCount++;
    }
  }

  console.log(`\nPassword Reset Completed!`);
  console.log(`- ${createdCount} new accounts created.`);
  console.log(`- ${updatedCount} existing accounts updated/reset.`);
  console.log(`\nUse these credentials to log in:`);
  
  DEFAULT_USERS.forEach((u) => {
    console.log(`  Role: [${u.role.toUpperCase()}]`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Password: ${u.password}`);
    console.log(`  -----------------------`);
  });

  await mongoose.disconnect();
  console.log("Database disconnected successfully.");
}

run().catch((err) => {
  console.error("Error resetting passwords:", err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
