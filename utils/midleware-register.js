const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const user_agent = require("express-useragent");

module.exports = (app, { callback = () => {}, enable_access_log = true }) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(user_agent.express());
  app.use(fileupload());
  if (enable_access_log) {
    app.use(morgan("dev"));
  }
  callback();
};
