const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { suggestId, listDistributors, createDistributor, updateDistributor, deleteDistributor } = require("../controllers/distributorController");

const router = express.Router();

router.use(requireAuth); // Temporarily bypassed role check for testing
router.get("/suggest-id", suggestId);
router.get("/", listDistributors);
router.post("/", createDistributor);
router.put("/:id", updateDistributor);
router.delete("/:id", deleteDistributor);

module.exports = router;
