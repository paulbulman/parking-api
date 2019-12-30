const moment = require("moment-timezone");

// TODO: Bank holidays
const isWorkingDay = date => date.isoWeekday() !== 6 && date.isoWeekday() !== 7;

const getCurrentDate = getMoment =>
  getMoment()
    .clone()
    .tz("Europe/London")
    .startOf("date");

const getCurrentActiveDates = getMoment => {
  const currentDate = getCurrentDate(getMoment);

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

  return activeDates.filter(isWorkingDay);
};

module.exports = getMoment => {
  const toDateString = date => date.format("YYYY-MM-DD");

  return {
    getCurrentDateString: () => toDateString(getCurrentDate(getMoment)),
    getCurrentActiveDateStrings: () => getCurrentActiveDates(getMoment).map(
      toDateString
    )
  };
};
