const router = require("aws-lambda-router");
const calculations = require("./calculations");

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
