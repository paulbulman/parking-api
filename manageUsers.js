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

const fetch = async (db, userId) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `#PROFILE#${userId}`
    }
  };

  try {
    const data = await db.get(params).promise();
    return {
      firstName: data.Item.firstName,
      lastName: data.Item.lastName,
      registrationNumber: data.Item.registrationNumber,
      alternativeRegistrationNumber: data.Item.alternativeRegistrationNumber,
      commuteDistance: data.Item.commuteDistance
    };
  } catch (error) {
    console.error("Unable to fetch user", JSON.stringify(error));
  }
};

const update = async (db, userId, userData) => {
  console.log("Updating user", userId, userData);

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `#PROFILE#${userId}`
    },
    UpdateExpression:
      "set firstName = :firstName, lastName=:lastName, registrationNumber=:registrationNumber, alternativeRegistrationNumber=:alternativeRegistrationNumber, commuteDistance=:commuteDistance",
    ExpressionAttributeValues: {
      ":firstName": userData.firstName,
      ":lastName": userData.lastName,
      ":registrationNumber": userData.registrationNumber,
      ":alternativeRegistrationNumber": userData.alternativeRegistrationNumber,
      ":commuteDistance": userData.commuteDistance
    },
    ReturnValues: "UPDATED_NEW"
  };

  try {
    return await db.update(params).promise();
  } catch (error) {
    console.error("Unable to update user", JSON.stringify(error));
  }
};

const del = async userId => {
  console.log("Deleting user", userId);

  return "User deleted successfully";
};

module.exports = { fetchAll, fetch, update, del };
