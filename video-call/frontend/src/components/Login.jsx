import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../store/api/login";
import { toast } from "react-toastify";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();

  const [loginUser, { isLoading, isError, isSuccess, error }] =
    useLoginUserMutation();

  const handleOnChange = (event) => {
    if (event.target["name"] === "username") {
      setFormData({ ...formData, username: event.target.value });
    } else if (event.target["name"] === "password") {
      setFormData({ ...formData, password: event.target.value });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Logged in successfully.");
      navigate('/')
    }
    if (isError) {
      console.log(error);
      if (Array.isArray(error.data.error)) {
        error.data.error.forEach((el) =>
          toast.error(el.message, {
            position: "top-right",
          })
        );
      } else {
        toast.error(error.data.error, {
          position: "top-right",
        });
      }
    }
  }, [isLoading]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loginUser(formData);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="shadow-lg w-full md:w-1/2 lg:w-1/3 rounded-lg py-4 border" onSubmit={handleSubmit}>
        <h3 className="text-center text-xl font-bold mb-4">Sign In</h3>
        <div className="mx-4">
          <input
            className="px-4 py-2 border w-full rounded-full mt-2"
            type="text"
            placeholder="Username"
            name="username"
            onChange={handleOnChange}
          />
          <label hidden>Username</label>
        </div>
        <div className="mx-4">
          <input
            className="px-4 py-2 border w-full rounded-full mt-2"
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleOnChange}
          />
          <label hidden>Username</label>
        </div>
        <div className="mx-4 my-2">
          <button
            type="submit"
            className="w-full border py-2 bg-gray-200 hover:cursor-pointer hover:bg-gray-200/80 transition-all ease-in-out duration-300 rounded-full"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
