import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { Profile } from "../models/profileModel.js";
import { ProfileDTO } from "../DTOs/ProfileDTO.js";

// Helper: Calculate Age
const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Helper: Convert height like 5'11 to inches
const convertHeightToInches = (heightStr) => {
  if (!heightStr) return null;

  const match = heightStr.match(/(\d+)'(\d+)/);
  if (!match) return null;

  const feet = parseInt(match[1]);
  const inches = parseInt(match[2]);

  return feet * 12 + inches;
};

export const findMatchesForCurrentUser = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const currentUser = await User.findById(uid).populate("profile");

    if (!currentUser || !currentUser.profile?.partnerPreferences) {
      return res.status(404).json({
        success: false,
        message: "User or partner preferences not found",
      });
    }

    const preferences = currentUser.profile.partnerPreferences;

    // =============================
    // STEP 1: BASE FILTER (ONLY GENDER)
    // =============================

    const query = {
      _id: { $ne: new mongoose.Types.ObjectId(uid) },
      gender: {
        $regex:
          currentUser.gender?.toLowerCase() === "male"
            ? /^female$/i
            : /^male$/i,
      },
    };


    const matchedUsers = await User.find(query)
      .select("-password -loginOtp -loginOtpExpiry")
      .populate("profile");

    // =============================
    // STEP 2: SCORING
    // =============================

    const results = [];

    for (const user of matchedUsers) {
      if (!user.profile) continue;

      let score = 0;
      let total = 0;

      const profile = user.profile;

      //  Age Match
      if (preferences.ageRange?.min && preferences.ageRange?.max && user.dob) {
        total++;
        const age = calculateAge(user.dob);

        if (
          age >= preferences.ageRange.min &&
          age <= preferences.ageRange.max
        ) {
          score++;
        }
      }

      // Height Match
      if (
        preferences.heightRange?.min &&
        preferences.heightRange?.max &&
        user.height
      ) {
        total++;

        const userHeight = convertHeightToInches(user.height);
        const min = convertHeightToInches(preferences.heightRange.min);
        const max = convertHeightToInches(preferences.heightRange.max);

        if (
          userHeight &&
          min &&
          max &&
          userHeight >= min &&
          userHeight <= max
        ) {
          score++;
        }
      }

      //  Religion
      if (preferences.religionCaste?.religion && user.religion) {
        total++;
        if (
          user.religion.toLowerCase() ===
          preferences.religionCaste.religion.toLowerCase()
        ) {
          score++;
        }
      }

      //  Caste
      if (preferences.religionCaste?.caste && user.caste) {
        total++;
        if (
          user.caste.toLowerCase() ===
          preferences.religionCaste.caste.toLowerCase()
        ) {
          score++;
        }
      }

      //  State
      if (preferences.location?.state && user.state) {
        total++;
        if (
          user.state.toLowerCase() === preferences.location.state.toLowerCase()
        ) {
          score++;
        }
      }

      //  City
      if (preferences.location?.city && user.city) {
        total++;
        if (
          user.city.toLowerCase() === preferences.location.city.toLowerCase()
        ) {
          score++;
        }
      }

      //  Education
      if (preferences.education && profile.education?.highestQualification) {
        total++;
        if (
          profile.education.highestQualification.toLowerCase() ===
          preferences.education.toLowerCase()
        ) {
          score++;
        }
      }

      //  Occupation
      if (preferences.occupation && profile.career?.occupation) {
        total++;
        if (
          profile.career.occupation.toLowerCase() ===
          preferences.occupation.toLowerCase()
        ) {
          score++;
        }
      }

      const matchPercentage = total ? Math.round((score / total) * 100) : 60;

      const dto = ProfileDTO(profile, user);

      if (dto) {
        results.push({
          ...dto,
          matchPercentage,
        });
      }
    }

    // Sort highest match first
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.status(200).json({
      success: true,
      message: "Matches found successfully",
      totalMatches: results.length,
      matches: results,
    });
  } catch (error) {
    console.error("Match Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while finding matches",
    });
  }
};
