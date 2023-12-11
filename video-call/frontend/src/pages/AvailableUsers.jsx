import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsFillPersonFill, BsXCircle } from "react-icons/bs";
import { FcNoVideo, FcVideoCall } from "react-icons/fc";
import socket from "../utils/socketConnection";
import { updateCallStatus } from "../store/slices/callStatus";
import { fetchLocalStorage } from "../utils/localStorage";

export default function AvailableUsers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = fetchLocalStorage("user");
  const callStatus = useSelector((state) => state.callStatus);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableOffers, setavailableOffers] = useState(null);
  const fullName = user?.name,
    username = user?.username;

  useEffect(() => {
    if (!user || !fetchLocalStorage("token").length) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const io = socket(fetchLocalStorage("token"));
    io.on("login", (usersFetched) => {
      setAvailableUsers(usersFetched);
    });
    io.on("offerAwaiting", (data) => {
      dispatch(updateCallStatus({ key: 'offer', value: data }))
      setavailableOffers(data);
    });
  }, []);

  const call = (user) => {
    if(availableOffers) {
      navigate("/call-page");
    } else {
      dispatch(updateCallStatus({ key: "offeredTo", value: { ...user } }));
      navigate("/call-page");
    }
  };

  const renderAvailableUsers = availableUsers
    ?.filter((u) => u.username !== user.username)
    .map((user) => (
      <div
        key={user.name}
        className="flex items-center justify-between border my-4 p-2 rounded-md"
      >
        <div className="flex items-center rounded-md">
          <BsFillPersonFill className="w-16 h-16 text-gray-500 border mr-4 rounded-full p-2" />
          <div>
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-md text-gray-400">{user.username}</p>
          </div>
        </div>
        <div>
          {user.online ? (
            <div className="relative">
              { availableOffers && <div className="absolute rounded-full w-16 h-16 animate-ping border border-green-600 -z-10" />}
              <FcVideoCall
                onClick={() => call(user)}
                className={`w-16 h-16 border border-green-600 p-4 hover:cursor-pointer rounded-full text-green-600`}
              />
            </div>
          ) : (
            <FcNoVideo className="w-16 h-16 border border-green-600 p-4 hover:cursor-pointer rounded-full text-green-600" />
          )}
        </div>
      </div>
    ));

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="w-full md:w-1/2 lg:w-1/3 border px-8 py-4 rounded-md">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            {fullName && (
              <p className="leading-none text-xl font-bold">{fullName}</p>
            )}
            {username && (
              <p className="leading-none text-gray-500">{username}</p>
            )}
          </div>
          <BsXCircle className="text-red-700 text-2xl hover:cursor-pointer" />
        </div>
        <div>
          {availableUsers.length === 0 ? (
            <p>Loading Users...</p>
          ) : (
            <div>{renderAvailableUsers}</div>
          )}
        </div>
      </div>
    </div>
  );
}
