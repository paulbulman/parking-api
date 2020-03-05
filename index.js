const router = require("aws-lambda-router");
const registrationNumbers = require("registrationNumbers");
const requests = require("requests");
const reservations = require("reservations");

exports.handler = router.handler({
  proxyIntegration: {
    cors: true,
    routes: [
      {
        path: "/registrationNumbers",
        method: "GET",
        action: async (request, context) => await registrationNumbers.fetch()
      },
      {
        path: "/requests/:userId",
        method: "GET",
        action: async (request, context) =>
          await requests.fetch(request.paths.userId)
      },
      {
        path: "/requests/:userId",
        method: "POST",
        action: async (request, context) =>
          await requests.update(request.paths.userId, request.body)
      },
      {
        path: "/reservations",
        method: "GET",
        action: async (request, context) => await reservations.fetch()
      }
    ]
  }
});
