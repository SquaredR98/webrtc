import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FcEndCall, FcSpeaker, FcVideoCall } from "react-icons/fc";
import { AiOutlineAudio } from "react-icons/ai";
import { updateCallStatus } from "../store/slices/callStatus";
import { PiChatsCircle } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { addStream } from "../store/slices/streamsSlice";
import createPeerConnection from "../utils/createPeerConnection";
import VideoButton from "../components/VideoButton";
import Dropdown from "../components/Dropdown";
import AudioButton from "../components/AudioButton";
import socketConnection from "../utils/socketConnection";

export default function MainVideo() {
  const dispatch = useDispatch();
  // Getting token from query string
  const [searchParams, setSearchParams] = useSearchParams();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const localFeedEl = useRef(null);
  const remoteFeedEl = useRef(null);
  const user = useSelector((state) => state.userState.user);

  console.log(callStatus);

  const handleCallDisconnect = () => {
    dispatch(updateCallStatus({ value: "completed", key: "current" }));
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const constraints = {
          video: true,
          audio: true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        dispatch(updateCallStatus({ key: "haveMedia", value: true }));
        dispatch(addStream({ key: "localStream", value: { stream } }));
        // dispatch(updateCallStatus({ key: "video", value: 'enabled' }));
        // dispatch(updateCallStatus({ key: "audio", value: 'enabled' }));
        const { peerConnection, remoteStream } = await createPeerConnection();
        // We don't know whom we are gonna talk to
        dispatch(
          addStream({
            key: "remoteStream",
            value: { stream: remoteStream, peerConnection },
          })
        );

        // Time to make an offer (SDP, ICE Candidate)
      } catch (error) {}
    };
    fetchMedia();
  }, []);

  useEffect(() => {
    const createOffer = async () => {
      for (const stream in streams) {
        try {
          if (stream !== "localStream") {
            const pc = streams[stream].peerConnection;
            const offer = await pc.createOffer();
            console.log("OFFER", offer);
            const socket = socketConnection(localStorage.getItem('token'));
            socket.emit("newOffer", { offer, user, offeredTo: callStatus.offeredTo });
          }
        } catch (error) {
          console.log(error);
        }
      }
      dispatch(updateCallStatus({ key: 'haveCreatedOffer', value: true }));
    };
    if (
      callStatus.video === "enabled" &&
      callStatus.audio === "enabled" &&
      !callStatus.haveCreatedOffer
    ) {
      // With audio and video we can now make an offer
      console.log("REACHING HERE");
      createOffer();
    }
  }, [callStatus.audio, callStatus.video, callStatus.haveCreatedOffer]);

  useEffect(() => {
    const token = searchParams.get("token");
    const fetchDecodedToken = async () => {};
  }, []);

  return (
    <div className="relative">
      <div className="w-full h-screen relative">
        <h3 className="my-2 mx-2 text-white absolute top-5 left-5 z-[10]">
          Remote Video
        </h3>
        <video
          id="remote"
          autoPlay
          playsInline
          ref={remoteFeedEl}
          className="w-full h-screen bg-black"
        />
      </div>
      <div className="absolute w-96 h-56 bottom-10 right-5 border border-gray-700 shadow-lg shadow-gray-700 rounded-lg">
        <h3 className="absolute shadow-lg my-2 mx-2 text-white">Local Video</h3>
        <video
          ref={localFeedEl}
          id="local"
          autoPlay
          playsInline
          muted
          className="rounded-lg w-full h-full"
        />
      </div>
      <div className="absolute bottom-5 left-5">
        <Dropdown
          icon={FcVideoCall}
          deviceType="videoinput"
          audioDevice={callStatus.audioDevice}
          videoDevice={callStatus.videoDevice}
          localFeedEl={localFeedEl}
        />
        <Dropdown
          icon={AiOutlineAudio}
          deviceType="audioinput"
          audioDevice={callStatus.audioDevice}
          videoDevice={callStatus.videoDevice}
          localFeedEl={localFeedEl}
        />
        <Dropdown
          icon={FcSpeaker}
          deviceType="audiooutput"
          audioDevice={callStatus.audioDevice}
          videoDevice={callStatus.videoDevice}
          localFeedEl={localFeedEl}
        />
      </div>
      <div className="absolute left-[50%] -translate-x-[50%] bottom-5 bg-black shadow-md shadow-gray-800 px-8 py-2 rounded-full border border-gray-600 flex">
        <AudioButton callStatus={callStatus} localFeedEl={localFeedEl} />
        <VideoButton callStatus={callStatus} localFeedEl={localFeedEl} />
        <button
          className="w-16 flex justify-center items-center"
          onClick={handleCallDisconnect}
        >
          <PiChatsCircle className="text-2xl w-10 h-10 rounded-full p-1 text-blue-700 hover:cursor-pointer hover:bg-white/10" />
        </button>
        <button
          className="w-16 flex justify-center items-center"
          onClick={handleCallDisconnect}
        >
          <FcEndCall className="text-4xl w-10 h-10 p-2 hover:cursor-pointer hover:bg-white/10 rounded-full" />
        </button>
      </div>
    </div>
  );
}
