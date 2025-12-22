import express from "express";
import bcrypt from "bcryptjs";
import { upload } from "../middleware/upload.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { DeliveryPartner } from "../models/DeliveryPartner.js";
import { DeliveryChargeRule } from "../models/DeliveryChargeRule.js";
import { SubscriptionPlan } from "../models/SubscriptionPlan.js";
import { InventoryHistory } from "../models/InventoryHistory.js";
import { SectionConfig } from "../models/SectionConfig.js";
import { requireAuth, requireAdmin, requireSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Create category with image upload (image optional for parent categories)
router.post("/categories", upload.single("image"), async (req, res) => {
  try {
    const { name, parentCategory, showInNavbar } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    // If no image provided and it's a parent category (no parentCategory), use placeholder
    if (!req.file && !parentCategory) {
      // Parent category without image - use placeholder
      const placeholderUrl = "https://placehold.co/600x600/e5e7eb/6b7280?text=" + encodeURIComponent(name.charAt(0).toUpperCase());
      const category = await Category.create({
        name,
        imageUrl: placeholderUrl,
        publicId: "placeholder",
        parentCategory: null,
        showInNavbar: showInNavbar === "true" || showInNavbar === true
      });
      return res.status(201).json(category);
    }

    // Subcategories must have an image
    if (!req.file && parentCategory) {
      return res.status(400).json({ message: "Image is required for subcategories" });
    }

    // If no file at this point, shouldn't happen but handle it
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
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
      const category = await Category.create({
        name,
        imageUrl: dataUrl,
        publicId: "local",
        parentCategory: parentCategory || null,
        showInNavbar: showInNavbar === "true" || showInNavbar === true
      });
      return res.status(201).json(category);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mdmart/categories",
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
              publicId: result.public_id,
              parentCategory: parentCategory || null,
              showInNavbar: showInNavbar === "true" || showInNavbar === true
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

// Get order detail
router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isHexId = /^[a-fA-F0-9]{24}$/.test(id);
    const where = isHexId ? { _id: id } : { orderId: String(id) };
    const order = await Order.findOne(where).populate({ path: "items.productId", select: "nameEn price imageUrl" });
    if (!order) return res.status(404).json({ message: "Order not found" });
    const items = (order.items || []).map((it) => ({
      productId: String(it.productId?._id || it.productId || ""),
      name: it.name || it.productId?.nameEn || "",
      price: typeof it.price === "number" ? it.price : (it.productId?.price || 0),
      quantity: it.quantity || 1,
      imageUrl: it.imageUrl || it.productId?.imageUrl || ""
    }));
    res.json({
      id: String(order._id),
      orderId: order.orderId || null,
      userId: String(order.userId || ""),
      customerDetails: order.customerDetails || {},
      status: order.status,
      paymentMode: order.paymentMode || "COD",
      paymentStatus: order.paymentStatus || "Pending",
      transactionId: order.transactionId || null,
      total: order.total,
      createdAt: order.createdAt,
      items
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order", error: err?.message || String(err) });
  }
});

// Assign delivery partner to order
router.put("/orders/:id/assign-partner", async (req, res) => {
  try {
    const { id } = req.params;
    const { partnerId } = req.body;

    const isHexId = /^[a-fA-F0-9]{24}$/.test(id);
    const where = isHexId ? { _id: id } : { orderId: String(id) };
    const order = await Order.findOne(where);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.assignedDeliveryPartner = partnerId || null;
    await order.save();

    res.json({ success: true, message: "Delivery partner assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign partner", error: err?.message || String(err) });
  }
});

// Update order status (id can be Mongo _id or custom orderId)
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ["placed", "shipped", "delivered", "cancelled", "confirmed", "payment_verified", "booked"]; // supports minimal and extended sets
    if (!allowed.includes(String(status))) return res.status(400).json({ message: "Invalid status" });
    const isHexId = /^[a-fA-F0-9]{24}$/.test(String(id));
    const where = isHexId ? { _id: id } : { orderId: String(id) };
    const order = await Order.findOneAndUpdate(where, { status: String(status) }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ id: String(order._id), orderId: order.orderId || null, status: order.status });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err?.message || String(err) });
  }
});

