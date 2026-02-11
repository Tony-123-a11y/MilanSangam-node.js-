import mongoose from "mongoose";
import { Profile } from "../models/profileModel.js";
import { User } from "../models/userModel.js";
import { transformProfilePayload } from "./transformData.js";
import { ProfileDTO } from "../DTOs/ProfileDTO.js";

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.uid;
    const profilePic = req.profilePic;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const { userData, profileData } = transformProfilePayload(req.body.formData);

    // Get existing profile to preserve current picture if no new one uploaded
    const existingProfile = await Profile.findOne({ user: userId });

    // ✅ Only update profilePic if a new one was uploaded
    if (profilePic) {
      profileData.profilePic = profilePic;
    } else if (existingProfile && existingProfile.profilePic) {
      profileData.profilePic = existingProfile.profilePic;
    }

    // Link the profile to the user
    profileData.user = userId;

    // ✅ Update the User document
    const userAck = await User.findByIdAndUpdate(
      userId,
      { $set: userData },
      { new: true, runValidators: true }
    );

    if (!userAck) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Update or create the Profile document
    let profileAck = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      { new: true, runValidators: true }
    );

    if (!profileAck) {
      const newProfile = new Profile(profileData);
      profileAck = await newProfile.save();

      await User.findByIdAndUpdate(userId, { profile: profileAck._id }, { new: true });

      return res.status(201).json({
        message: "Profile created and linked to user successfully",
        profile: profileAck,
        user: userAck,
        success: true,
      });
    }

    // ✅ Success response
    return res.status(200).json({
      message: "Profile and user data updated successfully",
      success: true,
      data: profileAck,
    });

  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getUserProfileById = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID format" });
    }

    const profile = await Profile.findOne({ user: uid }).populate({
      path: "user",
      select: "-password -loginOtp -loginOtpExpiry",
    });

   

    if (!profile || !profile.user) {
      return res
        .status(404)
        .json({ success: false, message: "User or Profile not found" });
    }

    const user = profile.user;

    const profileData = {
      personalInfo: {
        fullName: user.fullName || "",
        mobile: user.mobile || "",
        email: user.email || "",
        dob: user.dob || "",
        gender: user.gender || "",
        religion: user.religion || "",
        motherTongue: user.motherTongue || "",
        caste: user.caste || "",
        subcaste: user.subcaste || "",
        gothram: user.gothram || "",
        dosh: user.dosh || "",
      },
      education: profile.education || {},
      career: profile.career || {},
      about: {
        description: profile.about?.description || "", // ✅ should be empty string fallback
        interests: profile.about?.interests || [],
      },
      family: profile.family || {},
      lifeType: profile.lifeType || {},
      partnerPreferences: profile.partnerPreferences || {
        ageRange: { min: "", max: "" },
        heightRange: { min: "", max: "" },
        maritalStatus: "",
        religionCaste: { religion: "", caste: "" },
        education: "",
        profession: "",
        location: { country: "", state: "", city: "" },
        manglikPreference: "",
        lifestyle: { diet: "", smoking: "", drinking: "" },
      },
      profilePic: profile.profilePhotos,
    };

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      profile: profileData,
    });
  } catch (error) {
    console.error("❌ getUserProfileById Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the profile",
      error: error.message,
    });
  }
};

export const shortListProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { matchId } = req.params;
     const findUser= await User.findById(userId);
     if(!findUser){
      return res.status(404).json({ success: false, message: "User not found" });
     }
      if(findUser.shortProfiles.includes(matchId)){
        return res.status(400).json({ success: false, message: "Profile already shortlisted" });
      }
    findUser.shortProfiles.push(matchId);
    await findUser.save();
    return res.status(200).json({ success: true, message: "Profile shortlisted successfully" });  
  } catch (error) {
    console.error(" shortListProfile Error:", error);
    return res.status(500).json({ success: false, message: "An error occurred while shortlisting the profile", error: error.message });
  }
}

export const getAllShortListProfiles= async(req,res)=>{
  try {
    const userId = req.user.userId; 
    const findUser= await User.findById(userId).populate({
      path:'shortProfiles',
      populate:{
        path:'user'
      }
    })
    if(!findUser){
     return res.status(404).json({ success: false, message: "User not found" });
    }

    const shortProfiles= findUser.shortProfiles;
    if(!shortProfiles){
      return res.status(400).json({success:false, message:'No Shortlisted Profiles found'})
    }

    const shortlistedProfiles= shortProfiles.map((profile)=>{
      return ProfileDTO(profile)
    })
    
    return res.status(200).json({ success: true, message: "Shortlisted profiles fetched successfully",shortlistedProfiles:shortlistedProfiles });
}
catch (error) {
    console.error(" getAllShortListProfiles Error:", error);
    return res.status(500).json({ success: false, message: "An error occurred while fetching shortlisted profiles", error: error.message });
  }
}

export const removeShortListProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { matchId } = req.params;
     const findUser= await User.findById(userId);
      if(!findUser){
      return res.status(404).json({ success: false, message: "User not found" });
     }
      const index = findUser.shortProfiles.indexOf(matchId);
      if (index > -1) {
        findUser.shortProfiles.splice(index, 1);
        await findUser.save();
        return res.status(200).json({ success: true, message: "Profile removed from shortlist successfully" });  
      } else {
        return res.status(400).json({ success: false, message: "Profile not found in shortlist" });
      }
  }catch (error) {
    console.error(" removeShortListProfile Error:", error);
    return res.status(500).json({ success: false, message: "An error occurred while removing the profile from shortlist", error: error.message });
  }
}


export { updateProfile, getUserProfileById };
