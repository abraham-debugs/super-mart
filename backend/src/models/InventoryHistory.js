import mongoose from "mongoose";

const InventoryHistorySchema = new mongoose.Schema(
  {
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true,
      index: true
    },
    productName: { type: String, required: true }, // Store name for historical reference
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },
    change: { type: Number, required: true }, // positive for increase, negative for decrease
    changeType: { 
      type: String, 
      enum: ["manual", "order", "adjustment", "restock", "return"], 
      default: "manual" 
    },
    reason: { type: String, trim: true }, // Optional reason for the change
    changedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Admin/superadmin who made the change
    changedByName: { type: String }, // Store name for historical reference
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order" 
    }, // If change is due to an order
  },
  { timestamps: true }
);

// Index for efficient queries
InventoryHistorySchema.index({ productId: 1, createdAt: -1 });
InventoryHistorySchema.index({ createdAt: -1 });

export const InventoryHistory = mongoose.models.InventoryHistory || mongoose.model("InventoryHistory", InventoryHistorySchema);






