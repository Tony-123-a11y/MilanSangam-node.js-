import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";

import {
  shortListProfile,
  getAllShortListProfiles,
  removeShortListProfile,
} from "../controllers/shortlistController.js";

const shortlistRouter = express.Router();

shortlistRouter.post("/:targetUserId", authenticate, shortListProfile);

shortlistRouter.get("/", authenticate, getAllShortListProfiles);

shortlistRouter.delete("/:targetUserId", authenticate, removeShortListProfile);

export default shortlistRouter;
