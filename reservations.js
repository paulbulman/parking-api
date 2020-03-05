const fetch = async () => [
  {
    date: "2020-01-06",
    reservations: ["1", "3", null]
  },
  {
    date: "2020-01-07",
    reservations: ["1", "3", null]
  },
  {
    date: "2020-01-08",
    reservations: ["1", null, null]
  },
  {
    date: "2019-12-30",
    reservations: ["1", "3", null]
  },
  {
    date: "2019-12-31",
    reservations: [null, "2", null]
  }
];

const update = async reservationsData => {
  console.log("Saving reservation data", reservationsData);

  return "Reservations saved successfully";
};

module.exports = { fetch, update };
