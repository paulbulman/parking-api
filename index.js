const router = require("aws-lambda-router");
const moment = require("moment");
const calculations = require("./calculations")(moment);

exports.handler = router.handler({
  proxyIntegration: {
    cors: true,
    routes: [
      {
        path: "/getCurrentDate",
        method: "GET",
        action: (request, context) => calculations.getCurrentDateString()
      },
      {
        path: "/getCurrentActiveDates",
        method: "GET",
        action: (request, context) => calculations.getCurrentActiveDateStrings()
      }
    ]
  }
});
