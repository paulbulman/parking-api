const fetch = async userId => ({
  registrationNumber: "AB123CDE",
  alternativeRegistrationNumber: "X789XZ"
});

const update = async (userId, profileData) => {
  console.log("Saving profile data for user", userId, profileData);

  return "Profile saved successfully";
};

module.exports = { fetch, update };
