import express from "express";
import { checkPackageLimit } from "../middlewares/checkPackageLimit.js";
import { viewContact } from "../controllers/contactController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get(
  "/view-contact/:userId",
  authenticate,
  checkPackageLimit("contactView"),
  viewContact,
);

export default router;
