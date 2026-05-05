const express = require("express");
const { register, login, me, loginWithGoogle } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", loginWithGoogle);
router.get("/me", requireAuth, me);

module.exports = router;
