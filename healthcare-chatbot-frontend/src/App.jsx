import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import UploadImage from "./components/UploadImage"; 

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("hc_user")) || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const location = useLocation();
  const hideLayout = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="app">
      {!hideLayout && <Header user={user} setUser={setUser} />}
      <div className="app-body">
        {!hideLayout && (
          <Sidebar
            open={sidebarOpen}
            chats={chats}
            selectedId={selectedChatId}
            onSelect={setSelectedChatId}
            onNewChat={() => {
              const newChat = { id: Date.now(), title: `Chat ${chats.length + 1}`, messages: [] };
              setChats([newChat, ...chats]);
              setSelectedChatId(newChat.id);
            }}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Chat wrapper dynamically resizes based on sidebar */}
        <div className={`chat-wrapper ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup setUser={setUser} />} />

            <Route
              path="/"
              element={
                user ? (
                  <Chat
                    user={user}
                    chats={chats}
                    setChats={setChats}
                    selectedChatId={selectedChatId}
                    setSelectedChatId={setSelectedChatId}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/chat"
              element={
                user ? (
                  <Chat
                    user={user}
                    chats={chats}
                    setChats={setChats}
                    selectedChatId={selectedChatId}
                    setSelectedChatId={setSelectedChatId}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/upload"
              element={
                user ? <UploadImage /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
