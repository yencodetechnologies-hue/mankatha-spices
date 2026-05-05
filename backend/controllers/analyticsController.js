const Order = require("../models/Order");
const AnalyticsEvent = require("../models/AnalyticsEvent");

const SOURCE_LABELS = {
  organic: "Organic Search",
  social: "Social Media",
  direct: "Direct",
  email: "Email",
  referral: "Referral",
};

function parseRangeDays(raw) {
  const n = Number.parseInt(String(raw || "30"), 10);
  if (n === 7 || n === 30 || n === 90) return n;
  return 30;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfRangeDaysAgo(days, end = new Date()) {
  const e = endOfDay(end);
  const s = new Date(e);
  s.setDate(s.getDate() - (days - 1));
  s.setHours(0, 0, 0, 0);
  return { start: s, end: e };
}

function previousWindow(start, end) {
  const lenMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  prevEnd.setHours(23, 59, 59, 999);
  const prevStart = new Date(prevEnd.getTime() - lenMs);
  prevStart.setHours(0, 0, 0, 0);
  return { start: prevStart, end: prevEnd };
}

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

function formatCompact(n) {
  const x = Number(n) || 0;
  if (x >= 1_000_000) return `${round1(x / 1_000_000)}M`;
  if (x >= 1000) return `${round1(x / 1000)}K`;
  return String(Math.round(x));
}

function formatInrShort(n) {
  const x = Number(n) || 0;
  if (x >= 100000) return `₹${(x / 100000).toFixed(1)}L`;
  if (x >= 1000) return `₹${(x / 1000).toFixed(1)}k`;
  return `₹${Math.round(x)}`;
}

async function countEvents(start, end, eventType) {
  return AnalyticsEvent.countDocuments({
    occurredAt: { $gte: start, $lte: end },
    eventType,
  });
}

async function orderStats(start, end) {
  const match = {
    orderDate: { $gte: start, $lte: end },
    status: { $ne: "Cancelled" },
  };
  const r = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$total" } } },
  ]);
  const count = r[0]?.count || 0;
  const revenue = r[0]?.revenue || 0;
  return { count, revenue, aov: count ? revenue / count : 0 };
}

function conversionPercent(orders, pageviews) {
  if (!pageviews) return 0;
  return Math.min(100, round1((orders / pageviews) * 100));
}

function cartAbandonmentPercent(addToCarts, orders) {
  if (!addToCarts) return 0;
  const raw = ((addToCarts - Math.min(addToCarts, orders)) / addToCarts) * 100;
  return Math.min(100, Math.max(0, round1(raw)));
}