// List users with basic info and order counts
router.get("/users", async (_req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("name email phone createdAt isOnline lastSeen");

    // Aggregate order counts per user
    const counts = await Order.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const mapped = users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      orders: countMap.get(String(u._id)) || 0,
      status: u.isOnline ? "active" : "inactive",
      joinDate: u.createdAt
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err?.message || String(err) });
  }
});

// List recent orders for admin
router.get("/orders", async (_req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate({ path: "userId", select: "name email" })
      .populate({ path: "assignedDeliveryPartner", select: "name phone" });

    const mapped = orders.map((o) => ({
      id: String(o._id),
      orderId: o.orderId || null,
      customer: o.customerDetails?.fullName || o.userId?.name || "",
      customerDetails: o.customerDetails || {},
      total: o.total,
      status: o.status,
      date: o.createdAt,
      items: Array.isArray(o.items) ? o.items.reduce((n, it) => n + (it.quantity || 1), 0) : 0,
      itemsBrief: Array.isArray(o.items)
        ? o.items.slice(0, 10).map((it) => ({
          productId: String(it.productId || ""),
          name: it.name || "",
          price: typeof it.price === "number" ? it.price : 0,
          quantity: it.quantity || 1,
          imageUrl: it.imageUrl || ""
        }))
        : [],
      paymentScreenshot: o.paymentScreenshot ? { verified: !!o.paymentScreenshot.verified } : null,
      transportName: o.transportName || "",
      lrNumber: o.lrNumber || "",
      delivery: o.transportName || "Not Assigned",
      assignedDeliveryPartner: o.assignedDeliveryPartner ? String(o.assignedDeliveryPartner._id) : null,
      assignedPartnerName: o.assignedDeliveryPartner?.name || null
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err?.message || String(err) });
  }
});

// List categories
router.get("/categories", async (_req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name')
      .sort({ createdAt: -1 });

    res.json(categories);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
});

// List products
router.get("/products", async (req, res) => {
  try {
    const { categoryId, q } = req.query;
    const where = {};
    if (categoryId) Object.assign(where, { categoryId });
    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      Object.assign(where, { $or: [{ nameEn: rx }, { nameTa: rx }] });
    }
    const products = await Product.find(where)
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
      categoryName: p.categoryId?.name || "",
      isFreshPick: p.isFreshPick || false,
      isMostLoved: p.isMostLoved || false,
      stock: p.stock || 0
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err?.message || String(err) });
  }
});

// Create product in existing category
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { nameEn, nameTa, price, originalPrice, youtubeLink, categoryId, isFreshPick, isMostLoved, isDiscounted } = req.body;
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
            folder: "mdmart/products",
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

    // Ensure Fresh Picks and Most Loved are mutually exclusive
    const shouldBeFreshPick = isFreshPick === "true" || isFreshPick === true;
    const shouldBeMostLoved = isMostLoved === "true" || isMostLoved === true;

    const product = await Product.create({
      nameEn,
      nameTa,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      imageUrl,
      publicId,
      youtubeLink,
      categoryId,
      isFreshPick: shouldBeFreshPick,
      isMostLoved: shouldBeMostLoved && !shouldBeFreshPick, // Only set isMostLoved if not Fresh Pick
      isDiscounted: isDiscounted === "true" || isDiscounted === true,
      stock: req.body.stock ? Number(req.body.stock) : 0
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    res.status(500).json({ message: "Failed to create product", error: err?.message || String(err) });
  }
});

