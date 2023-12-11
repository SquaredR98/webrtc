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
import { fetchLocalStorage } from "../utils/localStorage";

export default function MainVideo() {
  const dispatch = useDispatch();
  // Getting token from query string
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const localFeedEl = useRef(null);
  const remoteFeedEl = useRef(null);
  const offerId = useRef(null);
  const streamsRef = useRef(null);
  const user = fetchLocalStorage("user");

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
        const { peerConnection, remoteStream } = await createPeerConnection(
          addIceCandidates
        );
        // We don't know whom we are gonna talk to
        dispatch(
          addStream({
            key: "remoteStream",
            value: { stream: remoteStream, peerConnection },
          })
        );
        remoteFeedEl.current.srcObject = remoteStream
        // Time to make an offer (SDP, ICE Candidate)
      } catch (error) {}
    };
    fetchMedia();
  }, []);

  useEffect(() => {
    const setAsyncOffer = async () => {
      try {
        for (const stream in streams) {
          if (stream !== "localStream") {
            const pc = streams[stream].peerConnection;
            await pc.setRemoteDescription(callStatus.offer.offer.offer);
          }
        }
      } catch (error) {
        console.log("ERROR", error);
      }
    };
    if (
      callStatus.offer &&
      streams.remoteStream &&
      streams.remoteStream.peerConnection
    ) {
      setAsyncOffer();
    }
  }, [callStatus.offer, streams.remoteStream]);

  useEffect(() => {
    const socket = socketConnection(localStorage.getItem("token"));
    const createOffer = async () => {
      for (const stream in streams) {
        try {
          if (stream !== "localStream" && user && callStatus.offeredTo) {
            const pc = streams[stream].peerConnection;
            const offer = await pc.createOffer();
            pc.setLocalDescription(offer);
            socket.emit("newOffer", {
              offer,
              offerFrom: user,
              offeredTo: callStatus.offeredTo,
            });
            socket.on("receiveOfferId", (offerIdFromServer) => {
              offerId.current = offerIdFromServer;
            });
            socket.on("answerToClient", (answer) => {
              dispatch(updateCallStatus({ key: "answer", value: answer }));
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
      dispatch(updateCallStatus({ key: "haveCreatedOffer", value: true }));
      dispatch(updateCallStatus({ key: "who", value: "caller" }));
    };
    const createAnswer = async () => {
      try {
        for (const stream in streams) {
          if (stream !== "localStream") {
            const pc = streams[stream].peerConnection;
            const answer = await pc.createAnswer();
            dispatch(
              updateCallStatus({ key: "haveCreatedAnswer", value: true })
            );
            await pc.setLocalDescription(answer);
            dispatch(updateCallStatus({ key: "answer", value: answer }));
            // Emit the answer to the server
            socket.emit("newAnswer", {
              answer,
              answeredBy: callStatus.offer.offer.answerer,
              answeredTo: callStatus.offer.offer.offerer,
              offerId: callStatus.offer.newOfferId,
            });
            dispatch(updateCallStatus({ key: "who", value: "callee" }));
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (callStatus.video === "enabled" && callStatus.audio === "enabled") {
      // With audio and video we can now make an offer
      if (!callStatus.haveCreatedOffer && !callStatus.offer) {
        createOffer();
        dispatch(updateCallStatus({ key: "haveCreatedOffer", value: true }));
      }
      if (!callStatus.haveCreatedAnswer && callStatus.offer) {
        createAnswer();
      }
    }
  }, [callStatus.audio, callStatus.video, callStatus.haveCreatedOffer]);

  useEffect(() => {
    const asyncAddAnswer = async () => {
      try {
        for (const stream in streams) {
          if (stream !== "localStream") {
            const pc = streams[stream].peerConnection;
            await pc.setRemoteDescription(callStatus.answer.answer);
          }
        }
      } catch (error) {
        console.log("ERROR: ", error);
      }
    };

    if (
      callStatus.answer &&
      streams["remoteStream"].peerConnection.signalingState !== "stable"
    ) {
      asyncAddAnswer();
    }
  }, [callStatus.answer]);

  useEffect(() => {
    const getIceCandidate = async () => {
      const socket = socketConnection(fetchLocalStorage("token"));
      const iceCandidates = await socket.emitWithAck(
        "getIce",
        offerId?.current || callStatus?.offer?.newOfferId,
        user
      );
      iceCandidates.forEach((candidate) => {
        console.log('CANDIDATES', candidate);
        for (const stream in streams) {
          if (stream !== "localStream") {
            const pc = streams[stream].peerConnection;
            pc.addIceCandidate(candidate);
            console.log("ICE CANDIDATE ADDED");
          }
        }
      });
    };
    if (streams.remoteStream && !callStatus.haveGottenIce) {
      dispatch(updateCallStatus({ key: "haveGottenIce", value: true }));
      getIceCandidate();
    }
    streamsRef.current = streams;
  }, [streams]);

  useEffect(() => {
    const socket = socketConnection(fetchLocalStorage("token"));
    socket.on("iceToClient", (iceCandidate) => {
      console.log(socket.id);
      console.log('ICE TO CLIENT EVENT TRIGGERED');
      if (streams.remoteStream) {
        addIceCandidatesToPC(iceCandidate, streamsRef.current);
      }
    });
  }, []);

  const addIceCandidatesToPC = (iceCandidates, streams) => {
    for (const stream in streams) {
      if (s !== "localStream") {
        const pc = streams[stream].peerConnection;
        pc.addIceCandidate(iceCandidates);
        console.log("Added an iceCandidate to existing page presence");
        setShowCallInfo(false);
      }
    }
  };

  const addIceCandidates = (iceCandidates) => {
    // Emit a new Ice Candidate to the signaling server
    const socket = socketConnection(fetchLocalStorage("token"));
    socket.emit("iceToServer", {
      iceCandidates,
      offerId: offerId?.current || callStatus?.offer?.newOfferId,
      who: user,
    });
  };

  const remoteUser =
    callStatus?.offeredTo?.name || callStatus?.offer?.offer?.answerer?.name;

  return (
    <div className="relative">
      <div className="w-full h-screen relative">
        <h3 className="my-2 mx-2 text-white absolute top-5 left-5 z-[10]">
          {remoteUser}
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
        <h3 className="absolute shadow-lg my-2 mx-2 text-white">{user.name}</h3>
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
