var moment = require("moment-timezone");

const getCurrentDate = currentMoment =>
  currentMoment.tz("Europe/London").startOf("date");

const createGetCurrentDateString = currentMoment => () =>
  getCurrentDate(currentMoment).format("YYYY-MM-DD");

const getCurrentDateString = createGetCurrentDateString(moment());

module.exports = { createGetCurrentDateString, getCurrentDateString };
