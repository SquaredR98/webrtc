import peerConfiguration from "./stunServers";

const createPeerConnection = (addIceCandidates) => {
  return new Promise(async (resolve, reject) => {
    // RTC Peer Connection -> Peer, May need more than one this time
    // Will get us ICE Candidates
    const peerConnection = await new RTCPeerConnection(peerConfiguration);

    const remoteStream = new MediaStream();

    peerConnection.addEventListener('signalingstatechange', event => {
      console.log('Signaling Success');
    })

    peerConnection.addEventListener('icecandidate', event => {
      console.log('Found Ice Candidates');
      if(event.candidate) {
        // Emit to socket server
        addIceCandidates(event.candidate);
      }
    })

    peerConnection.addEventListener('track', event => {
      console.log('Got a track from peer connection');
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track, remoteStream);
        console.log('Added Streams to Remote');
      })
    })

    resolve({
      peerConnection,
      remoteStream
    })
  })
}

export default createPeerConnection;