// Update product stock (bulk update endpoint) - MUST be before /products/:id route
router.put("/products/stock", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { productId, stock, reason, changeType } = req.body;
    if (!productId || stock === undefined) {
      return res.status(400).json({ message: "productId and stock are required" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const previousStock = product.stock || 0;
    const newStock = Math.max(0, Number(stock));
    const change = newStock - previousStock;

    product.stock = newStock;
    await product.save();

    // Create inventory history record
    const userId = req.user?.uid || req.user?._id || req.user?.id;
    const userName = req.user?.name || req.user?.email || "System";

    await InventoryHistory.create({
      productId: product._id,
      productName: product.nameEn,
      previousStock,
      newStock,
      change,
      changeType: changeType || "manual",
      reason: reason || null,
      changedBy: userId,
      changedByName: userName
    });

    res.json({ _id: product._id, stock: product.stock });
  } catch (err) {
    console.error("PUT /api/admin/products/stock error:", err);
    res.status(500).json({ message: "Failed to update stock", error: err?.message || String(err) });
  }
});

// Update product
router.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nameEn, nameTa, price, originalPrice, youtubeLink, categoryId, isFreshPick, isMostLoved, isDiscounted } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    // Update fields if provided
    if (nameEn) product.nameEn = nameEn;
    if (nameTa) product.nameTa = nameTa;
    if (price) product.price = Number(price);
    if (originalPrice) product.originalPrice = Number(originalPrice);
    if (youtubeLink) product.youtubeLink = youtubeLink;
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(404).json({ message: "Category not found" });
      product.categoryId = categoryId;
    }
    // Update home page section flags
    // Ensure Fresh Picks and Most Loved are mutually exclusive
    if (isFreshPick !== undefined) {
      const shouldBeFreshPick = isFreshPick === "true" || isFreshPick === true;
      product.isFreshPick = shouldBeFreshPick;
      // If adding to Fresh Picks, remove from Most Loved
      if (shouldBeFreshPick) {
        product.isMostLoved = false;
      }
    }
    if (isMostLoved !== undefined) {
      const shouldBeMostLoved = isMostLoved === "true" || isMostLoved === true;
      product.isMostLoved = shouldBeMostLoved;
      // If adding to Most Loved, remove from Fresh Picks
      if (shouldBeMostLoved) {
        product.isFreshPick = false;
      }
    }
    if (isDiscounted !== undefined) {
      product.isDiscounted = isDiscounted === "true" || isDiscounted === true;
    }

    // Handle image update if new image provided
    if (req.file) {
      if (hasCloudinary) {
        try {
          // Remove old image if it was stored in Cloudinary
          if (product.publicId && product.publicId !== "local") {
            await cloudinary.uploader.destroy(product.publicId, { resource_type: "image" });
          }
        } catch (e) {
          console.warn("Cloudinary destroy failed:", e?.message || e);
        }

        // Upload new image
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "mdmart/products",
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

        product.imageUrl = result.secure_url;
        product.publicId = result.public_id;
      } else {
        const mime = req.file.mimetype || "image/png";
        const base64 = req.file.buffer.toString("base64");
        product.imageUrl = `data:${mime};base64,${base64}`;
        product.publicId = "local";
      }
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("PUT /api/admin/products/:id error:", err);
    res.status(500).json({ message: "Failed to update product", error: err?.message || String(err) });
  }
});

// Delete product (superadmin only)
router.delete("/products/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Remove image from Cloudinary if it exists
    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinary && product.publicId && product.publicId !== "local") {
      try {
        await cloudinary.uploader.destroy(product.publicId, { resource_type: "image" });
      } catch (e) {
        console.warn("Cloudinary destroy failed:", e?.message || e);
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/admin/products/:id error:", err);
    res.status(500).json({ message: "Failed to delete product", error: err?.message || String(err) });
  }
});

// Update category (name and/or image and/or parentCategory)
router.put("/categories/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentCategory, showInNavbar } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    // Update name if provided
    if (name) category.name = name;

    // Update parent category if provided (including setting to null)
    if (parentCategory !== undefined) {
      category.parentCategory = parentCategory || null;
    }

    // Update showInNavbar if provided
    if (showInNavbar !== undefined) {
      category.showInNavbar = showInNavbar === "true" || showInNavbar === true;
    }

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
              folder: "mdmart/categories",
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

// Delivery partners - list
router.get("/delivery-partners", async (_req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.json(partners.map(p => ({ id: String(p._id), name: p.name, phone: p.phone, status: p.status })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch delivery partners", error: err?.message || String(err) });
  }
});

// Delivery partners - create
router.post("/delivery-partners", async (req, res) => {
  try {
    const { name, phone, status } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "name and phone are required" });
    const partner = await DeliveryPartner.create({ name, phone, status: status === "inactive" ? "inactive" : "active" });
    res.status(201).json({ id: String(partner._id), name: partner.name, phone: partner.phone, status: partner.status });
  } catch (err) {
    res.status(500).json({ message: "Failed to create delivery partner", error: err?.message || String(err) });
  }
});

