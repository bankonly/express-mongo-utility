const socketIo = require("socket.io");

let io;
let socketClient;

exports.initSocket = (server, channel = "connect", msg = "connected") => {
  io = socketIo(server);
  io.on(channel, function (_socketClient) {
    socketClient = _socketClient;
    console.log(socketClient);
    console.log(msg);
  });
  return io;
};

exports.socket = () => {
  if (!io) throw new Error("uninitialize socket");
  return io;
};
