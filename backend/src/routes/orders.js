import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Counter } from "../models/Counter.js";

const router = express.Router();

// Place a new order
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
  const { items, total, address, paymentInfo, customerDetails } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Order items required" });
    if (!total) return res.status(400).json({ message: "Order total required" });
    // build date key ddMMyyyy
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = String(now.getFullYear());
    const dayKey = `${dd}${mm}${yyyy}`;
    const counterKey = `ORD-${dayKey}`;
    const counter = await Counter.findOneAndUpdate(
      { key: counterKey },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seq = String(counter.seq).padStart(2, "0");
    const orderId = `${dayKey}${seq}`;

    const order = await Order.create({ userId, items, total, address, paymentInfo, customerDetails, orderId });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to place order", error: err?.message || String(err) });
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

export default router;
