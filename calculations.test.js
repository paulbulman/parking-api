const moment = require("moment");
const calculations = require("./calculations");

describe("get current date", () => {
  it("uses Europe/London time zone", () => {
    const getCurrentDateWinter = calculations.createGetCurrentDateString(
      moment.utc("2019-12-30T23:00:00Z")
    );
    expect(getCurrentDateWinter()).toBe("2019-12-30");

    const getCurrentDateSummer = calculations.createGetCurrentDateString(
      moment.utc("2019-06-30T23:00:00Z")
    );
    expect(getCurrentDateSummer()).toBe("2019-07-01");
  });
});

describe("get current active dates", () => {
  const getCurrentActiveDates = calculations.createGetCurrentActiveDateStrings(
    moment.utc("2020-02-27T23:00:00Z")
  );

  const result = getCurrentActiveDates();

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
  })

  it("does not contain an arbitrary Sunday in the period", () => {
    expect(result).not.toContain("2020-03-15");
  })
});
