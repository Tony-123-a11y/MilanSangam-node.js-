import express from "express";
import { checkPackageLimit } from "../middlewares/checkPackageLimit.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  sendInterest,
  withdrawInterest,
  acceptInterest,
  rejectInterest,
  getSentInterests,
  getReceivedInterests,
} from "../controllers/interestController.js";

export const interestRouter = express.Router();

/* SEND INTEREST */
interestRouter.post(
  "/send",
  authenticate,
  checkPackageLimit("interest"),
  sendInterest,
);

/* WITHDRAW INTEREST */
interestRouter.post("/withdraw", authenticate, withdrawInterest);

/* ACCEPT / REJECT */
interestRouter.post("/accept", authenticate, acceptInterest);
interestRouter.post("/reject", authenticate, rejectInterest);

/* GET SENT INTERESTS */
interestRouter.get("/sent/:userId", authenticate, getSentInterests);

/* GET RECEIVED INTERESTS */
interestRouter.get("/received/:userId", authenticate, getReceivedInterests);
