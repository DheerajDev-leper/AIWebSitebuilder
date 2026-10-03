import express from "express";
import rateLimit from "express-rate-limit";
import {
  changes, deploy, generateWebsite, getAll, getBySlug, getWebsiteById,
  saveCode, updateSeo, serveSite, sitemapSites,
} from "../controllers/website.controller.js";
import { requireAuth } from "../middleware/isAuth.js";

// ---- small helpers kept in this file ----
const validateObjectId = (param = "id") => (req, res, next) =>
  /^[a-f\d]{24}$/i.test(req.params[param] || "") ? next() : res.status(400).json({ message: "Invalid id" });

const validateSlug = (req, res, next) =>
  /^[a-z0-9-]{1,80}$/.test(req.params.slug || "") ? next() : res.status(404).json({ message: "Website not found" });

// Must run AFTER requireAuth (keys by user id)
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  message: { message: "You're generating too quickly. Please wait a few minutes." },
});

// One AI job per user at a time (in-memory: use Redis if you run several instances)
const inFlight = new Set();
const oneAtATime = (req, res, next) => {
  const key = String(req.user._id);
  if (inFlight.has(key)) {
    return res.status(429).json({ message: "A request is already running. Wait for it to finish." });
  }
  inFlight.add(key);
  const done = () => inFlight.delete(key);
  res.on("finish", done);
  res.on("close", done);
  next();
};

// ---- /api/website ----
const websiteRouter = express.Router();

websiteRouter.post("/generate", requireAuth, aiLimiter, oneAtATime, generateWebsite);
websiteRouter.post("/update/:id", requireAuth, validateObjectId(), aiLimiter, oneAtATime, changes);
websiteRouter.put("/save/:id", requireAuth, validateObjectId(), saveCode);
websiteRouter.patch("/seo/:id", requireAuth, validateObjectId(), updateSeo);
websiteRouter.get("/get-by-id/:id", requireAuth, validateObjectId(), getWebsiteById);
websiteRouter.get("/get-all", requireAuth, getAll);
websiteRouter.get("/deploy/:id", requireAuth, validateObjectId(), deploy);
websiteRouter.get("/get-by-slug/:slug", validateSlug, getBySlug);

// ---- public, mounted at the app root: real HTML for crawlers + sitemap ----
export const siteRouter = express.Router();
siteRouter.get("/site/:slug", validateSlug, serveSite);
siteRouter.get("/sitemap-sites.xml", sitemapSites);

export default websiteRouter;