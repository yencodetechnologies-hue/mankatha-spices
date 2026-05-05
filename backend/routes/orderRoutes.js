const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { getOrders, getStats } = require("../controllers/orderController");

const router = express.Router();

router.use(requireAuth, requireRoles("admin"));
router.get("/stats", getStats);
router.get("/", getOrders);

module.exports = router;
