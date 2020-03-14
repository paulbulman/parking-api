const moment = require("moment");
const { createFetch, createUpdate } = require("./reservations");

const createGetCurrentActiveDates = dateStrings => () =>
  dateStrings.map(d => moment(d, "YYYY-MM-DD"));

describe("fetch", () => {
  const createDb = data => ({
    get: params => ({
      promise: async () => ({
        Item: { reservations: data[params.Key.SK] }
      })
    })
  });

  const callFetch = async (existingData, activeDates) => {
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);
    const fetch = createFetch(createDb(existingData), getCurrentActiveDates);
    return await fetch();
  };

  it("returns nulls for active dates in a month without data", async () => {
    const existingData = { "RESERVATIONS#2020-03": {} };
    const activeDates = ["2020-03-06", "2020-03-09"];

    const result = await callFetch(existingData, activeDates);

    const expectedResult = [
      { date: "2020-03-06", reservations: [null, null, null, null] },
      { date: "2020-03-09", reservations: [null, null, null, null] }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("returns nulls for missing active dates in months with data", async () => {
    const existingData = {
      "RESERVATIONS#2020-03": {
        "05": ["USER_ID_1", "USER_ID_2", "USER_ID_3", "USER_ID_4"],
        "11": ["USER_ID_1", "USER_ID_2", "USER_ID_3", "USER_ID_4"]
      }
    };
    const activeDates = ["2020-03-06", "2020-03-09"];

    const result = await callFetch(existingData, activeDates);

    const expectedResult = [
      { date: "2020-03-06", reservations: [null, null, null, null] },
      { date: "2020-03-09", reservations: [null, null, null, null] }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("returns data flattened across months", async () => {
    const data1 = ["USER_ID_1", "USER_ID_2", null, "USER_ID_3"];
    const data2 = [null, null, "USER_ID_4", "USER_ID_3"];
    const data3 = ["USER_ID_2", "USER_ID_1", "USER_ID_4", "USER_ID_3"];
    const data4 = [null, null, null, null];

    const existingData = {
      "RESERVATIONS#2020-03": { "09": data1, "10": data2 },
      "RESERVATIONS#2020-04": { "02": data3, "03": data4 }
    };

    const activeDates = [
      "2020-03-09",
      "2020-03-10",
      "2020-04-02",
      "2020-04-03"
    ];

    const result = await callFetch(existingData, activeDates);

    const expectedResult = [
      { date: "2020-03-09", reservations: data1 },
      { date: "2020-03-10", reservations: data2 },
      { date: "2020-04-02", reservations: data3 },
      { date: "2020-04-03", reservations: data4 }
    ];

    expect(result).toEqual(expectedResult);
  });
});

describe("update", () => {
  const createDb = (existingReservationsData, actualParams) => ({
    get: params => ({
      promise: async () => ({
        Item: { reservations: existingReservationsData[params.Key.SK] }
      })
    }),
    put: params => ({
      promise: async () => {
        actualParams.push(params);
      }
    })
  });

  it("calls the database for each active month", async () => {
    let actualParams = [];
    const existingReservations = {
      "RESERVATIONS#2020-03": {},
      "RESERVATIONS#2020-04": {}
    };
    const db = createDb(existingReservations, actualParams);

    const activeDates = ["2020-03-09", "2020-04-03"];
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);

    const data1 = ["USER_ID_1", "USER_ID_2", null, "USER_ID_3"];
    const data2 = [null, null, "USER_ID_4", "USER_ID_3"];
    const postData = [
      { date: "2020-03-09", reservations: data1 },
      { date: "2020-04-03", reservations: data2 }
    ];
    await createUpdate(db, getCurrentActiveDates)(postData);

    const expectedItems = [
      {
        PK: "GLOBAL",
        SK: "RESERVATIONS#2020-03",
        reservations: { "09": data1 }
      },
      {
        PK: "GLOBAL",
        SK: "RESERVATIONS#2020-04",
        reservations: { "03": data2 }
      }
    ];
    const actualItems = actualParams.map(p => p.Item);

    expect(actualItems).toEqual(expectedItems);
  });

  it("ignores any post data not for an active date, and active dates without post data", async () => {
    let actualParams = [];
    const existingData = {
      12: ["USER_ID_1", "USER_ID_2", null, "USER_ID_3"],
      13: [null, null, "USER_ID_4", "USER_ID_3"]
    };
    const existingReservations = {
      "RESERVATIONS#2020-03": existingData
    };
    const db = createDb(existingReservations, actualParams);

    const activeDates = ["2020-03-12", "2020-03-13"];
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);

    const postData = [
      { date: "2020-03-10", reservations: ["OTHER_USER_ID"] },
      { date: "2020-03-11", reservations: ["OTHER_USER_ID"] }
    ];
    await createUpdate(db, getCurrentActiveDates)(postData);

    const expectedItems = [
      {
        PK: "GLOBAL",
        SK: "RESERVATIONS#2020-03",
        reservations: existingData
      }
    ];
    const actualItems = actualParams.map(p => p.Item);

    expect(actualItems).toEqual(expectedItems);
  });
});
