import { ProfileDTO } from "../DTOs/ProfileDTO.js";
import { calculateMatchPercentage } from "./matchCalculator.js";

export const buildProfileResponse = (currentUser, user, extraFlags = {}) => {
  const dto = ProfileDTO(user.profile, user);

  const interestSent = currentUser.interestsSent?.some(
    (id) => id.toString() === user._id.toString(),
  );

  const interestReceived = currentUser.interestsReceived?.some(
    (id) => id.toString() === user._id.toString(),
  );

  const matched = currentUser.matches?.some(
    (id) => id.toString() === user._id.toString(),
  );

  const isShortlisted = currentUser.shortProfiles?.some(
    (id) => id.toString() === user._id.toString(),
  );

  return {
    ...dto,
    matchPercentage: calculateMatchPercentage(currentUser, user),
    interestSent,
    interestReceived,
    matched,
    isShortlisted,
    canSendInterest: !interestSent && !interestReceived && !matched,
    canAccept: interestReceived && !matched,
    canShortlist: !isShortlisted,
    canRemoveShortlist: isShortlisted,
    ...extraFlags, 
  };
};
