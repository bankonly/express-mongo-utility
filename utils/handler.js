const Res = require("./api-response");
const { router: app, app: expressApp } = require("./server");

const method = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const handler = (mongoose) =>
  function (handler, { path = null, middleware = [], enableTransaction = false, enableLog = false }) {
    let _path = null;
    let _method = null;
    if (path) {
      let split_path = path.toString().split(".");
      if (split_path.length < 2) throw new Error(`Invalid path ex: GET.login`);
      _path = "/" + split_path[1];
      _method = split_path[0];

      if (!method.includes(_method)) throw new Error(`Invalid method "GET", "POST", "PUT", "PATCH","DELETE"`);
    }

    if (enableTransaction) {
      if (!mongoose) throw new Error(`enableTransaction required mongoose instance`);

      const handlerAPITransaction = async (req, res, next) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        const resp = new Res(res);
        try {
          for (let i = 0; i < middleware.length; i++) await middleware[i](req, res, next);
          const opts = { session };
          async function commit() {
            await session.commitTransaction();
            session.endSession();
          }
          await handler({ req, res, next, opts, commit, resp, body: req.body, params: req.params, query: req.query, headers: req.headers });
        } catch (ex) {
          if (enableLog) console.log(ex);
          await session.abortTransaction();
          session.endSession();
          return resp.catch({ error: ex });
        }
      };

      if (path) {
        expressApp.use(handlerSwitchCase(_method, _path, middleware, handlerAPITransaction));
      }

      return handlerAPITransaction;
    } else {
      const handlerAPI = async (req, res, next) => {
        const resp = new Res(res);
        try {
          for (let i = 0; i < middleware.length; i++) await middleware[i](req, res, next);
          await handler({ req, res, next, resp, body: req.body, params: req.params, query: req.query, headers: req.headers });
        } catch (ex) {
          if (enableLog) console.log(ex);
          return resp.catch({ error: ex });
        }
      };

      if (path) {
        handlerSwitchCase(_method, _path, middleware, handlerAPI);
      }

      return handlerAPI;
    }
  };

function handlerSwitchCase(_method, _path, middleware, handlerAPI) {
  if (_method === "POST") {
    return expressApp.post(_path, handlerAPI);
  }
  if (_method === "PUT") {
    return expressApp.put(_path, handlerAPI);
  }
  if (_method === "PATCH") {
    return expressApp.patch(_path, handlerAPI);
  }
  if (_method === "DELETE") {
    return expressApp.delete(_path, handlerAPI);
  }
  return expressApp.get(_path, handlerAPI);
}

module.exports = handler;
