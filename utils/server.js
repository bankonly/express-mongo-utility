require("dotenv").config()

const express = require("express")
const app = express()
const cors = require("cors");
const fileupload = require("express-fileupload");
const morgan = require("morgan");
const { initSocket } = require("./socket")


const appMiddlewareRegister = (app) => (option = { enableAccessLog: true, callback: () => { } }) => {
    option = { enableAccessLog: true, callback: () => { }, ...option }
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(fileupload());
    if (option.enableAccessLog) {
        app.use(morgan("dev"));
    }
    option.callback(app)
};

app.get("/", (req, res) => res.json("Server is running"))

function listener({ port, callback, enableSocket = true }) {
    const _listener = app.listen(port, callback)
    if (enableSocket) {
        initSocket(_listener)
    }
    return _listener
}

module.exports = {
    appMiddlewareRegister,
    listener,
    app,
    router:express.Router()
}


