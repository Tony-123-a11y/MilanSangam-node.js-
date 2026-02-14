import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getAllShortListProfiles,
  getUserProfileById,
  removeShortListProfile,
  shortListProfile,
  updateProfile,
} from "../controllers/profileControler.js";
import {
  uploadTopPhotos,
  uploadProfilePic,
} from "../middlewares/multerUpload.js"; // Make sure this exports correctly

const profileRouter = express.Router();

// ✅ Get user profile by UID (requires authentication)
profileRouter.get("/getuserprofile/:uid", authenticate, getUserProfileById);

// ✅ Update user profile with profile pic & multiple photos
profileRouter.post(
  "/updateuserprofile",
  authenticate,
  uploadTopPhotos,
  uploadProfilePic,
  updateProfile,
);

profileRouter.post("/shortlist/:matchId", authenticate, shortListProfile);
profileRouter.get(
  "/allshortlistedprofiles",
  authenticate,
  getAllShortListProfiles,
);
profileRouter.delete(
  "/removeshortlist/:matchId",
  authenticate,
  removeShortListProfile,
);

export default profileRouter;
