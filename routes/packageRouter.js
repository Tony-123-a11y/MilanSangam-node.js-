import express from "express";
import { getActivePackages } from "../controllers/packageController.js";

const router = express.Router();

router.get("/", getActivePackages);

export default router;
