const Product = require("../models/Product");

const parsePayload = (body) => {
  const parsed = { ...body };
  if (typeof parsed.pricing === "string") {
    parsed.pricing = JSON.parse(parsed.pricing);
  }
  parsed.stock = Number(parsed.stock);
  parsed.minStock = Number(parsed.minStock);
  if (parsed.reorderQty != null && parsed.reorderQty !== "") {
    const rq = Math.max(0, Number(parsed.reorderQty));
    if (Number.isFinite(rq)) parsed.reorderQty = rq;
    else delete parsed.reorderQty;
  }
  if (parsed.supplier != null) {
    parsed.supplier = String(parsed.supplier).trim();
  }
  return parsed;
};

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const payload = parsePayload(req.body);
    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create(payload);
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Duplicate key error: ${Object.keys(error.keyValue).join(', ')} already exists.` });
    }
    res.status(400).json({ message: error.message || "Failed to create product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    console.log("UPDATE PRODUCT RECEIVED BODY:", req.body);
    const payload = parsePayload(req.body);
    const shouldRemoveImage = payload.removeImage === "true" || payload.removeImage === true;
    delete payload.removeImage;
    console.log("shouldRemoveImage:", shouldRemoveImage, "req.file:", !!req.file);

    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    } else if (shouldRemoveImage) {
      payload.image = "";
    }

    const existingProduct = shouldRemoveImage && !req.file
      ? await Product.findById(req.params.id)
      : null;

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (existingProduct?.image) {
      const fs = require("fs");
      const path = require("path");
      const oldImagePath = path.join(__dirname, "..", existingProduct.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.warn("Could not delete old image file:", err.message);
      });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product updated", product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Duplicate key error: ${Object.keys(error.keyValue).join(', ')} already exists.` });
    }
    res.status(400).json({ message: error.message || "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete product" });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
