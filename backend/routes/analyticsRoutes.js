const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { getAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/", requireAuth, requireRoles("admin"), getAnalytics);

module.exports = router;
