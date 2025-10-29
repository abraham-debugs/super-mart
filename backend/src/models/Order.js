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
    paymentMode: {
      type: String,
      enum: ["COD", "Online Payment", "UPI", "Card", "Wallet"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending"
    },
    transactionId: {
      type: String,
      default: null
    },
    address: { type: String },
    paymentInfo: { type: Object },
    paymentScreenshot: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    transportName: String,
    lrNumber: String,
    assignedDeliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPartner',
      default: null
    },
    promoCode: {
      code: { type: String },
      discountPercent: { type: Number },
      discountAmount: { type: Number, default: 0 }
    },
    subtotalBeforeDiscount: { type: Number }, // Subtotal before promo discount
    placedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
