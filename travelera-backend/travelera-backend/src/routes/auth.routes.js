const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");
const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require("../validators/auth.validator");

router.post("/register", authLimiter, validate(registerSchema), ctrl.register);
router.post("/verify-otp", authLimiter, validate(verifyOtpSchema), ctrl.verifyOtp);
router.post("/resend-otp", authLimiter, ctrl.resendOtp);
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", authenticate, ctrl.logout);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), ctrl.resetPassword);
router.get("/me", authenticate, ctrl.me);

module.exports = router;
