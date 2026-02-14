import express from "express";
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
interestRouter.post("/send", sendInterest);

/* WITHDRAW INTEREST */
interestRouter.post("/withdraw", withdrawInterest);

/* ACCEPT / REJECT */
interestRouter.post("/accept", acceptInterest);
interestRouter.post("/reject", rejectInterest);

/*  GET SENT INTERESTS */
interestRouter.get("/sent/:userId", getSentInterests);

/*GET RECEIVED INTERESTS*/
interestRouter.get("/received/:userId", getReceivedInterests);
