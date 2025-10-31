import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    expiryDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageLimit: {
      type: Number,
      default: null // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0
    },
    minOrderAmount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Index for faster lookups
PromoCodeSchema.index({ code: 1 });
PromoCodeSchema.index({ expiryDate: 1 });

// Method to check if promo code is valid
PromoCodeSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (new Date() > this.expiryDate) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

export const PromoCode = mongoose.models.PromoCode || mongoose.model("PromoCode", PromoCodeSchema);








