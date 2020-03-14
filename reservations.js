const dateCalculations = require("./dateCalculations");

const getCurrentMonths = activeDates => {
  const activeMonths = activeDates.map(d => d.format("YYYY-MM"));
  return [...new Set(activeMonths)];
};

const createFetch = (db, getCurrentActiveDates) => async () => {
  const activeDates = getCurrentActiveDates();
  const currentMonths = getCurrentMonths(activeDates);
  const monthlyData = await getMonthlyData(db, currentMonths);

  return activeDates.map(d => ({
    date: d.format("YYYY-MM-DD"),
    reservations: createReservations(d, monthlyData)
  }));
};

const createReservations = (date, monthlyData) => {
  const monthKey = date.format("YYYY-MM");
  const dayKey = date.format("DD");

  const dailyData = monthlyData[monthKey][dayKey];

  return dailyData ? dailyData : [null, null, null, null];
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
  const params = {
    TableName: process.env.TABLE_NAME,
    ProjectionExpression: "reservations",
    Key: {
      PK: "GLOBAL",
      SK: `RESERVATIONS#${monthId}`
    }
  };

  try {
    const result = await db.get(params).promise();
    return result.Item ? result.Item.reservations : {};
  } catch (error) {
    console.error("Unable to fetch reservations", JSON.stringify(error));
  }
};

const createUpdate = (db, getCurrentActiveDates) => async postData => {
  const activeDates = getCurrentActiveDates();
  const currentMonths = getCurrentMonths(activeDates);

  const monthlyData = await getMonthlyData(db, currentMonths);
  activeDates.forEach(d => updateReservationsValue(d, monthlyData, postData));

  await Promise.all(
    currentMonths.map(async m => {
      await saveMonthlyData(db, m, monthlyData[m]);
    })
  );

  return "Reservations saved successfully";
};

const updateReservationsValue = (date, monthlyData, postData) => {
  const postElement = postData.find(p => p.date === date.format("YYYY-MM-DD"));

  if (!postElement) {
    return;
  }

  const monthKey = date.format("YYYY-MM");
  const dayKey = date.format("DD");

  monthlyData[monthKey][dayKey] = postElement.reservations;
};

const saveMonthlyData = async (db, monthId, reservations) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      PK: "GLOBAL",
      SK: `RESERVATIONS#${monthId}`,
      reservations: reservations
    }
  };

  try {
    await db.put(params).promise();
  } catch (error) {
    console.error("Unable to save reservations", JSON.stringify(error));
  }
};

const fetch = async db =>
  createFetch(db, dateCalculations.getCurrentActiveDates)();

const update = async (db, postData) => {
  createUpdate(db, dateCalculations.getCurrentActiveDates)(postData);
};

module.exports = { fetch, createFetch, update, createUpdate };
