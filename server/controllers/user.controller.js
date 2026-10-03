import crypto from "crypto";
import User, { Payment } from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  // null (not {user:null}) so the client can simply check `if (userData)`
  return res.json(req.user ?? null);
};

// DEMO ONLY. Anyone could call the old version to mint unlimited credits.
// Disabled unless ALLOW_DEMO_CREDITS=true (local dev). Real purchases use /create-order + /verify-payment.
export const addCredits = async (req, res) => {
  try {
    if (process.env.ALLOW_DEMO_CREDITS !== "true") {
      return res.status(403).json({ message: "Online payments are not enabled yet." });
    }

    const { plan } = req.body;
    const planCredits = { pro: 500, premium: 1200 };

    if (plan === "free") {
      return res.status(400).json({ message: "Free credits are added when you sign up." });
    }
    if (!planCredits[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { credits: planCredits[plan] }, $set: { plan } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: `${planCredits[plan]} credits added successfully`,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Add credits error:", error);
    return res.status(500).json({ message: "Failed to add credits" });
  }
};

// ---------------- Razorpay (INR) ----------------
// Needs RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
// Prices and credits live on the SERVER only; the client just names a plan.
const PLANS = {
  pro: { amount: 49900, credits: 500 }, // paise
  premium: { amount: 99900, credits: 1200 },
};

const safeEqual = (a = "", b = "") => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// Idempotent: only the first caller (verify OR webhook) flips created -> paid and adds credits
const fulfillOrder = async (orderId, paymentId) => {
  const payment = await Payment.findOneAndUpdate(
    { orderId, status: "created" },
    { $set: { status: "paid", paymentId } },
    { new: true }
  );
  if (!payment) return null;
  return User.findByIdAndUpdate(
    payment.user,
    { $inc: { credits: payment.credits }, $set: { plan: payment.plan } },
    { new: true }
  );
};

export const createOrder = async (req, res) => {
  try {
    const plan = PLANS[req.body.plan];
    if (!plan) return res.status(400).json({ message: "Invalid plan" });

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: plan.amount,
        currency: "INR",
        receipt: `gw_${Date.now()}`,
        notes: { userId: String(req.user._id), plan: req.body.plan },
      }),
    });
    const order = await r.json();
    if (!r.ok) {
      console.error("Razorpay order error:", order);
      return res.status(502).json({ message: "Could not start the payment. Try again." });
    }

    await Payment.create({
      user: req.user._id, orderId: order.id, plan: req.body.plan, amount: plan.amount, credits: plan.credits,
    });

    return res.json({ orderId: order.id, amount: plan.amount, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Could not start the payment. Try again." });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((v) => typeof v === "string")) {
      return res.status(400).json({ message: "Invalid payment details" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (!safeEqual(expected, razorpay_signature)) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const owned = await Payment.findOne({ orderId: razorpay_order_id, user: req.user._id });
    if (!owned) return res.status(404).json({ message: "Order not found" });

    const user = (await fulfillOrder(razorpay_order_id, razorpay_payment_id)) || (await User.findById(req.user._id));
    return res.json({ message: `${owned.credits} credits added successfully`, credits: user.credits });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ message: "Could not verify the payment" });
  }
};

// Covers users who pay and close the tab before verify runs. Mounted with express.raw() in index.js.
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(503).end();

    const expected = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
    if (!safeEqual(expected, req.get("x-razorpay-signature"))) return res.status(400).end();

    const event = JSON.parse(req.body.toString("utf8"));
    const entity = event?.payload?.payment?.entity;
    if (event.event === "payment.captured" && entity?.order_id) {
      await fulfillOrder(entity.order_id, entity.id);
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).end();
  }
};