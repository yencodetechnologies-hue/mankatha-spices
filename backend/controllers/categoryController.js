const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
  "Whole Spices",
  "Ground Spices",
  "Blended Masala",
  "Herbs",
  "Seasoning",
];

const listCategories = async (req, res) => {
  try {
    let list = await Category.find().sort({ name: 1 });
    if (list.length === 0) {
      // Seed default categories
      const seed = DEFAULT_CATEGORIES.map((name) => ({ name }));
      await Category.insertMany(seed);
      list = await Category.find().sort({ name: 1 });
    }
    res.json({ categories: list });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to list categories" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const trimmed = name.trim();
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, "i") } });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const doc = new Category({ name: trimmed });
    await doc.save();
    res.status(201).json({ category: doc });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create category" });
  }
};

module.exports = { listCategories, createCategory };
