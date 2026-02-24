import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-order/:packageId", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);

export default router;
