"use strict";

const app = require("./app");
const { PORT, HOSTNAME } = require("./config");

app.listen(PORT, HOSTNAME, function () {
  console.log(`Started on http://${HOSTNAME}:${PORT}`);
});
