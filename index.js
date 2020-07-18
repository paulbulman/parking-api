const authentication = require("authentication");
const manageUsers = require("manageUsers");
const profile = require("profile");
const registrationNumbers = require("registrationNumbers");
const requests = require("requests");
const reservations = require("reservations");
const summary = require("summary");
const users = require("users");

const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-2" });

const cognito = new AWS.CognitoIdentityServiceProvider();
const db = new AWS.DynamoDB.DocumentClient();

const router = require("aws-lambda-router");

exports.handler = router.handler({
  proxyIntegration: {
    cors: true,
    routes: [
      {
        path: "/manageUsers",
        method: "GET",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.UserAdmin
          );
          return await manageUsers.fetchAll(db);
        }
      },
      {
        path: "/manageUsers/:userId",
        method: "GET",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.UserAdmin
          );
          return await manageUsers.fetch(db, request.paths.userId);
        }
      },
      {
        path: "/manageUsers",
        method: "POST",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.UserAdmin
          );
          return await manageUsers.add(cognito, db, request.body);
        }
      },
      {
        path: "/manageUsers/:userId",
        method: "PUT",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.UserAdmin
          );
          return await manageUsers.update(
            db,
            request.paths.userId,
            request.body
          );
        }
      },
      {
        path: "/manageUsers/:userId",
        method: "DELETE",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.UserAdmin
          );
          return await manageUsers.del(request.paths.userId);
        }
      },
      {
        path: "/profile/:userId",
        method: "GET",
        action: async (request, context) =>
          await profile.fetch(db, request.paths.userId)
      },
      {
        path: "/profile/:userId",
        method: "PUT",
        action: async (request, context) =>
          await profile.update(db, request.paths.userId, request.body)
      },
      {
        path: "/registrationNumbers",
        method: "GET",
        action: async (request, context) => await registrationNumbers.fetch(db)
      },
      {
        path: "/requests/:userId",
        method: "GET",
        action: async (request, context) =>
          await requests.fetch(db, request.paths.userId)
      },
      {
        path: "/requests/:userId",
        method: "POST",
        action: async (request, context) =>
          await requests.update(db, request.paths.userId, request.body)
      },
      {
        path: "/reservations",
        method: "GET",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.TeamLeader
          );
          return await reservations.fetch(db);
        }
      },
      {
        path: "/reservations",
        method: "POST",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.TeamLeader
          );
          return await reservations.update(db, request.body);
        }
      },
      {
        path: "/summary/:userId",
        method: "GET",
        action: async (request, context) =>
          await summary.fetch(db, request.paths.userId)
      },
      {
        path: "/users",
        method: "GET",
        action: async (request, context) => {
          authentication.checkUserHasRole(
            request,
            authentication.roles.TeamLeader
          );
          return await users.fetch(db);
        }
      }
    ],
    errorMapping: { Forbidden: 403 }
  }
});
