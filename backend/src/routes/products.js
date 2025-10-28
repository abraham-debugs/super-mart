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

export default router;
