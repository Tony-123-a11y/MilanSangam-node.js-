import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { ProfileDTO } from "../DTOs/ProfileDTO.js";
import { calculateMatchPercentage } from "../utils/matchCalculator.js";

export const findMatchesForCurrentUser = async (req, res) => {
  try {
    const { uid } = req.params;

    const currentUser = await User.findById(uid).populate("profile");

    if (!currentUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const oppositeGender =
      currentUser.gender?.toLowerCase() === "male" ? "female" : "male";

    const users = await User.find({
      _id: { $ne: uid },
      gender: { $regex: new RegExp(`^${oppositeGender}$`, "i") },
    }).populate("profile");

    const results = users.map((user) => {
      const dto = ProfileDTO(user.profile, user);

      const interestSent = currentUser.interestsSent.some(
        (id) => id.toString() === user._id.toString(),
      );

      const interestReceived = currentUser.interestsReceived.some(
        (id) => id.toString() === user._id.toString(),
      );

      const matched = currentUser.matches.some(
        (id) => id.toString() === user._id.toString()
      );

      const matchPercentage = calculateMatchPercentage(currentUser, user);

      return {
        ...dto,
        matchPercentage,
        interestSent,
        interestReceived,
        matched,
      };
    });

    res.status(200).json({
      success: true,
      matches: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
