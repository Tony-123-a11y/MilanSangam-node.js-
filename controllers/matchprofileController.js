import { User } from "../models/userModel.js";
import { buildProfileResponse } from "../utils/buildProfileResponse.js";

export const findMatchesForCurrentUser = async (req, res) => {
  try {
    const { uid } = req.params;

    const currentUser = await User.findById(uid).populate("profile");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oppositeGender =
      currentUser.gender?.toLowerCase() === "male" ? "female" : "male";

    const users = await User.find({
      _id: { $ne: uid },
      gender: { $regex: new RegExp(`^${oppositeGender}$`, "i") },
    }).populate("profile");

    const results = users.map((user) =>
      buildProfileResponse(currentUser, user),
    );

    res.status(200).json({
      success: true,
      matches: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
