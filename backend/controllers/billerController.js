const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function listBillers(req, res) {
  try {
    const billers = await User.find({ role: "biller" }).sort({ createdAt: -1 });
    res.json({ billers });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch billers." });
  }
}

async function createBiller(req, res) {
  try {
    const { name, email, password, phone, isActive } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    const doc = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashed,
      phone: phone ? String(phone).trim() : "",
      role: "biller",
      isActive: isActive !== undefined ? isActive : true,
    });

    const docObj = doc.toObject();
    delete docObj.password;
    res.status(201).json({ biller: docObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create biller." });
  }
}

async function updateBiller(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, phone, isActive } = req.body;

    const user = await User.findOne({ _id: id, role: "biller" });
    if (!user) return res.status(404).json({ message: "Biller not found." });

    if (name) user.name = String(name).trim();
    if (email) user.email = String(email).toLowerCase().trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      user.password = await bcrypt.hash(String(password), 10);
    }

    await user.save();
    const docObj = user.toObject();
    delete docObj.password;
    
    res.json({ biller: docObj });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email is already in use." });
    }
    console.error(err);
    res.status(500).json({ message: "Could not update biller." });
  }
}

async function deleteBiller(req, res) {
  try {
    const { id } = req.params;
    const doc = await User.findOneAndDelete({ _id: id, role: "biller" });
    if (!doc) return res.status(404).json({ message: "Biller not found." });
    res.json({ message: "Biller deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete biller." });
  }
}

module.exports = { listBillers, createBiller, updateBiller, deleteBiller };
