const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { getOrders, getStats, createOrder, getMyOrders } = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder); // Allow guests to place orders

router.use(requireAuth);
router.get("/my-orders", getMyOrders);

router.use(requireRoles("admin"));
router.get("/stats", getStats);
router.get("/", getOrders);

module.exports = router;