// Delivery partners - update
router.put("/delivery-partners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, status } = req.body;
    const update = {};
    if (typeof name === "string") update.name = name;
    if (typeof phone === "string") update.phone = phone;
    if (status === "active" || status === "inactive") update.status = status;
    const partner = await DeliveryPartner.findByIdAndUpdate(id, update, { new: true });
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.json({ id: String(partner._id), name: partner.name, phone: partner.phone, status: partner.status });
  } catch (err) {
    res.status(500).json({ message: "Failed to update delivery partner", error: err?.message || String(err) });
  }
});

// Create admin user (SuperAdmin only)
router.post("/create-admin", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Normalize email
    const normalizedEmail = String(email).toLowerCase().trim();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "admin",
      isProfileComplete: true,
      emailVerified: true, // Admin accounts don't need email verification
      isOnline: false,
      lastSeen: new Date()
    });

    res.status(201).json({
      id: String(adminUser._id),
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      createdAt: adminUser.createdAt
    });
  } catch (err) {
    console.error("Create admin error:", err);
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Failed to create admin user", error: err?.message || String(err) });
  }
});

// Get all admin users (SuperAdmin only)
router.get("/admins", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } })
      .select("name email role createdAt isOnline lastSeen")
      .sort({ createdAt: -1 });

    res.json(admins.map(admin => ({
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: admin.role || "user",
      createdAt: admin.createdAt,
      isOnline: admin.isOnline || false,
      lastSeen: admin.lastSeen || null
    })));
  } catch (err) {
    console.error("Get admins error:", err);
    res.status(500).json({ message: "Failed to fetch admins", error: err?.message || String(err) });
  }
});

// ==================== Subscription Plans Management ====================

// Get all subscription plans
router.get("/subscription-plans", requireAuth, requireAdmin, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ order: 1, createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error("Get subscription plans error:", err);
    res.status(500).json({ message: "Failed to fetch subscription plans", error: err?.message || String(err) });
  }
});

// Create a new subscription plan
router.post("/subscription-plans", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      planId,
      name,
      price,
      duration,
      description,
      features,
      popular,
      isActive,
      maxOrders,
      freeDelivery,
      prioritySupport,
      exclusiveDeals,
      cashbackPercentage,
      order
    } = req.body;

    if (!planId || !name) {
      return res.status(400).json({ message: "planId and name are required" });
    }

    // Check if planId already exists
    const existing = await SubscriptionPlan.findOne({ planId: planId.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Plan ID already exists" });
    }

    const plan = await SubscriptionPlan.create({
      planId: planId.toLowerCase(),
      name,
      price: Number(price) || 0,
      duration: duration || 'month',
      description: description || '',
      features: Array.isArray(features) ? features : [],
      popular: popular === true || popular === 'true',
      isActive: isActive !== false && isActive !== 'false',
      maxOrders: maxOrders !== undefined ? Number(maxOrders) : 10,
      freeDelivery: freeDelivery === true || freeDelivery === 'true',
      prioritySupport: prioritySupport === true || prioritySupport === 'true',
      exclusiveDeals: exclusiveDeals === true || exclusiveDeals === 'true',
      cashbackPercentage: cashbackPercentage !== undefined ? Number(cashbackPercentage) : 0,
      order: order !== undefined ? Number(order) : 0
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error("Create subscription plan error:", err);
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Plan ID already exists" });
    }
    res.status(500).json({ message: "Failed to create subscription plan", error: err?.message || String(err) });
  }
});

