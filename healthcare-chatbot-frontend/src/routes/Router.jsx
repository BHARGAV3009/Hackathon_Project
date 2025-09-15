import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import Chat from '../pages/Chat.jsx';

export default function Router({ user, setUser, activeChat, pushMessage, setTitleIfEmpty }) {
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<Signup setUser={setUser} />} />
      <Route path="/chat" element={user ? <Chat user={user} activeChat={activeChat} pushMessage={pushMessage} setTitleIfEmpty={setTitleIfEmpty} /> : <Navigate to="/login" />} />
    </Routes>
  );
}