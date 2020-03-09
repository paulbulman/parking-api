const mapItem = item => ({
  registrationNumber: item.registrationNumber,
  alternativeRegistrationNumber: item.alternativeRegistrationNumber
});

const fetch = async (db, userId) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    ProjectionExpression: "registrationNumber, alternativeRegistrationNumber",
    Key: {
      PK: `USER#${userId}`,
      SK: "PROFILE"
    }
  };

  try {
    const data = await db.get(params).promise();
    return mapItem(data.Item);
  } catch (error) {
    console.error("Unable to fetch profile", JSON.stringify(error));
  }
};

const update = async (db, userId, profileData) => {
  console.log("Saving profile data for user", userId, profileData);

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: "PROFILE"
    },
    UpdateExpression:
      "set registrationNumber=:registrationNumber, alternativeRegistrationNumber=:alternativeRegistrationNumber",
    ExpressionAttributeValues: {
      ":registrationNumber": profileData.registrationNumber,
      ":alternativeRegistrationNumber": profileData.alternativeRegistrationNumber
        ? profileData.alternativeRegistrationNumber
        : null
    },
    ReturnValues: "UPDATED_NEW"
  };

  try {
    return await db.update(params).promise();
  } catch (error) {
    console.error("Unable to update profile", JSON.stringify(error));
  }
};

module.exports = { fetch, update };
