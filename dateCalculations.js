const moment = require("moment-timezone");
const bankHolidays = require("./bankHolidays");

const timeZoneName = "Europe/London";

const createGetCurrentDate = getMoment => () =>
  getMoment()
    .clone()
    .tz(timeZoneName)
    .startOf("date");

const isWorkingDay = (date, bankHolidays) =>
  date.isoWeekday() !== 6 &&
  date.isoWeekday() !== 7 &&
  bankHolidays.every(b => !date.isSame(b, "day"));

const createGetCurrentActiveDates = (getMoment, bankHolidays) => () => {
  const currentDate = createGetCurrentDate(getMoment)();
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

const getCurrentDate = createGetCurrentDate(() => moment());
const getCurrentActiveDates = createGetCurrentActiveDates(
  () => moment(),
  bankHolidays
);

module.exports = {
  getCurrentDate,
  createGetCurrentDate,
  getCurrentActiveDates,
  createGetCurrentActiveDates
};
