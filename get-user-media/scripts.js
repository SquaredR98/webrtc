let stream = null; // Initialize stream globally so that it can be used anywhere
let mediaStream = null; // MediaStream var for screenshare
const videoEl = document.querySelector("#my-video");
const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
const constraints = {
  audio: true,
  video: true,
};

/**
 * Function to get access to MIC and CAMERA
 */
const getMicAndCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    changeButtons([
      "green",
      "blue",
      "blue",
      "grey",
      "grey",
      "grey",
      "grey",
      "grey",
    ]);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Function to throw the captured media onto video tag in browser
 */
const showMyFeed = () => {
  videoEl.srcObject = stream;
  const tracks = stream?.getTracks();
  // console.log(tracks);
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "blue",
    "grey",
    "grey",
    "blue",
  ]);
};

/**
 * Function to detach video/audio stream from the video tag
 */
const stopMyFeed = () => {
  const tracks = stream?.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  changeButtons([
    "blue",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
  ]);
};

const changeVideoSize = () => {
  stream.getVideoTracks().forEach(track => {
    const [height, width] = [document.querySelector("#vid-height").value, document.querySelector('#vid-width').value];
    console.log(height, width);
    const capabilities = track.getCapabilities();
    /**
     * This track is a video track
     * we can get the capabilities with the .getCapabilities()
     * or we can apply constraints with .applyConstraints()
     */
    const vConstraint = {
      height: {
        exact: height < capabilities.height.max ? height : capabilities.height.max
      },
      width : {
        exact: width < capabilities.width.max ? width : capabilities.width.max
      }
    }
    console.log(vConstraint);
    track.applyConstraints(vConstraint)
  })
  // stream.getTracks().forEach((track) => {
  //   const capabilities = track.getCapabilities();
  // });
};

document
  .querySelector("#share")
  .addEventListener("click", (e) => getMicAndCamera(e));
document
  .querySelector("#show-video")
  .addEventListener("click", (e) => showMyFeed(e));
document
  .querySelector("#stop-video")
  .addEventListener("click", (e) => stopMyFeed(e));
document
  .querySelector("#change-size")
  .addEventListener("click", (e) => changeVideoSize(e));
document
  .querySelector("#start-record")
  .addEventListener("click", (e) => startRecording(e));
document
  .querySelector("#stop-record")
  .addEventListener("click", (e) => stopRecording(e));
document
  .querySelector("#play-record")
  .addEventListener("click", (e) => playRecording(e));
document
  .querySelector("#share-screen")
  .addEventListener("click", (e) => shareScreen(e));
document
  .querySelector("#audio-input")
  .addEventListener("change", (e) => changeAudioInput(e));
document
  .querySelector("#audio-output")
  .addEventListener("change", (e) => changeAudioOutput(e));
document
  .querySelector("#video-input")
  .addEventListener("change", (e) => changeVideoInput(e));

/**
 * Change buttons colors based on the click events
 */
const buttonsById = [
  "share",
  "show-video",
  "stop-video",
  "change-size",
  "start-record",
  "stop-record",
  "play-record",
  "share-screen",
];

//buttonEls will be an array of dom elements in order of buttonsById
const buttonEls = buttonsById.map((buttonId) =>
  document.getElementById(buttonId)
);

const changeButtons = (colorsArray) => {
  colorsArray.forEach((color, i) => {
    buttonEls[i].classList.remove("btn-success");
    buttonEls[i].classList.remove("btn-primary");
    buttonEls[i].classList.remove("btn-secondary");
    buttonEls[i].classList.remove("btn-danger");
    if (color === "green") {
      buttonEls[i].classList.add("btn-success");
    } else if (color === "blue") {
      buttonEls[i].classList.add("btn-primary");
    } else if (color === "grey") {
      buttonEls[i].classList.add("btn-secondary");
    } else if (color === "red") {
      buttonEls[i].classList.add("btn-danger");
    }
  });
};
