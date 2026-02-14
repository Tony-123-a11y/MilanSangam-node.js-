import express from "express";
import {
  editProfile,
  forgetPassword,
  getProfileDetails,
  getUserAfterLogin,
  getUserForAdmin,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { uploadTopPhotos } from "../middlewares/multerUpload.js";
// import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/getUser", authenticate, getUserAfterLogin);

router.post("/forget-password", forgetPassword);

router.post("/reset-password", resetPassword);

router.patch("/editProfile", uploadTopPhotos, authenticate, editProfile);

router.get("/getAllUsers", authenticate, getUserForAdmin);

router.get("/profileDetails/:uid", getProfileDetails);

router.post("/logout", logoutUser);

export default router;
