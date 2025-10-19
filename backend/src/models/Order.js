import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, index: true, unique: true, sparse: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerDetails: {
      fullName: { type: String },
      mobile: { type: String },
      address: { type: String }
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        imageUrl: String
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "placed" }, // placed, confirmed, payment_verified, booked, shipped, delivered, cancelled
    address: { type: String },
    paymentInfo: { type: Object },
    paymentScreenshot: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    transportName: String,
    lrNumber: String,
    placedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
