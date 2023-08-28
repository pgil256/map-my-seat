"use strict";

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const HOSTNAME = process.env.HOSTNAME || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost");

const PORT = +process.env.PORT || 3000;

//Automates URI to correct db URI based on whether in testing env or not
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "seating_test"
    : process.env.DATABASE_URL || "seating";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  target: "node",
};
