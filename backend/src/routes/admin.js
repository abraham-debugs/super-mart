import express from "express";
import bcrypt from "bcryptjs";
import { upload } from "../middleware/upload.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { DeliveryPartner } from "../models/DeliveryPartner.js";
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
      isMostLoved: p.isMostLoved || false
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err?.message || String(err) });
  }
});

// Create product in existing category
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { nameEn, nameTa, price, originalPrice, youtubeLink, categoryId, isFreshPick, isMostLoved } = req.body;
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
      isMostLoved: shouldBeMostLoved && !shouldBeFreshPick // Only set isMostLoved if not Fresh Pick
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("POST /api/admin/products error:", err);
    res.status(500).json({ message: "Failed to create product", error: err?.message || String(err) });
  }
});

// Update product
router.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nameEn, nameTa, price, originalPrice, youtubeLink, categoryId, isFreshPick, isMostLoved } = req.body;
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

export default router;


