const dateCalculations = require("./dateCalculations");

const getCurrentMonths = activeDates => {
  const activeMonths = activeDates.map(d => d.format("YYYY-MM"));
  return [...new Set(activeMonths)];
};

const createFetch = (db, getCurrentActiveDates) => async userId => {
  const activeDates = getCurrentActiveDates();
  const currentMonths = getCurrentMonths(activeDates);
  const monthlyData = await getMonthlyData(db, currentMonths, userId);

  return activeDates.map(d => ({
    date: d.format("YYYY-MM-DD"),
    requested: calculateRequestedValue(d, monthlyData)
  }));
};

const calculateRequestedValue = (date, monthlyData) => {
  const monthKey = date.format("YYYY-MM");
  const dayKey = date.format("DD");

  const dailyData = monthlyData[monthKey][dayKey];

  return dailyData === "REQUESTED" || dailyData === "ALLOCATED";
};

const createUpdate = (db, getCurrentActiveDates) => async (
  userId,
  postData
) => {
  const activeDates = getCurrentActiveDates();
  const currentMonths = getCurrentMonths(activeDates);
  const monthlyData = await getMonthlyData(db, currentMonths, userId);

  activeDates.forEach(d => updateRequestedValue(d, monthlyData, postData));

  await Promise.all(
    currentMonths.map(async m => {
      await saveMonthlyData(db, userId, m, monthlyData[m]);
    })
  );

  return "Requests saved successfully";
};

const updateRequestedValue = (date, monthlyData, postData) => {
  const postElement = postData.find(p => p.date === date.format("YYYY-MM-DD"));

  if (!postElement) {
    return;
  }

  const monthKey = date.format("YYYY-MM");
  const dayKey = date.format("DD");

  const existingValue = monthlyData[monthKey][dayKey];
  const postedValue = postElement.requested;

  if (existingValue !== "ALLOCATED" && postedValue) {
    monthlyData[monthKey][dayKey] = "REQUESTED";
  } else if (existingValue && !postedValue) {
    monthlyData[monthKey][dayKey] = "CANCELLED";
  }
};

const getMonthlyData = async (db, months, userId) => {
  let monthlyData = {};
  await Promise.all(
    months.map(async m => {
      monthlyData[m] = await loadMonthlyData(db, userId, m);
    })
  );

  return monthlyData;
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
    return result.Item ? result.Item.requests : {};
  } catch (error) {
    console.error("Unable to fetch requests", JSON.stringify(error));
  }
};

const saveMonthlyData = async (db, userId, monthId, requests) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: `REQUESTS#${monthId}`,
      requests: requests
    }
  };

  try {
    await db.put(params).promise();
  } catch (error) {
    console.error("Unable to save requests", JSON.stringify(error));
  }
};

const update = async (db, userId, postData) => {
  createUpdate(db, dateCalculations.getCurrentActiveDates)(userId, postData);
};

const fetch = async (db, userId) =>
  createFetch(db, dateCalculations.getCurrentActiveDates)(userId);

module.exports = { fetch, createFetch, update, createUpdate };
