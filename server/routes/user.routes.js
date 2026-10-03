import express from "express";
import { getCurrentUser, addCredits, createOrder, verifyPayment } from "../controllers/user.controller.js";
import isAuth, { requireAuth } from "../middleware/isAuth.js";

const userRouter = express.Router();

userRouter.get("/me", isAuth, getCurrentUser); // optional auth: returns null when signed out
userRouter.post("/add-credits", requireAuth, addCredits); // demo only, see controller
userRouter.post("/create-order", requireAuth, createOrder); // Razorpay
userRouter.post("/verify-payment", requireAuth, verifyPayment);
// the Razorpay webhook (POST /api/user/webhook) is mounted in index.js because it needs the raw body

export default userRouter;