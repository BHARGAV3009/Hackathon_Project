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

  const touch = (chatId) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, updatedAt: Date.now() } : c)));
  };

  const renameIfFirstMessage = (chatId, text) => {
    if (!text) return;
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId && (!c.title || c.title === "New chat")
          ? { ...c, title: text.slice(0, 30) }
          : c
      )
    );
  };

  const pushToActiveChat = (newMessages) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? { ...chat, messages: [...(chat.messages || []), ...newMessages], updatedAt: Date.now() }
          : chat
      )
    );
  };

  const ensureChat = () => {
    if (!selectedChatId) {
      const now = Date.now();
      const newChat = { id: now, title: "New chat", messages: [], createdAt: now, updatedAt: now };
      setChats([newChat, ...(chats || [])]);
      setSelectedChatId?.(newChat.id);
      return newChat.id;
    }
    return selectedChatId;
  };

  const handlePickImage = (file) => {
    if (!file) return;
    const chatId = ensureChat();
    setAttachment(file);

    const tempMsg = { role: "user", text: message || "", imageUrl: URL.createObjectURL(file), temp: true };
    setSelectedChatId(chatId);
    pushToActiveChat([tempMsg]);
    renameIfFirstMessage(chatId, message || "Image");
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

        const botTyping = { role: "bot", text: "..." };
        pushToActiveChat([botTyping]);

        const res = await fetch("http://localhost:5000/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Upload failed");

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((m) => (m.temp ? { role: "user", text: m.text, imageUrl: data.fileUrl } : m)),
                }
              : chat
          )
        );

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? {
                  ...chat,
                  messages: chat.messages.map((m) => (m.text === "..." && m.role === "bot" ? { role: "bot", text: data.description } : m)),
                }
              : chat
          )
        );

        touch(chatId);
        setAttachment(null);
        return;
      }

      // Text-only message
      const userTextMsg = { role: "user", text: message };
      pushToActiveChat([userTextMsg]);
      renameIfFirstMessage(chatId, message);

      // Add bot typing
      pushToActiveChat([{ role: "bot", text: "..." }]);
      setMessage("");

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, userId }),
      });
      const data = await res.json();

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: chat.messages.map((m) => (m.text === "..." && m.role === "bot" ? { role: "bot", text: data?.text || data?.reply } : m)),
                updatedAt: Date.now(),
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
        <input type="file" accept="image/*" style={{ display: "none" }} ref={fileInputRef} onChange={handleImageInputChange} />
        <button className="plus-btn" onClick={() => fileInputRef.current?.click()} title="Upload image">➕</button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message HealthBot..."
          id="chat-input-field"
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
