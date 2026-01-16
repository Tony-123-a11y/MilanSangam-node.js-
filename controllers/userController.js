import { User } from "../models/userModel.js";
import { sendMail } from "../Common/sendmail.js";
import jwt from "jsonwebtoken";
import { sendOtpSms } from "../Common/sendOtpSms.js";
import { validateRegisterUser } from "../validation/validation.js";
import { Profile } from "../models/profileModel.js";
import { transformProfilePayload } from "./transformData.js";
import { json } from "express";

export const registerUser = async (req, res) => {
  try {
    const validation = validateRegisterUser(req.body);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const {
      profileFor,
      fullName,
      mobile,
      dob,
      religion,
      motherTongue,
      gender,
      email,
      password,
      caste,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Mobile number";
      return res
        .status(409)
        .json({ message: `${field} is already registered.` });
    }

    const profile = await Profile.create({});

    // Create new user
    const newUser = new User({
      profile: profile._id,
      profileFor,
      fullName,
      mobile,
      dob,
      religion,
      motherTongue,
      gender,
      email,
      password,
      caste,
    });

    await newUser.save();

    //to create and save profile
    profile.user = newUser._id;
    await profile.save();

    // Send welcome email
    const welcomeMessage = `
      Hello ${fullName},

      Welcome to Vivah Sanyog!

      This is the best way to find your ideal life partner.

      Thank you!
    `;

    const isMailSent = await sendMail(
      email,
      "Welcome to Vivah Sanyog",
      welcomeMessage
    );

    if (isMailSent) {
      newUser.isEmailVerified = true;
      await newUser.save();

      return res.status(201).json({
        message: "User registered and email verified successfully.",
      });
    }

    // If mail fails, delete user and inform client
    await User.findOneAndDelete({ _id: newUser._id });

    return res.status(400).json({
      message: "Registration failed. Please provide a valid email address.",
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({
      message:
        "An unexpected error occurred during registration. Please try again later.",
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json({ message: "Email not verified. Please verify first." });
    }

    const isMatch = await user.verifyPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        age: user.age,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

export const getUserAfterLogin = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId)
      .populate("profile")
      .select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found", success: false });
    }

    const profile = user.profile;

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
        height:user.height || "",
        marriageStatus:user.marriageStatus || "",
        state:user.state || "",
        city:user.city || ""
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
      profilePic: !profile.profilePhotos?.length<1 ? [...profile.profilePhotos] : [
        'null','null','null','null','null','null'
      ]
    };

    res
      .status(200)
      .json({ msg: "User found", user, profileData, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server error", success: false, error: error.message });
  }
};

export const editProfile = async (req, res) => {

  try {
    const userId = req.user.userId;
    const profilePic = req.profilePic || null;
     const fileUrls = req.files.map(file => {
    return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
  });

    const rawFormData = JSON.parse(req.body.formData)

    const { userData, profileData } = transformProfilePayload(rawFormData);

    
    profileData.profilePhotos = [...fileUrls,...req.body.profilePhotos];
    profileData.user = userId;
   
    const userAck = await User.findByIdAndUpdate(
      userId,
      { $set: userData },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!userAck) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    let profileAck = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      { new: true, runValidators: true }
    );

    // If no profile found, create and link
    if (!profileAck) {
      const newProfile = new Profile(profileData);
      profileAck = await newProfile.save();

      await User.findByIdAndUpdate(userId, { profile: profileAck._id });
    }

    return res.status(200).json({
      message: "Profile and user updated successfully",
      success: true,
      user: userAck,
      profile: profileAck,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetUrl = `${process.env.ClientUrl}/reset-password/${token}`;

    const message = `Hello ${user.fullName},\n\nYou requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes.\n\nIf you did not request this, please ignore this email.`;

    await sendMail(email, "Password Reset Request", message);

    res.status(200).json({
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Forget Password Error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.body;
  // console.log(token);
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "Password is required." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        message: "Reset link expired. Please request a new one.",
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(400).json({
        message: "Invalid token. Please try again.",
      });
    }
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserForAdmin= async(req,res)=>{
    try {
      const users= await User.find()
      if(!users){
        res.status(404).json({success:false,msg:'No users were found',users})
        return
      }
      res.json({success:true,users})
      
    } catch (error) {
      res.status(500).json({success:false,msg:'Internal Server Error'})
    } 
}
