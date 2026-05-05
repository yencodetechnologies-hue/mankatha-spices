const express = require("express");
const { getCustomers, getStats } = require("../controllers/customerController");

const router = express.Router();

router.get("/stats", getStats);
router.get("/", getCustomers);

module.exports = router;
