const jwt = require("jsonwebtoken");

const roles = {
  TeamLeader: "TeamLeader",
  UserAdmin: "UserAdmin"
};

const checkUserHasRole = (request, role) => {
  const raw = request.headers["Authorization"];
  const decoded = jwt.decode(raw);

  if (!decoded["cognito:groups"] || !decoded["cognito:groups"].includes(role)) {
    throw { reason: "Forbidden", message: "Forbidden" };
  }
};

module.exports = { roles, checkUserHasRole };
