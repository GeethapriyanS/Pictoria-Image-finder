const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (dnsErr) {
      console.warn("⚠️ DNS setServers failed:", dnsErr.message);
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
