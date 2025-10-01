import express from "express";
import { upload } from "../middleware/upload.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Create category with image upload
router.post("/categories", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ message: "name and image are required" });
    }

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!hasCloudinary) {
      // Dev fallback: store data URL so frontend can render without Cloudinary
      const mime = req.file.mimetype || "image/png";
      const base64 = req.file.buffer.toString("base64");
      const dataUrl = `data:${mime};base64,${base64}`;
      const category = await Category.create({ name, imageUrl: dataUrl, publicId: "local" });
      return res.status(201).json(category);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "supermart/categories",
        resource_type: "image",
        transformation: [{ width: 600, height: 600, crop: "fill", gravity: "auto" }]
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          res.status(500).json({ message: "Cloudinary upload failed", error: error.message });
        } else {
          try {
            const category = await Category.create({
              name,
              imageUrl: result.secure_url,
              publicId: result.public_id
            });
            res.status(201).json(category);
          } catch (dbErr) {
            console.error("DB create category error:", dbErr);
            res.status(500).json({ message: "Database error", error: dbErr.message });
          }
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error("/api/admin/categories unexpected error:", err);
    res.status(500).json({ message: "Unexpected error", error: err?.message || String(err) });
  }
});

// List categories
router.get("/categories", async (_req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
});

// List products
router.get("/products", async (_req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate({ path: "categoryId", select: "name" });
    const mapped = products.map((p) => ({
      _id: p._id,
      nameEn: p.nameEn,
      nameTa: p.nameTa,
      price: p.price,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId?._id || null,
      categoryName: p.categoryId?.name || ""
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err?.message || String(err) });
  }
});

// Create product in existing category
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { nameEn, nameTa, price, originalPrice, youtubeLink, categoryId } = req.body;
    if (!nameEn || !price || !categoryId || !req.file) {
      return res.status(400).json({ message: "nameEn, price, categoryId and image are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    let imageUrl = "";
    let publicId = "local";
    if (!hasCloudinary) {
      const mime = req.file.mimetype || "image/png";
      const base64 = req.file.buffer.toString("base64");
      imageUrl = `data:${mime};base64,${base64}`;
    } else {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "supermart/products",
            resource_type: "image",
            transformation: [{ width: 800, height: 800, crop: "fill", gravity: "auto" }]
          },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const product = await Product.create({
      nameEn,
      nameTa,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      imageUrl,
      publicId,
      youtubeLink,
      categoryId
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    res.status(500).json({ message: "Failed to create product", error: err?.message || String(err) });
  }
});

// Update category (name and/or image)
router.put("/categories/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    // Update name if provided
    if (name) category.name = name;

    if (req.file) {
      // If new image provided
      if (hasCloudinary) {
        try {
          // Remove old image if it was stored in Cloudinary
          if (category.publicId && category.publicId !== "local") {
            await cloudinary.uploader.destroy(category.publicId, { resource_type: "image" });
          }
        } catch (e) {
          // non-fatal
          console.warn("Cloudinary destroy failed:", e?.message || e);
        }

        // Upload new image
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "supermart/categories",
              resource_type: "image",
              transformation: [{ width: 600, height: 600, crop: "fill", gravity: "auto" }]
            },
            (error, uploadResult) => {
              if (error) reject(error);
              else resolve(uploadResult);
            }
          );
          stream.end(req.file.buffer);
        });

        category.imageUrl = result.secure_url;
        category.publicId = result.public_id;
      } else {
        const mime = req.file.mimetype || "image/png";
        const base64 = req.file.buffer.toString("base64");
        category.imageUrl = `data:${mime};base64,${base64}`;
        category.publicId = "local";
      }
    }

    await category.save();
    res.json(category);
  } catch (err) {
    console.error("PUT /api/admin/categories/:id error:", err);
    res.status(500).json({ message: "Failed to update category", error: err?.message || String(err) });
  }
});

export default router;


