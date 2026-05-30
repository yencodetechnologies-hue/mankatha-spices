const Category = require("../models/Category");
const Product = require("../models/Product");

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
    if (req.file) {
      doc.image = `/uploads/${req.file.filename}`;
    }
    
    await doc.save();
    res.status(201).json({ category: doc });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create category" });
  }
};

const renameCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "New category name is required" });
    }
    const trimmed = name.trim();
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const duplicate = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${trimmed}$`, "i") },
    });
    if (duplicate) return res.status(409).json({ message: "Category name already exists" });

    const oldName = cat.name;
    cat.name = trimmed;
    
    if (req.file) {
      cat.image = `/uploads/${req.file.filename}`;
    }
    
    await cat.save();

    // Also update all products that used the old category name
    if (oldName !== trimmed) {
      await Product.updateMany({ category: oldName }, { $set: { category: trimmed } });
    }

    res.json({ category: cat });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to rename category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    // Update all products in this category to have an empty category string
    await Product.updateMany({ category: cat.name }, { $set: { category: "" } });

    await Category.findByIdAndDelete(id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete category" });
  }
};

module.exports = { listCategories, createCategory, renameCategory, deleteCategory };
