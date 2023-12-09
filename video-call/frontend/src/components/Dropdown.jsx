import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import callStatus, { updateCallStatus } from "../store/slices/callStatus";
import { addStream } from "../store/slices/streamsSlice";

export default function Dropdown({
  icon,
  deviceType,
  audioDevice,
  videoDevice,
  localFeedEl,
}) {
  const dispatch = useDispatch();
  const [devices, setDevices] = useState(null);
  const changeDevice = (event) => {
    // 1. We need to get the desired video device
    const deviceId = event.target.value;
    // 2. We need to getUserMedia again (permission)
    const newConstraints =
      deviceType === "videoinput"
        ? {
            audio:
              audioDevice === "default"
                ? true
                : { deviceId: { exact: audioDevice } },
            video: { deviceId: { exact: deviceId } },
          }
        : {
            audio: { deviceId: { exact: deviceId } },
            video:
              videoDevice === "default"
                ? true
                : { deviceId: { exact: videoDevice } },
          };
    const stream = navigator.mediaDevices.getUserMedia(newConstraints);
    // 3. Update redux with the new device id
    if (deviceType === "videoinput") {
      dispatch(updateCallStatus({ key: "videoDevice", value: deviceId }));
      dispatch(updateCallStatus({ key: "video", value: "enabled" }));
      // 4. Update the localStream with new stream
      dispatch(addStream({ key: "localStream", value: { stream } }));
      // 5. Update the video feed it the device is video and add tracks
      const tracks = stream.getVideoTracks();
    } else if (deviceType === "audiooutput") {
      localFeedEl.current.setSinkId(deviceId);
    } else {
      dispatch(updateCallStatus({ key: "audioDevice", value: deviceId }));
      dispatch(updateCallStatus({ key: "video", value: "enabled" }));
      // 4. Update the localStream with new stream
      dispatch(addStream({ key: "localStream", value: { stream } }));
      // 5. Update the video feed it the device is video and add tracks
      const tracks = stream.getAudioTracks();
    }
  };

  const defaultValue = deviceType === "videoinput" ? videoDevice : audioDevice;

  useEffect(() => {
    const getDevicesAsync = async () => {
      const fetchedDevices = await getDevices(deviceType);
      setDevices(fetchedDevices);
    };
    getDevicesAsync();
  }, []);

  const Icon = icon;
  return (
    <div className="flex py-1">
      {<Icon className="text-3xl mr-2 text-blue-400" />}
      <select
        className="w-64 px-1 flex items-center outline-none rounded text-white/50 bg-black border border-white/50"
        name="video-select"
      >
        {devices?.map((device) => (
          <option
            key={device.deviceId}
            value={device.deviceId}
            defaultValue={defaultValue}
            onChange={changeDevice}
            className="flex items-center text-white"
          >
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function getDevices(deviceType) {
  return new Promise(async (resolve, reject) => {
    let devices = await navigator.mediaDevices.enumerateDevices();
    devices = devices.filter((d) => d.kind === deviceType);
    resolve(devices);
  });
}
