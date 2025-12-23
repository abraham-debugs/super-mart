import express from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Order } from "../models/Order.js";

const router = express.Router();

// Get all products (public endpoint)
// Supports optional category filter: /api/products?category=categoryName
router.get("/", async (req, res) => {
  try {
    const categoryName = req.query.category;
    let query = {};

    // If category filter is provided, find products by category name
    if (categoryName) {
      const category = await Category.findOne({
        $or: [
          { nameEn: new RegExp(categoryName, "i") },
          { nameTa: new RegExp(categoryName, "i") },
          { name: new RegExp(categoryName, "i") }
        ]
      });

      if (category) {
        query.categoryId = category._id;
      } else {
        // If category not found, return empty array
        return res.json([]);
      }
    }

    if (req.query.isDiscounted === "true") {
      query.isDiscounted = true;
    }

    if (req.query.ids) {
      query._id = { $in: req.query.ids.split(",") };
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: "categoryId", select: "name nameEn nameTa" });

    const mapped = products.map((p) => ({
      id: String(p._id),
      name: p.nameEn || "",
      description: "",
      price: p.price,
      originalPrice: p.originalPrice || undefined,
      category: p.categoryId?.name || p.categoryId?.nameEn || "",
      image: p.imageUrl,
      rating: 5,
      reviews: 0,
      inStock: (p.stock || 0) > 0,
      stock: p.stock || 0,
      isNew: false,
      isBestSeller: false,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ message: "Failed to fetch products", error: err?.message || String(err) });
  }
});

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
      inStock: (p.stock || 0) > 0,
      stock: p.stock || 0,
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
// Excludes products that are already in Most Loved to avoid duplication
router.get("/fresh-picks", async (req, res) => {
  try {
    // First, get Most Loved product IDs to exclude them from Fresh Picks
    const salesData = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 20 }
    ]);
    const mostLovedProductIds = salesData.map(item => item._id).filter(Boolean);

    // Get Fresh Picks products, excluding those that are in Most Loved
    const query = { isFreshPick: true };
    if (mostLovedProductIds.length > 0) {
      query._id = { $nin: mostLovedProductIds };
    }

    const products = await Product.find(query)
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
      inStock: (p.stock || 0) > 0,
      stock: p.stock || 0,
      isNew: false,
      isBestSeller: false,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fresh picks", error: err?.message || String(err) });
  }
});

// Get Most Loved products (for home page "Most Loved Items" section)
// Returns high sales products based on order quantities
router.get("/most-loved", async (req, res) => {
  try {
    const { SectionConfig } = await import("../models/SectionConfig.js");
    const sectionConfig = await SectionConfig.findOne({ sectionId: "most_loved" });

    let products = [];

    // If manual mode is configured by admin
    if (sectionConfig?.metadata?.mode === "manual") {
      const { selectionType, categoryId, productIds, selectAllInCategory } = sectionConfig.metadata;
      let query = {};

      if (selectionType === "category" && categoryId) {
        query.categoryId = categoryId;
        // If they didn't 'select all', filter by specific IDs if provided
        if (!selectAllInCategory && Array.isArray(productIds) && productIds.length > 0) {
          query._id = { $in: productIds };
        }
      } else if (selectionType === "specific_products" && Array.isArray(productIds)) {
        query._id = { $in: productIds };
      }

      products = await Product.find(query)
        .populate({ path: "categoryId", select: "name" })
        .limit(20);
    } else {
      // DEFAULT: Automated sales-based logic
      const salesData = await Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 20 }
      ]);

      const productIdsArr = salesData.map(item => item._id).filter(Boolean);
      if (productIdsArr.length > 0) {
        const fetchedProducts = await Product.find({ _id: { $in: productIdsArr } })
          .populate({ path: "categoryId", select: "name" });

        const salesMap = new Map();
        salesData.forEach(item => { if (item._id) salesMap.set(String(item._id), item.totalQuantity); });

        products = fetchedProducts.sort((a, b) => {
          const aSales = salesMap.get(String(a._id)) || 0;
          const bSales = salesMap.get(String(b._id)) || 0;
          return bSales - aSales;
        });
      }
    }

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
      inStock: (p.stock || 0) > 0,
      stock: p.stock || 0,
      isNew: false,
      isBestSeller: false,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Most Loved fetch error:", err);
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
