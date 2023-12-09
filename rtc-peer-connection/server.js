const https = require("https");
const express = require("express");
const socketio = require("socket.io");
const { readFileSync } = require("fs");
const app = express();

app.use(express.static(__dirname));

const key = readFileSync("cert.key");
const cert = readFileSync("cert.crt");

const expressServer = https.createServer({ key, cert }, app);
const io = socketio(expressServer);

expressServer.listen(9000, () => {
  console.log("Server listening on PORT: 9000");
});

/**
 * Contains a list of
 * {
 *    offerUsername
 *    offer
 *    offererIceCandidate
 *    answererUsername
 *    answer
 *    answererIceCandidate
 * }
 */
const offers = [];
// An array to track all the connected sockets to the server
const connectedSockets = [];

io.on("connection", (socket) => {
  const { username, password } = socket.handshake.auth;
  connectedSockets.push({ socketId: socket.id, username });

  // A new client has joined. If there are any offers available, 
  // emit them out
  if (offers.length) {
    socket.emit("availableOffers", offers);
  }

  socket.on("newOffer", (newOffer) => {
    offers.push({
      offererUsername: username,
      offer: newOffer,
      offerIceCandidates: [],
      answererUsername: null,
      answer: null,
      answererIceCandidates: [],
    });

    // Send out the offer to all connected sockets except the caller
    console.log('NEW OFFER', offers);
    socket.broadcast.emit("newOfferAwaiting", offers.slice(-1));
  });

  socket.on("newAnswer", (offerObj, ackFunction) => {
    const socketToAnswer = connectedSockets.find(
      (s) => s.username === offerObj.offererUsername
    );
    if (!socketToAnswer) {
      console.log('No matching socket');
      return;
    }
    // Found matching socket, so we can emit to it
    const socketIdToAnswer = socketToAnswer.socketId;
    // Found the offer to update so we can emit it
    const offerToUpdate = offers.find(
      (o) => o.offererUsername === offerObj.offererUsername
    );
    if (!offerToUpdate) {
      console.log("No offer to update");
      return;
    }
    // Send back to answerer all the ice candidate
    ackFunction(offerToUpdate.offerIceCandidates);
    offerToUpdate.answer = offerObj.answer;
    offerToUpdate.answererUsername = username;
    // .to allows socket to emit to a particular room only
    socket.to(socketIdToAnswer).emit("answererResponse", offerToUpdate);
  });

  socket.on("sendIceCandidateToSignalingServer", (iceCandidateObj) => {
    console.log(iceCandidateObj);
    const { didIOffer, iceCandidate, iceUsername } = iceCandidateObj;
    if (didIOffer) {
      // This runs when it comes from offerer or caller and send to answerer
      const offerInOffers = offers.find((o) => o?.offererUsername === iceUsername);
      if (offerInOffers) {
        offerInOffers?.offerIceCandidates.push(iceCandidate);
        const socketToSendTo = connectedSockets?.find(
          (s) => s.username === offerInOffers.answererUsername
        );
        if (socketToSendTo) {
          socket
            .to(socketToSendTo?.socketId)
            .emit("receivedIceCandidateFromServer", iceCandidate);
        } else {
          console.log("Ice candidate received but could not find answerer");
        }
      }
    } else {
      // This runs when it comes from answerer or receiver and send to caller
      const offerInOffers = offers?.find((o) => o?.answererUsername === iceUsername);
      console.log(offerInOffers, offers);
      const socketToSendTo = connectedSockets?.find(
        (s) => s?.username === offerInOffers?.offererUsername
      );
      console.log(socketToSendTo);
      if (socketToSendTo) {
        socket
          .to(socketToSendTo?.socketId)
          .emit("receivedIceCandidateFromServer", iceCandidate);
      } else {
        console.log("Ice candidate received but could not find offerer");
      }
    }
  });
});

console.log(connectedSockets);
