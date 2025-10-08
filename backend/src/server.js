import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import userListRoutes from "./routes/userLists.js";

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

    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();


