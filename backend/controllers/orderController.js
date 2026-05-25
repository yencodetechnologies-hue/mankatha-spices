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
    const { search = "", period = "all", page = 1, limit = 200, source } = req.query;
    const periodFilter = periodToFilter(period);
    let filter = mergeSearch(periodFilter, search);
    
    if (source === 'pos') {
      filter.isPOS = true;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).populate("customerId", "name email phone").sort({ orderDate: -1 }).skip(skip).limit(Number(limit)).lean(),
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
    const { period = "all", source } = req.query;
    let periodFilter = periodToFilter(period);
    
    if (source === 'pos' || (req.user && req.user.role === 'biller')) {
      periodFilter.billerId = req.user._id;
    }

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
      Order.countDocuments({ ...periodFilter, status: { $in: ["Processing", "Confirmed", "Ordered", "Shipped", "Out for Delivery"] } }),
      Order.countDocuments({ ...periodFilter, status: "Pending" }),
      Order.countDocuments({ ...periodFilter, status: "Cancelled" }),
      Order.countDocuments({
        ...periodFilter,
        $or: [
          { status: "Pending" }, 
          { status: "Awaiting Bank Transfer" }, 
          { payment: "Pending" }, 
          { payment: "Awaiting Approval" }
        ],
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
    const { customerName, email, phone, city, address, state, zipCode, country, total, payment, paymentMethod, status, lineItems, itemCount, couponCode, discountAmount, isPOS, password, slipUrl, userBankName, transactionRef } = req.body;
    
    // Simple order ID generator
    const orderId = "SE" + Math.floor(1000 + Math.random() * 9000);
    
    const isBiller = req.user && req.user.role === "biller";
    let customerId = !isBiller && req.user ? req.user._id : undefined;
    const billerId = isBiller ? req.user._id : undefined;
    const billerName = isBiller ? req.user.name : undefined;

    // Link order to an existing registered customer if email or phone is provided by Biller
    if (!customerId && (email || phone)) {
      const User = require("../models/User");
      const user = await User.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
          ...(phone ? [{ phone: phone.trim() }] : [])
        ]
      });
      if (user) {
        customerId = user._id;
      } else if (password && email) {
        const bcrypt = require("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
          name: customerName || "Customer",
          email: email.toLowerCase().trim(),
          phone: phone || "",
          password: hashedPassword,
          role: "customer"
        });
        customerId = newUser._id;
      }
    }

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
      discountAmount,
      shippingAddress: {
        address,
        city,
        state,
        zipCode,
        country
      },
      isPOS: Boolean(isPOS),
      slipUrl,
      userBankName,
      transactionRef
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

    if (customerId) {
      const Notification = require("../models/Notification");
      await Notification.create({
        user: customerId,
        title: "Order Placed Successfully",
        message: `Your order #${orderId} has been placed.`,
        icon: "📦",
        color: "bg-green-100"
      });
    }

    try {
      const Product = require("../models/Product");
      if (lineItems && lineItems.length > 0) {
        for (const item of lineItems) {
          if (item.name && item.quantity) {
            const baseName = item.name.split(" - ")[0].trim();
            await Product.updateMany(
              { name: new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") },
              { $inc: { sales: item.quantity } }
            );
          }
        }
      }
    } catch (e) {
      console.error("Failed to increment product sales", e);
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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: id },
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customerId) {
      const Notification = require("../models/Notification");
      await Notification.create({
        user: order.customerId,
        title: "Order Update",
        message: `Your order #${order.orderId} status changed to ${status}.`,
        icon: "🚚",
        color: "bg-blue-100"
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update order status" });
  }
};

const getBillerOrders = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "biller") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { search = "", page = 1, limit = 100 } = req.query;
    const filter = { billerId: req.user._id };
    if (search && search.trim()) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ orderId: rx }, { customerName: rx }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ orderDate: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 } });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load biller orders" });
  }
};

module.exports = {
  getOrders,
  getStats,
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getBillerOrders,
};

const updateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment } = req.body;
    
    if (!payment) {
      return res.status(400).json({ message: "Payment status is required" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: id },
      { $set: { payment } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customerId) {
      const Notification = require("../models/Notification");
      await Notification.create({
        user: order.customerId,
        title: "Payment Update",
        message: `Your order #${order.orderId} payment status changed to ${payment}.`,
        icon: "💳",
        color: "bg-green-100"
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update payment status" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndDelete({ orderId: id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully", orderId: id });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete order" });
  }
};

module.exports = {
  getOrders,
  getStats,
  createOrder,
  getMyOrders,
  updateOrderStatus,
  updateOrderPayment,
  getBillerOrders,
  deleteOrder,
};
