import express from "express";
import {
  getAllContacts,
  getAllMessages,
  sendMessage,
} from "../controllers/messageController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { checkPackageLimit } from "../middlewares/checkPackageLimit.js";

const messageRouter = express.Router();

messageRouter.post(
  "/sendMessage/:profileId",
  authenticate,
  checkPackageLimit("message"),
  sendMessage,
);

messageRouter.get(
  "/getContacts",
  authenticate,
  checkPackageLimit("message"),
  getAllContacts,
);

messageRouter.get(
  "/getMessages/:profileId",
  authenticate,
  checkPackageLimit("message"),
  getAllMessages,
);

export default messageRouter;
