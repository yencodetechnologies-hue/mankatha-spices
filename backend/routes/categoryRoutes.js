const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const { listCategories, createCategory, renameCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

const upload = require("../middleware/upload");

router.get("/", listCategories);
router.post("/", requireAuth, requireRoles("admin"), upload.single("image"), createCategory);
router.put("/:id", requireAuth, requireRoles("admin"), upload.single("image"), renameCategory);
router.delete("/:id", requireAuth, requireRoles("admin"), deleteCategory);

module.exports = router;
