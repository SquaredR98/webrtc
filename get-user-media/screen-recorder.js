let mediaRecorder, recordedBlobs;

const startRecording = (e) => {
  console.log('Recording Started');
  recordedBlobs = [];     // Array to hold the blobs for playback
  mediaRecorder = stream && new MediaRecorder(stream);    // 
  mediaRecorder.ondataavailable = e => {
    // Available when stream ends
    console.log('Stream ends pushing started');
    recordedBlobs.push(e.data);
  }
  mediaRecorder.start();
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "blue",
    "grey",
    "blue",
  ]);
}

const stopRecording = (e) => {
  console.log('Recording Stopped');
  mediaRecorder?.stop();
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "green",
    "blue",
    "blue",
  ]);
}

const playRecording = (e) => {
  const superBuffer = recordedBlobs && new Blob(recordedBlobs);
  const recordedVideoEl = document.querySelector('#other-video');
  recordedVideoEl.src = window.URL.createObjectURL(superBuffer);
  recordedVideoEl.controls = true;
  recordedVideoEl.play();
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "green",
    "green",
    "blue",
  ]);
}