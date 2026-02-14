import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    education: {
      highestQualification: {
        type: String,
        // enum: [
        //   "High School",
        //   "Associate Degree",
        //   "Bachelor's Degree",
        //   "Master's Degree",
        //   "Doctorate",
        //   "Professional Degree",
        // ],
      },
      educationDetails: {
        type: String,
      },
    },

    career: {
      occupation: { type: String },
      company: { type: String },
      annualIncome: {
        type: String,
        // enum: [
        //   "Prefer not to say",
        //   "Under $30,000",
        //   "$30,000 - $50,000",
        //   "$50,000 - $80,000",
        //   "$80,000 - $100,000",
        //   "$100,000 - $150,000",
        //   "$150,000 - $200,000",
        //   "$200,000+",
        // ],
        required: false,
      },
      employmentType: {
        type: String,
        // enum: ["Private", "Government", "Business", "Self Employed", "Other"],
        required: false,
      },
    },

    about: {
      description: {
        type: String,
        maxlength: 1000,
      },
      interests: [
        {
          type: String,
        },
      ],
    },

    family: {
      noOfSiblings: {
        type: Number,
        min: 0,
      },
      financialStatus: {
        type: String,
        enum: [
          "Lower Class",
          "Middle Class",
          "Upper Middle Class",
          "Upper Class",
          "Rich",
        ],
      },
      familyType: {
        type: String,
        enum: ["Joint", "Nuclear"],
      },
    },

    lifeType: {
      diet: {
        type: String,
        enum: ["Vegetarian", "Non-vegetarian", "Vegan", "Eggetarian", "Jain"],
      },
      smoking: {
        type: String,
        enum: ["Never", "Occasionally", "Regularly", "Trying to quit"],
      },
      drinking: {
        type: String,
        enum: ["Never", "Occasionally", "Regularly"],
      },
    },

    partnerPreferences: {
      ageRange: {
        min: Number,
        max: Number,
      },
      heightRange: {
        min: String, // e.g., "5'3\""
        max: String, // e.g., "5'8\""
      },
      marriageStatus: {
        type: String,
        // enum: ["Never Married", "Divorced", "Widowed", "Separated","Single","Unmarried","Married"],
      },
      religionCaste: {
        religion: String,
        caste: String,
      },
      education: String,
      occupation: String,
      location: {
        country: String,
        state: String,
        city: String,
      },
      manglikPreference: {
        type: String,
        enum: ["Yes", "No", "Doesn't Matter"],
      },
      motherTongue: {
        type: String,
      },
      physicalDisability: {
        type: String,
      },
      lifestyle: {
        diet: String,
        smoking: String,
        drinking: String,
      },
      annualIncome: {
        type: String,
      },
      workingStatus: {
        type: String,
      },
      kids: {
        type: String,
      },
      community: {
        type: String,
      },
    },

    profilePhotos: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

export const Profile = mongoose.model("Profile", profileSchema);
