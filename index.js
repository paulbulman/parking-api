const router = require("aws-lambda-router");
const moment = require("moment");
const bankHolidays = require("./bankHolidays");
const dateCalculations = require("./dateCalculations")(moment, bankHolidays);

exports.handler = router.handler({
  proxyIntegration: {
    cors: true,
    routes: [
      {
        path: "/getCurrentDate",
        method: "GET",
        action: (request, context) => dateCalculations.getCurrentDateString()
      },
      {
        path: "/getCurrentActiveDates",
        method: "GET",
        action: (request, context) => dateCalculations.getCurrentActiveDateStrings()
      }
    ]
  }
});
