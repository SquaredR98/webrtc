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
    console.log('LOGGED IN USER', loggedInUserExistsInConnectedUser, connectedUsers);
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

    for (const key in allKnownOffers) {
      if (allKnownOffers[key].answererUsername === loggedInUser.username) {
        io.to(socket.id).emit("newOfferAwaiting", allKnownOffers[key]);
      }
    }
  } catch (err) {
    socket.disconnect();
    return;
  }

  socket.on("newAnswer", ({ answer, offerId, answeredBy, answeredTo }) => {
    // Emitting to client
    const socketToSendTo = connectedUsers.find(
      (user) => user.username === answeredTo.username
    );
    if (socketToSendTo) {
      socket
        .to(socketToSendTo.socketId)
        .emit("answerToClient", { answer, offerId, answeredBy, answeredTo });
    }
    const knownOffer = allKnownOffers[offerId];
    if (knownOffer) {
      knownOffer.answer = answer;
    }
  });

  socket.on("newOffer", ({ offer, offerFrom, offeredTo }) => {
    // offer => sdp/type, apptInfo has the uuid that we can add to allKnownOffers
    // So that the answerer can find the right offer
    const newOfferId = uuidV4();
    // console.log("NEW OFFER", offer, offerFrom, offeredTo);
    allKnownOffers[newOfferId] = {
      offer,
      offerer: offerFrom,
      offererIceCandidates: [],
      answer: null,
      answerer: offeredTo,
      answererIceCandidates: [],
    };
    // console.log(allKnownOffers);
    // Donot emit to everyone, only the user called
    const respondTo = connectedUsers.find(
      (user) => user.username === offeredTo.username
    );

    if (respondTo) {
      const socketIdToRespond = respondTo.socketId;
      socket.to(socketIdToRespond).emit("offerAwaiting", {
        offer: allKnownOffers[newOfferId],
        newOfferId,
      });
    }
    socket.emit("receiveOfferId", newOfferId);
  });

  socket.on('getIce', (uuid, user, ackFunc) => {
    const offer = allKnownOffers[uuid];
    let iceCandidates = [];
    if(offer) {
      if(offer.offerer.username === user.username) {
        iceCandidates = offer.offererIceCandidates;
      } else if (offer.answerer.username === user.username) {
        iceCandidates = offer.answererIceCandidates;
      }
    }

    ackFunc(iceCandidates);
  })

  socket.on("iceToServer", ({ iceCandidates, offerId, who }) => {
    const offerToUpdate = allKnownOffers[offerId];
    if (offerToUpdate) {
      if (offerToUpdate.offerer.username === who.username) {
        offerToUpdate.offererIceCandidates.push(iceCandidates);
      } else {
        offerToUpdate.answererIceCandidates.push(iceCandidates);
      }
      const socketToSendTo = connectedUsers.find(cu => cu.username === who.username);
      console.log(socketToSendTo);
      if(socketToSendTo) {
        console.log('ICE TO CLIENT');
        socket.to(socketToSendTo.socketId).emit('iceToClient', iceCandidates);
      } 
    }
  });

  socket.on("disconnect", () => {
    // console.log("DISCONNECT:", socket.rooms);
  });
});
