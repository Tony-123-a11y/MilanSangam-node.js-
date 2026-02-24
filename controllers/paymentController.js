import crypto from "crypto";
import mongoose from "mongoose";
import { razorpay } from "../config/razorpay.js";
import { Package } from "../models/packageModel.js";
import { Payment } from "../models/paymentModel.js";
import { User } from "../models/userModel.js";

/**
 * CREATE ORDER
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { packageId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!packageId) {
      return res.status(400).json({
        message: "Package ID required",
      });
    }
    // expire old pending payments
    await Payment.updateMany(
      {
        user: userId,
        status: "created",
        createdAt: {
          $lt: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
      {
        status: "failed",
      },
    );

    // prevent multiple pending
    const existingPending = await Payment.findOne({
      user: userId,
      status: "created",
    });

    if (existingPending) {
      return res.status(400).json({
        message: "Complete previous payment first",
      });
    }

    // find package
    const selectedPackage = await Package.findOne({
      _id: packageId,
      isActive: true,
    });

    if (!selectedPackage) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // create razorpay order
    const order = await razorpay.orders.create({
      amount: Number(selectedPackage.price) * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    console.log("Razorpay Order Created:", order.id);

    // save in DB
    await Payment.create({
      user: userId,
      package: selectedPackage._id,
      razorpay_order_id: order.id,
      amount: selectedPackage.price,
      status: "created",
    });

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Create Order Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * VERIFY PAYMENT
 */
export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const userId = req.user?.userId;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment details",
      });
    }

    // generate signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    // verify signature
    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpay_order_id },
        { status: "failed" },
        { session },
      );

      await session.abortTransaction();

      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    // find payment
    const payment = await Payment.findOne({
      razorpay_order_id,
    }).session(session);

    if (!payment) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // prevent double verify
    if (payment.status === "paid") {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Payment already verified",
      });
    }

    // find package
    const selectedPackage = await Package.findById(payment.package).session(
      session,
    );

    if (!selectedPackage) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Package not found",
      });
    }

    // find user
    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "User not found",
      });
    }

    // expiry logic
    let baseDate = new Date();

    if (user.packageExpiry && user.packageExpiry > new Date()) {
      baseDate = user.packageExpiry;
    }

    const expiryDate = new Date(
      baseDate.getTime() + selectedPackage.durationDays * 24 * 60 * 60 * 1000,
    );

    // update payment
    payment.status = "paid";
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.expiryDate = expiryDate;

    await payment.save({ session });

    // update user
    user.package = selectedPackage._id;
    user.packageExpiry = expiryDate;

    user.contactViewed = 0;
    user.interestSentToday = 0;
    user.messageSentToday = 0;
    user.lastInterestDate = null;
    user.lastMessageDate = null;

    await user.save({ session });

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      expiryDate,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("❌ Verify Payment Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  } finally {
    session.endSession();
  }
};
