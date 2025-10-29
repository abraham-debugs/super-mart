import express from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

const router = express.Router();

// Public search endpoint: /api/products/search?q=milk
router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ products: [], categories: [] });
    
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

    // Search for products
    const products = await Product.find(andConds.length ? { $and: andConds } : {})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: "categoryId", select: "name" });

    const mappedProducts = products.map((p) => ({
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

    // Search for categories
    const categoryAndConds = words.map((w) => {
      const rx = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      return { name: rx };
    });

    const categories = await Category.find(categoryAndConds.length ? { $and: categoryAndConds } : {})
      .populate('parentCategory', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const mappedCategories = categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      imageUrl: c.imageUrl,
      parentCategory: c.parentCategory ? {
        id: String(c.parentCategory._id),
        name: c.parentCategory.name
      } : null
    }));

    res.json({
      products: mappedProducts,
      categories: mappedCategories,
      query: q
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to search", error: err?.message || String(err) });
  }
});

// Get Fresh Picks products (for home page "Fresh Picks for You" section)
router.get("/fresh-picks", async (req, res) => {
  try {
    const products = await Product.find({ isFreshPick: true })
      .sort({ createdAt: -1 })
      .limit(20)
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
    res.status(500).json({ message: "Failed to fetch fresh picks", error: err?.message || String(err) });
  }
});

// Get Most Loved products (for home page "Most Loved Items" section)
router.get("/most-loved", async (req, res) => {
  try {
    const products = await Product.find({ isMostLoved: true })
      .sort({ createdAt: -1 })
      .limit(20)
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
    res.status(500).json({ message: "Failed to fetch most loved", error: err?.message || String(err) });
  }
});

// Get navbar categories (public endpoint)
router.get("/navbar-categories", async (_req, res) => {
  try {
    const { Category } = await import("../models/Category.js");
    const categories = await Category.find({ showInNavbar: true })
      .select('name _id')
      .sort({ name: 1 });
    
    res.json(categories.map(cat => ({
      id: String(cat._id),
      name: cat.name
    })));
  } catch (err) {
    console.error("Failed to fetch navbar categories:", err);
    res.status(500).json({ message: "Failed to fetch navbar categories", error: err.message });
  }
});

export default router;
