const fetch = async userId => [
  {
    date: "2020-01-06",
    allocated: ["Person 1", "Person 2"],
    interrupted: ["Person 3"],
    highlight: "Person 1"
  },
  {
    date: "2020-01-09",
    allocated: ["Person 1", "Person 3"],
    interrupted: ["Person 2"],
    highlight: "Person 2"
  },
  {
    date: "2020-01-10",
    allocated: ["Person 2", "Person 3"],
    interrupted: ["Person 1"],
    highlight: "Person 3"
  },
  {
    date: "2019-12-30",
    allocated: ["Person 1", "Person 2"],
    interrupted: ["Person 3"],
    highlight: "Person 1"
  },
  {
    date: "2019-12-31",
    allocated: ["Person 1", "Person 3"],
    interrupted: ["Person 2"],
    highlight: "Person 2"
  },
  {
    date: "2020-01-01",
    allocated: ["Person 2", "Person 3"],
    interrupted: ["Person 1"],
    highlight: "Person 3"
  },
  {
    date: "2020-01-02",
    allocated: ["Person 1", "Person 2"],
    interrupted: ["Person 3"],
    highlight: "Person 1"
  },
  {
    date: "2020-01-07",
    allocated: ["Person 1", "Person 3"],
    interrupted: ["Person 2"],
    highlight: "Person 2"
  },
  {
    date: "2020-01-03",
    allocated: ["Person 2", "Person 3"],
    interrupted: ["Person 1"],
    highlight: "Person 3"
  }
];

module.exports = { fetch };
