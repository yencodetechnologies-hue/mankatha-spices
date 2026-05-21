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
};

const createProduct = async (req, res) => {
  const payload = parsePayload(req.body);
  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  }

  const product = await Product.create(payload);
  res.status(201).json({ message: "Product created", product });
};

const updateProduct = async (req, res) => {
  console.log("UPDATE PRODUCT RECEIVED BODY:", req.body);
  const payload = parsePayload(req.body);
  if (req.file) {
    payload.image = `/uploads/${req.file.filename}`;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ message: "Product updated", product });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ message: "Product deleted" });
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
