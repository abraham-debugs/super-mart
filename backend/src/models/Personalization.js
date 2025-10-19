import mongoose from "mongoose";

const PersonalizationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    preferredCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    // future personalization fields can be added here (recommended products, tags, etc.)
  },
  { timestamps: true }
);

export const Personalization = mongoose.models.Personalization || mongoose.model("Personalization", PersonalizationSchema);