// Update a subscription plan
router.put("/subscription-plans/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      planId,
      name,
      price,
      duration,
      description,
      features,
      popular,
      isActive,
      maxOrders,
      freeDelivery,
      prioritySupport,
      exclusiveDeals,
      cashbackPercentage,
      order
    } = req.body;

    const updateData = {};
    if (planId !== undefined) updateData.planId = planId.toLowerCase();
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (duration !== undefined) updateData.duration = duration;
    if (description !== undefined) updateData.description = description;
    if (features !== undefined) updateData.features = Array.isArray(features) ? features : [];
    if (popular !== undefined) updateData.popular = popular === true || popular === 'true';
    if (isActive !== undefined) updateData.isActive = isActive !== false && isActive !== 'false';
    if (maxOrders !== undefined) updateData.maxOrders = Number(maxOrders);
    if (freeDelivery !== undefined) updateData.freeDelivery = freeDelivery === true || freeDelivery === 'true';
    if (prioritySupport !== undefined) updateData.prioritySupport = prioritySupport === true || prioritySupport === 'true';
    if (exclusiveDeals !== undefined) updateData.exclusiveDeals = exclusiveDeals === true || exclusiveDeals === 'true';
    if (cashbackPercentage !== undefined) updateData.cashbackPercentage = Number(cashbackPercentage);
    if (order !== undefined) updateData.order = Number(order);

    // Check if planId is being changed and if it conflicts
    if (planId) {
      const existing = await SubscriptionPlan.findOne({
        planId: planId.toLowerCase(),
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(409).json({ message: "Plan ID already exists" });
      }
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.json(plan);
  } catch (err) {
    console.error("Update subscription plan error:", err);
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Plan ID already exists" });
    }
    res.status(500).json({ message: "Failed to update subscription plan", error: err?.message || String(err) });
  }
});

// Delete a subscription plan
router.delete("/subscription-plans/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.json({ message: "Subscription plan deleted successfully", plan });
  } catch (err) {
    console.error("Delete subscription plan error:", err);
    res.status(500).json({ message: "Failed to delete subscription plan", error: err?.message || String(err) });
  }
});

// Toggle plan active status
router.put("/subscription-plans/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json(plan);
  } catch (err) {
    console.error("Toggle subscription plan error:", err);
    res.status(500).json({ message: "Failed to toggle subscription plan", error: err?.message || String(err) });
  }
});

// ==================== Delivery Charge Rules Management ====================

// Get all delivery charge rules
router.get("/delivery-charges", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rules = await DeliveryChargeRule.find()
      .sort({ minAmount: 1, sortOrder: 1, createdAt: 1 });
    res.json(rules);
  } catch (err) {
    console.error("Get delivery charge rules error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch delivery charge rules", error: err?.message || String(err) });
  }
});

// Create a new delivery charge rule
router.post("/delivery-charges", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { minAmount, fee, label, isActive, sortOrder } = req.body;

    if (minAmount === undefined || fee === undefined) {
      return res
        .status(400)
        .json({ message: "minAmount and fee are required" });
    }

    const rule = await DeliveryChargeRule.create({
      minAmount: Number(minAmount),
      fee: Number(fee),
      label: label || "",
      isActive: isActive !== false && isActive !== "false",
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0
    });

    res.status(201).json(rule);
  } catch (err) {
    console.error("Create delivery charge rule error:", err);
    res
      .status(500)
      .json({ message: "Failed to create delivery charge rule", error: err?.message || String(err) });
  }
});

// Update a delivery charge rule
router.put("/delivery-charges/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { minAmount, fee, label, isActive, sortOrder } = req.body;

    const updateData = {};
    if (minAmount !== undefined) updateData.minAmount = Number(minAmount);
    if (fee !== undefined) updateData.fee = Number(fee);
    if (label !== undefined) updateData.label = label;
    if (isActive !== undefined) updateData.isActive = isActive !== false && isActive !== "false";
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const rule = await DeliveryChargeRule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({ message: "Delivery charge rule not found" });
    }

    res.json(rule);
  } catch (err) {
    console.error("Update delivery charge rule error:", err);
    res
      .status(500)
      .json({ message: "Failed to update delivery charge rule", error: err?.message || String(err) });
  }
});

// Delete a delivery charge rule
router.delete("/delivery-charges/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await DeliveryChargeRule.findByIdAndDelete(id);

    if (!rule) {
      return res.status(404).json({ message: "Delivery charge rule not found" });
    }

    res.json({ message: "Delivery charge rule deleted successfully", rule });
  } catch (err) {
    console.error("Delete delivery charge rule error:", err);
    res
      .status(500)
      .json({ message: "Failed to delete delivery charge rule", error: err?.message || String(err) });
  }
});

// ========== INVENTORY MANAGEMENT ROUTES (SuperAdmin Only) ==========

