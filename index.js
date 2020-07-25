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

const api = require("lambda-api")({ version: "v1.0", base: "v1" });

api.get("/manageUsers", async (req, res) => {
  res.cors();
  if (authentication.userHasRole(req, authentication.roles.UserAdmin)) {
    res.send(await manageUsers.fetchAll(db));
  } else {
    res.sendStatus(403);
  }
});
api.get("/manageUsers/:userId", async (req, res) => {
  res.cors();
  if (authentication.userHasRole(req, authentication.roles.UserAdmin)) {
    res.send(await manageUsers.fetch(db, req.params.userId));
  } else {
    res.sendStatus(403);
  }
});
api.post("/manageUsers", async (req, res) => {
  res.cors();
  if (authentication.userHasRole(req, authentication.roles.UserAdmin)) {
    res.send(await manageUsers.add(cognito, db, req.body));
  } else {
    res.sendStatus(403);
  }
});
api.put("/manageUsers/:userId", async (req, res) => {
  res.cors();
  if (authentication.userHasRole(req, authentication.roles.UserAdmin)) {
    res.send(await manageUsers.update(db, req.params.userId, req.body));
  } else {
    res.sendStatus(403);
  }
});
api.delete("/manageUsers/:userId", async (req, res) => {
  res.cors();
  if (authentication.userHasRole(req, authentication.roles.UserAdmin)) {
    res.send(await manageUsers.del(req.params.userId));
  } else {
    res.sendStatus(403);
  }
});

api.get("/profile/:userId", async (req, res) => {
  res.cors();
  res.send(await profile.fetch(db, req.params.userId));
});
api.put("/profile/:userId", async (req, res) => {
  res.cors();
  if (authentication.userHasId(req, req.params.userId)) {
    res.send(await profile.update(db, req.params.userId, req.body));
  } else {
    res.sendStatus(403);
  }
});

api.get("/registrationNumbers", async (req, res) => {
  res.cors();
  res.send(await registrationNumbers.fetch(db));
});

api.get("/requests/:userId", async (req, res) => {
  res.cors();
  res.send(await requests.fetch(db, req.params.userId));
});
api.post("/requests/:userId", async (req, res) => {
  res.cors();
  if (
    authentication.userHasId(req, req.params.userId) ||
    authentication.userHasRole(req, authentication.roles.TeamLeader)
  ) {
    res.send(await requests.update(db, req.params.userId, req.body));
  } else {
    res.sendStatus(403);
  }
});

api.get("/reservations", async (req, res) => {
  res.cors();
  res.send(await reservations.fetch(db));
});
api.post("/reservations", async (req, res) => {
  res.cors();
  if (authentication.userHasRole(req, authentication.roles.TeamLeader)) {
    res.send(await reservations.update(db, req.body));
  } else {
    res.sendStatus(403);
  }
});

api.get("/summary/:userId", async (req, res) => {
  res.cors();
  res.send(await summary.fetch(db, req.params.userId));
});

api.get("/users", async (req, res) => {
  res.cors();
  res.send(await users.fetch(db));
});

exports.handler = async (event, context) => await api.run(event, context);
