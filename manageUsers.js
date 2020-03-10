const mapItem = item => ({
  userId: item.PK.substr(5),
  firstName: item.firstName,
  lastName: item.lastName,
  registrationNumber: item.registrationNumber,
  alternativeRegistrationNumber: item.alternativeRegistrationNumber,
  commuteDistance: item.commuteDistance
});

const fetchAll = async db => {
  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "SK-PK-index",
    ProjectionExpression:
      "PK, firstName, lastName, registrationNumber, alternativeRegistrationNumber, commuteDistance",
    KeyConditionExpression: "SK = :sk",
    ExpressionAttributeValues: { ":sk": "PROFILE" }
  };

  try {
    const data = await db.query(params).promise();
    return data.Items.map(mapItem);
  } catch (error) {
    console.error("Unable to fetch user", JSON.stringify(error));
  }
};

const fetch = async (db, userId) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    ProjectionExpression:
      "PK, firstName, lastName, registrationNumber, alternativeRegistrationNumber, commuteDistance",
    Key: {
      PK: `USER#${userId}`,
      SK: "PROFILE"
    }
  };

  try {
    const data = await db.get(params).promise();
    return mapItem(data.Item);
  } catch (error) {
    console.error("Unable to fetch user", JSON.stringify(error));
  }
};

const add = async (cognito, db, userData) => {
  console.log("Adding user", userData);

  try {
    var cognitoParams = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: userData.emailAddress,
      UserAttributes: [
        { Name: "email", Value: userData.emailAddress },
        { Name: "given_name", Value: userData.firstName },
        { Name: "family_name", Value: userData.lastName }
      ]
    };

    const cognitoResponse = await cognito
      .adminCreateUser(cognitoParams)
      .promise();

    const userName = cognitoResponse.User.Username;

    const dbParams = {
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: `USER#${userName}`,
        SK: "PROFILE",
        emailAddress: userData.emailAddress,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    };

    await db.put(dbParams).promise();
  } catch (error) {
    console.error("Unable to add user", JSON.stringify(error));
  }
};

const update = async (db, userId, userData) => {
  console.log("Updating user", userId, userData);

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: "PROFILE"
    },
    UpdateExpression:
      "set firstName = :firstName, lastName=:lastName, registrationNumber=:registrationNumber, alternativeRegistrationNumber=:alternativeRegistrationNumber, commuteDistance=:commuteDistance",
    ExpressionAttributeValues: {
      ":firstName": userData.firstName,
      ":lastName": userData.lastName,
      ":registrationNumber": userData.registrationNumber,
      ":alternativeRegistrationNumber": userData.alternativeRegistrationNumber
        ? userData.alternativeRegistrationNumber
        : null,
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

module.exports = { fetchAll, fetch, add, update, del };
