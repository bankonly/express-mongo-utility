require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const fileupload = require("express-fileupload");
const morgan = require("morgan");
const { initSocket } = require("./socket");
const { mailConfig } = require("./mail");

const appMiddlewareRegister =
  (app) =>
  (option = { enableAccessLog: true, callback: () => {} }) => {
    option = { enableAccessLog: true, callback: () => {}, ...option };
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(fileupload());
    if (option.enableAccessLog) {
      app.use(morgan("dev"));
    }
    option.callback(app);
  };

app.get("/", (req, res) => res.json("Server is running"));

function listener({ port, callback, enableSocket = true, enableMailer = false }) {
  const _listener = app.listen(port, callback);
  if (enableSocket) {
    initSocket(_listener);
  }

  if (enableMailer) {
    mailConfig({ email: process.env.MAILER_EMAIL, service: process.env.MAILER_SERVICE, password: process.env.MAILER_PASS });
  }

  return _listener;
}

module.exports = {
  appMiddlewareRegister,
  listener,
  app,
  router: express.Router(),
};
