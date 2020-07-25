const jsonWebToken = require("jsonwebtoken");

const roles = {
  TeamLeader: "TeamLeader",
  UserAdmin: "UserAdmin"
};

const userHasId = (request, userId) => {
  const token = getToken(request);
  return token["cognito:username"] && token["cognito:username"] === userId;
};

const userHasRole = (request, role) => {
  const token = getToken(request);
  return token["cognito:groups"] && token["cognito:groups"].includes(role);
};

const getToken = request => {
  const raw = request.headers.authorization;
  return jsonWebToken.decode(raw);
};

module.exports = {
  roles,
  userHasId,
  userHasRole,
};
