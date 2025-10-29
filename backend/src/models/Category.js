import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 64
    },
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    showInNavbar: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for better query performance
CategorySchema.index({ parentCategory: 1 });

// Drop the old unique index on name if it exists (will be handled by migration)
// Note: If you have existing data, you may need to manually drop the unique index
// Run this in MongoDB: db.categories.dropIndex("name_1")

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);


