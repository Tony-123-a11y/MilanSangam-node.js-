import { User } from "../models/userModel.js";
import { ProfileDTO } from "../DTOs/ProfileDTO.js";
import { calculateMatchPercentage } from "../utils/matchCalculator.js";

export const getAcceptedProfiles = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(userId).populate("profile");

    if (!currentUser)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    const users = await User.find({
      _id: { $in: currentUser.acceptedProfiles },
    }).populate("profile");

    const results = users.map((user) => ({
      ...ProfileDTO(user.profile, user),
      matchPercentage: calculateMatchPercentage(currentUser, user),
      matched: currentUser.matches.some(
        (id) => id.toString() === user._id.toString(),
      ),
    }));

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
