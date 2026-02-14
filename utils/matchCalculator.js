
export const calculateAge = (dob) => {
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

export const convertHeightToInches = (heightStr) => {
  if (!heightStr) return null;

  const match = heightStr.match(/(\d+)'(\d+)/);

  if (!match) return null;

  return parseInt(match[1]) * 12 + parseInt(match[2]);
};

export const calculateMatchPercentage = (currentUser, targetUser) => {
  try {
    const preferences = currentUser?.profile?.partnerPreferences;

    if (!preferences) return 0;

    let score = 0;
    let total = 0;

    const profile = targetUser.profile;

    // AGE
    if (
      preferences.ageRange?.min &&
      preferences.ageRange?.max &&
      targetUser.dob
    ) {
      total++;

      const age = calculateAge(targetUser.dob);

      if (
        age >= preferences.ageRange.min &&
        age <= preferences.ageRange.max
      ) {
        score++;
      }
    }

    // HEIGHT
    if (
      preferences.heightRange?.min &&
      preferences.heightRange?.max &&
      targetUser.height
    ) {
      total++;

      const userHeight = convertHeightToInches(targetUser.height);
      const min = convertHeightToInches(preferences.heightRange.min);
      const max = convertHeightToInches(preferences.heightRange.max);

      if (userHeight && min && max) {
        if (userHeight >= min && userHeight <= max) score++;
      }
    }

    // RELIGION
    if (
      preferences.religionCaste?.religion &&
      targetUser.religion
    ) {
      total++;

      if (
        targetUser.religion.toLowerCase() ===
        preferences.religionCaste.religion.toLowerCase()
      ) {
        score++;
      }
    }

    // CASTE
    if (
      preferences.religionCaste?.caste &&
      targetUser.caste
    ) {
      total++;

      if (
        targetUser.caste.toLowerCase() ===
        preferences.religionCaste.caste.toLowerCase()
      ) {
        score++;
      }
    }

    // STATE
    if (
      preferences.location?.state &&
      targetUser.state
    ) {
      total++;

      if (
        targetUser.state.toLowerCase() ===
        preferences.location.state.toLowerCase()
      ) {
        score++;
      }
    }

    // CITY
    if (
      preferences.location?.city &&
      targetUser.city
    ) {
      total++;

      if (
        targetUser.city.toLowerCase() ===
        preferences.location.city.toLowerCase()
      ) {
        score++;
      }
    }

    // EDUCATION
    if (
      preferences.education &&
      profile?.education?.highestQualification
    ) {
      total++;

      if (
        profile.education.highestQualification.toLowerCase() ===
        preferences.education.toLowerCase()
      ) {
        score++;
      }
    }

    // OCCUPATION
    if (
      preferences.occupation &&
      profile?.career?.occupation
    ) {
      total++;

      if (
        profile.career.occupation.toLowerCase() ===
        preferences.occupation.toLowerCase()
      ) {
        score++;
      }
    }

    return total === 0 ? 60 : Math.round((score / total) * 100);

  } catch {
    return 0;
  }
};
