import mongoose from "mongoose";
import dotenv from "dotenv";
import { Package } from "./models/packageModel.js";

dotenv.config();

const seedPackages = async () => {
  try {
    console.log("Connecting to DB...");

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Connected ✅");

    await Package.deleteMany();

    await Package.insertMany([
      {
        name: "Mini Package",
        price: 95,
        durationDays: 2,
        features: [
          "3 Contact Views",
          "Send unlimited Interest",
          "Duration – 2 Days",
          "Send Unlimited Interests",
          "Send Unlimited Messages",
        ],
        limits: {
          contactView: 3,
          interestsPerDay: -1,
          messagesPerDay: -1,
        },
        isActive: true,
      },
      {
        name: "Basic Package",
        price: 150,
        durationDays: 30,
        features: [
          "20 Contact Views",
          "Send unlimited Interest",
          "Duration – 1 Month",
          "Send Unlimited Interests",
          "Send Unlimited Messages",
        ],
        limits: {
          contactView: 20,
          interestsPerDay: -1,
          messagesPerDay: -1,
        },
        isActive: true,
      },
      {
        name: "Standard Package",
        price: 250,
        durationDays: 30,
        features: [
          "35 Contact Views",
          "Send unlimited Interest",
          "Duration – 1 Month",
          "Send Unlimited Interests",
          "Send Unlimited Messages",
        ],
        limits: {
          contactView: 35,
          interestsPerDay: -1,
          messagesPerDay: -1,
        },
        isActive: true,
      },
      {
        name: "Regular Package",
        price: 350,
        durationDays: 30,
        features: [
          "45 Contact Views",
          "Send unlimited Interest",
          "Duration – 1 Month",
          "Send Unlimited Interests",
          "Send Unlimited Messages",
        ],
        limits: {
          contactView: 45,
          interestsPerDay: -1,
          messagesPerDay: -1,
        },
        isActive: true,
      },
      {
        name: "Premium Package",
        price: 450,
        durationDays: 30,
        features: [
          "55 Contact Views",
          "Send unlimited Interest",
          "Duration – 1 Month",
          "Send Unlimited Interests",
          "Send Unlimited Messages",
        ],
        limits: {
          contactView: 55,
          interestsPerDay: -1,
          messagesPerDay: -1,
        },
        isActive: true,
      },
    ]);

    console.log("🎉 5 Packages Inserted Successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedPackages();
