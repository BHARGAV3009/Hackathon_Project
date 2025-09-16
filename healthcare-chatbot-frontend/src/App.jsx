import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import UploadImage from "./components/UploadImage";
import Profile from "./pages/Profile";
import Diagnosis from "./pages/Diagnosis";

function Home() {
  // Simple home dashboard with AI Diagnosis and AI Chat cards
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Home</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>Hello! Here are your AI-driven insights.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/diagnosis" style={{
          textDecoration: 'none',
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 280,
          boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
          border: '1px solid #e6eaf0'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>AI Diagnosis</div>
          <div style={{ color: '#445', lineHeight: 1.4 }}>Review AI-generated diagnoses from your inputs or images.</div>
        </Link>

        <Link to="/chat" style={{
          textDecoration: 'none',
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 280,
          boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
          border: '1px solid #e6eaf0'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>AI Chat</div>
          <div style={{ color: '#445', lineHeight: 1.4 }}>Chat with the AI and upload images.</div>
        </Link>
      </div>
    </div>
  );
}

// Using page component at ./pages/Diagnosis

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("hc_user")) || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const location = useLocation();
  const hideLayout = location.pathname === "/login" || location.pathname === "/signup";

  // Load chats for current user on login
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`hc_chats_${user.id}`);
      const savedSel = localStorage.getItem(`hc_selected_${user.id}`);
      setChats(saved ? JSON.parse(saved) : []);
      setSelectedChatId(savedSel ? JSON.parse(savedSel) : null);
    } else {
      setChats([]);
      setSelectedChatId(null);
    }
  }, [user]);

  // Persist chats and selection per user
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`hc_chats_${user.id}`, JSON.stringify(chats));
    localStorage.setItem(`hc_selected_${user.id}`, JSON.stringify(selectedChatId));
  }, [user, chats, selectedChatId]);

  const createNewChat = () => {
    const now = Date.now();
    const newChat = { id: now, title: "New chat", messages: [], createdAt: now, updatedAt: now };
    setChats([newChat, ...chats]);
    setSelectedChatId(newChat.id);
  };

  const deleteChat = (id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setSelectedChatId((prev) => (prev === id ? null : prev));
  };

  return (
    <div className="app">
      {!hideLayout && <Header user={user} setUser={setUser} onNewChat={createNewChat} />}
      <div className="app-body">
        {!hideLayout && (
          <Sidebar
            open={sidebarOpen}
            chats={chats}
            selectedId={selectedChatId}
            onSelect={setSelectedChatId}
            onNewChat={createNewChat}
            onDelete={deleteChat}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        <div className={`chat-wrapper ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />} />
            <Route path="/signup" element={user ? <Navigate to="/home" /> : <Signup setUser={setUser} />} />

            {/* Home dashboard visible after login */}
            <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />

            {/* Chat uses Gemini and image upload already */}
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

            {/* AI Diagnosis page placeholder */}
            <Route path="/diagnosis" element={user ? <Diagnosis /> : <Navigate to="/login" />} />

            <Route path="/upload" element={user ? <UploadImage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />

            {/* Default: redirect root to home */}
            <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
