const express = require("express");
const {
  register,
  login,
  me,
  loginWithGoogle,
  registerSendOtp,
  registerVerifyOtp,
  forgotSendOtp,
  forgotVerifyOtp,
  resetPassword,
  changePassword,
  updatePreferences
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/register-send-otp", registerSendOtp);
router.post("/register-verify-otp", registerVerifyOtp);
router.post("/forgot-send-otp", forgotSendOtp);
router.post("/forgot-verify-otp", forgotVerifyOtp);
router.post("/reset-password", resetPassword);
router.post("/login", login);
router.post("/google", loginWithGoogle);
router.post("/change-password", requireAuth, changePassword);
router.put("/preferences", requireAuth, updatePreferences);
router.get("/me", requireAuth, me);

module.exports = router;
