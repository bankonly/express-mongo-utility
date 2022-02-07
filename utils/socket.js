const socketIo = require("socket.io");

let io;

exports.initSocket = (server, channel = "connect", msg = "connected") => {
  io = socketIo(server);
  io.on(channel, () => console.log(msg));
  return io;
};

exports.socket = () => {
  if (!io) throw new Error("uninitialize socket");
  return io;
};
