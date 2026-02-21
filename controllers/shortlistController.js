import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { buildProfileResponse } from "../utils/buildProfileResponse.js";

// ================= SHORTLIST PROFILE =================

export const shortListProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetUserId } = req.params;

    // validate id
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // prevent self shortlist
    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot shortlist yourself",
      });
    }

    const currentUser = await User.findById(userId).populate("profile");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found",
      });
    }

    // check target user exists
    const targetUserExists = await User.exists({ _id: targetUserId });

    if (!targetUserExists) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    // check already shortlisted
    const alreadyShortlisted = currentUser.shortProfiles.some(
      (id) => id.toString() === targetUserId,
    );

    if (alreadyShortlisted) {
      return res.status(400).json({
        success: false,
        message: "Profile already shortlisted",
        isShortlisted: true,
        canShortlist: false,
        canRemoveShortlist: true,
      });
    }

    // push user id
    currentUser.shortProfiles.push(targetUserId);

    await currentUser.save();

    return res.status(200).json({
      success: true,
      message: "Profile shortlisted successfully",
      isShortlisted: true,
      canShortlist: false,
      canRemoveShortlist: true,
    });
  } catch (error) {
    console.error("shortListProfile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL SHORTLIST =================

export const getAllShortListProfiles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const currentUser = await User.findById(userId).populate("profile");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!currentUser.shortProfiles.length) {
      return res.status(200).json({
        success: true,
        profiles: [],
      });
    }

    const users = await User.find({
      _id: { $in: currentUser.shortProfiles },
    }).populate("profile");

    const results = users.map((user) =>
      buildProfileResponse(currentUser, user),
    );

    return res.status(200).json({
      success: true,
      profiles: results,
    });
  } catch (error) {
    console.error("getAllShortListProfiles error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= REMOVE SHORTLIST =================

export const removeShortListProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const currentUser = await User.findById(userId).populate("profile");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    currentUser.shortProfiles = currentUser.shortProfiles.filter(
      (id) => id.toString() !== targetUserId,
    );

    await currentUser.save();

    return res.status(200).json({
      success: true,
      message: "Removed from shortlist",
      isShortlisted: false,
      canShortlist: true,
      canRemoveShortlist: false,
    });
  } catch (error) {
    console.error("removeShortListProfile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
