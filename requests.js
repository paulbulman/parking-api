const fetch = async userId => [
  { date: "2020-01-06", requested: true },
  { date: "2020-01-07", requested: false },
  { date: "2020-01-08", requested: true },
  { date: "2020-01-02", requested: true },
  { date: "2019-12-30", requested: true },
  { date: "2019-12-31", requested: false }
];

const update = async (userId, requestsData) => {
  console.log("Saving requests data for user", userId, requestsData);

  return "Requests saved successfully"
};

module.exports = { fetch, update };
