import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { authCookieOptions, clearCookieOptions } from "../middleware/isAuth.js";

// Verifying a sign-in token only needs your Firebase PROJECT ID (public).
// FIREBASE_SERVICE_ACCOUNT is optional.
const firebaseAuth = () => {
  let app;
  if (getApps().length) app = getApp();
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (account.private_key) account.private_key = account.private_key.replace(/\\n/g, "\n");
    app = initializeApp({ credential: cert(account) });
  } else {
    app = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
  }
  return getAuth(app);
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ message: "Sign-in token is required" });
    }

    // Never trust a client-supplied email: verify the Firebase ID token server-side.
    let decoded;
    try {
      decoded = await firebaseAuth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ message: "Invalid sign-in token" });
    }

    if (!decoded.email || decoded.email_verified === false) {
      return res.status(401).json({ message: "A verified email is required" });
    }

    const email = decoded.email.toLowerCase();
    const name = decoded.name || email.split("@")[0];
    const avatar = decoded.picture;

    let user = await User.findOne({ email });
    let created = false;

    if (!user) {
      try {
        user = await User.create({ name, email, avatar });
        created = true;
      } catch (e) {
        if (e.code !== 11000) throw e; // two tabs signing up at once
        user = await User.findOne({ email });
      }
    } else if (avatar && user.avatar !== avatar) {
      user.avatar = avatar;
      await user.save();
    }

    // Always set the cookie (the old code skipped it for brand-new users)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
    res.cookie("token", token, authCookieOptions());

    return res
      .status(created ? 201 : 200)
      .json({ message: created ? "User created successfully" : "User logged in successfully", user });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", clearCookieOptions());
  return res.status(200).json({ message: "User logged out successfully" });
};