const moment = require("moment");
const calculations = require("./calculations");

describe("get current date", () => {
  it("uses Europe/London time zone", () => {
    const getCurrentDateWinter = calculations.createGetCurrentDate(
      moment.utc("2019-12-30T23:00:00Z")
    );
    expect(getCurrentDateWinter()).toBe("2019-12-30");

    const getCurrentDateSummer = calculations.createGetCurrentDate(
      moment.utc("2019-06-30T23:00:00Z")
    );
    expect(getCurrentDateSummer()).toBe("2019-07-01");
  });
});
