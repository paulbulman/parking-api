var moment = require("moment-timezone");

const createGetCurrentDate = currentMoment => () =>
  currentMoment.tz("Europe/London").format("YYYY-MM-DD");

const getCurrentDate = createGetCurrentDate(moment());

module.exports = { createGetCurrentDate, getCurrentDate };
