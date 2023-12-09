const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");
const username = `user-${Math.floor(Math.random() * 100000000)}`;
const password = Math.floor(Math.random() * 100000000000000);
let didIOffer = false;

const socket = io.connect("https://5568-180-151-95-170.ngrok-free.app", {
  auth: {
    username,
    password,
  },
});
document.querySelector("#user-name").innerText = username;
let localStream, remoteStream, peerConnection;

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const call = async (e) => {
  // Fetching user media
  await fetchUserMedia();
  // Peer connection established
  await createPeerConnection();
  try {
    console.log("Creating Offer");
    // An offer has been created
    const offer = await peerConnection.createOffer();
    // Setting local description
    peerConnection.setLocalDescription(offer);
    // Var to signify whether the user is an initiater or answerer
    didIOffer = true;
    // Emitting the offer created so far
    socket.emit("newOffer", offer);
  } catch (error) {
    console.log(error);
  }
};

const addAnswer = async (offerObj) => {
  // it is called in the socketListener when an answerResponse is emitted.
  // At this point, the offer and answer have been exchanged
  // Now client1 needs to set the remote description
  await peerConnection.setRemoteDescription(offerObj.answer);
}

const answerOffer = async (offer) => {
  await fetchUserMedia();
  await createPeerConnection(offer);
  const answer = await peerConnection.createAnswer({});
  peerConnection.setLocalDescription(answer);
  offer.answer = answer;
  const offerIceCandidate = await socket.emitWithAck('newAnswer', offer);
  offerIceCandidate.forEach(candidate => {
    peerConnection.addIceCandidate(candidate);
    console.log("Added Ice Candidate");
  })

};

const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localVideoEl.srcObject = stream;
      localStream = stream;
      resolve();
    } catch (error) {
      console.log(error);
      reject();
    }
  });
};

const createPeerConnection = async (offerObj) => {
  return new Promise(async (resolve, reject) => {
    // RTC Peer connection is the thing that creates a connection where we can pass config object
    // which contains stun servers which will fetch us ICE candidates
    peerConnection = await new RTCPeerConnection(peerConfiguration);
    remoteStream = new MediaStream();
    remoteVideoEl.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
      // Add local tracks so that they can be sent to remote
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener('signalingstatechange', event => {
      console.log(event);
    })

    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket.emit("sendIceCandidateToSignalingServer", {
          iceCandidate: event.candidate,
          iceUsername: username,
          didIOffer,
        });
      }
    });

    peerConnection.addEventListener('track', event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      })
    })

    if(offerObj) {
      peerConnection.setRemoteDescription(offerObj.offer);
    }
    resolve();
  });
};

const addNewIceCandidate = (iceCandidate) => {
  peerConnection.addIceCandidate(iceCandidate);
}

document.querySelector("#call").addEventListener("click", call);
document.getElementById('hangup').addEventListener("click", () => {
  
})
