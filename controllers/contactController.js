import { User } from "../models/userModel.js";

export const viewContact = async (req, res) => {
  try {
    const viewer = req.packageUser;
    const targetUserId = req.params.userId;

    if (viewer._id.toString() === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot view your own contact",
      });
    }

    const targetUser = await User.findById(targetUserId).populate("profile");

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // increment contact view count
    viewer.contactViewed = (viewer.contactViewed || 0) + 1;
    await viewer.save();

    const limit = viewer.package.limits.contactView;

    res.status(200).json({
      success: true,
      message: "Contact viewed successfully",

      contact: {
        phone: targetUser.profile?.phone,
        email: targetUser.profile?.email,
      },

      remaining: limit === -1 ? "Unlimited" : limit - viewer.contactViewed,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
