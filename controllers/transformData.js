export const transformProfilePayload = (formData) => {
  if (!formData || typeof formData !== "object") {
    throw new Error("Invalid or missing formData");
  }

  const {
    personalInfo = {},
    education = {},
    career = {},
    about = {},
    family = {},
    lifeType = {},
    partnerPreferences = {},
  } = formData;

  const {
    fullName,
    mobile,
    dob,
    gender,
    religion,
    motherTongue,
    caste,
    subcaste,
    gothram,
    dosh,
    height,
    marriageStatus,
    state,
    city
  } = personalInfo;

  const userData = {
    fullName,
    mobile,
    dob,
    gender,
    religion,
    motherTongue,
    caste,
    subcaste,
    gothram,
    dosh,
    height,
    marriageStatus,
    state,
    city
  };
  

  const profileData = {
    education: {
      highestQualification: education.highestQualification || "",
      educationDetails: education.educationDetails || "",
    },
    career: {
      employmentType: career.employmentType || "",
      occupation: career.occupation || "",
      company: career.company || "",
      annualIncome: career.annualIncome || "",
      location: career.location || "",
    },
    about,
    family,
    lifeType,
    partnerPreferences,
  };

  return { userData, profileData };
};