async function trafficBySource(start, end) {
  const rows = await AnalyticsEvent.aggregate([
    {
      $match: {
        occurredAt: { $gte: start, $lte: end },
        eventType: "pageview",
      },
    },
    { $group: { _id: "$source", count: { $sum: 1 } } },
  ]);
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return rows
    .map((r) => ({
      key: r._id || "direct",
      label: SOURCE_LABELS[r._id] || "Direct",
      count: r.count,
      percent: round1((r.count / total) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);
}

async function topCities(start, end, limit = 6) {
  const baseMatch = {
    occurredAt: { $gte: start, $lte: end },
    eventType: "pageview",
    city: { $nin: [null, ""] },
  };
  const withCity = await AnalyticsEvent.countDocuments(baseMatch);
  const rows = await AnalyticsEvent.aggregate([
    { $match: baseMatch },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  const total = withCity || 1;
  return rows.map((r) => ({
    city: r._id,
    percent: round1((r.count / total) * 100),
  }));
}

function allocateLineItemRevenue(order) {
  const out = {};
  if (!order.lineItems || order.lineItems.length === 0) {
    out.Other = (out.Other || 0) + (order.total || 0);
    return { revenue: out, units: {} };
  }
  const q = order.lineItems.reduce((s, l) => s + l.quantity, 0) || 1;
  const units = {};
  for (const li of order.lineItems) {
    const share = (order.total * li.quantity) / q;
    const name = (li.name && li.name.trim()) || "Other";
    out[name] = (out[name] || 0) + share;
    units[name] = (units[name] || 0) + (li.quantity || 0);
  }
  return { revenue: out, units };
}

async function topProductsByRevenue(start, end, limit = 5) {
  const orders = await Order.find({
    orderDate: { $gte: start, $lte: end },
    status: { $ne: "Cancelled" },
  })
    .select("total lineItems")
    .lean();

  const rev = {};
  const units = {};
  for (const o of orders) {
    const { revenue, units: u } = allocateLineItemRevenue(o);
    for (const [k, v] of Object.entries(revenue)) {
      rev[k] = (rev[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(u)) {
      units[k] = (units[k] || 0) + v;
    }
  }
  const sorted = Object.entries(rev)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const maxRev = sorted[0]?.[1] || 1;
  return sorted.map(([name, revenue], idx) => ({
    rank: idx + 1,
    name,
    revenue,
    revenueDisplay: formatInrShort(revenue),
    unitSales: units[name] || 0,
    barPct: Math.round((revenue / maxRev) * 1000) / 10,
  }));
}

function periodHeading(start) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(start);
}

const getAnalytics = async (req, res) => {
  try {
    const rangeDays = parseRangeDays(req.query.range);
    const now = new Date();
    const { start: curStart, end: curEnd } = startOfRangeDaysAgo(rangeDays, now);
    const { start: prevStart, end: prevEnd } = previousWindow(curStart, curEnd);

    const [
      pvCur,
      pvPrev,
      atcCur,
      atcPrev,
      ordCur,
      ordPrev,
      traffic,
      cities,
      topProducts,
    ] = await Promise.all([
      countEvents(curStart, curEnd, "pageview"),
      countEvents(prevStart, prevEnd, "pageview"),
      countEvents(curStart, curEnd, "add_to_cart"),
      countEvents(prevStart, prevEnd, "add_to_cart"),
      orderStats(curStart, curEnd),
      orderStats(prevStart, prevEnd),
      trafficBySource(curStart, curEnd),
      topCities(curStart, curEnd),
      topProductsByRevenue(curStart, curEnd, 5),
    ]);

    const convCur = conversionPercent(ordCur.count, pvCur);
    const convPrev = conversionPercent(ordPrev.count, pvPrev);
    const abandonCur = cartAbandonmentPercent(atcCur, ordCur.count);
    const abandonPrev = cartAbandonmentPercent(atcPrev, ordPrev.count);

    const pvDeltaPct = pvPrev ? round1(((pvCur - pvPrev) / pvPrev) * 100) : pvCur > 0 ? 100 : 0;

    res.json({
      rangeDays,
      rangeLabel:
        rangeDays === 7 ? "Last 7 Days" : rangeDays === 90 ? "Last 90 Days" : "Last 30 Days",
      periodLabel: periodHeading(curStart),
      updatedAt: new Date().toISOString(),
      kpis: {
        conversionRate: {
          value: convCur,
          display: `${convCur}%`,
          deltaPoints: round1(convCur - convPrev),
          positive: convCur >= convPrev,
        },
        avgOrderValue: {
          value: Math.round(ordCur.aov),
          display: `₹${Math.round(ordCur.aov).toLocaleString("en-IN")}`,
          deltaAmount: Math.round(ordCur.aov - ordPrev.aov),
          positive: ordCur.aov >= ordPrev.aov,
        },
        pageViews: {
          value: pvCur,
          display: formatCompact(pvCur),
          deltaPct: pvDeltaPct,
          positive: pvCur >= pvPrev,
        },
        cartAbandonment: {
          value: abandonCur,
          display: `${abandonCur}%`,
          deltaPoints: round1(abandonCur - abandonPrev),
          /** Higher abandonment is worse for the business. */
          positive: abandonCur <= abandonPrev,
        },
      },
      topProducts,
      trafficSources: traffic,
      topCities: cities,
      meta: {
        ordersInRange: ordCur.count,
        pageviewsInRange: pvCur,
        addToCartsInRange: atcCur,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Analytics failed" });
  }
};

module.exports = { getAnalytics };
