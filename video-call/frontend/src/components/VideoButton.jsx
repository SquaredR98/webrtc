import React, { useEffect, useState } from "react";
import { FcCancel, FcVideoCall, FcNoVideo } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { updateCallStatus } from "../store/slices/callStatus";

export default function VideoButton({ callStatus, localFeedEl }) {
  const dispatch = useDispatch();
  // Fetch Media Streams from Redux
  const streams = useSelector((state) => state.streams);

  // Status to track whether the feed has been loaded or not
  const [pendingUpdate, setPendingUpdate] = useState(false);

  // Click Handler for
  const startOrStopVideo = () => {
    // 1. Check if the video is enabled, if so disable it.
    if (callStatus.video === "enabled") {
      dispatch(updateCallStatus({ key: "video", value: "disabled" }));
      streams.localStream.stream.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
    } else if (callStatus.video === "disabled") {
      // 2. Check if the video is disabled, if so enable it.
      dispatch(updateCallStatus({ key: "video", value: "enabled" }));
      streams.localStream.stream.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
    } else if (callStatus.haveMedia) {
      // 3. Check to see if we have media, if yes then start the stream
      // We have media show feed
      localFeedEl.current.srcObject = streams.localStream.stream;
      // Add tracks to the peerConnection
      startLocalVideoStream(streams, dispatch);
    } else {
      // 4. There are possibility, we don't have media, wait for the media and then enable it.
      setPendingUpdate(true);
    }
  };
  useEffect(() => {
    // This useEffect will run whenever we get streams updated
    if (pendingUpdate && callStatus.haveMedia) {
      setPendingUpdate(false);
      localFeedEl.current.srcObject = streams.localStream.stream;
      startLocalVideoStream(streams, dispatch);
    }
  }, [pendingUpdate, callStatus.haveMedia]);

  let videoText = callStatus.video === "enabled" ? "Disable" : "Enable";

  return (
    <div className="flex flex-col items-center">
      <button
        className="w-16 flex justify-center items-center relative"
        onClick={startOrStopVideo}
      >
        {videoText == "Disable" ? (
          <FcNoVideo className="text-2xl w-10 h-10 rounded-full p-2 text-blue-400 hover:cursor-pointer hover:bg-white/10" />
        ) : (
          <FcVideoCall className="text-2xl w-10 h-10 rounded-full p-2 text-blue-400 hover:cursor-pointer hover:bg-white/10" />
        )}
      </button>
      <p className="text-gray-500 leading-none text-xs">{videoText}</p>
    </div>
  );
}

// Function to update all peerConnection and update redux callStatus
function startLocalVideoStream(streams, dispatch) {
  const localStream = streams.localStream;
  for (const stream in streams) {
    if (stream !== "localStream") {
      const currentStream = streams[stream];
      // Add tracks to all peerConnection
      localStream.stream.getVideoTracks().forEach((track) => {
        currentStream.peerConnection.addTrack(track, currentStream.stream);
      });
      // Update Redux Call Status
      dispatch(updateCallStatus({ value: "enabled", key: "video" }));
    }
  }
}
