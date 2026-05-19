const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { listCategories, createCategory, renameCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.use(requireAuth, requireRoles("admin"));
router.get("/", listCategories);
router.post("/", createCategory);
router.put("/:id", renameCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
