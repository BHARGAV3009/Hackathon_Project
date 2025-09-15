import React from 'react';
import './MessageBubble.css';

export default function MessageBubble({ m }) {
  const isUser = m.sender === 'user';
  return (
    <div className={`message-container ${isUser ? 'user' : 'bot'}`}>
      <div className="message-bubble">
        {m.text && <p>{m.text}</p>}
        {m.image && <img src={m.image} alt="sent" className="message-image" />}
      </div>
    </div>
  );
}
