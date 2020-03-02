const router = require("aws-lambda-router");
const registrationNumbers = require("registrationNumbers");

exports.handler = router.handler({
  proxyIntegration: {
    cors: true,
    routes: [
      {
        path: "/registrationNumbers",
        method: "GET",
        action: async (request, context) => await registrationNumbers.fetch()
      }
    ]
  }
});
