const manageUsers = require("manageUsers");
const profile = require("profile");
const registrationNumbers = require("registrationNumbers");
const requests = require("requests");
const reservations = require("reservations");
const summary = require("summary");
const users = require("users");

const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2",
  endpoint: "https://dynamodb.eu-west-2.amazonaws.com"
});

const db = new AWS.DynamoDB.DocumentClient();

const router = require("aws-lambda-router");

exports.handler = router.handler({
  proxyIntegration: {
    cors: true,
    routes: [
      {
        path: "/manageUsers",
        method: "GET",
        action: async (request, context) => await manageUsers.fetchAll(db)
      },
      {
        path: "/manageUsers/:userId",
        method: "GET",
        action: async (request, context) =>
          await manageUsers.fetch(db, request.paths.userId)
      },
      {
        path: "/manageUsers/:userId",
        method: "POST",
        action: async (request, context) =>
          await manageUsers.update(db, request.paths.userId, request.body)
      },
      {
        path: "/manageUsers/:userId",
        method: "DELETE",
        action: async (request, context) =>
          await manageUsers.del(request.paths.userId)
      },
      {
        path: "/profile/:userId",
        method: "GET",
        action: async (request, context) =>
          await profile.fetch(request.paths.userId)
      },
      {
        path: "/profile/:userId",
        method: "POST",
        action: async (request, context) =>
          await profile.update(request.paths.userId, request.body)
      },
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
      },
      {
        path: "/reservations",
        method: "POST",
        action: async (request, context) =>
          await reservations.update(request.body)
      },
      {
        path: "/summary/:userId",
        method: "GET",
        action: async (request, context) =>
          await summary.fetch(request.paths.userId)
      },
      {
        path: "/users",
        method: "GET",
        action: async (request, context) => await users.fetch()
      }
    ]
  }
});
