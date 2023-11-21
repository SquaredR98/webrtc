const shareScreen = async () => {
  const options = {
    video: true,
    audio: false,
    surfaceSwitching: 'include',
  };

  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia(options);
  } catch (error) {
    console.log(error);
  }

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
};
