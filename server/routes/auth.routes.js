import express from "express";
import { googleAuth, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// Define your authentication routes here
router.post("/google", googleAuth);
router.get("/logout", logout);

export default router;