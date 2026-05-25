const express = require("express");
const { requireAuth, optionalAuth, requireRoles } = require("../middleware/auth");
const {
  getOrders,
  getStats,
  createOrder,
  getMyOrders,
  updateOrderStatus,
  updateOrderPayment,
  getBillerOrders,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", optionalAuth, createOrder);

router.use(requireAuth);
router.get("/my-orders", getMyOrders);
router.get("/biller-orders", requireRoles("biller"), getBillerOrders);

// Biller can update status/payment only on their own orders
router.patch("/:id/status", requireRoles("admin", "biller"), updateOrderStatus);
router.patch("/:id/payment", requireRoles("admin", "biller"), updateOrderPayment);

router.use(requireRoles("admin"));
router.get("/stats", getStats);
router.get("/", getOrders);
router.delete("/:id", deleteOrder);

module.exports = router;
