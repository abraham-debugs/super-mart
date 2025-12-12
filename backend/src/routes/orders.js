import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { PromoCode } from "../models/PromoCode.js";
import { Product } from "../models/Product.js";
import { sendSms, buildOrderPlacedMessage, buildOrderDeliveredMessage } from "../services/sms.js";

const router = express.Router();

// Sanity ping to verify mount
router.get("/ping", (_req, res) => {
  res.json({ ok: true });
});

// Place a new order
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { items, total, address, paymentInfo, customerDetails, promoCode, deliveryFee = 0 } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Order items required" });
    if (!total) return res.status(400).json({ message: "Order total required" });
    const mobile = customerDetails?.mobile || customerDetails?.phone || address?.phone;
    if (!mobile || String(mobile).length !== 13) {
      return res.status(400).json({ message: "Mobile number must be 13 characters (include country code)" });
    }
    
    // Validate productIds are valid ObjectIds
    for (const item of items) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      }
      // Verify product exists
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
    }
    
    // Calculate subtotal from items
    const subtotalBeforeDiscount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalTotal = total;
    let promoCodeData = null;
    
    // Validate and apply promo code if provided
    if (promoCode && promoCode.code) {
      const promo = await PromoCode.findOne({ code: promoCode.code.toUpperCase() });
      
      if (!promo) {
        return res.status(400).json({ message: "Invalid promo code" });
      }
      
      if (!promo.isValid()) {
        return res.status(400).json({ message: "This promo code has expired or is no longer valid" });
      }
      
      if (promo.minOrderAmount > subtotalBeforeDiscount) {
        return res.status(400).json({ 
          message: `Minimum order amount of ₹${promo.minOrderAmount} required for this promo code` 
        });
      }
      
      // Calculate discount amount (applies to subtotal only)
      const discountAmount = Math.round((subtotalBeforeDiscount * promo.discountPercent) / 100);
      
      // Update promo code usage
      promo.usedCount += 1;
      await promo.save();
      
      promoCodeData = {
        code: promo.code,
        discountPercent: promo.discountPercent,
        discountAmount: discountAmount
      };
      
      // Apply discount to total (discount applies to subtotal only, delivery fee is added after)
      finalTotal = subtotalBeforeDiscount - discountAmount + deliveryFee;
    }
    
    // Generate a unique random orderId to avoid conflicts
    const generateRandomOrderId = () => {
      const timestamp = Date.now().toString(36).toUpperCase(); // Base36 timestamp
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random chars
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4 random digits
      return `ORD-${timestamp}-${randomStr}${randomNum}`;
    };

    // Ensure orderId is unique (retry if collision occurs, though highly unlikely)
    let orderId;
    try {
      let attempts = 0;
      const maxAttempts = 5;
      do {
        orderId = generateRandomOrderId();
        const existing = await Order.findOne({ orderId });
        if (!existing) break;
        attempts++;
        if (attempts >= maxAttempts) {
          // Fallback: use timestamp + UUID-like string
          orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
          break;
        }
      } while (attempts < maxAttempts);
    } catch (idGenError) {
      console.error("Error generating orderId:", idGenError);
      // Fallback to simple timestamp-based ID
      orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }

    // Convert address object to string if needed
    let addressString = address;
    if (typeof address === 'object' && address !== null) {
      // Build address string from object
      const parts = [];
      if (address.line1) parts.push(address.line1);
      if (address.line2) parts.push(address.line2);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.pincode) parts.push(address.pincode);
      addressString = parts.join(', ');
    } else if (typeof address !== 'string') {
      // Fallback to customerDetails.address if address is not valid
      addressString = customerDetails?.address || '';
    }

    const order = await Order.create({ 
      userId, 
      items, 
      total: finalTotal, 
      address: addressString, 
      paymentInfo, 
      customerDetails, 
      orderId,
      promoCode: promoCodeData,
      subtotalBeforeDiscount
    });
    // attempt SMS notify (non-fatal)
    try {
      const phone = customerDetails?.mobile || customerDetails?.phone || address?.phone;
      if (phone) {
        const customerName = customerDetails?.fullName || customerDetails?.name || 'there';
        const msg = buildOrderPlacedMessage({ customerName, orderId, etaMins: req.body?.etaMins });
        await sendSms(phone, msg);
      }
    } catch (e) {
      console.warn("Order placed SMS failed:", e?.message || e);
    }
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    console.error("Error details:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      code: err?.code,
      errors: err?.errors
    });
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors || {}).map((e) => e.message).join(', ');
      return res.status(400).json({ 
        message: "Validation error", 
        error: validationErrors || err?.message
      });
    }
    
    // Handle duplicate key errors (e.g., orderId collision)
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: "Order ID conflict. Please try again.", 
        error: "Duplicate order ID detected"
      });
    }
    
    // Handle Cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid data format", 
        error: err?.message || "Invalid ID format"
      });
    }
    
    res.status(500).json({ 
      message: "Failed to place order", 
      error: err?.message || String(err),
      details: process.env.NODE_ENV === 'development' ? err?.stack : undefined
    });
  }
});

// Get all orders for current user
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err?.message || String(err) });
  }
});

// Public tracking endpoint - lookup by orderId and mobile number
router.get("/track", async (req, res) => {
  try {
    const { orderId, mobile } = req.query;
    if (!orderId || !mobile) return res.status(400).json({ message: "orderId and mobile are required" });
    const order = await Order.findOne({ orderId: String(orderId), "customerDetails.mobile": String(mobile) });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // map to tracking response shape
    const resp = {
      orderId: order.orderId,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      customerDetails: order.customerDetails,
      paymentScreenshot: order.paymentScreenshot,
      transportName: order.transportName,
      lrNumber: order.lrNumber
    };
    res.json(resp);
  } catch (err) {
    res.status(500).json({ message: "Failed to track order", error: err?.message || String(err) });
  }
});

// Mark delivered and send SMS confirmation
router.put("/:id/delivered", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "delivered";
    await order.save();
    try {
      const phone = order?.customerDetails?.mobile || order?.customerDetails?.phone || order?.address?.phone;
      if (phone) {
        const customerName = order?.customerDetails?.fullName || order?.customerDetails?.name || 'there';
        const msg = buildOrderDeliveredMessage({ customerName, orderId: order.orderId || order._id });
        await sendSms(phone, msg);
      }
    } catch (e) {
      console.warn("Delivered SMS failed:", e?.message || e);
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update delivery status", error: err?.message || String(err) });
  }
});

export default router;
