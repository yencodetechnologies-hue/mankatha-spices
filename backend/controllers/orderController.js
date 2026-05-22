const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Customer = require("../models/Customer");
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

const createOrder = async (req, res) => {
  try {
    const { customerName, email, phone, city, total, payment, paymentMethod, status, lineItems, itemCount, couponCode, discountAmount } = req.body;
    
    // Simple order ID generator
    const orderId = "SE" + Math.floor(1000 + Math.random() * 9000);
    
    const isBiller = req.user && req.user.role === "biller";
    const customerId = !isBiller && req.user ? req.user._id : undefined;
    const billerId = isBiller ? req.user._id : undefined;
    const billerName = isBiller ? req.user.name : undefined;

    // Increment coupon usedCount if couponCode is provided
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.trim().toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }
    
    const order = await Order.create({
      orderId,
      customerName: customerName || (req.user ? req.user.name : "Walk-in Customer"),
      itemCount: itemCount || (lineItems ? lineItems.length : 1),
      total: total || 0,
      payment: payment || "Paid",
      paymentMethod: paymentMethod || "Cash",
      status: status || "Processing",
      lineItems: lineItems || [],
      billerId,
      billerName,
      customerId,
      couponCode,
      discountAmount
    });

    // Upsert Customer Analytics Record if email is provided
    if (email) {
      const orderValue = total || 0;
      await Customer.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { 
          $set: { 
            name: customerName || "Walk-in Customer",
            phone: phone || "N/A",
            city: city || "N/A",
            lastActivityAt: new Date()
          },
          $inc: {
            orderCount: 1,
            totalSpent: orderValue
          },
          $setOnInsert: {
            tier: "New",
            joinedAt: new Date()
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const orders = await Order.find({ customerId: req.user._id })
      .sort({ orderDate: -1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load your orders" });
  }
};

module.exports = {
  getOrders,
  getStats,
  createOrder,
  getMyOrders,
};
