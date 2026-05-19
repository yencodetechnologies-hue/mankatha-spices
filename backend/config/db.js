const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (err) {
    console.warn("Could not set custom DNS servers, using system default:", err.message);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};

module.exports = connectDB;
