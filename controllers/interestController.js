import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { ProfileDTO } from "../DTOs/ProfileDTO.js";
import { calculateMatchPercentage } from "../utils/matchCalculator.js";

/**
 * SEND INTEREST
 */
export const sendInterest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId)
      return res.status(400).json({
        success: false,
        message: "senderId and receiverId required",
      });

    if (senderId === receiverId)
      return res.status(400).json({
        success: false,
        message: "Cannot send interest to yourself",
      });

    const sender = await User.findById(senderId).session(session);

    const receiver = await User.findById(receiverId).session(session);

    if (!sender || !receiver) throw new Error("User not found");

    if (sender.matches.includes(receiverId)) throw new Error("Already matched");

    if (sender.interestsSent.includes(receiverId))
      throw new Error("Interest already sent");

    sender.interestsSent.push(receiverId);
    receiver.interestsReceived.push(senderId);

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Interest sent successfully",
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * ACCEPT INTEREST
 */
export const acceptInterest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId)
      return res.status(400).json({
        success: false,
        message: "senderId and receiverId required",
      });

    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findById(receiverId).session(session);

    if (!sender || !receiver) throw new Error("User not found");

    if (!receiver.interestsReceived.includes(senderId))
      throw new Error("No pending interest found");

    // ✅ Add to matches
    if (!sender.matches.includes(receiverId)) {
      sender.matches.push(receiverId);
    }

    if (!receiver.matches.includes(senderId)) {
      receiver.matches.push(senderId);
    }

    // ❌ DO NOT REMOVE FROM interestsSent / interestsReceived

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Interest accepted. Users matched successfully.",
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * REJECT INTEREST
 */
export const rejectInterest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverId } = req.body;

    const sender = await User.findById(senderId).session(session);

    const receiver = await User.findById(receiverId).session(session);

    if (!sender || !receiver) throw new Error("User not found");

    receiver.interestsReceived = receiver.interestsReceived.filter(
      (id) => id.toString() !== senderId,
    );

    sender.interestsSent = sender.interestsSent.filter(
      (id) => id.toString() !== receiverId,
    );

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Interest rejected successfully",
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * WITHDRAW INTEREST
 */
export const withdrawInterest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverId } = req.body;

    const sender = await User.findById(senderId).session(session);

    const receiver = await User.findById(receiverId).session(session);

    if (!sender || !receiver) throw new Error("User not found");

    sender.interestsSent = sender.interestsSent.filter(
      (id) => id.toString() !== receiverId,
    );

    receiver.interestsReceived = receiver.interestsReceived.filter(
      (id) => id.toString() !== senderId,
    );

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Interest withdrawn successfully",
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * GET SENT INTERESTS
 */
export const getSentInterests = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId).populate("profile");

    if (!currentUser) throw new Error("User not found");

    const users = await User.find({
      _id: { $in: currentUser.interestsSent },
    }).populate("profile");

    const results = users.map((user) => ({
      ...ProfileDTO(user.profile, user),

      matchPercentage: calculateMatchPercentage(currentUser, user),
    }));

    return res.status(200).json({
      success: true,
      interests: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET RECEIVED INTERESTS
 */
export const getReceivedInterests = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId).populate("profile");

    if (!currentUser) throw new Error("User not found");

    const users = await User.find({
      _id: { $in: currentUser.interestsReceived },
    }).populate("profile");

    const results = users.map((user) => ({
      ...ProfileDTO(user.profile, user),

      matchPercentage: calculateMatchPercentage(currentUser, user),
    }));

    return res.status(200).json({
      success: true,
      interests: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
