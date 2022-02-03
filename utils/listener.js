const express = require("express");
const app = express();

const start = ({ port, callback = () => {} }) => {
  port = port || process.argv[2] || process.env.APP_PORT || 45678;
  const app_listen = app.listen(port, callback);
  callback(app_listen);
};

module.exports = {
  start,
  app,
  express,
};
