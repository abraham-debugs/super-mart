import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    // Check role in token first (faster)
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      return next();
    }
    
    // If role not in token or role is "user", check database (in case role was updated after token was issued)
    const user = await User.findById(req.user.uid).select("role");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (user.role === "admin" || user.role === "superadmin") {
      // Update token role for this request (won't persist but will help in this request)
      req.user.role = user.role;
      return next();
    }
    
    // User doesn't have admin or superadmin role
    return res.status(403).json({ 
      message: "Admin access required",
      userRole: user.role || "user"
    });
  } catch (err) {
    console.error("requireAdmin error:", err);
    return res.status(500).json({ 
      message: "Failed to verify admin status", 
      error: err?.message || String(err) 
    });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
}


