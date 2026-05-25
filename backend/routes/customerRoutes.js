const express = require("express");
const { getCustomers, getStats, deleteCustomer } = require("../controllers/customerController");

const router = express.Router();

router.get("/stats", getStats);
router.get("/", getCustomers);
router.delete("/:id", deleteCustomer);

module.exports = router;
