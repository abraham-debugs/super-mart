import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { configureVision } from "./config/vision.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import userListRoutes from "./routes/userLists.js";
import orderRoutes from "./routes/orders.js";
import addressRoutes from "./routes/addresses.js";
import productsRoutes from "./routes/products.js";
import deliveryRoutes from "./routes/delivery.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import imageSearchRoutes from "./routes/imageSearch.js";
import recommendationRoutes from "./routes/recommendations.js";
import promoCodeRoutes from "./routes/promoCodes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userListRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/image-search", imageSearchRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/promo-codes", promoCodeRoutes);

const port = process.env.PORT || 5000;

async function bootstrap() {
  try {
    const conn = await connectToDatabase(process.env.MONGODB_URI);
    if (conn && conn.client && conn.client.s && conn.client.s.url) {
      console.log("MongoDB connected:", conn.client.s.url);
    } else if (conn && conn.host) {
      console.log("MongoDB connected:", conn.host);
    } else {
      console.log("MongoDB connected");
    }
    configureCloudinary({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    });

    // Configure Google Cloud Vision API (optional)
    if (process.env.GOOGLE_CLOUD_VISION_CREDENTIALS) {
      configureVision(process.env.GOOGLE_CLOUD_VISION_CREDENTIALS);
    } else {
      console.warn('Google Cloud Vision API credentials not provided. Image search will be disabled.');
    }

    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();


