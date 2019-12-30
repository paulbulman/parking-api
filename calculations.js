const moment = require("moment-timezone");

const isWorkingDay = (date, bankHolidays) =>
  date.isoWeekday() !== 6 &&
  date.isoWeekday() !== 7 &&
  bankHolidays.every(b => !date.isSame(b, "day"));

const getCurrentDate = getMoment =>
  getMoment()
    .clone()
    .tz("Europe/London")
    .startOf("date");

const getCurrentActiveDates = (getMoment, bankHolidays) => {
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

  return activeDates.filter(d => isWorkingDay(d, bankHolidays));
};

module.exports = (getMoment, bankHolidays) => {
  const toDateString = date => date.format("YYYY-MM-DD");

  return {
    getCurrentDateString: () => toDateString(getCurrentDate(getMoment)),
    getCurrentActiveDateStrings: () =>
      getCurrentActiveDates(getMoment, bankHolidays).map(toDateString)
  };
};
