const { info, log } = require("console");
const { io } = require("./server");
const jwt = require("jsonwebtoken");
const { v4: uuidV4 } = require("uuid");
const { users, connectedUsers } = require("./data");
// const  = require('./server');

let allKnownOffers = {};

io.on("connection", (socket) => {
  info(
    `[${new Date().toUTCString()}]: SOCKET - Socket Id ${
      socket.id
    } connected successfully`
  );
  // Fetching Auth token here
  const token = socket.handshake.auth.token;

  // Conditional on token
  try {
    const loggedInUser = jwt.verify(token, "forbiddenKeyDoNotShare");
    const loggedInUserExistsInConnectedUser = connectedUsers.find(
      (user) => user.username === loggedInUser.username
    );
    if (loggedInUserExistsInConnectedUser) {
      const userIndex = connectedUsers.findIndex(
        (user) => user.username === loggedInUser.username
      );
      const newUserConnectedIndex = users.findIndex(
        (user) => user.username === loggedInUser.username
      );
      connectedUsers[userIndex].socketId = socket.id;
      users[newUserConnectedIndex].online = true;
    } else {
      connectedUsers.push({ socketId: socket.id, ...loggedInUser });
    }
    socket.broadcast.emit("login", users);
    socket.emit("login", users);

  } catch (err) {
    socket.disconnect();
    return;
  }

  for(const key in allKnownOffers) {
    if(allKnownOffers[key].answererUsername === loggedInUser.username) {
      io.to(socket.id).emit('newOfferAwaiting', allKnownOffers[key]);
    }
  }

  socket.on("newOffer", ({ offer, offerFrom, offeredTo }) => {
    // offer => sdp/type, apptInfo has the uuid that we can add to allKnownOffers
    // So that the answerer can find the right offer
    const newOfferId = uuidV4();
    console.log("NEW OFFER", offer, callInfo);
    allKnownOffers[newOfferId] = {
      offer,
      offererUsername: offerFrom.username,
      offererIceCandidates: [],
      answer: null,
      answererUsername,
      answererIceCandidates: [],
    };
    // Donot emit to everyone, only the user called
    const respondTo = connectedUsers.find(
      (user) => user.username === offeredTo.username
    );

    if (respondTo) {
      const socketIdToRespond = respondTo.socketId;
      socket
        .to(socketIdToRespond)
        .emit("offerAwaiting", allKnownOffers[newOfferId]);
    }
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECT:", socket.rooms);
  });
});
