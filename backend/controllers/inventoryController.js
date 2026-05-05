const Product = require("../models/Product");
const RestockRequest = require("../models/RestockRequest");

function rowStatus(stock, minLevel) {
  if (stock <= 0) return "out_of_stock";
  if (stock <= minLevel) return "low_stock";
  return "healthy";
}

function defaultReorderQty(minLevel, stored) {
  const n = Number(stored);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  const m = Number(minLevel) || 0;
  return Math.max(m * 2, 50);
}

const getInventory = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 }).lean();

    let productsInStock = 0;
    let lowStockAlerts = 0;
    let outOfStock = 0;

    const items = products.map((p) => {
      const stock = Number(p.stock) || 0;
      const minLevel = Number(p.minStock) || 0;
      const status = rowStatus(stock, minLevel);
      if (status === "healthy") productsInStock += 1;
      else if (status === "low_stock") lowStockAlerts += 1;
      else outOfStock += 1;

      const reorderQty = defaultReorderQty(minLevel, p.reorderQty);
      const supplier = (p.supplier && String(p.supplier).trim()) || "—";

      return {
        id: p._id.toString(),
        name: p.name,
        sku: p.sku,
        image: p.image || "",
        currentStock: stock,
        minLevel,
        reorderQty,
        supplier,
        status,
      };
    });

    const needRestocking = lowStockAlerts + outOfStock;

    res.json({
      summary: {
        productsInStock,
        lowStockAlerts,
        outOfStock,
        needRestocking,
      },
      items,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Inventory load failed" });
  }
};

const postReorder = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const urgent = !!req.body?.urgent;
    const qtyRaw = req.body?.qty;
    const qty =
      qtyRaw != null && qtyRaw !== ""
        ? Math.max(1, Math.round(Number(qtyRaw)))
        : defaultReorderQty(product.minStock, product.reorderQty);

    await RestockRequest.create({
      productId: product._id,
      qty,
      urgent,
    });

    const msg = urgent ? "Urgent reorder logged with supplier." : "Reorder logged with supplier.";
    return res.status(201).json({ ok: true, message: msg, qty, urgent });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Reorder failed" });
  }
};

const postBulkRestock = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
    }).lean();

    if (!products.length) {
      return res.json({ ok: true, message: "No products need restocking right now.", count: 0 });
    }

    const docs = products.map((p) => ({
      productId: p._id,
      qty: defaultReorderQty(p.minStock, p.reorderQty),
      urgent: (Number(p.stock) || 0) <= 0,
    }));

    await RestockRequest.insertMany(docs);

    return res.status(201).json({
      ok: true,
      message: `Placed ${docs.length} restock request(s) for low or out-of-stock items.`,
      count: docs.length,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Bulk restock failed" });
  }
};

module.exports = { getInventory, postReorder, postBulkRestock };
