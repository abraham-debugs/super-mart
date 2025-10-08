import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = express.Router();

async function updateList(req, res, listKey, op) {
  try {
    const userId = req.user.uid;
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required" });
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    const update = op === "add" ? { $addToSet: { [listKey]: productId } } : { $pull: { [listKey]: productId } };
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("wishlist saveForLater");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ wishlist: user.wishlist || [], saveForLater: user.saveForLater || [] });
  } catch (err) {
    console.error("updateList error:", err);
    res.status(500).json({ message: "Failed to update list", error: err?.message || String(err) });
  }
}

router.post("/wishlist/add", requireAuth, async (req, res) => updateList(req, res, "wishlist", "add"));
router.post("/wishlist/remove", requireAuth, async (req, res) => updateList(req, res, "wishlist", "remove"));
router.post("/save-later/add", requireAuth, async (req, res) => updateList(req, res, "saveForLater", "add"));
router.post("/save-later/remove", requireAuth, async (req, res) => updateList(req, res, "saveForLater", "remove"));

// Fetch wishlist populated
router.get("/wishlist", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.uid).populate({ path: "wishlist", select: "nameEn price originalPrice imageUrl categoryId" });
  res.json(user?.wishlist || []);
});

// Fetch save-for-later populated
router.get("/save-later", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.uid).populate({ path: "saveForLater", select: "nameEn price originalPrice imageUrl categoryId" });
  res.json(user?.saveForLater || []);
});

export default router;


