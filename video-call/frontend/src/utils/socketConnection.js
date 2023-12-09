import { io } from "socket.io-client";

let socket;

export default (token) =>
  socket && socket.connected
    ? socket
    : (socket = io("http://localhost:5000", { auth: { token } }));
