import React from "react";
import socketConnection from './utils/socketConnection.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from "react-router-dom";
import AvailableUsers from "./pages/AvailableUsers.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MainVideo from "./pages/MainVideo.jsx";

function App() {
  return <React.Fragment>
    <Routes>
      <Route path="/" element={<AvailableUsers />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/call-page" element={<MainVideo />} />
    </Routes>
    <ToastContainer />
  </React.Fragment>;
}

export default App;
