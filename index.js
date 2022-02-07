module.exports = {
    socket: require("./utils/socket"),
    Res: require("./utils/api-response"),
    aws: require("./utils/aws"),
    validator: require("./utils/body-validation"),
    handler: require("./utils/handler"),
    query: require("./utils/query"),
    helper: require("./utils/helper"),
    server: require("./utils/server")
}