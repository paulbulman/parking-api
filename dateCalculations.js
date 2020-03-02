const moment = require("moment-timezone");

const timeZoneName = "Europe/London";
const dateFormatString = "YYYY-MM-DD";

const getCurrentDate = getMoment =>
  getMoment()
    .clone()
    .tz(timeZoneName)
    .startOf("date");

const isWorkingDay = (date, bankHolidays) =>
  date.isoWeekday() !== 6 &&
  date.isoWeekday() !== 7 &&
  bankHolidays.every(b => !date.isSame(b, "day"));

const getCurrentActiveDates = (getMoment, bankHolidays) => {
  const currentDate = getCurrentDate(getMoment);
  const lastDayOfNextMonth = currentDate
    .clone()
    .startOf("month")
    .add(2, "months")
    .subtract(1, "days");

  let activeDates = [];
  while (currentDate.isSameOrBefore(lastDayOfNextMonth, "day")) {
    activeDates.push(currentDate.clone());
    currentDate.add(1, "days");
  }

  return activeDates.filter(d => isWorkingDay(d, bankHolidays));
};

module.exports = (getMoment, bankHolidays) => {
  const toDateString = date => date.format(dateFormatString);

  return {
    getCurrentDateString: () => toDateString(getCurrentDate(getMoment)),
    getCurrentActiveDateStrings: () =>
      getCurrentActiveDates(getMoment, bankHolidays).map(toDateString)
  };
};
