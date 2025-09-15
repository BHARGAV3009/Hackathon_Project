import React, { useState, useRef, useEffect } from "react";
import "./Chat.css"

const Chat = ({ user, chats, setChats, selectedChatId, setSelectedChatId }) => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef();
  const messagesEndRef = useRef(null);

  const getActiveChat = () => chats?.find((c) => c.id === selectedChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedChatId]);

  const pushToActiveChat = (newMessages) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? { ...chat, messages: [...(chat.messages || []), ...newMessages] }
          : chat
      )
    );
  };

  const ensureChat = () => {
    if (!selectedChatId) {
      const newChat = { id: Date.now(), title: `Chat ${chats.length + 1}`, messages: [] };
      setChats([newChat, ...(chats || [])]);
      setSelectedChatId?.(newChat.id);
      return newChat.id;
    }
    return selectedChatId;
  };

  const handlePickImage = (file) => {
    if (!file) return;
    setAttachment(file);

    // Add temporary local message for preview
    const tempMsg = {
      role: "user",
      text: message || "",
      imageUrl: URL.createObjectURL(file),
      temp: true, // mark as temporary
    };
    pushToActiveChat([tempMsg]);
    setMessage("");
  };

  const handleImageInputChange = (e) => handlePickImage(e.target.files?.[0]);

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;
    const chatId = ensureChat();
    if (!chatId) return;

    setSending(true);

    try {
      const userId = user?.id || user?._id;

      // Handle image upload
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        formData.append("userId", userId || "");

        // Add bot typing effect
        const botTyping = { role: "bot", text: "..." };
        pushToActiveChat([botTyping]);

        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Upload failed");

        // Replace temporary user image with uploaded image
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((m) =>
                    m.temp ? { role: "user", text: m.text, imageUrl: data.fileUrl } : m
                  ),
                }
              : chat
          )
        );

        // Replace bot typing with real response
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((m) =>
                    m.text === "..." && m.role === "bot" ? { role: "bot", text: data.description } : m
                  ),
                }
              : chat
          )
        );

        setAttachment(null);
        return;
      }

      // Text-only message
      const userTextMsg = { role: "user", text: message };
      pushToActiveChat([userTextMsg]);

      // Add bot typing
      pushToActiveChat([{ role: "bot", text: "..." }]);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, userId }),
      });
      const data = await res.json();

      // Replace bot typing with real response
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.text === "..." && m.role === "bot" ? { role: "bot", text: data?.text || data?.reply } : m
                ),
              }
            : chat
        )
      );

      setMessage("");
    } catch (err) {
      console.error(err);
      pushToActiveChat([{ role: "bot", text: "⚠️ Something went wrong while sending" }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-wrapper">
        <div className="messages-container">
          {getActiveChat()?.messages?.map((msg, idx) => (
            <div key={idx} className={`msg-row ${msg.role === "user" ? "right" : "left"}`}>
              <span className={`msg-bubble ${msg.role === "user" ? "user-msg" : "bot-msg"}`}>
                {msg.text}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl.startsWith("http") ? msg.imageUrl : `http://localhost:5000${msg.imageUrl}`}
                    alt="uploaded"
                    className="msg-image"
                  />
                )}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input">
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleImageInputChange}
        />
        <button className="plus-btn" onClick={() => fileInputRef.current?.click()}>
          ➕
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..." id="chat-input-field"
          disabled={sending}
          onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
        />

        <button className="send-btn" onClick={handleSend} disabled={sending}>
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