// Get inventory list with filters
router.get("/inventory", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { categoryId, lowStock, search } = req.query;
    let query = {};

    if (categoryId && categoryId !== "all") {
      query.categoryId = categoryId;
    }

    if (search) {
      const searchRegex = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ nameEn: searchRegex }, { nameTa: searchRegex }];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: "categoryId", select: "name nameEn nameTa" });

    let mapped = products.map((p) => ({
      _id: p._id,
      nameEn: p.nameEn,
      nameTa: p.nameTa,
      price: p.price,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId?._id || null,
      categoryName: p.categoryId?.name || p.categoryId?.nameEn || "",
      stock: p.stock || 0,
      isLowStock: (p.stock || 0) < 10 // Low stock threshold
    }));

    // Filter by low stock if requested
    if (lowStock === "true") {
      mapped = mapped.filter(p => p.isLowStock);
    }

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/admin/inventory error:", err);
    res.status(500).json({ message: "Failed to fetch inventory", error: err?.message || String(err) });
  }
});

// Get inventory history for a product
router.get("/inventory/:productId/history", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 50 } = req.query;

    const history = await InventoryHistory.find({ productId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate({ path: "changedBy", select: "name email" })
      .populate({ path: "orderId", select: "orderId" });

    const mapped = history.map((h) => ({
      id: String(h._id),
      productId: String(h.productId),
      productName: h.productName,
      previousStock: h.previousStock,
      newStock: h.newStock,
      change: h.change,
      changeType: h.changeType,
      reason: h.reason || null,
      changedBy: h.changedBy ? {
        id: String(h.changedBy._id),
        name: h.changedBy.name || h.changedBy.email
      } : {
        id: null,
        name: h.changedByName || "System"
      },
      orderId: h.orderId ? String(h.orderId._id) : null,
      orderNumber: h.orderId?.orderId || null,
      createdAt: h.createdAt
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/admin/inventory/:productId/history error:", err);
    res.status(500).json({ message: "Failed to fetch inventory history", error: err?.message || String(err) });
  }
});

// Bulk update inventory
router.put("/inventory/bulk-update", requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, stock, reason, changeType }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "updates array is required" });
    }

    const userId = req.user?.uid || req.user?._id || req.user?.id;
    const userName = req.user?.name || req.user?.email || "System";

    const results = [];

    for (const update of updates) {
      const { productId, stock, reason, changeType } = update;

      if (!productId || stock === undefined) {
        results.push({ productId, error: "productId and stock are required" });
        continue;
      }

      try {
        const product = await Product.findById(productId);
        if (!product) {
          results.push({ productId, error: "Product not found" });
          continue;
        }

        const previousStock = product.stock || 0;
        const newStock = Math.max(0, Number(stock));
        const change = newStock - previousStock;

        product.stock = newStock;
        await product.save();

        // Create inventory history record
        await InventoryHistory.create({
          productId: product._id,
          productName: product.nameEn,
          previousStock,
          newStock,
          change,
          changeType: changeType || "manual",
          reason: reason || null,
          changedBy: userId,
          changedByName: userName
        });

        results.push({ productId, success: true, stock: newStock });
      } catch (err) {
        results.push({ productId, error: err.message || String(err) });
      }
    }

    res.json({ results });
  } catch (err) {
    console.error("PUT /api/admin/inventory/bulk-update error:", err);
    res.status(500).json({ message: "Failed to bulk update inventory", error: err?.message || String(err) });
  }
});

export default router;


