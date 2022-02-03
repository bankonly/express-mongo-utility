const Res = require("async-api-response");
const mongoose = require("mongoose");

const middle = (_mongoose) =>
  function (handler, option = { use_transaction: false, enable_logger: false, log_err: false }) {
    if (!_mongoose) _mongoose = mongoose;
    option = { use_transaction: false, enable_logger: false, ...option };
    if (use_transaction) {
      return async (req, res, next) => {
        const session = await _mongoose.startSession();
        session.startTransaction();
        const resp = new Res(res);
        try {
          const opts = { session };
          async function commit() {
            await session.commitTransaction();
            session.endSession();
          }
          await handler(req, res, next, opts, commit);
        } catch (ex) {
          if (log_err) console.log(ex);
          await session.abortTransaction();
          session.endSession();
          return resp.catch({ error: ex });
        }
      };
    } else {
      return async (req, res, next) => {
        const resp = new Res(res);
        try {
          await handler(req, res, next);
        } catch (ex) {
          if (log_err) console.log(ex);
          return resp.catch({ error: ex });
        }
      };
    }
  };

module.exports = middle;
