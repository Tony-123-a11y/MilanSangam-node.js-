import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
    },

    // UI display ke liye
    displayFeatures: [
      {
        type: String,
      },
    ],

    // Backend logic ke liye
    features: {
      sendInterest: {
        type: Boolean,
        default: false,
      },

      sendMessage: {
        type: Boolean,
        default: false,
      },

      viewContact: {
        type: Boolean,
        default: false,
      },
    },

    limits: {
      interestsPerDay: {
        type: Number,
        default: 0,
      },

      messagesPerDay: {
        type: Number,
        default: 0,
      },

      contactView: {
        type: Number,
        default: 0,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Package = mongoose.model("Package", packageSchema);
