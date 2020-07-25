const jsonWebToken = require("jsonwebtoken");

const roles = {
  TeamLeader: "TeamLeader",
  UserAdmin: "UserAdmin"
};

const userHasId = (request, userId) => {
  const token = getToken(request);
  return token["cognito:username"] && token["cognito:username"] === userId;
};

const checkUserHasId = (request, userId) => {
  if (!userHasId(request, userId)) {
    throw { reason: "Forbidden", message: "Forbidden" };
  }
};

const userHasRole = (request, role) => {
  const token = getToken(request);
  return token["cognito:groups"] && token["cognito:groups"].includes(role);
};

const checkUserHasRole = (request, role) => {
  if (!userHasRole(request, role)) {
    throw { reason: "Forbidden", message: "Forbidden" };
  }
};

const checkUserHasRoleOrId = (request, userId, role) => {
  if (!userHasRole(request, role) && !userHasId(request, userId)) {
    throw { reason: "Forbidden", message: "Forbidden" };
  }
};

const getToken = request => {
  const raw = request.headers["Authorization"];
  return jsonWebToken.decode(raw);
};

module.exports = {
  roles,
  checkUserHasId,
  checkUserHasRole,
  checkUserHasRoleOrId
};
