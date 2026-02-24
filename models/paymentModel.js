import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    razorpay_order_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpay_payment_id: {
      type: String,
      index: true, // useful for lookup
    },

    razorpay_signature: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },

    expiryDate: {
      type: Date,
      index: true,
    },

    paidAt: {
      type: Date,
    },

    failedAt: {
      type: Date,
    },

    metadata: {
      type: Object, // optional extra info
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Compound index
 */
paymentSchema.index({ user: 1, status: 1 });

/**
 * Automatically set paidAt when paid
 */
paymentSchema.pre("save", function (next) {
  if (this.status === "paid" && !this.paidAt) {
    this.paidAt = new Date();
  }

  if (this.status === "failed" && !this.failedAt) {
    this.failedAt = new Date();
  }

  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);
