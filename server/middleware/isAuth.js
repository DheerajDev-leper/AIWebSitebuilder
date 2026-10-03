import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isProd = () => process.env.NODE_ENV === "production";

// Same-site setup (app.example.com + api.example.com): COOKIE_DOMAIN=.example.com, COOKIE_SAMESITE=lax
// Different sites (x.vercel.app + y.onrender.com): "none" is needed, but Safari/iOS may still block it.
const baseCookie = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: process.env.COOKIE_SAMESITE || (isProd() ? "none" : "lax"),
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
});

export const authCookieOptions = () => ({ ...baseCookie(), maxAge: 3 * 24 * 60 * 60 * 1000 });
export const clearCookieOptions = () => baseCookie();

// Optional auth: sets req.user when a valid cookie exists, otherwise continues anonymously.
const isAuth = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
    else res.clearCookie("token", clearCookieOptions());
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      res.clearCookie("token", clearCookieOptions());
      return next(); // bad/expired token = anonymous, not a server error
    }
    return next(error);
  }
};

const mustHaveUser = (req, res, next) =>
  req.user ? next() : res.status(401).json({ message: "Unauthorized" });

// Use on every private route
export const requireAuth = [isAuth, mustHaveUser];

export default isAuth;