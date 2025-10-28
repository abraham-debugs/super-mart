import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 64 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    preferredCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isProfileComplete: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    emailOtpCode: { type: String, default: null },
    emailOtpExpiresAt: { type: Date, default: null },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    saveForLater: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    subscriptionPlan: { type: String, enum: ["free", "basic", "professional", "enterprise"], default: "free" }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);


