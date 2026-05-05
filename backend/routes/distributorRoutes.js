const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { suggestId, listDistributors, createDistributor } = require("../controllers/distributorController");

const router = express.Router();

router.use(requireAuth, requireRoles("admin", "vendor"));
router.get("/suggest-id", suggestId);
router.get("/", listDistributors);
router.post("/", createDistributor);

module.exports = router;
