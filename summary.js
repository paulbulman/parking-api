const dateCalculations = require("./dateCalculations");
const users = require("./users");

const getCurrentMonths = activeDates => {
  const activeMonths = activeDates.map(d => d.format("YYYY-MM"));
  return [...new Set(activeMonths)];
};

const createFetch = (db, getCurrentActiveDates) => async userId => {
  const usersData = await users.fetch(db);

  const activeDates = getCurrentActiveDates();
  const currentMonths = getCurrentMonths(activeDates);
  const monthlyData = await getMonthlyData(db, currentMonths);

  const rawData = activeDates.map(d => createRaw(d, monthlyData));

  return rawData.map(r => formatForDisplay(r, usersData, userId));
};

const getMonthlyData = async (db, months) => {
  let monthlyData = {};
  await Promise.all(
    months.map(async m => {
      monthlyData[m] = await loadMonthlyData(db, m);
    })
  );

  return monthlyData;
};

const loadMonthlyData = async (db, monthId) => {
  const mapItem = item => ({
    userId: item.PK.substr(5),
    requests: item.requests
  });

  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "SK-PK-index",
    ProjectionExpression: "PK, requests",
    KeyConditionExpression: "SK = :sk",
    ExpressionAttributeValues: { ":sk": `REQUESTS#${monthId}` }
  };

  try {
    const data = await db.query(params).promise();
    return data.Items.map(mapItem);
  } catch (error) {
    console.error("Unable to fetch requests", JSON.stringify(error));
  }
};

const createRaw = (date, monthlyData) => {
  let allocated = [];
  let interrupted = [];

  const monthKey = date.format("YYYY-MM");
  const dayKey = date.format("DD");

  monthlyData[monthKey].forEach(user => {
    const dailyData = user.requests[dayKey];

    if (dailyData === "ALLOCATED") {
      allocated.push(user.userId);
    } else if (dailyData === "REQUESTED") {
      interrupted.push(user.userId);
    }
  });

  return { date: date.format("YYYY-MM-DD"), allocated, interrupted };
};

const formatForDisplay = (rawData, usersData, userId) => {
  let users = {};
  usersData.forEach(u => (users[u.userId] = u.name));

  return {
    date: rawData.date,
    allocated: rawData.allocated.map(a => users[a]),
    interrupted: rawData.interrupted.map(i => users[i]),
    highlight: users[userId]
  };
};

const fetch = async (db, userId) =>
  createFetch(db, dateCalculations.getCurrentActiveDates)(userId);

module.exports = { fetch, createFetch };
