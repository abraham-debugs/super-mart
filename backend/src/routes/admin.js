import express from "express";
import { upload } from "../middleware/upload.js";
import { Category } from "../models/Category.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Create category with image upload
router.post("/categories", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ message: "name and image are required" });
    }

    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        folder: "supermart/categories",
        resource_type: "image",
        transformation: [{ width: 600, height: 600, crop: "fill", gravity: "auto" }]
      },
      async (error, result) => {
        if (error) {
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
            res.status(500).json({ message: "Database error", error: dbErr.message });
          }
        }
      }
    );

    // Write file buffer to the upload stream
    uploadResult.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: "Unexpected error", error: err.message });
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

export default router;


