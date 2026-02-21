import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getUserProfileById,
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

export default profileRouter;