/ /   . . .   e x i s t i n g   i m p o r t s  
 / /   . . .   e x i s t i n g   r o u t e s  
  
 / /   - - -   S e c t i o n   C o n f i g   M a n a g e m e n t   - - -  
  
 / /   G e t   s e c t i o n   c o n f i g  
 r o u t e r . g e t ( " / s e c t i o n s / : s e c t i o n I d " ,   a s y n c   ( r e q ,   r e s )   = >   {  
         t r y   {  
                 c o n s t   {   s e c t i o n I d   }   =   r e q . p a r a m s ;  
                 c o n s t   c o n f i g   =   a w a i t   S e c t i o n C o n f i g . f i n d O n e ( {   s e c t i o n I d   } ) ;  
                 / /   R e t u r n   e m p t y / d e f a u l t   i f   n o t   f o u n d  
                 r e s . j s o n ( c o n f i g   | |   {   s e c t i o n I d ,   t i t l e :   " " ,   i m a g e U r l :   " " ,   i s V i s i b l e :   t r u e   } ) ;  
         }   c a t c h   ( e r r o r )   {  
                 c o n s o l e . e r r o r ( " E r r o r   f e t c h i n g   s e c t i o n   c o n f i g : " ,   e r r o r ) ;  
                 r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   m e s s a g e :   " S e r v e r   e r r o r "   } ) ;  
         }  
 } ) ;  
  
 / /   U p d a t e   s e c t i o n   c o n f i g  
 r o u t e r . p o s t ( " / s e c t i o n s / : s e c t i o n I d " ,   u p l o a d . s i n g l e ( " i m a g e " ) ,   a s y n c   ( r e q ,   r e s )   = >   {  
         t r y   {  
                 c o n s t   {   s e c t i o n I d   }   =   r e q . p a r a m s ;  
                 c o n s t   {   t i t l e ,   i s V i s i b l e   }   =   r e q . b o d y ;  
  
                 l e t   i m a g e U r l   =   r e q . b o d y . i m a g e U r l ;   / /   k e e p   e x i s t i n g   i f   n o t   c h a n g e d  
                 l e t   p u b l i c I d   =   r e q . b o d y . p u b l i c I d ;  
  
                 / /   H a n d l e   I m a g e   U p l o a d  
                 i f   ( r e q . f i l e )   {  
                         i f   ( p r o c e s s . e n v . C L O U D I N A R Y _ C L O U D _ N A M E )   {  
                                 / /   C l o u d i n a r y   l o g i c   ( p r o m i s i f i e d   f o r   c l e a n l i n e s s )  
                                 c o n s t   r e s u l t   =   a w a i t   n e w   P r o m i s e ( ( r e s o l v e ,   r e j e c t )   = >   {  
                                         c o n s t   s t r e a m   =   c l o u d i n a r y . u p l o a d e r . u p l o a d _ s t r e a m (  
                                                 {   f o l d e r :   " m d m a r t / s e c t i o n s " ,   r e s o u r c e _ t y p e :   " i m a g e "   } ,  
                                                 ( e r r ,   r e s )   = >   {   i f   ( e r r )   r e j e c t ( e r r ) ;   e l s e   r e s o l v e ( r e s ) ;   }  
                                         ) ;  
                                         s t r e a m . e n d ( r e q . f i l e . b u f f e r ) ;  
                                 } ) ;  
                                 i m a g e U r l   =   r e s u l t . s e c u r e _ u r l ;  
                                 p u b l i c I d   =   r e s u l t . p u b l i c _ i d ;  
                         }   e l s e   {  
                                 / /   L o c a l   f a l l b a c k  
                                 c o n s t   m i m e   =   r e q . f i l e . m i m e t y p e ;  
                                 c o n s t   b a s e 6 4   =   r e q . f i l e . b u f f e r . t o S t r i n g ( " b a s e 6 4 " ) ;  
                                 i m a g e U r l   =   ` d a t a : $ { m i m e } ; b a s e 6 4 , $ { b a s e 6 4 } ` ;  
                                 p u b l i c I d   =   " l o c a l " ;  
                         }  
                 }  
  
                 c o n s t   c o n f i g   =   a w a i t   S e c t i o n C o n f i g . f i n d O n e A n d U p d a t e (  
                         {   s e c t i o n I d   } ,  
                         {  
                                 s e c t i o n I d ,  
                                 t i t l e ,  
                                 i s V i s i b l e :   i s V i s i b l e   = = =   " t r u e "   | |   i s V i s i b l e   = = =   t r u e ,  
                                 i m a g e U r l ,  
                                 p u b l i c I d  
                         } ,  
                         {   n e w :   t r u e ,   u p s e r t :   t r u e   }  
                 ) ;  
  
                 r e s . j s o n ( c o n f i g ) ;  
         }   c a t c h   ( e r r o r )   {  
                 c o n s o l e . e r r o r ( " E r r o r   u p d a t i n g   s e c t i o n   c o n f i g : " ,   e r r o r ) ;  
                 r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   m e s s a g e :   " U p d a t e   f a i l e d " ,   e r r o r :   e r r o r . m e s s a g e   } ) ;  
         }  
 } ) ;  
  
 e x p o r t   d e f a u l t   r o u t e r ;  
 