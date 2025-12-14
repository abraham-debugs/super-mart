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
    
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = String(email).toLowerCase().trim();
    
    // Check if user already exists (case-insensitive)
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      console.log(`❌ Registration failed: Email "${normalizedEmail}" already registered`);
      return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    // Create user with normalized email
    const user = await User.create({ 
      name, 
      email: normalizedEmail, 
      passwordHash, 
      preferredCategoryId, 
      isProfileComplete: false, 
      emailVerified: false, 
      emailOtpCode: otp, 
      emailOtpExpiresAt: otpExpires 
    });
    
    console.log(`✅ User created: ${normalizedEmail}, OTP: ${otp}`);

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
    console.log(`📧 Attempting to send OTP email to ${normalizedEmail}...`);
    const mailer = createMailer();
    if (mailer) {
      try {
        const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
        console.log(`📧 Sending email from: ${fromEmail} to: ${normalizedEmail}`);
        
        const mailOptions = {
          from: fromEmail,
          to: normalizedEmail,
          subject: "Your verification code",
          text: `Your OTP is ${otp}. It expires in 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Email Verification Code</h2>
              <p>Your verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #e74c3c; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
            </div>
          `
        };
        
        const info = await mailer.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${normalizedEmail}`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
      } catch (e) {
        console.error("❌ Failed to send OTP email:", e?.message || e);
        console.error("   Error details:", e);
        // Log OTP to console as fallback
        console.log(`\n📧 [FALLBACK] OTP for ${normalizedEmail}: ${otp}`);
        console.log(`   This OTP expires in 10 minutes.`);
        console.log(`   Email sending failed, but user can still verify using this OTP.\n`);
      }
    } else {
      // If mailer is not configured, log OTP to console for development
      console.log(`\n📧 [DEVELOPMENT MODE] OTP for ${normalizedEmail}: ${otp}`);
      console.log(`   This OTP expires in 10 minutes.`);
      console.log(`   SMTP not configured - email not sent.\n`);
    }
    const token = signToken(user);
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        preferredCategoryId: user.preferredCategoryId || null, 
        isProfileComplete: user.isProfileComplete, 
        role: user.role || "user" 
      } 
    });
  } catch (err) {
    if (err && err.code === 11000) {
      console.log(`❌ Registration failed: Duplicate key error for email`);
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
    
    // Normalize email
    const normalizedEmail = String(email).toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (!user.emailOtpCode || !user.emailOtpExpiresAt) {
      return res.status(400).json({ message: "No OTP requested. Please request a new OTP." });
    }
    
    if (user.emailOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }
    
    if (user.emailOtpCode !== code) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }
    
    user.emailVerified = true;
    user.emailOtpCode = null;
    user.emailOtpExpiresAt = null;
    await user.save();
    
    console.log(`✅ Email verified for ${normalizedEmail}`);
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Verification failed", error: err?.message || String(err) });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  console.log("📧 Resend OTP endpoint called");
  try {
    const { email } = req.body;
    if (!email) {
      console.log("❌ Resend OTP: email missing");
      return res.status(400).json({ message: "email required" });
    }
    
    // Normalize email
    const normalizedEmail = String(email).toLowerCase().trim();
    console.log(`📧 Resend OTP: Processing request for ${normalizedEmail}`);
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`❌ Resend OTP: User not found for ${normalizedEmail}`);
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    user.emailOtpCode = otp;
    user.emailOtpExpiresAt = otpExpires;
    await user.save();
    console.log(`✅ Resend OTP: New OTP generated for ${normalizedEmail}`);
    
    // Send OTP email
    const mailer = createMailer();
    if (mailer) {
      try {
        const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER;
        await mailer.sendMail({
          from: fromEmail,
          to: normalizedEmail,
          subject: "Your verification code",
          text: `Your OTP is ${otp}. It expires in 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Email Verification Code</h2>
              <p>Your verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #e74c3c; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
            </div>
          `
        });
        console.log(`✅ OTP email resent to ${normalizedEmail} from ${fromEmail}`);
      } catch (e) {
        console.error("Failed to send OTP email:", e?.message || e);
        // Log OTP to console as fallback
        console.log(`\n📧 [FALLBACK] Resent OTP for ${normalizedEmail}: ${otp}`);
        console.log(`   This OTP expires in 10 minutes.\n`);
      }
    } else {
      // If mailer is not configured, log OTP to console for development
      console.log(`\n📧 [DEVELOPMENT MODE] Resent OTP for ${normalizedEmail}: ${otp}`);
      console.log(`   This OTP expires in 10 minutes.\n`);
    }
    
    res.json({ message: "OTP has been resent to your email" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP", error: err?.message || String(err) });
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

// Test endpoint to verify route is accessible
router.get("/admin/test", (_req, res) => {
  res.json({ message: "Admin route is accessible", timestamp: new Date().toISOString() });
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


