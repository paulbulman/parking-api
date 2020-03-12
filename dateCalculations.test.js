const moment = require("moment");
const dateCalculations = require("./dateCalculations");

describe("get current date", () => {
  it("uses Europe/London time zone", () => {
    const checkDay = (utcMomentInput, expectedResult) => {
      const getMoment = () => moment.utc(utcMomentInput);

      const result = dateCalculations.createGetCurrentDate(getMoment)();

      const expectedMoment = moment(expectedResult).tz("Europe/London");
      const comparisonResult = result.isSame(expectedMoment, "day");

      expect(comparisonResult).toBe(true);
    };

    checkDay("2019-12-30T23:00:00Z", "2019-12-30");
    checkDay("2019-06-30T23:00:00Z", "2019-07-01");
  });
});

describe("get current active dates", () => {
  const checkContains = (actualResult, searchDate, expectedContainsDay) => {
    const searchMoment = moment(searchDate).tz("Europe/London");
    const containsDay = actualResult.some(a => searchMoment.isSame(a, "day"));

    expect(containsDay).toBe(expectedContainsDay);
  };

  const expectContainsDay = (actualResult, searchDate) => {
    checkContains(actualResult, searchDate, true);
  };

  const expectNotContainsDay = (actualResult, searchDate) => {
    checkContains(actualResult, searchDate, false);
  };

  const getMoment = () => moment.utc("2020-02-27T23:00:00Z");
  const result = dateCalculations.createGetCurrentActiveDates(getMoment, [])();

  it("contains the current date", () => {
    expectContainsDay(result, "2020-02-27");
  });

  it("does not contain the previous date", () => {
    // 26 Feb 2020 is a Wednesday, so would otherwise have been included
    expectNotContainsDay(result, "2020-02-26");
  });

  it("contains the last day of the next month", () => {
    expectContainsDay(result, "2020-03-31");
  });

  it("does not contain the first day of the month after next", () => {
    // 01 Apr 2020 is a Wednesday, so would otherwise have been included
    expectNotContainsDay(result, "2020-04-01");
  });

  it("does not contain an arbitrary Saturday in the period", () => {
    expectNotContainsDay(result, "2020-03-14");
  });

  it("does not contain an arbitrary Sunday in the period", () => {
    expectNotContainsDay(result, "2020-03-15");
  });

  it("does not contain a bank holiday in the period", () => {
    const getMoment = () => moment.utc("2019-12-30T23:00:00Z");
    const bankHolidays = [moment("2020-01-01")];

    const result = dateCalculations.createGetCurrentActiveDates(
      getMoment,
      bankHolidays
    )();

    expectNotContainsDay(result, "2020-01-01");
  });
});
