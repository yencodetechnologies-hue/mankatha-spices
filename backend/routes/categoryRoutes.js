const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { listCategories, createCategory } = require("../controllers/categoryController");

const router = express.Router();

router.use(requireAuth, requireRoles("admin"));
router.get("/", listCategories);
router.post("/", createCategory);

module.exports = router;
