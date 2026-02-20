import express from "express";
import { getAcceptedProfiles } from "../controllers/acceptedController.js";

import { getRejectedProfiles } from "../controllers/rejectedController.js";

const router = express.Router();

router.get("/accepted/:userId", getAcceptedProfiles);
router.get("/rejected/:userId", getRejectedProfiles);

export default router;
