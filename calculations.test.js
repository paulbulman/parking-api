const moment = require("moment");
const calculations = require("./calculations");

const createCalculations = momentInput =>
  calculations(() => moment.utc(momentInput));

describe("get current date", () => {
  it("uses Europe/London time zone", () => {
    const winter = createCalculations("2019-12-30T23:00:00Z");
    expect(winter.getCurrentDateString()).toBe("2019-12-30");

    const summer = createCalculations("2019-06-30T23:00:00Z");
    expect(summer.getCurrentDateString()).toBe("2019-07-01");
  });
});

describe("get current active dates", () => {
  const result = createCalculations(
    "2020-02-27T23:00:00Z"
  ).getCurrentActiveDateStrings();

  it("contains the current date", () => {
    expect(result).toContain("2020-02-27");
  });

  it("does not contain the previous date", () => {
    // 26 Feb 2020 is a Wednesday, so would otherwise have been included
    expect(result).not.toContain("2020-02-26");
  });

  it("contains the last day of the next month", () => {
    expect(result).toContain("2020-03-31");
  });

  it("does not contain the first day of the month after next", () => {
    // 01 Apr 2020 is a Wednesday, so would otherwise have been included
    expect(result).not.toContain("2020-04-01");
  });

  it("does not contain an arbitrary Saturday in the period", () => {
    expect(result).not.toContain("2020-03-14");
  });

  it("does not contain an arbitrary Sunday in the period", () => {
    expect(result).not.toContain("2020-03-15");
  });
});
