import { Profile } from "../models/profileModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";

// Helper to calculate age
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const convertHeightToInches = (heightStr) => {
  if (!heightStr) return null;
  const feet = Number(heightStr.charAt(0));
  const inches = Number(heightStr.charAt(2));
  return feet * 12 + inches;
};

export const findMatchesForCurrentUser = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const currentUser = await User.findById(uid).populate({ path: "profile" });

    if (!currentUser || !currentUser.profile?.partnerPreferences) {
      return res
        .status(404)
        .json({ success: false, message: "User or preferences not found" });
    }
    console.log(currentUser.profile.partnerPreferences);

    const {
      ageRange,
      heightRange,
      religionCaste,
      location,
      marriageStatus,
      annualIncome,
      occupation,
      motherTongue,
      physicalDisability,
      education,
      community,
      manglikPreference,
      lifestyle,
    } = currentUser.profile.partnerPreferences;

    const query = {};

    let dobMin, dobMax;

    // Age-based DOB filter
    if (ageRange?.min && ageRange?.max) {
      const now = new Date();
      const currentYear = now.getFullYear();
      dobMax = new Date(currentYear - ageRange.min, 0, 1);
      dobMin = new Date(currentYear - ageRange.max - 1, 11, 31);
      query.dob = { $gte: dobMin, $lte: dobMax };
    }
    console.log(query.dob);
    console.log(heightRange);

    console.log()

    // if (marriageStatus) query.marriageStatus = marriageStatus;
    // if (education) query["education.highestQualification"] = education;

    // // Location filters
    // if (location?.country) query["career.location"] = location.country;
    // if (location?.state) query["career.state"] = location.state;
    // if (location?.city) query["career.city"] = location.city;

    // Lifestyle filters
    // if (lifestyle?.diet) query["lifeType.diet"] = lifestyle.diet;
    // if (lifestyle?.smoking) query["lifeType.somking"] = lifestyle.smoking;
    // if (lifestyle?.drinking) query["lifeType.drinking"] = lifestyle.drinking;

    // Religion & Caste
    // if (religionCaste?.religion)
    //   query["user.religion"] = religionCaste.religion;
    // if (religionCaste?.caste) query["user.caste"] = religionCaste.caste;

    // Manglik preference (assuming you add this field later)
    // if (manglikPreference === "Yes" || manglikPreference === "No") {
    //   query["religionInfo.manglik"] = manglikPreference; // Note: this field doesn't exist yet
    // }

    // Exclude current user's profile
    // query.user = { $ne: new mongoose.Types.ObjectId(uid) };

    // const candidates = await Profile.find(query).populate({
    //   path: "user",
    //   select: "-password -loginOtp -loginOtpExpiry",
    // });

    //new aggreation pipeline
    // const candidates = await Profile.find({});
    // const candidates = await Profile.find({
    //   ...query,
    //   user: { $ne: new mongoose.Types.ObjectId(uid) }, // exclude current user
    // }).populate({
    //   path: "user",
    //   select: "-password -loginOtp -loginOtpExpiry",
    // });
    // .aggregate([
    //   { $match: query },
    //   // {
    //   //   $lookup: {
    //   //     from: "users",
    //   //     localField: "user",
    //   //     foreignField: "_id",
    //   //     as: "user",
    //   //   },
    //   // },
    //   // { $addFields: { userCount: { $size: "$user" } } },
    //   // { $match: { userCount: { $gt: 0 } } }, // make sure join worked
    //   // { $unwind: "$user" },
    //   // // {
    //   // //   // $match: {
    //   // //   //   "user._id": { $ne: new mongoose.Types.ObjectId(uid) }
    //   // //   // }
    //   // // },
    //   // { $sort: { createdAt: -1 } },
    // ]);

    const candidates = await Profile.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 🟢 Apply filters on user.dob here
      {
        $match: {
          "user._id": { $ne: new mongoose.Types.ObjectId(uid) },
          "user.dob": { $gte: dobMin, $lte: dobMax },
          ...(currentUser.gender ? {
            "user.gender": currentUser.gender.toLocaleLowerCase() === 'male' ? "Female" : "Male"
          } : {}
          ),
          ...(currentUser.profile.partnerPreferences.marriageStatus ? {
            'user.marriageStatus': currentUser.profile.partnerPreferences.marriageStatus,
          } : {}),
          ...(currentUser.profile.partnerPreferences.religionCaste.religion ? {
            'user.religion': currentUser.profile.partnerPreferences.religionCaste.religion,
          } : {}),
          ...(currentUser.profile.partnerPreferences.location.state ? {
            'user.state': currentUser.profile.partnerPreferences.location.state,
          } : {}),
          ...(currentUser.profile.partnerPreferences.location.city ? {
            'user.city': currentUser.profile.partnerPreferences.location.city,
          } : {}),
          ...(currentUser.profile.partnerPreferences.motherTongue ? {
            'user.motherTongue': currentUser.profile.partnerPreferences.motherTongue,
          } : {}),
          ...(currentUser.profile.partnerPreferences.annualIncome ? {
            'career.annualIncome': currentUser.profile.partnerPreferences.annualIncome,
          } : {}),
          ...(currentUser.profile.partnerPreferences.occupation ? {
            'career.occupation': currentUser.profile.partnerPreferences.occupation,
          } : {}),
          ...(currentUser.profile.partnerPreferences.education ? {
            'career.highestQualification': currentUser.profile.partnerPreferences.education,
          } : {}),
        },
      },

      { $sort: { createdAt: -1 } },
    ]);
    console.log(candidates);

    // let filteredByHeight = candidates;
    
    // if (heightRange.min && heightRange.max) {
    //   console.log("i am here");
    //   const minInches = convertHeightToInches(heightRange.min);
    //   const maxInches = convertHeightToInches(heightRange.max);

    //   filteredByHeight = candidates.filter((c) => {
    //     console.log("filter height ke andar",c);
    //     const userHeight = convertHeightToInches(c.height);
    //     console.log("userheight",userHeight);
    //     if (!userHeight) return false;
    //     return userHeight >= minInches && userHeight <= maxInches;
    //   });
    // }

    // console.log("filter bu",filteredByHeight);
    const results = candidates.map((candidate) => {
      let score = 0;
      let total = 0;
      const profile = candidate;
      const user = profile.user;

      if (!user) return null;
      // Age match
      if (profile.dob && ageRange?.min && ageRange?.max) {
        total++;
        const age = calculateAge(profile.dob);
        if (age >= ageRange.min && age <= ageRange.max) score++;
      }

      // Simple equality checks
      const comparisons = [
        [marriageStatus, profile.marriageStatus],
        [religionCaste?.religion, user.religion],
        [religionCaste?.caste, user.caste],
        [education, profile.education?.highestQualification],
        [occupation, profile.career?.occupation],
        [location?.country, profile.career?.location],
        [location?.state, profile.career?.state],
        [location?.city, profile.career?.city],
        [lifestyle?.diet, profile.lifeType?.diet],
        [lifestyle?.smoking, profile.lifeType?.somking],
        [lifestyle?.drinking, profile.lifeType?.drinking],
      ];

      comparisons.forEach(([pref, actual]) => {
        if (pref) {
          total++;
          if (pref === actual) score++;
        }
      });

      const matchPercentage = total ? Math.round((score / total) * 100) : 0;

      return {
        ...candidate,
        user,
        matchPercentage,
      };
    });

    // console.log(results);

    const filteredResults = results.filter(Boolean);
    filteredResults.sort((a, b) => b.matchPercentage - a.matchPercentage);
    

    // console.log(filteredResults);
    res.status(200).json({
      success: true,
      message: "Matches found",
      matches: filteredResults,
    });
  } catch (error) {
    console.error("Error finding matches:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
