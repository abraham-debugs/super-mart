import express from "express";
import { DeliveryChargeRule } from "../models/DeliveryChargeRule.js";
import { DeliveryPartner } from "../models/DeliveryPartner.js";
import { Order } from "../models/Order.js";

const router = express.Router();

// Public: get active delivery charge rules (sorted by minAmount ascending)
router.get("/charges", async (_req, res) => {
  try {
    const rules = await DeliveryChargeRule.find({ isActive: true })
      .sort({ minAmount: 1, sortOrder: 1, createdAt: 1 });
    res.json(rules);
  } catch (err) {
    console.error("Get public delivery charge rules error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch delivery charge rules", error: err?.message || String(err) });
  }
});

// Public: calculate delivery fee for a given amount
router.get("/calculate-fee", async (req, res) => {
  try {
    const amountRaw = req.query.amount;
    const amount = Number(amountRaw);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const rules = await DeliveryChargeRule.find({ isActive: true })
      .sort({ minAmount: 1, sortOrder: 1, createdAt: 1 });

    let appliedRule = null;

    for (const rule of rules) {
      if (amount >= rule.minAmount) {
        appliedRule = rule;
      } else {
        // rules are sorted by minAmount ascending; we can break early
        break;
      }
    }

    const fee = appliedRule ? appliedRule.fee : 0;

    res.json({
      amount,
      fee,
      rule: appliedRule
        ? {
            id: appliedRule._id,
            minAmount: appliedRule.minAmount,
            fee: appliedRule.fee,
            label: appliedRule.label
          }
        : null
    });
  } catch (err) {
    console.error("Calculate delivery fee error:", err);
    res
      .status(500)
      .json({ message: "Failed to calculate delivery fee", error: err?.message || String(err) });
  }
});

// Delivery Partner Login (using name and mobile)
router.post("/login", async (req, res) => {
  try {
    const { name, mobile } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({ message: "Name and mobile number are required" });
    }

    // Find delivery partner by name and mobile
    let partner = await DeliveryPartner.findOne({ 
      name: name.trim(), 
      phone: mobile.trim() 
    });

    if (!partner) {
      return res.status(401).json({ message: "Invalid credentials. Please contact admin." });
    }

    if (partner.status !== "active") {
      return res.status(403).json({ message: "Your account is inactive. Please contact admin." });
    }

    // Return partner details (no JWT for simplicity, just session data)
    res.json({
      success: true,
      partner: {
        id: String(partner._id),
        name: partner.name,
        phone: partner.phone,
        status: partner.status
      }
    });
  } catch (err) {
    console.error("Delivery partner login error:", err);
    res.status(500).json({ message: "Login failed", error: err?.message || String(err) });
  }
});

// Get assigned orders for a delivery partner
router.get("/orders/:partnerId", async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    // Find partner first to verify
    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Find all orders assigned to this partner
    const orders = await Order.find({ 
      assignedDeliveryPartner: partnerId 
    })
    .populate({ path: "items.productId", select: "nameEn price imageUrl" })
    .sort({ createdAt: -1 });

    const mappedOrders = orders.map(order => ({
      id: String(order._id),
      orderId: order.orderId || String(order._id).slice(-6),
      customerDetails: order.customerDetails || {},
      address: order.address || order.customerDetails?.address || "",
      items: (order.items || []).map(it => ({
        productId: String(it.productId?._id || it.productId || ""),
        name: it.name || it.productId?.nameEn || "",
        price: typeof it.price === "number" ? it.price : (it.productId?.price || 0),
        quantity: it.quantity || 1,
        imageUrl: it.imageUrl || it.productId?.imageUrl || ""
      })),
      total: order.total,
      status: order.status,
      paymentMode: order.paymentMode || "COD",
      paymentStatus: order.paymentStatus || "Pending",
      createdAt: order.createdAt,
      placedAt: order.placedAt || order.createdAt
    }));

    res.json(mappedOrders);
  } catch (err) {
    console.error("Get delivery orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err?.message || String(err) });
  }
});

// Update order status by delivery partner
router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, partnerId } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Find order
    const isHexId = /^[a-fA-F0-9]{24}$/.test(orderId);
    const where = isHexId ? { _id: orderId } : { orderId: String(orderId) };
    const order = await Order.findOne(where);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the partner is assigned to this order
    if (partnerId && String(order.assignedDeliveryPartner) !== partnerId) {
      return res.status(403).json({ message: "You are not assigned to this order" });
    }

    // Update status
    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: String(order._id),
        status: order.status
      }
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update status", error: err?.message || String(err) });
  }
});

export default router;

