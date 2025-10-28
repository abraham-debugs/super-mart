import express from "express";
import { PromoCode } from "../models/PromoCode.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all promo codes (Admin only)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const promoCodes = await PromoCode.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    const mapped = promoCodes.map(code => ({
      id: String(code._id),
      code: code.code,
      discountPercent: code.discountPercent,
      expiryDate: code.expiryDate,
      isActive: code.isActive,
      usageLimit: code.usageLimit,
      usedCount: code.usedCount,
      minOrderAmount: code.minOrderAmount,
      createdBy: code.createdBy?.name || 'Unknown',
      createdAt: code.createdAt,
      isValid: code.isValid()
    }));
    
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch promo codes", error: err?.message || String(err) });
  }
});

// Create new promo code (Admin only)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { code, discountPercent, expiryDate, usageLimit, minOrderAmount, isActive } = req.body;
    
    if (!code || !discountPercent || !expiryDate) {
      return res.status(400).json({ message: "Code, discount percent, and expiry date are required" });
    }
    
    // Check if code already exists
    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Promo code already exists" });
    }
    
    // Validate discount percent
    if (discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({ message: "Discount percent must be between 1 and 100" });
    }
    
    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }
    
    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      discountPercent: Number(discountPercent),
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      id: String(promoCode._id),
      code: promoCode.code,
      discountPercent: promoCode.discountPercent,
      expiryDate: promoCode.expiryDate,
      isActive: promoCode.isActive,
      usageLimit: promoCode.usageLimit,
      usedCount: promoCode.usedCount,
      minOrderAmount: promoCode.minOrderAmount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create promo code", error: err?.message || String(err) });
  }
});

// Validate promo code (Public - for customers to check)
router.post("/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "Promo code is required" });
    }
    
    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });
    
    if (!promoCode) {
      return res.status(404).json({ message: "Invalid promo code" });
    }
    
    if (!promoCode.isValid()) {
      return res.status(400).json({ message: "This promo code has expired or is no longer valid" });
    }
    
    if (orderAmount && promoCode.minOrderAmount > orderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${promoCode.minOrderAmount} required for this promo code` 
      });
    }
    
    res.json({
      valid: true,
      code: promoCode.code,
      discountPercent: promoCode.discountPercent,
      message: `${promoCode.discountPercent}% discount applied!`
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to validate promo code", error: err?.message || String(err) });
  }
});

// Update promo code (Admin only)
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountPercent, expiryDate, usageLimit, minOrderAmount, isActive } = req.body;
    
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    
    // Update fields
    if (code) promoCode.code = code.toUpperCase();
    if (discountPercent !== undefined) {
      if (discountPercent < 1 || discountPercent > 100) {
        return res.status(400).json({ message: "Discount percent must be between 1 and 100" });
      }
      promoCode.discountPercent = Number(discountPercent);
    }
    if (expiryDate) promoCode.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) promoCode.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (minOrderAmount !== undefined) promoCode.minOrderAmount = Number(minOrderAmount);
    if (isActive !== undefined) promoCode.isActive = isActive;
    
    await promoCode.save();
    
    res.json({
      id: String(promoCode._id),
      code: promoCode.code,
      discountPercent: promoCode.discountPercent,
      expiryDate: promoCode.expiryDate,
      isActive: promoCode.isActive,
      usageLimit: promoCode.usageLimit,
      usedCount: promoCode.usedCount,
      minOrderAmount: promoCode.minOrderAmount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update promo code", error: err?.message || String(err) });
  }
});

// Delete promo code (Admin only)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await PromoCode.findByIdAndDelete(id);
    
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    
    res.json({ message: "Promo code deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete promo code", error: err?.message || String(err) });
  }
});

// Toggle promo code active status (Admin only)
router.patch("/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await PromoCode.findById(id);
    
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    
    promoCode.isActive = !promoCode.isActive;
    await promoCode.save();
    
    res.json({
      id: String(promoCode._id),
      isActive: promoCode.isActive,
      message: `Promo code ${promoCode.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle promo code status", error: err?.message || String(err) });
  }
});

export default router;


