import React from "react";
import "./Sidebar.css";

export default function Sidebar({ open, chats, selectedId, onSelect, onNewChat, onToggle }) {
  if (!open) {
    return (
      <button aria-label="Open sidebar" className="sidebar-hamburger" onClick={onToggle}>
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

      <div className="sidebar-chats">
        <div className="chats-label">Chat History</div>
        {chats.length === 0 && <div className="no-chats">No chats yet</div>}
        <ul className="chats-list">
          {chats.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`chat-item ${selectedId === c.id ? "active" : ""}`}
              >
                <div className="chat-title">{c.title}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
