require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

async function checkUsers() {
  await connectDB();
  const users = await User.find({}, "email role name isActive");
  console.log("Registered Users in Database:");
  console.log(users);
  await mongoose.disconnect();
}

checkUsers().catch(console.error);
