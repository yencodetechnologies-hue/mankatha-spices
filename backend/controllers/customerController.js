const Customer = require("../models/Customer");

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const buildFilter = (query) => {
  const { search = "", tier = "All", city = "All" } = query;
  const filter = {};
  if (tier && tier !== "All") filter.tier = tier;
  if (city && city !== "All") filter.city = city;
  if (search && String(search).trim()) {
    const q = String(search).trim();
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  return filter;
};

const getCustomers = async (req, res) => {
  try {
    const { search = "", tier = "All", city = "All", page = 1, limit = 10 } = req.query;
    const filter = buildFilter({ search, tier, city });
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Customer.find(filter).sort({ joinedAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Customer.countDocuments(filter),
    ]);

    res.json({
      customers: items,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load customers" });
  }
};

/** Shared payload for GET /api/customers/stats and overview `customerDashboard`. */
async function getCustomerStatsPayload() {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [
    totalRegistered,
    activeThisMonth,
    avgLifetimeAgg,
    repeatAgg,
    avgOrdersAgg,
    distinctCities,
  ] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ lastActivityAt: { $gte: monthStart } }),
    Customer.aggregate([{ $group: { _id: null, v: { $avg: "$totalSpent" } } }]),
    Customer.aggregate([
      {
        $group: {
          _id: null,
          repeat: { $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]),
    Customer.aggregate([{ $group: { _id: null, v: { $avg: "$orderCount" } } }]),
    Customer.distinct("city"),
  ]);

  const avgLifetimeValue = Math.round(avgLifetimeAgg[0]?.v || 0);
  const avgOrdersPerCustomer = Math.round((avgOrdersAgg[0]?.v || 0) * 10) / 10;
  const r = repeatAgg[0];
  const repeatPurchaseRate =
    r && r.total > 0 ? Math.round((r.repeat / r.total) * 1000) / 10 : 0;

  return {
    totalRegistered,
    activeThisMonth,
    avgLifetimeValue,
    repeatPurchaseRate,
    avgOrdersPerCustomer,
    cities: distinctCities.sort(),
  };
}

const getStats = async (req, res) => {
  try {
    const payload = await getCustomerStatsPayload();
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load customer stats" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    // Also delete the User account if it exists with this email? 
    // Not strictly required for now, but usually they just want the CRM customer entry deleted.
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete customer" });
  }
};

module.exports = { getCustomers, getStats, getCustomerStatsPayload, deleteCustomer };
