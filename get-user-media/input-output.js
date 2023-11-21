const audioInputEl = document.querySelector("#audio-input");
const audioOutputEl = document.querySelector("#audio-output");
const videoInputEl = document.querySelector("#video-input");

const getDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.label = device.label;
      if (device.kind === "audioinput") {
        audioInputEl.appendChild(option);
      } else if (device.kind === "audiooutput") {
        audioOutputEl.appendChild(option);
      } else if (device.kind === "videoinput") {
        videoInputEl.appendChild(option);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const changeAudioInput = async (e) => {
  const deviceId = e.target.value;
  const newConstraints = {
    audio: {
      deviceId: {
        exact: deviceId,
      },
    },
    video: true
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(newConstraints);
    const tracks = stream.getAudioTracks();
    console.log(tracks);
  } catch (error) {
    console.log(error);
  }
};
const changeAudioOutput = async (e) => {
  await videoEl.setSinkId(e.target.value);
  console.log("Changed audio device");
};
const changeVideoInput = async (e) => {
  const deviceId = e.target.value;
  const newConstraints = {
    audio: true,
    video: {
      deviceId: {
        exact: deviceId,
      },
    }
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(newConstraints);
    const tracks = stream.getVideoTracks();
    console.log(tracks);
  } catch (error) {
    console.log(error);
  }
};

getDevices();
