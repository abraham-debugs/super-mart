import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { upload } from "../middleware/upload.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { AdPoster } from "../models/AdPoster.js";

const router = express.Router();

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mdmart/ads",
        resource_type: "image",
        transformation: [{ width: 1200, height: 800, crop: "fill", gravity: "auto" }],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (!result) {
          reject(new Error("No upload result received"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    stream.end(fileBuffer);
  });

router.get("/", async (_req, res) => {
  try {
    const posters = await AdPoster.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(posters);
  } catch (err) {
    console.error("Failed to fetch ad posters:", err);
    res.status(500).json({ message: "Failed to fetch ad posters" });
  }
});

router.get(
  "/manage",
  requireAuth,
  requireAdmin,
  async (_req, res) => {
    try {
      const posters = await AdPoster.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();
      res.json(posters);
    } catch (err) {
      console.error("Failed to fetch ad posters for admin:", err);
      res.status(500).json({ message: "Failed to fetch ad posters" });
    }
  }
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, subtitle, description, ctaText, ctaLink, order, isActive } =
        req.body || {};

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      let imageUrl = "";
      let imagePublicId = "local";

      if (hasCloudinaryConfig()) {
        try {
          const uploaded = await uploadToCloudinary(req.file.buffer);
          imageUrl = uploaded.url;
          imagePublicId = uploaded.publicId;
        } catch (err) {
          console.error("Cloudinary upload failed:", err);
          return res
            .status(500)
            .json({ message: "Failed to upload image", error: err.message });
        }
      } else {
        const mime = req.file.mimetype || "image/png";
        const base64 = req.file.buffer.toString("base64");
        imageUrl = `data:${mime};base64,${base64}`;
      }

      const poster = await AdPoster.create({
        title: String(title),
        subtitle: subtitle ? String(subtitle) : "",
        description: description ? String(description) : "",
        ctaText: ctaText ? String(ctaText) : "Shop Now",
        ctaLink: ctaLink ? String(ctaLink) : "/",
        order:
          typeof order !== "undefined" && order !== ""
            ? Number(order)
            : 0,
        isActive:
          typeof isActive === "boolean"
            ? isActive
            : !(String(isActive || "").toLowerCase() === "false"),
        imageUrl,
        imagePublicId,
      });

      res.status(201).json(poster);
    } catch (err) {
      console.error("Failed to create ad poster:", err);
      res
        .status(500)
        .json({ message: "Failed to create ad poster", error: err?.message || String(err) });
    }
  }
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const poster = await AdPoster.findById(id);
      if (!poster) {
        return res.status(404).json({ message: "Poster not found" });
      }

      const {
        title,
        subtitle,
        description,
        ctaText,
        ctaLink,
        order,
        isActive,
      } = req.body || {};

      if (typeof title !== "undefined") poster.title = String(title);
      if (typeof subtitle !== "undefined") poster.subtitle = String(subtitle);
      if (typeof description !== "undefined") poster.description = String(description);
      if (typeof ctaText !== "undefined") poster.ctaText = String(ctaText);
      if (typeof ctaLink !== "undefined") poster.ctaLink = String(ctaLink);
      if (typeof order !== "undefined" && order !== "") poster.order = Number(order);
      if (typeof isActive !== "undefined") {
        poster.isActive =
          typeof isActive === "boolean"
            ? isActive
            : !(String(isActive).toLowerCase() === "false");
      }

      if (req.file) {
        if (
          poster.imagePublicId &&
          poster.imagePublicId !== "local" &&
          hasCloudinaryConfig()
        ) {
          try {
            await cloudinary.uploader.destroy(poster.imagePublicId, {
              resource_type: "image",
            });
          } catch (err) {
            console.warn("Failed to delete previous poster image:", err);
          }
        }

        if (hasCloudinaryConfig()) {
          try {
            const uploaded = await uploadToCloudinary(req.file.buffer);
            poster.imageUrl = uploaded.url;
            poster.imagePublicId = uploaded.publicId;
          } catch (err) {
            console.error("Cloudinary upload failed:", err);
            return res
              .status(500)
              .json({ message: "Failed to upload image", error: err.message });
          }
        } else {
          const mime = req.file.mimetype || "image/png";
          const base64 = req.file.buffer.toString("base64");
          poster.imageUrl = `data:${mime};base64,${base64}`;
          poster.imagePublicId = "local";
        }
      }

      await poster.save();
      res.json(poster);
    } catch (err) {
      console.error("Failed to update ad poster:", err);
      res
        .status(500)
        .json({ message: "Failed to update ad poster", error: err?.message || String(err) });
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const poster = await AdPoster.findById(id);
      if (!poster) {
        return res.status(404).json({ message: "Poster not found" });
      }

      if (
        poster.imagePublicId &&
        poster.imagePublicId !== "local" &&
        hasCloudinaryConfig()
      ) {
        try {
          await cloudinary.uploader.destroy(poster.imagePublicId, {
            resource_type: "image",
          });
        } catch (err) {
          console.warn("Failed to delete poster image from Cloudinary:", err);
        }
      }

      await poster.deleteOne();
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete ad poster:", err);
      res
        .status(500)
        .json({ message: "Failed to delete ad poster", error: err?.message || String(err) });
    }
  }
);

export default router;


