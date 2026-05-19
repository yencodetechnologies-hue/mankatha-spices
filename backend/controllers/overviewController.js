const Order = require("../models/Order");
const { getCustomerStatsPayload } = require("./customerController");

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function pctChange(current, previous) {
  if (previous === 0 || previous == null) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Short Sri Lanka Rupee labels for dashboard KPIs (revenue). */
function formatInShortLKR(n) {
  const x = Number(n) || 0;
  if (x >= 1000000) return `Rs.${(x / 1000000).toFixed(1)}M`;
  if (x >= 1000) return `Rs.${(x / 1000).toFixed(0)}k`;
  return `Rs.${Math.round(x)}`;
}

/** Revenue: completed sales (not cancelled) */
async function sumRevenue(start, end) {
  const r = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: start, $lte: end },
        status: { $ne: "Cancelled" },
      },
    },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  return r[0]?.total || 0;
}

async function countOrders(start, end) {
  return Order.countDocuments({
    orderDate: { $gte: start, $lte: end },
  });
}

async function countUniqueCustomers(start, end) {
  const names = await Order.distinct("customerName", {
    orderDate: { $gte: start, $lte: end },
  });
  return names.length;
}

/** Return / refund rate: refunded or cancelled as share of all orders in range */
async function returnRatePercent(start, end) {
  const [bad, all] = await Promise.all([
    Order.countDocuments({
      orderDate: { $gte: start, $lte: end },
      $or: [{ payment: "Refunded" }, { status: "Cancelled" }],
    }),
    Order.countDocuments({ orderDate: { $gte: start, $lte: end } }),
  ]);
  if (!all) return 0;
  return Math.round((bad / all) * 1000) / 10;
}

function allocateOrderTotalToCategories(order) {
  const out = {};
  if (!order.lineItems || order.lineItems.length === 0) {
    out.Other = (out.Other || 0) + (order.total || 0);
    return out;
  }
  const q = order.lineItems.reduce((s, l) => s + l.quantity, 0) || 1;
  for (const li of order.lineItems) {
    const share = (order.total * li.quantity) / q;
    const cat = (li.category && li.category.trim()) || "Whole Spices";
    out[cat] = (out[cat] || 0) + share;
  }
  return out;
}

const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const thisStart = startOfMonth(now);
    const thisEnd = endOfMonth(now);
    const lastStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const lastEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    // Category mix date threshold
    const d90 = new Date(now);
    d90.setDate(d90.getDate() - 90);

    // Setup monthly revenue queries (last 7 months)
    const monthQueries = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const s = startOfMonth(d);
      const e = endOfMonth(d);
      monthQueries.push({
        d,
        promise: sumRevenue(s, e)
      });
    }

    // Execute everything in parallel
    const [
      [
        revThis,
        revLast,
        ordThis,
        ordLast,
        custThis,
        custLast,
        retThis,
        retLast,
      ],
      monthlyRevenues,
      orderBatch,
      recent,
      customerDashboard,
    ] = await Promise.all([
      // 1. KPI metrics
      Promise.all([
        sumRevenue(thisStart, thisEnd),
        sumRevenue(lastStart, lastEnd),
        countOrders(thisStart, thisEnd),
        countOrders(lastStart, lastEnd),
        countUniqueCustomers(thisStart, thisEnd),
        countUniqueCustomers(lastStart, lastEnd),
        returnRatePercent(thisStart, thisEnd),
        returnRatePercent(lastStart, lastEnd),
      ]),
      // 2. Monthly Revenues
      Promise.all(monthQueries.map(mq => mq.promise)),
      // 3. Category Mix
      Order.find({
        orderDate: { $gte: d90 },
        status: { $ne: "Cancelled" },
      })
        .select("total lineItems")
        .lean(),
      // 4. Recent Orders
      Order.find()
        .sort({ orderDate: -1 })
        .limit(5)
        .lean(),
      // 5. Customer Dashboard stats
      getCustomerStatsPayload().catch(() => null),
    ]);

    // Build KPIs
    const kpis = {
      totalRevenue: {
        value: revThis,
        display: formatInShortLKR(revThis),
        changePct: pctChange(revThis, revLast),
      },
      totalOrders: {
        value: ordThis,
        changePct: pctChange(ordThis, ordLast),
      },
      customers: {
        value: custThis,
        changePct: pctChange(custThis, custLast),
      },
      returnRate: {
        value: retThis,
        changePct: Math.round((retThis - retLast) * 10) / 10,
      },
    };

    // Format Monthly revenues
    const revenueByMonth = monthlyRevenues.map((rev, index) => {
      const d = monthQueries[index].d;
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: MONTH_LABELS[d.getMonth()],
        year: d.getFullYear(),
        revenue: rev,
        label: formatInShortLKR(rev),
      };
    });

    // Category mix calculations
    const catTotals = {};
    for (const o of orderBatch) {
      const parts = allocateOrderTotalToCategories(o);
      for (const [k, v] of Object.entries(parts)) {
        catTotals[k] = (catTotals[k] || 0) + v;
      }
    }
    const catSum = Object.values(catTotals).reduce((a, b) => a + b, 0);
    const salesByCategory = Object.entries(catTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: catSum ? Math.round((amount / catSum) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const top = salesByCategory[0];
    const donutCenter = top
      ? { percent: top.percent, label: top.category.split("&")[0].trim() }
      : { percent: 0, label: "—" };

    // Format Recent Orders
    const recentOrders = recent.map((o) => {
      const productsLabel =
        o.lineItems && o.lineItems.length
          ? o.lineItems.map((li) => `${li.name} × ${li.quantity}`).join(", ")
          : `${o.itemCount} item(s)`;
      return {
        orderId: o.orderId,
        customerName: o.customerName,
        productsLabel,
        amount: o.total,
        status: o.status,
        orderDate: o.orderDate,
      };
    });

    res.json({
      kpis,
      revenueByMonth,
      salesByCategory,
      donutCenter,
      recentOrders,
      customerDashboard,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Overview failed" });
  }
};

module.exports = { getOverview };
