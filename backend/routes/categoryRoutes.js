const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { listCategories, createCategory, renameCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", listCategories);
router.post("/", requireAuth, requireRoles("admin"), createCategory);
router.put("/:id", requireAuth, requireRoles("admin"), renameCategory);
router.delete("/:id", requireAuth, requireRoles("admin"), deleteCategory);

module.exports = router;
