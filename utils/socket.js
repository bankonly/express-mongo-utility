const socketIo = require("socket.io");

let io;
let io_client;

exports.init_socket = (server, { channel = "connect", msg = "connected", option = {} }) => {
  io = socketIo(server, option);
  io.on(channel, (socket) => {
    io_client = socket;
    console.log(message);
  });
  return io;
};

exports.io = () => {
  if (!io) throw new Error("unregistered io");
  return io;
};

exports.io_client = () => {
  if (!io_client) throw new Error("unregistered io_client");
  return io_client;
};
