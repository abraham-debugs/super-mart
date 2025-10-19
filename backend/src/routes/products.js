import express from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

const router = express.Router();

// Public search endpoint: /api/products/search?q=milk
router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);
    // tokenize by words, ignore punctuation; require all words to appear across nameEn/nameTa
    const words = q
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .split(/\s+/)
      .filter(Boolean);
    const andConds = words.map((w) => {
      const rx = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      return { $or: [{ nameEn: rx }, { nameTa: rx }] };
    });

    const products = await Product.find(andConds.length ? { $and: andConds } : {})
      .sort({ createdAt: -1 })
      .populate({ path: "categoryId", select: "name" });

    const mapped = products.map((p) => ({
      id: String(p._id),
      name: p.nameEn || "",
      description: "",
      price: p.price,
      originalPrice: p.originalPrice || undefined,
      category: p.categoryId?.name || "",
      image: p.imageUrl,
      rating: 5,
      reviews: 0,
      inStock: true,
      isNew: false,
      isBestSeller: false,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to search products", error: err?.message || String(err) });
  }
});

export default router;
