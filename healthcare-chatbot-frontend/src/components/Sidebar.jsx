import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ open, chats, selectedId, onSelect, onNewChat, onDelete, onToggle }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = Array.isArray(chats) ? [...chats] : [];
    // Sort by updatedAt desc, then createdAt desc
    list.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    if (!q) return list;
    return list.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [chats, query]);

  if (!open) {
    return (
      <button aria-label="close sidebar" className="sidebar-hamburger" onClick={onToggle}>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">HealthBot</div>
        <button aria-label="Close sidebar" onClick={onToggle} className="sidebar-close">✕</button>
      </div>

      <div className="sidebar-newchat">
        <button onClick={onNewChat} className="newchat-btn">
          <span className="newchat-plus">+</span> New chat
        </button>
      </div>

      {/* Quick navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li><NavLink to="/home" onClick={() => onToggle?.()}>🏠 Home</NavLink></li>
          <li><NavLink to="/diagnosis" onClick={() => onToggle?.()}>🧠 AI Diagnosis</NavLink></li>
          <li><NavLink to="/chat" onClick={() => onToggle?.()}>💬 AI Chat</NavLink></li>
        </ul>
      </nav>

      <div className="sidebar-search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
        />
      </div>

      <div className="sidebar-chats">
        <div className="chats-label">Chat History</div>
        {filtered.length === 0 && <div className="no-chats">No chats found</div>}
        <ul className="chats-list">
          {filtered.map((c) => (
            <li key={c.id}>
              <div className={`chat-item-row ${selectedId === c.id ? "active" : ""}`}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={`chat-item ${selectedId === c.id ? "active" : ""}`}
                  title={c.title}
                >
                  <div className="chat-title">{c.title || "Untitled"}</div>
                </button>
                <button className="chat-delete" title="Delete chat" onClick={() => onDelete?.(c.id)}>🗑</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
