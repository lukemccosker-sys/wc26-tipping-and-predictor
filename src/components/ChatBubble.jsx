import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import PlayerAvatar from "@/components/PlayerAvatar";

// Simple profanity filter — replaces bad words with asterisks
const BAD_WORDS = [
  "fuck","shit","cunt","bitch","asshole","bastard","dick","pussy","wanker",
  "twat","bollocks","prick","slut","whore","nigger","nigga","faggot","retard",
  "arsehole","dickhead","motherfucker","cock","boner","jizz","cum","slut",
  "douche","douchebag","scumbag","tosser","knob","knobhead","minge","fanny",
  "bloody","bugger","sod","crap","shag","rape","raping","rapist","nazi"
];

function censorMessage(text) {
  if (!text) return "";
  let result = text;
  for (const word of BAD_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    result = result.replace(regex, match => "*".repeat(match.length));
  }
  return result;
}

export default function ChatBubble({ player, players }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wasOpen, setWasOpen] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const playerMap = useCallback(() => {
    const m = {};
    (players || []).forEach(p => { m[p.id] = p; });
    return m;
  }, [players]);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const msgs = await base44.entities.ChatMessage.list("-created_date", 100);
      setMessages(msgs || []);
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    }
  }, []);

  // Initial load + realtime subscription
  useEffect(() => {
    if (!player) return;
    loadMessages();

    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === "create") {
        setMessages(prev => {
          if (prev.some(m => m.id === event.id)) return prev;
          const next = [...prev, event.data].sort((a, b) =>
            new Date(a.created_date) - new Date(b.created_date)
          );
          // Keep last 100
          return next.slice(-100);
        });
      } else if (event.type === "delete") {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });

    return () => unsub();
  }, [player, loadMessages]);

  // Track unread count
  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      setWasOpen(true);
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (wasOpen) {
      setWasOpen(false);
    }
  }, [open]);

  // Increment unread when new message arrives and panel is closed
  const lastMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length > lastMsgCount.current && !open && lastMsgCount.current > 0) {
      setUnreadCount(c => c + (messages.length - lastMsgCount.current));
    }
    lastMsgCount.current = messages.length;
  }, [messages, open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setInput("");
    try {
      const censored = censorMessage(trimmed);
      await base44.entities.ChatMessage.create({
        playerId: player.id,
        playerName: player.name,
        message: censored,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setInput(trimmed); // restore input on failure
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!player) return null;

  const pm = playerMap();

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: `calc(80px + env(safe-area-inset-bottom, 0px))`,
            right: 18,
            zIndex: 9000,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #ff3d7f, #7b54f0)",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 8px 24px -6px rgba(123,84,240,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            transition: "transform .15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          title="Open chat"
        >
          💬
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#ff3d7f",
              color: "#fff",
              fontSize: 11,
              fontWeight: 900,
              borderRadius: "50%",
              minWidth: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              border: "2px solid #fff",
            }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          zIndex: 10001,
          width: "100%",
          maxWidth: 420,
          height: "100vh",
          maxHeight: "calc(100vh - 70px - env(safe-area-inset-bottom, 0px))",
          marginBottom: "calc(66px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          background: "#fff7ee",
          borderRadius: "16px",
          boxShadow: "0 -8px 40px -10px rgba(80,40,20,.35)",
          border: "1px solid #efe3d2",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "linear-gradient(95deg, #ff3d7f, #7b54f0)",
            color: "#fff",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>💬</span>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, letterSpacing: ".03em", textTransform: "uppercase" }}>Pool Chat</div>
                <div style={{ fontSize: 10, opacity: .85, fontWeight: 700 }}>{messages.length} messages</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,.2)",
                border: "none",
                borderRadius: "50%",
                width: 30,
                height: 30,
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 900,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#9aa0ad", fontSize: 13, fontWeight: 600, padding: "30px 0" }}>
                No messages yet — start the banter! 💬
              </div>
            )}
            {messages.map(msg => {
              const isMe = msg.playerId === player.id;
              const sender = pm[msg.playerId];
              return (
                <div key={msg.id} style={{
                  display: "flex",
                  flexDirection: isMe ? "row-reverse" : "row",
                  gap: 7,
                  alignItems: "flex-end",
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <PlayerAvatar player={sender || { name: msg.playerName }} size={26} />
                  </div>
                  <div style={{
                    maxWidth: "75%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#9aa0ad", marginBottom: 2, padding: "0 4px" }}>
                      {isMe ? "You" : msg.playerName}
                    </div>
                    <div style={{
                      background: isMe ? "linear-gradient(95deg, #ff3d7f, #ff7a2f)" : "#fff",
                      color: isMe ? "#fff" : "#222a3d",
                      border: isMe ? "none" : "1px solid #efe3d2",
                      borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      padding: "8px 12px",
                      fontSize: 13.5,
                      fontWeight: 500,
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                    }}>
                      {msg.message}
                    </div>
                    <div style={{ fontSize: 9, color: "#b9b1a3", fontWeight: 600, padding: "2px 4px 0" }}>
                      {new Date(msg.created_date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{
            flexShrink: 0,
            padding: "10px 12px calc(10px + env(safe-area-inset-bottom, 0px))",
            background: "#fff",
            borderTop: "1px solid #efe3d2",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={500}
              style={{
                flex: 1,
                border: "2px solid #efe3d2",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "inherit",
                background: "#fff7ee",
                color: "#222a3d",
                outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#7b54f0"}
              onBlur={e => e.target.style.borderColor = "#efe3d2"}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                flexShrink: 0,
                width: 42,
                height: 42,
                border: "none",
                borderRadius: 12,
                background: input.trim() ? "linear-gradient(95deg, #ff3d7f, #7b54f0)" : "#e0d2bd",
                color: "#fff",
                cursor: input.trim() ? "pointer" : "default",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background .15s ease",
              }}
            >
              {loading ? "⏳" : "➤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}