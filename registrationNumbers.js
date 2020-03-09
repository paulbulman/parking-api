const mapItem = item => {
  let results = [];

  const fullName = `${item.firstName} ${item.lastName}`;

  results.push({ registrationNumber: item.registrationNumber, name: fullName });

  if (item.alternativeRegistrationNumber) {
    results.push({
      registrationNumber: item.alternativeRegistrationNumber,
      name: fullName
    });
  }

  return results;
};

const fetch = async db => {
  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "SK-PK-index",
    ProjectionExpression:
      "firstName, lastName, registrationNumber, alternativeRegistrationNumber",
    KeyConditionExpression: "SK = :sk",
    ExpressionAttributeValues: { ":sk": "PROFILE" }
  };

  try {
    const data = await db.query(params).promise();
    return data.Items.flatMap(mapItem);
  } catch (error) {
    console.error(
      "Unable to fetch registration numbers",
      JSON.stringify(error)
    );
  }
};

module.exports = { fetch };
