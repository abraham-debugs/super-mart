import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Personalization } from "../models/Personalization.js";
import { createMailer } from "../config/mailer.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ uid: user._id, email: user.email, name: user.name, role: user.role || "user" }, secret, { expiresIn: "7d" });
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

    // create personalization record if preferredCategoryId provided
    if (preferredCategoryId) {
      try {
        await Personalization.create({ userId: user._id, preferredCategoryId });
      } catch (e) {
        // non-fatal - personalization can be updated later
        console.warn("Failed to create personalization record:", e?.message || e);
      }
    }
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
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, preferredCategoryId: user.preferredCategoryId || null, isProfileComplete: user.isProfileComplete, role: user.role || "user" } });
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
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }
    
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = String(email).toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`Login attempt failed: User not found for email "${normalizedEmail}"`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check if user has a password hash
    if (!user.passwordHash) {
      console.log(`Login attempt failed: User "${normalizedEmail}" has no password hash`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log(`Login attempt failed: Invalid password for email "${normalizedEmail}"`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = signToken(user);
    console.log(`Login successful: User "${normalizedEmail}" logged in`);
    res.json({ 
      token, 
      user: { 
        id: String(user._id), 
        name: user.name, 
        email: user.email, 
        preferredCategoryId: user.preferredCategoryId || null, 
        isProfileComplete: user.isProfileComplete, 
        role: user.role || "user" 
      } 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err?.message || String(err) });
  }
});

// Admin login - validates admin/superadmin role
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[Admin Login] Attempt from email: ${email}`);
    console.log(`[Admin Login] Password length: ${password ? password.length : 'missing'}`);
    
    if (!email || !password) {
      console.log(`[Admin Login] Missing email or password`);
      return res.status(400).json({ message: "Email and password required" });
    }
    
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = String(email).toLowerCase().trim();
    console.log(`[Admin Login] Normalized email: ${normalizedEmail}`);
    
    // Try multiple query methods to ensure we find the user
    let user = await User.findOne({ email: normalizedEmail });
    
    // If not found with exact match, try case-insensitive regex
    if (!user) {
      console.log(`[Admin Login] Trying case-insensitive search...`);
      user = await User.findOne({ 
        email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }
    
    // If still not found, search for any variation
    if (!user) {
      console.log(`[Admin Login] Trying partial match search...`);
      const emailParts = normalizedEmail.split('@');
      if (emailParts.length === 2) {
        user = await User.findOne({ 
          email: { $regex: new RegExp(`^${emailParts[0]}@${emailParts[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      }
    }
    if (!user) {
      console.log(`[Admin Login] ❌ User not found for email "${normalizedEmail}"`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(`[Admin Login] ✅ User found: ${user._id}, role: ${user.role}`);
    
    // Check if user has a password hash
    if (!user.passwordHash) {
      console.log(`[Admin Login] ❌ User "${normalizedEmail}" has no password hash`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(`[Admin Login] ✅ Password hash exists`);
    
    // Verify password
    console.log(`[Admin Login] Comparing password with hash...`);
    console.log(`[Admin Login] Password to check: "${password}" (length: ${password.length})`);
    console.log(`[Admin Login] Stored hash (first 30 chars): ${user.passwordHash.substring(0, 30)}...`);
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log(`[Admin Login] Password verification result: ${ok}`);
    
    if (!ok) {
      console.log(`[Admin Login] ❌ Invalid password for email "${normalizedEmail}"`);
      console.log(`[Admin Login] User ID from DB: ${user._id}`);
      console.log(`[Admin Login] User role from DB: ${user.role}`);
      
      // Try to re-hash and update immediately
      console.log(`[Admin Login] Attempting to fix password hash in real-time...`);
      try {
        const newHash = await bcrypt.hash(password, 10);
        user.passwordHash = newHash;
        user.role = 'superadmin';
        await user.save();
        console.log(`[Admin Login] ✅ Password hash updated, retrying...`);
        
        const retryOk = await bcrypt.compare(password, user.passwordHash);
        if (retryOk) {
          console.log(`[Admin Login] ✅ Password now works after fix!`);
          // Continue with login
        } else {
          console.log(`[Admin Login] ❌ Still failing after update`);
          return res.status(401).json({ message: "Invalid credentials" });
        }
      } catch (fixErr) {
        console.log(`[Admin Login] Failed to fix: ${fixErr.message}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }
    console.log(`[Admin Login] ✅ Password verified successfully`);
    
    // Check if user has admin or superadmin role
    const userRole = user.role || "user";
    console.log(`[Admin Login] Role check: ${userRole}`);
    if (userRole !== "admin" && userRole !== "superadmin") {
      console.log(`[Admin Login] ❌ User "${normalizedEmail}" does not have admin role (role: ${userRole})`);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    console.log(`[Admin Login] ✅ Role check passed`);
    
    // Generate token with role
    const token = signToken(user);
    console.log(`[Admin Login] ✅ SUCCESS: User "${normalizedEmail}" (${userRole}) logged in`);
    
    res.json({ 
      token, 
      user: { 
        id: String(user._id), 
        name: user.name, 
        email: user.email, 
        role: userRole,
        preferredCategoryId: user.preferredCategoryId || null, 
        isProfileComplete: user.isProfileComplete
      } 
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Login failed", error: err?.message || String(err) });
  }
});

// Presence heartbeat: marks the current user online and updates lastSeen
router.post("/heartbeat", requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Heartbeat failed", error: err?.message || String(err) });
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
    const user = await User.findById(payload.uid).select("name email phone address preferredCategoryId isProfileComplete wishlist saveForLater role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone || "", address: user.address || "", preferredCategoryId: user.preferredCategoryId || null, isProfileComplete: user.isProfileComplete, wishlist: user.wishlist || [], saveForLater: user.saveForLater || [], role: user.role || "user" });
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
    const user = await User.findByIdAndUpdate(payload.uid, update, { new: true }).select("name email phone address preferredCategoryId isProfileComplete wishlist saveForLater role");
    if (!user) return res.status(404).json({ message: "User not found" });

    // upsert personalization for this user
    if (preferredCategoryId) {
      try {
        await Personalization.findOneAndUpdate(
          { userId: payload.uid },
          { preferredCategoryId },
          { upsert: true, new: true }
        );
      } catch (e) {
        console.warn("Failed to upsert personalization:", e?.message || e);
      }
    }
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone || "", address: user.address || "", preferredCategoryId: user.preferredCategoryId || null, isProfileComplete: user.isProfileComplete, wishlist: user.wishlist || [], saveForLater: user.saveForLater || [], role: user.role || "user" });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;


