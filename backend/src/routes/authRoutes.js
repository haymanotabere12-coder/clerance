const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many attempts, try again later" },
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, me);

module.exports = router;
