const fetchAll = async () => [
  {
    userId: "1",
    firstName: "Person",
    lastName: "1",
    registrationNumber: "AB123CDE",
    alternativeRegistrationNumber: "X789XZ",
    commuteDistance: "3"
  },
  {
    userId: "2",
    firstName: "Person",
    lastName: "2",
    registrationNumber: "CD234DEF",
    alternativeRegistrationNumber: "Y789YZ",
    commuteDistance: "2"
  },
  {
    userId: "3",
    firstName: "Person",
    lastName: "3",
    registrationNumber: "EF234EFG",
    alternativeRegistrationNumber: "Z789ZZ",
    commuteDistance: "7"
  }
];

const fetch = async userId => ({
  userId: "1",
  firstName: "Person",
  lastName: "1",
  registrationNumber: "AB123CDE",
  alternativeRegistrationNumber: "X789XZ",
  commuteDistance: "3"
});

const update = async userId => {
  console.log("Updating user", userId);

  return "User updated successfully";
};

const del = async userId => {
  console.log("Deleting user", userId);

  return "User deleted successfully";
};

module.exports = { fetchAll, fetch, update, del };
