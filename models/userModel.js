import mongoose, { Mongoose } from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    marriageStatus: {
      type: String,
    },
    profileFor: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    religion: {
      type: String,
      required: true,
      trim: true,
    },
    motherTongue: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    caste: {
      type: String,
      required: true,
    },
    subcaste: {
      type: String,
      default: "",
      trim: true,
    },
    gothram: {
      type: String,
      default: "",
      trim: true,
    },
    dosh: {
      type: String,
      default: "",
      trim: true,
    },
    shortProfiles: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    acceptedProfiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    rejectedProfiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    interestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    interestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    loginOtp: {
      type: String,
    },
    loginOtpExpiry: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.virtual("age").get(function () {
  if (!this.dob) return null;
  const birthDate = new Date(this.dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Method to verify password
userSchema.methods.verifyPassword = async function (password) {
  return await argon2.verify(this.password, password);
};

userSchema.index({ interestsSent: 1 });
userSchema.index({ interestsReceived: 1 });
userSchema.index({ matches: 1 });

export const User = mongoose.model("User", userSchema);
