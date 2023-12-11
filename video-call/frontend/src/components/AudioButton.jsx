import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateCallStatus } from "../store/slices/callStatus";
import { FaMicrophoneAlt, FaMicrophoneAltSlash } from "react-icons/fa";

export default function AudioButton({ callStatus }) {
  const dispatch = useDispatch();
  const streams = useSelector((state) => state.streams);
  let micText;
  if (callStatus.audio === "off") {
    micText = "Join Audio";
  } else if (callStatus.audio === "enabled") {
    micText = "Mute";
  } else {
    micText = "Unmute";
  }
  // Click Handler for
  const startOrStopAudio = () => {
    // 1. Check if the audio is enabled, if so disable it.
    if (callStatus.audio === "enabled") {
      dispatch(updateCallStatus({ key: "audio", value: "disabled" }));
      streams.localStream.stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    } else if (callStatus.audio === "disabled") {
      // 2. Check if the video is disabled, if so enable it.
      dispatch(updateCallStatus({ key: "audio", value: "enabled" }));
      streams.localStream.stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    } else {
      // 4. There are possibility, we don't have media, wait for the media and then enable it.
      // setPendingUpdate(true);
      startAudioStream(streams);
      dispatch(updateCallStatus({ key: "audio", value: "enabled" }));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className="w-16 flex justify-center items-center relative"
        onClick={startOrStopAudio}
      >
        {micText === "Unmute" ? (
          <FaMicrophoneAltSlash className="w-10 h-10 text-blue-600 hover:bg-white/10 rounded-full p-2" />
        ) : (
          <FaMicrophoneAlt className="w-10 h-10 rounded-full p-2 text-blue-600 hover:bg-white/10" />
        )}
      </button>
      <p className="text-gray-500 leading-none text-xs">{micText}</p>
    </div>
  );
}

// Function to update all peerConnection and update redux callStatus
function startAudioStream(streams, dispatch) {
  const localStream = streams.localStream;
  for (const stream in streams) {
    if (stream !== "localStream") {
      const currentStream = streams[stream];
      // Add tracks to all peerConnection
      localStream.stream.getAudioTracks().forEach((track) => {
        currentStream.peerConnection.addTrack(track, currentStream.stream);
      });
    }
  }
}
