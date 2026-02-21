import { User } from "../models/userModel.js";
import { buildProfileResponse } from "../utils/buildProfileResponse.js";

export const getRejectedProfiles = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId).populate("profile");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const users = await User.find({
      _id: { $in: currentUser.rejectedProfiles },
    }).populate("profile");

    const results = users.map((user) =>
      buildProfileResponse(currentUser, user, {
        matched: false,
        canSendInterest: false,
        canAccept: false,
      }),
    );

    return res.status(200).json({
      success: true,
      profiles: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
