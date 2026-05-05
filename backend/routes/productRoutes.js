const express = require("express");
const upload = require("../middleware/upload");
const { requireAuth, requireRoles } = require("../middleware/auth");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.post("/", requireAuth, requireRoles("admin"), upload.single("image"), createProduct);
router.put("/:id", requireAuth, requireRoles("admin"), upload.single("image"), updateProduct);
router.delete("/:id", requireAuth, requireRoles("admin"), deleteProduct);

module.exports = router;
