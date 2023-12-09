import peerConfiguration from "./stunServers";

const createPeerConnection = () => {
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
      }
    })
    resolve({
      peerConnection,
      remoteStream
    })
  })
}

export default createPeerConnection;