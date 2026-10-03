import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String },
    credits: { type: Number, default: 100, min: 0 },
    // was ['free','premium','enterprise'], which did not match the Pricing page plans
    plan: { type: String, enum: ["free", "pro", "premium"], default: "free" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Razorpay orders. Kept in this file so no extra model file is needed.
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    plan: { type: String, enum: ["pro", "premium"], required: true },
    amount: { type: Number, required: true }, // paise
    credits: { type: Number, required: true },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);

export default User;