import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameTa: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    youtubeLink: { type: String, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    isFreshPick: { type: Boolean, default: false }, // For "Fresh Picks for You" section
    isMostLoved: { type: Boolean, default: false }   // For "Most Loved Items" section
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);


