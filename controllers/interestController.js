import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { buildProfileResponse } from "../utils/buildProfileResponse.js";

/**
 * SEND INTEREST
 */
export const sendInterest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId)
      throw new Error("senderId and receiverId required");

    if (senderId === receiverId)
      throw new Error("Cannot send interest to yourself");

    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findById(receiverId).session(session);

    if (!sender || !receiver) throw new Error("User not found");

    if (sender.matches.includes(receiverId)) throw new Error("Already matched");

    if (sender.interestsSent.includes(receiverId))
      throw new Error("Interest already sent");

    sender.rejectedProfiles = sender.rejectedProfiles.filter(
      (id) => id.toString() !== receiverId,
    );

    receiver.rejectedProfiles = receiver.rejectedProfiles.filter(
      (id) => id.toString() !== senderId,
    );

    sender.interestsSent.push(receiverId);
    receiver.interestsReceived.push(senderId);

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    res.json({ success: true, message: "Interest sent successfully" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
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

    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findById(receiverId).session(session);

    if (!sender || !receiver) throw new Error("User not found");

    if (!receiver.interestsReceived.some((id) => id.toString() === senderId))
      throw new Error("No pending interest found");

    // match
    if (!sender.matches.some((id) => id.toString() === receiverId)) {
      sender.matches.push(receiverId);
    }

    if (!receiver.matches.some((id) => id.toString() === senderId)) {
      receiver.matches.push(senderId);
    }

    // acceptedProfiles
    if (!receiver.acceptedProfiles.some((id) => id.toString() === senderId)) {
      receiver.acceptedProfiles.push(senderId);
    }

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Interest accepted successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
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

    if (!receiver.interestsReceived.some((id) => id.toString() === senderId))
      throw new Error("No pending interest found");

    receiver.interestsReceived = receiver.interestsReceived.filter(
      (id) => id.toString() !== senderId,
    );

    sender.interestsSent = sender.interestsSent.filter(
      (id) => id.toString() !== receiverId,
    );
    receiver.acceptedProfiles = receiver.acceptedProfiles.filter(
      (id) => id.toString() !== senderId,
    );

    if (!receiver.rejectedProfiles.some((id) => id.toString() === senderId)) {
      receiver.rejectedProfiles.push(senderId);
    }

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Interest rejected successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
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

    if (!currentUser)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const users = await User.find({
      _id: { $in: currentUser.interestsSent },
    }).populate("profile");

    const results = users.map((user) => {
      const isAccepted = currentUser.matches.some(
        (id) => id.toString() === user._id.toString(),
      );

      return buildProfileResponse(currentUser, user, {
        interestSent: true,
        accepted: isAccepted,
        canSendInterest: false,
        canAccept: false,
      });
    });

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

    if (!currentUser)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const users = await User.find({
      _id: { $in: currentUser.interestsReceived },
    }).populate("profile");

    const results = users.map((user) => {
      const isAccepted = currentUser.acceptedProfiles.some(
        (id) => id.toString() === user._id.toString(),
      );

      return buildProfileResponse(currentUser, user, {
        interestReceived: true,
        accepted: isAccepted,
        canAccept: !isAccepted,
        canSendInterest: false,
      });
    });

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
