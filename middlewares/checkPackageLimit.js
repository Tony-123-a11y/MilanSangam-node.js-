import { User } from "../models/userModel.js";

export const checkPackageLimit = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const user = await User.findById(userId).populate("package");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.package) {
        return res.status(403).json({
          success: false,
          message: "Please purchase a package",
        });
      }

      if (!user.packageExpiry || user.packageExpiry < new Date()) {
        return res.status(403).json({
          success: false,
          message: "Your package has expired",
        });
      }

      // unlimited features
      if (feature === "interest" || feature === "message") {
        req.packageUser = user;
        return next();
      }

      // contact view limit check
      if (feature === "contactView") {
        const limit = user.package.limits?.contactView;
        const used = user.contactViewed || 0;

        if (limit !== -1 && used >= limit) {
          return res.status(403).json({
            success: false,
            message: "Contact view limit reached",
          });
        }

        req.packageUser = user;
        return next();
      }

      return res.status(400).json({
        success: false,
        message: "Invalid feature",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};
