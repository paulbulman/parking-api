const moment = require("moment");
const { createFetch, createUpdate } = require("./requests");

const createGetCurrentActiveDates = dateStrings => () =>
  dateStrings.map(d => moment(d, "YYYY-MM-DD"));

describe("fetch", () => {
  const createDb = data => ({
    get: params => ({
      promise: async () => ({
        Item: { requests: data[params.Key.SK] }
      })
    })
  });

  const callFetch = async (existingData, activeDates) => {
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);
    const fetch = createFetch(createDb(existingData), getCurrentActiveDates);
    return await fetch("USER_ID");
  };

  it("returns an element for each active date", async () => {
    const existingData = { "REQUESTS#2020-03": {} };
    const activeDates = ["2020-03-06", "2020-03-09", "2020-03-10"];

    const result = await callFetch(existingData, activeDates);

    expect(result.map(r => r.date)).toEqual(activeDates);
  });

  it("calls the database with the given user ID for each active month", async () => {
    let actualParams = [];
    const db = {
      get: params => ({ promise: async () => actualParams.push(params) })
    };

    const activeDates = ["2020-03-09", "2020-04-02"];
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);

    const fetch = createFetch(db, getCurrentActiveDates);
    await fetch("USER_ID");

    const expectedKeys = [
      { PK: "USER#USER_ID", SK: "REQUESTS#2020-03" },
      { PK: "USER#USER_ID", SK: "REQUESTS#2020-04" }
    ];
    const actualKeys = actualParams.map(p => p.Key);

    expect(actualKeys).toEqual(expectedKeys);
  });

  it("returns false for active dates in a month without data", async () => {
    const existingData = { "REQUESTS#2020-03": {} };
    const activeDates = ["2020-03-06", "2020-03-09"];

    const result = await callFetch(existingData, activeDates);

    const expectedResult = [
      { date: "2020-03-06", requested: false },
      { date: "2020-03-09", requested: false }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("returns false for missing active dates in months with data", async () => {
    const existingData = {
      "REQUESTS#2020-03": { "05": "REQUESTED", "11": "REQUESTED" }
    };
    const activeDates = ["2020-03-06", "2020-03-09"];

    const result = await callFetch(existingData, activeDates);

    const expectedResult = [
      { date: "2020-03-06", requested: false },
      { date: "2020-03-09", requested: false }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("returns true only for active dates with status REQUESTED or ALLOCATED", async () => {
    const existingData = {
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
    const activeDates = [
      "2020-03-09",
      "2020-03-10",
      "2020-03-11",
      "2020-04-02",
      "2020-04-03"
    ];

    const result = await callFetch(existingData, activeDates);

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

describe("update", () => {
  const createDb = (existingRequestsData, actualParams) => ({
    get: params => ({
      promise: async () => ({
        Item: { requests: existingRequestsData[params.Key.SK] }
      })
    }),
    put: params => ({
      promise: async () => {
        actualParams.push(params);
      }
    })
  });

  const checkSavedRequests = (actualParams, expectedRequests) => {
    expect(actualParams.length).toBe(1);
    expect(actualParams[0].Item.requests).toEqual(expectedRequests);
  };

  const checkStatusTransition = async (
    existingStatus,
    postValue,
    expectedNewStatus
  ) => {
    let actualParams = [];
    const existingRequests = existingStatus ? { "04": existingStatus } : {};
    const existingRequestsData = { "REQUESTS#2020-03": existingRequests };
    const db = createDb(existingRequestsData, actualParams);

    const getCurrentActiveDates = createGetCurrentActiveDates(["2020-03-04"]);

    const postData = [{ date: "2020-03-04", requested: postValue }];
    await createUpdate(db, getCurrentActiveDates)("USER_ID", postData);

    checkSavedRequests(actualParams, { "04": expectedNewStatus });
  };

  it("calls the database with the given user ID for each active month", async () => {
    let actualParams = [];
    const existingRequestsData = {
      "REQUESTS#2020-03": { "09": "REQUESTED" },
      "REQUESTS#2020-04": { "03": "ALLOCATED" }
    };
    const db = createDb(existingRequestsData, actualParams);

    const activeDates = ["2020-03-09", "2020-04-03"];
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);

    const postData = [
      { date: "2020-03-09", requested: false },
      { date: "2020-04-03", requested: false }
    ];
    await createUpdate(db, getCurrentActiveDates)("USER_ID", postData);

    const expectedKeys = [
      { PK: "USER#USER_ID", SK: "REQUESTS#2020-03" },
      { PK: "USER#USER_ID", SK: "REQUESTS#2020-04" }
    ];
    const actualKeys = actualParams.map(p => ({
      PK: p.Item.PK,
      SK: p.Item.SK
    }));

    expect(actualKeys).toEqual(expectedKeys);
  });

  it("ignores any post data not for an active date, and active dates without post data", async () => {
    let actualParams = [];
    const existingRequests = { "04": "ALLOCATED", "05": "CANCELLED" };
    const existingRequestsData = { "REQUESTS#2020-03": existingRequests };
    const db = createDb(existingRequestsData, actualParams);

    const activeDates = ["2020-03-06", "2020-03-09", "2020-03-10"];
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);

    const postData = [
      { date: "2020-03-04", requested: false },
      { date: "2020-03-05", requested: true }
    ];
    await createUpdate(db, getCurrentActiveDates)("USER_ID", postData);

    checkSavedRequests(actualParams, existingRequests);
  });

  describe("when an active date is posted as false", () => {
    it("does not create a new request element", async () => {
      let actualParams = [];
      const existingRequests = { "04": "ALLOCATED" };
      const existingRequestsData = { "REQUESTS#2020-03": existingRequests };
      const db = createDb(existingRequestsData, actualParams);

      const activeDates = ["2020-03-04", "2020-03-05"];
      const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);

      const postData = [{ date: "2020-03-05", requested: false }];
      await createUpdate(db, getCurrentActiveDates)("USER_ID", postData);

      checkSavedRequests(actualParams, existingRequests);
    });

    it("sets existing request elements to status CANCELLED", async () => {
      await checkStatusTransition("ALLOCATED", false, "CANCELLED");
    });
  });

  describe("when an active date is posted as true", () => {
    it("ignores existing request elements with status ALLOCATED", async () => {
      await checkStatusTransition("ALLOCATED", true, "ALLOCATED");
    });

    it("sets other existing request elements to status REQUESTED", async () => {
      await checkStatusTransition("CANCELLED", true, "REQUESTED");
    });

    it("creates new request elements with status REQUESTED if none exists", async () => {
      await checkStatusTransition(null, true, "REQUESTED");
    });
  });
});
