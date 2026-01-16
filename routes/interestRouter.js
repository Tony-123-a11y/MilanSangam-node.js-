import express from "express";
import { getAllInterestsReceived, getAllInterestsSent, sendInterest, withdrawInterest } from "../controllers/interestController.js";

export const interestRouter = express.Router();

interestRouter.post("/send", sendInterest);
interestRouter.post("/withdraw", withdrawInterest);
interestRouter.get('/getAllInterestSend/:userId',getAllInterestsSent);
interestRouter.get('/getAllInterestReceived/:userId',getAllInterestsReceived);