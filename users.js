const mapItem = item => ({
  userId: item.PK.substr(5),
  name: `${item.firstName} ${item.lastName}`
});

const fetch = async db => {
  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "SK-PK-index",
    KeyConditionExpression: "SK = :sk",
    ExpressionAttributeValues: { ":sk": "PROFILE" }
  };

  try {
    const data = await db.query(params).promise();
    return data.Items.map(mapItem);
  } catch (error) {
    console.error("Unable to fetch users", JSON.stringify(error));
  }
};

module.exports = { fetch };
