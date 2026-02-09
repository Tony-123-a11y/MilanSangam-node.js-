export const ProfileDTO=(user)=>{
    if(!user){
        return console.log("User not found")
    }
 
    const profile= user.profile;
    console.log("user :",user)
    if(!profile){
        return console.log("Profile not found in user")
    }

    const profileCardData={
      _id:user._id,
        fullName: user.fullName || "",
        religion: user.religion || "",
        caste: user.caste || "",
        height:user.height || "",
        marriageStatus:user.marriageStatus || "",
        state:user.state || "",
        city:user.city || "",
        highestQualification:profile.education?.highestQualification,
        occupation:profile.career?.occupation,
        employmentType:profile.career?.employmentType,
        profilePic: !profile.profilePhotos?.length<1 ? [...profile.profilePhotos] : [
        'null','null','null','null','null','null'
      ]


    }
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

    return profileCardData;
}