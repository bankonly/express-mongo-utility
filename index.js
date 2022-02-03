module.exports = {
  env_example: require("./env.json"),
  query: require("./utils/mongo"),
  validator: require("./utils/validator"),
  Res: require("./utils/api-response"),
  common: require("./utils/common"),
  socket: require("./utils/socket"),
  discord: require("./utils/discord"),
  listen: require("./utils/listener"),
  aws: require("./utils/aws"),
  middle: require("./utils/midleware-register"),
  discord: require("./utils/discord"),
};
