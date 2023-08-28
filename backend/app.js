"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const classroomsRoutes = require("./routes/classrooms");
const periodsRoutes = require("./routes/periods");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);
app.set('etag', false)

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/classrooms", classroomsRoutes);
app.use("/periods", periodsRoutes);

//404 Error handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

//Generic error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});



module.exports = app;
