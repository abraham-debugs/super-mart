import mongoose from "mongoose";

const AdPosterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    ctaText: {
      type: String,
      trim: true,
      default: "Shop Now",
      maxlength: 60,
    },
    ctaLink: {
      type: String,
      trim: true,
      default: "/",
      maxlength: 200,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

AdPosterSchema.index({ order: 1, createdAt: -1 });

export const AdPoster =
  mongoose.models.AdPoster || mongoose.model("AdPoster", AdPosterSchema);




