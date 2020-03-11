const moment = require("moment");
const requests = require("./requests");

describe("fetch", () => {
  const createDb = data => ({
    get: params => ({
      promise: async () => ({
        Item: { requests: JSON.stringify(data[params.Key.SK]) }
      })
    })
  });

  it("returns an element for each active date", async () => {
    const dateStrings = ["2020-03-06", "2020-03-09", "2020-03-10"];
    const getCurrentActiveDates = () =>
      dateStrings.map(d => moment(d, "YYYY-MM-DD"));

    const data = { "REQUESTS#2020-03": {} };

    const fetch = requests.createFetch(createDb(data), getCurrentActiveDates);
    const result = await fetch("USER_ID");

    expect(result.map(r => r.date)).toEqual(dateStrings);
  });

  it("calls the database with the given user ID for each active month", async () => {
    const dateStrings = ["2020-03-09", "2020-04-02"];
    const getCurrentActiveDates = () =>
      dateStrings.map(d => moment(d, "YYYY-MM-DD"));

    let actualParams = [];
    const db = {
      get: params => ({ promise: async () => actualParams.push(params) })
    };

    const fetch = requests.createFetch(db, getCurrentActiveDates);
    await fetch("USER_ID");

    const expectedKeys = [
      { PK: "USER#USER_ID", SK: "REQUESTS#2020-03" },
      { PK: "USER#USER_ID", SK: "REQUESTS#2020-04" }
    ];
    const actualKeys = actualParams.map(p => p.Key);

    expect(actualKeys).toEqual(expectedKeys);
  });

  it("returns false for active dates in a month without data", async () => {
    const dateStrings = ["2020-03-06", "2020-03-09", "2020-03-10"];
    const getCurrentActiveDates = () =>
      dateStrings.map(d => moment(d, "YYYY-MM-DD"));

    const data = { "REQUESTS#2020-03": {} };

    const fetch = requests.createFetch(createDb(data), getCurrentActiveDates);
    const result = await fetch("USER_ID");

    const expectedResult = [
      { date: "2020-03-06", requested: false },
      { date: "2020-03-09", requested: false },
      { date: "2020-03-10", requested: false }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("returns false for missing active dates in months with data", async () => {
    const dateStrings = ["2020-03-06", "2020-03-09", "2020-03-10"];
    const getCurrentActiveDates = () =>
      dateStrings.map(d => moment(d, "YYYY-MM-DD"));

    const data = {
      "REQUESTS#2020-03": {
        "05": "REQUESTED",
        "11": "REQUESTED",
        "12": "REQUESTED"
      }
    };

    const fetch = requests.createFetch(createDb(data), getCurrentActiveDates);

    const result = await fetch("USER_ID");

    const expectedResult = [
      { date: "2020-03-06", requested: false },
      { date: "2020-03-09", requested: false },
      { date: "2020-03-10", requested: false }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("returns true only for active dates with status REQUESTED or ALLOCATED", async () => {
    const dateStrings = [
      "2020-03-09",
      "2020-03-10",
      "2020-03-11",
      "2020-04-02",
      "2020-04-03"
    ];
    const getCurrentActiveDates = () =>
      dateStrings.map(d => moment(d, "YYYY-MM-DD"));

    const data = {
      "REQUESTS#2020-03": {
        "09": "REQUESTED",
        "10": "ALLOCATED",
        "11": "CANCELLED"
      },
      "REQUESTS#2020-04": {
        "02": "WIBBLE",
        "03": "ALLOCATED"
      }
    };

    const fetch = requests.createFetch(createDb(data), getCurrentActiveDates);

    const result = await fetch("USER_ID");

    const expectedResult = [
      { date: "2020-03-09", requested: true },
      { date: "2020-03-10", requested: true },
      { date: "2020-03-11", requested: false },
      { date: "2020-04-02", requested: false },
      { date: "2020-04-03", requested: true }
    ];

    expect(result).toEqual(expectedResult);
  });
});
