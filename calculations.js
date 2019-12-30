var moment = require("moment-timezone");

const getCurrentDate = currentMoment =>
  currentMoment
    .clone()
    .tz("Europe/London")
    .startOf("date");

const createGetCurrentDateString = currentMoment => () =>
  getCurrentDate(currentMoment).format("YYYY-MM-DD");

const getCurrentDateString = createGetCurrentDateString(moment());

// TODO: Bank holidays
const isWorkingDay = date => date.isoWeekday() !== 6 && date.isoWeekday() !== 7;

const createGetCurrentActiveDateStrings = currentMoment => () => {
  const currentDate = getCurrentDate(currentMoment);

  const lastDayOfNextMonth = currentDate
    .clone()
    .startOf("month")
    .add(2, "months")
    .subtract(1, "days");

  let activeDates = [];
  for (
    let d = currentDate.clone();
    d <= lastDayOfNextMonth;
    d = d.add(1, "days")
  ) {
    activeDates.push(d.clone());
  }

  return activeDates.filter(isWorkingDay).map(d => d.format("YYYY-MM-DD"));
};

const getCurrentActiveDateStrings = createGetCurrentActiveDateStrings(moment());

module.exports = {
  createGetCurrentDateString,
  getCurrentDateString,
  createGetCurrentActiveDateStrings,
  getCurrentActiveDateStrings
};
