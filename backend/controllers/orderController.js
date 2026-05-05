const Order = require("../models/Order");

const periodToFilter = (period) => {
  const now = new Date();
  if (period === "this-month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { orderDate: { $gte: start } };
  }
  if (period === "last-month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { orderDate: { $gte: start, $lte: end } };
  }
  return {};
};

const mergeSearch = (base, search) => {
  if (!search || !String(search).trim()) return base;
  const q = String(search).trim();
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const textQuery = { $or: [{ orderId: rx }, { customerName: rx }] };
  const keys = Object.keys(base);
  if (keys.length === 0) return textQuery;
  return { $and: [base, textQuery] };
};

const getOrders = async (req, res) => {
  try {
    const { search = "", period = "all", page = 1, limit = 200 } = req.query;
    const periodFilter = periodToFilter(period);
    const filter = mergeSearch(periodFilter, search);

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ orderDate: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load orders" });
  }
};

const getStats = async (req, res) => {
  try {
    const { period = "all" } = req.query;
    const periodFilter = periodToFilter(period);

    const [
      totalOrders,
      delivered,
      processing,
      pending,
      cancelled,
      pendingAction,
    ] = await Promise.all([
      Order.countDocuments(periodFilter),
      Order.countDocuments({ ...periodFilter, status: "Delivered" }),
      Order.countDocuments({ ...periodFilter, status: "Processing" }),
      Order.countDocuments({ ...periodFilter, status: "Pending" }),
      Order.countDocuments({ ...periodFilter, status: "Cancelled" }),
      Order.countDocuments({
        ...periodFilter,
        $or: [{ status: "Pending" }, { payment: "Pending" }],
      }),
    ]);

    res.json({
      totalOrders,
      delivered,
      processing,
      pending,
      cancelled,
      pendingAction,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load stats" });
  }
};

module.exports = {
  getOrders,
  getStats,
};
