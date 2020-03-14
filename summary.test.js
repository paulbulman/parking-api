const moment = require("moment");
const { createFetch } = require("./summary");

const createGetCurrentActiveDates = dateStrings => () =>
  dateStrings.map(d => moment(d, "YYYY-MM-DD"));

describe("fetch", () => {
  const usersData = [
    { PK: "USER#USER_ID_1", firstName: "First", lastName: "User" },
    { PK: "USER#USER_ID_2", firstName: "User", lastName: "2" },
    { PK: "USER#USER_ID_3", firstName: "Person", lastName: "Three" }
  ];

  const activeDates = ["2020-03-06", "2020-04-09"];

  const createDb = requestsData => ({
    query: params => {
      const data =
        params.ExpressionAttributeValues[":sk"] === "PROFILE"
          ? usersData
          : requestsData[params.ExpressionAttributeValues[":sk"]];

      return { promise: async () => ({ Items: data }) };
    }
  });

  const callFetch = async (requestsData, userId) => {
    const db = createDb(requestsData, usersData);
    const getCurrentActiveDates = createGetCurrentActiveDates(activeDates);

    const fetch = createFetch(db, getCurrentActiveDates);
    return await fetch(userId);
  };

  it("returns an element for each active date", async () => {
    const requests = { "REQUESTS#2020-03": [], "REQUESTS#2020-04": [] };

    const result = await callFetch(requests, "USER_ID_1");

    const expectedResult = [
      {
        date: "2020-03-06",
        allocated: [],
        interrupted: [],
        highlight: "First User"
      },
      {
        date: "2020-04-09",
        allocated: [],
        interrupted: [],
        highlight: "First User"
      }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("separates allocated and interrupted user data", async () => {
    const requests = {
      "REQUESTS#2020-03": [
        { PK: "USER#USER_ID_1", requests: { "06": "REQUESTED" } },
        { PK: "USER#USER_ID_2", requests: { "06": "ALLOCATED" } },
        { PK: "USER#USER_ID_3", requests: { "06": "ALLOCATED" } }
      ],
      "REQUESTS#2020-04": [
        { PK: "USER#USER_ID_2", requests: { "09": "CANCELLED" } },
        { PK: "USER#USER_ID_1", requests: { "09": "ALLOCATED" } },
      ]
    };

    const result = await callFetch(requests, "USER_ID_1");

    const expectedResult = [
      {
        date: "2020-03-06",
        allocated: ["User 2", "Person Three"],
        interrupted: ["First User"],
        highlight: "First User"
      },
      {
        date: "2020-04-09",
        allocated: ["First User"],
        interrupted: [],
        highlight: "First User"
      }
    ];

    expect(result).toEqual(expectedResult);
  });

  it("highlights the current user", async () => {
    const checkHighlight = async(userId, expectedHighlight) => {
      const requests = { "REQUESTS#2020-03": [], "REQUESTS#2020-04": [] };
  
      const result = await callFetch(requests, userId);
  
      const expectedResult = [
        {
          date: "2020-03-06",
          allocated: [],
          interrupted: [],
          highlight: expectedHighlight
        },
        {
          date: "2020-04-09",
          allocated: [],
          interrupted: [],
          highlight: expectedHighlight
        }
      ];
  
      expect(result).toEqual(expectedResult);
    }

    await checkHighlight("USER_ID_1", "First User");
    await checkHighlight("USER_ID_2", "User 2");
  });
});
