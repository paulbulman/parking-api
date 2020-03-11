const dateCalculations = require("./dateCalculations");

const createFetch = (db, getCurrentActiveDates) => async userId => {
  const activeDates = getCurrentActiveDates();

  const activeMonths = activeDates.map(d => d.format("YYYY-MM"));
  const distinctMonths = [...new Set(activeMonths)];

  let monthlyData = {};

  await Promise.all(
    distinctMonths.map(async m => {
      monthlyData[m] = await loadMonthlyData(db, userId, m);
    })
  );

  return activeDates.map(d => ({
    date: d.format("YYYY-MM-DD"),
    requested: calculateDailyValue(d, monthlyData)
  }));
};

const loadMonthlyData = async (db, userId, monthId) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    ProjectionExpression: "requests",
    Key: {
      PK: `USER#${userId}`,
      SK: `REQUESTS#${monthId}`
    }
  };

  try {
    const result = await db.get(params).promise();
    return result.Item ? JSON.parse(result.Item.requests) : {};
  } catch (error) {
    console.error("Unable to fetch requests", JSON.stringify(error));
  }
};

const calculateDailyValue = (date, monthlyData) => {
  const monthKey = date.format("YYYY-MM");
  const dayKey = date.format("DD");

  const dailyData = monthlyData[monthKey][dayKey];

  return dailyData === "REQUESTED" || dailyData === "ALLOCATED";
};

const update = async (userId, requestsData) => {
  console.log("Saving requests data for user", userId, requestsData);

  return "Requests saved successfully";
};

const fetch = async (db, userId) =>
  createFetch(db, dateCalculations.getCurrentActiveDates)(userId);

module.exports = { fetch, createFetch, update };
