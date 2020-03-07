const manageUsers = require("./manageUsers");
const profile = require("./profile");
const registrationNumbers = require("./registrationNumbers");
const requests = require("./requests");
const reservations = require("./reservations");
const summary = require("./summary");
const users = require("./users");

const express = require("express");
const cors = require("cors");
const textBody = require("body");

const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2",
  endpoint: "https://dynamodb.eu-west-2.amazonaws.com"
});

const db = new AWS.DynamoDB.DocumentClient();

const app = express();
const port = 4000;

app.use(cors());
app.get("/manageUsers/", async (req, res) => {
  res.send(await manageUsers.fetchAll());
});

app.get("/manageUsers/:userId", async (req, res) => {
  res.send(await manageUsers.fetch(db, req.params["userId"]));
});
app.post("/manageUsers/:userId", (req, res) => {
  textBody(req, res, async function(err, body) {
    res.send(await manageUsers.update(db, req.params["userId"], JSON.parse(body)));
  });
});
app.delete("/manageUsers/:userId", async (req, res) => {
  res.send(await manageUsers.del(req.params["userId"]));
});

app.get("/profile/:userId", async (req, res) => {
  res.send(await profile.fetch(req.params["userId"]));
});
app.post("/profile/:userId", async (req, res) => {
  textBody(req, res, async function(err, body) {
    res.send(await profile.update(req.params["userId"], JSON.parse(body)));
  });
});

app.get("/registrationNumbers", async (req, res) => {
  res.send(await registrationNumbers.fetch());
});

app.get("/requests/:userId", async (req, res) => {
  res.send(await requests.fetch(req.params["userId"]));
});
app.post("/requests/:userId", async (req, res) => {
  textBody(req, res, async function(err, body) {
    res.send(await requests.update(req.params["userId"], JSON.parse(body)));
  });
});

app.get("/reservations", async (req, res) => {
  res.send(await reservations.fetch());
});
app.post("/reservations", async (req, res) => {
  textBody(req, res, async function(err, body) {
    res.send(await reservations.update(JSON.parse(body)));
  });
});

app.get("/summary/:userId", async (req, res) => {
  res.send(await summary.fetch(req.params["userId"]));
});

app.get("/users", async (req, res) => {
  res.send(await users.fetch());
});

app.listen(port, () => console.log(`Mock API server running on port ${port}`));
