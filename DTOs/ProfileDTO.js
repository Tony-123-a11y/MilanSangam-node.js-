export const ProfileDTO = (profile, user) => {
  if (!profile || !user) return null;

  return {
    userId: user._id,
    profileId: profile._id,
    dob:user.dob,
    fullName: user.fullName || "",
    religion: user.religion || "",
    caste: user.caste || "",
    height: user.height || "",
    marriageStatus: user.marriageStatus || "",
    state: user.state || "",
    city: user.city || "",
    highestQualification: profile.education?.highestQualification || "",
    occupation: profile.career?.occupation || "",
    employmentType: profile.career?.employmentType || "",
    profilePic: profile.profilePhotos?.filter((p) => p && p !== "null") || [],
  };
};
