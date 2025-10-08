import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { createMailer } from "../config/mailer.js";

const router = express.Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ uid: user._id, email: user.email, name: user.name }, secret, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, preferredCategoryId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({ name, email, passwordHash, preferredCategoryId, isProfileComplete: false, emailVerified: false, emailOtpCode: otp, emailOtpExpiresAt: otpExpires });
    // send OTP email
    const mailer = createMailer();
    if (mailer) {
      try {
        await mailer.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER,
          to: email,
          subject: "Your verification code",
          text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        });
      } catch (e) {
        console.warn("Failed to send OTP email:", e?.message || e);
      }
    }
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, preferredCategoryId: user.preferredCategoryId || null, isProfileComplete: user.isProfileComplete } });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error("/api/auth/register error:", err);
    res.status(500).json({ message: "Registration failed", error: err?.message || String(err) });
  }
});

// Verify email OTP
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "email and code required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.emailOtpCode || !user.emailOtpExpiresAt) return res.status(400).json({ message: "No OTP requested" });
    if (user.emailOtpExpiresAt.getTime() < Date.now()) return res.status(400).json({ message: "OTP expired" });
    if (user.emailOtpCode !== code) return res.status(400).json({ message: "Invalid OTP" });
    user.emailVerified = true;
    user.emailOtpCode = null;
    user.emailOtpExpiresAt = null;
    await user.save();
    res.json({ message: "Email verified" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err?.message || String(err) });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, preferredCategoryId: user.preferredCategoryId || null, isProfileComplete: user.isProfileComplete } });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.uid).select("name email phone address preferredCategoryId isProfileComplete wishlist saveForLater");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone || "", address: user.address || "", preferredCategoryId: user.preferredCategoryId || null, isProfileComplete: user.isProfileComplete, wishlist: user.wishlist || [], saveForLater: user.saveForLater || [] });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Update current user profile
router.put("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret);
    const { name, phone, address, preferredCategoryId, isProfileComplete } = req.body;
    const update = {};
    if (typeof name === "string") update.name = name;
    if (typeof phone === "string") update.phone = phone;
    if (typeof address === "string") update.address = address;
    if (preferredCategoryId) update.preferredCategoryId = preferredCategoryId;
    if (typeof isProfileComplete === "boolean") update.isProfileComplete = isProfileComplete;
    const user = await User.findByIdAndUpdate(payload.uid, update, { new: true }).select("name email phone address preferredCategoryId isProfileComplete wishlist saveForLater");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone || "", address: user.address || "", preferredCategoryId: user.preferredCategoryId || null, isProfileComplete: user.isProfileComplete, wishlist: user.wishlist || [], saveForLater: user.saveForLater || [] });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;


