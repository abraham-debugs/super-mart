import mongoose from "mongoose";

const DeliveryChargeRuleSchema = new mongoose.Schema(
  {
    // Minimum order amount (cart subtotal) this rule applies to
    minAmount: {
      type: Number,
      required: true,
      min: 0
    },
    // Delivery fee in currency units (e.g. 30 = Rs.30)
    fee: {
      type: Number,
      required: true,
      min: 0
    },
    // Optional label/help text shown in admin UI (e.g. "Orders above 200")
    label: {
      type: String,
      trim: true,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index to efficiently sort and find by minAmount
DeliveryChargeRuleSchema.index({ minAmount: 1 });

export const DeliveryChargeRule =
  mongoose.models.DeliveryChargeRule ||
  mongoose.model("DeliveryChargeRule", DeliveryChargeRuleSchema);



