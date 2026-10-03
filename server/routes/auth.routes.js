import express from "express";
import rateLimit from "express-rate-limit";
import { googleAuth, logout } from "../controllers/auth.controller.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Try again later." },
});

router.post("/google", authLimiter, googleAuth);
router.route("/logout").get(logout).post(logout);

export default router;