import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import connect from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import websiteRouter, { siteRouter } from "./routes/website.routes.js";
import { razorpayWebhook } from "./controllers/user.controller.js";

// ---- fail fast on missing configuration ----
const missing = ["MONGO_URL", "JWT_SECRET", "CLIENT_URL", "OPENROUTER_API_KEY"].filter((k) => !process.env[k]);
if (!process.env.FIREBASE_PROJECT_ID && !process.env.FIREBASE_SERVICE_ACCOUNT) missing.push("FIREBASE_PROJECT_ID");
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

// CLIENT_URL may hold several origins, comma separated
const clientOrigins = () =>
  (process.env.CLIENT_URL || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);

// Blocks cross-site requests that carry the auth cookie (CSRF), including state-changing GETs
const csrfGuard = (req, res, next) => {
  const origin = req.get("origin");
  if (origin) {
    return clientOrigins().includes(origin) ? next() : res.status(403).json({ message: "Forbidden origin" });
  }
  if (req.get("sec-fetch-site") === "cross-site") return res.status(403).json({ message: "Forbidden" });
  next();
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

await connect(); // don't accept traffic without a database

const app = express();
app.set("trust proxy", 1); // correct client IPs behind Render/Nginx/Cloudflare (rate limits)
app.disable("x-powered-by");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

app.get("/health", (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));

// Public HTML for deployed sites + sitemap (no cookies, no CORS)
app.use(siteRouter);

// Webhook needs the RAW body, so it is mounted before express.json()
app.post("/api/user/webhook", express.raw({ type: "application/json", limit: "1mb" }), razorpayWebhook);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || clientOrigins().includes(origin)) return cb(null, true);
      const err = new Error("Origin not allowed");
      err.status = 403;
      cb(err);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use("/api", apiLimiter, csrfGuard);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);
app.use("/api/website", websiteRouter);

app.use((req, res) => res.status(404).json({ message: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || (err.type === "entity.too.large" ? 413 : 500);
  if (status >= 500) console.error("Unhandled error:", err);
  res.status(status).json({ message: status >= 500 ? "Internal server error" : err.message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Keep-alive above typical load balancer idle timeouts (avoids random 502s)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));