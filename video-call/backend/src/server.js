const { readFileSync } = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const { info } = require('console');

const app = express();

app.use(cors({ allowedHeaders: "*", origin: "*" }));
app.use(express.json());

const expressServer = http.createServer(app);
const io = socketio(expressServer, {
  cors: ['https://localhost:5173']
})


expressServer.listen('5000', () => {
  info(`[${new Date().toUTCString()}]: SERVER - Server Listening on PORT 5000`)
})

module.exports = { io, expressServer, app }
