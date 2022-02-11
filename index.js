module.exports = {
  socket: require("./utils/socket"),
  Res: require("./utils/api-response"),
  aws: require("./utils/aws"),
  validator: require("./utils/body-validation"),
  handler: require("./utils/handler"),
  query: require("./utils/query"),
  helper: require("./utils/helper"),
  server: require("./utils/server"),
  mailer: require("./utils/mail"),
  pubnub: require("./utils/pubnub"),
};
