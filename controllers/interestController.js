import { User } from "../models/userModel.js";
import mongoose from "mongoose";

export const sendInterest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ success: false, message: "senderId and receiverId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ success: false, message: "Invalid user IDs" });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: "You cannot send interest to yourself" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender) {
      return res.status(404).json({ success: false, message: "Sender not found" });
    }
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    // ✅ Check if interest already sent
    const alreadySent = sender.interestsSent.includes(receiverId);
    if (alreadySent) {
      return res.status(400).json({ success: false, message: "Interest already sent to this user" });
    }

    // ✅ Push receiver to sender’s interestsSent
    sender.interestsSent.push(receiverId);

    // ✅ Push sender to receiver’s interestsReceived
    receiver.interestsReceived.push(senderId);

    await sender.save();
    await receiver.save();

    return res.status(200).json({
      success: true,
      message: "Interest sent successfully",
    });
  } catch (error) {
    console.error("Error sending interest:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const withdrawInterest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ success: false, message: "senderId and receiverId are required" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    sender.interestsSent = sender.interestsSent.filter(
      (id) => id.toString() !== receiverId
    );
    receiver.interestsReceived = receiver.interestsReceived.filter(
      (id) => id.toString() !== senderId
    );

    await sender.save();
    await receiver.save();

    res.status(200).json({ success: true, message: "Interest withdrawn successfully" });
  } catch (error) {
    console.error("Error withdrawing interest:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// ==========================
// 📤 Get All Interests Sent
// ==========================
export const getAllInterestsSent = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "interestsSent",
        select: "fullName gender dob religion caste city state profile",
        populate: { path: "profile" },
      })
      .select("interestsSent");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Fetched all interests sent successfully",
      interestsSent: user.interestsSent,
    });
  } catch (error) {
    console.error("Error fetching sent interests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ==========================
// 📥 Get All Interests Received
// ==========================
export const getAllInterestsReceived = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "interestsReceived",
        select: "fullName gender dob religion caste city state profile",
        populate: { path: "profile" },
      })
      .select("interestsReceived");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Fetched all interests received successfully",
      interestsReceived: user.interestsReceived,
    });
  } catch (error) {
    console.error("Error fetching received interests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};