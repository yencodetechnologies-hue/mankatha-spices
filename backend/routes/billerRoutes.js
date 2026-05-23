const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const {
  listBillers,
  createBiller,
  updateBiller,
  deleteBiller,
} = require("../controllers/billerController");

const router = express.Router();

router.use(requireAuth);
router.use(requireRoles("admin"));

router.get("/", listBillers);
router.post("/", createBiller);
router.put("/:id", updateBiller);
router.delete("/:id", deleteBiller);

module.exports = router;
