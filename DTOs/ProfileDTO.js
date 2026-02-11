export const ProfileDTO=(profile)=>{
    if(!profile){
        return console.log("Profile not found")
    }
 
    const user= profile.user;
   
    if(!user){
        return console.log("user not found in profile")
    }

    const profileCardData={
        userId:user._id,
        profileId:profile._id,
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
   

    return profileCardData;
}