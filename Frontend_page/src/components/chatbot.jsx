import { useState, useEffect, useRef, useCallback } from "react";
import { chatWithBot } from "@/Services/miscService";

// ─── Inline Styles (no external CSS needed) ───────────────────────────────────
const S = {
  // Floating button
  fab: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4B70F5 0%, #3563E9 100%)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(75,112,245,0.4)",
    zIndex: 9999,
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  fabBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#E24B4A",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
  },
  // Chat window
  window: (open) => ({
    position: "fixed",
    bottom: "92px",
    right: "24px",
    width: "380px",
    maxWidth: "calc(100vw - 32px)",
    height: "560px",
    maxHeight: "calc(100vh - 120px)",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9998,
    transformOrigin: "bottom right",
    transform: open ? "scale(1)" : "scale(0.85)",
    opacity: open ? 1 : 0,
    pointerEvents: open ? "all" : "none",
    transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  }),
  // Header
  header: {
    background: "linear-gradient(135deg, #4B70F5 0%, #3563E9 100%)",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  headerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 },
  headerStatus: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.85)",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    margin: "2px 0 0",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#A8FFDC",
    flexShrink: 0,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: "8px",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    flexShrink: 0,
  },
  // Messages area
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#F7F9FB",
  },
  // Message row
  msgRow: (role) => ({
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    flexDirection: role === "user" ? "row-reverse" : "row",
    animation: "fadeUp 0.2s ease",
  }),
  avatar: (role) => ({
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    background: role === "bot" ? "linear-gradient(135deg,#4B70F5,#3563E9)" : "#F0F3FF",
    color: role === "bot" ? "#fff" : "#4B70F5",
  }),
  bubble: (role) => ({
    maxWidth: "82%",
    padding: "10px 14px",
    borderRadius: role === "bot" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
    background: role === "bot" ? "#ffffff" : "linear-gradient(135deg,#4B70F5,#3563E9)",
    color: role === "bot" ? "#1a1a1a" : "#ffffff",
    fontSize: "13.5px",
    lineHeight: "1.6",
    boxShadow: role === "bot" ? "0 2px 10px rgba(0,0,0,0.05)" : "0 4px 12px rgba(75,112,245,0.25)",
    wordBreak: "break-word",
  }),
  timestamp: (role) => ({
    fontSize: "10px",
    color: "#aaa",
    marginTop: "3px",
    textAlign: role === "user" ? "right" : "left",
    paddingLeft: role === "bot" ? "36px" : 0,
    paddingRight: role === "user" ? "36px" : 0,
  }),
  // Typing indicator
  typing: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    animation: "fadeUp 0.2s ease",
  },
  typingBubble: {
    padding: "12px 16px",
    borderRadius: "4px 16px 16px 16px",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  typingDot: (i) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4B70F5",
    animation: `typingBounce 1.2s ${i * 0.15}s infinite`,
  }),
  // Quick suggestions
  suggestions: {
    padding: "8px 12px",
    display: "flex",
    gap: "6px",
    overflowX: "auto",
    background: "#fff",
    borderTop: "1px solid #eef0f3",
    flexShrink: 0,
    scrollbarWidth: "none",
  },
  sugBtn: {
    flexShrink: 0,
    padding: "5px 12px",
    fontSize: "12px",
    background: "#FFF5F0",
    border: "1px solid #FFD8C2",
    borderRadius: "20px",
    color: "#E65100",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    transition: "background 0.15s",
  },
  // Input area
  inputArea: {
    padding: "12px 14px",
    background: "#fff",
    borderTop: "1px solid #eef0f3",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "13.5px",
    border: "1.5px solid #e0e5ea",
    borderRadius: "24px",
    outline: "none",
    fontFamily: "inherit",
    background: "#F7F9FB",
    color: "#1a1a1a",
    transition: "border 0.15s",
  },
  sendBtn: (disabled) => ({
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: disabled ? "#D6DEFF" : "linear-gradient(135deg,#4B70F5,#3563E9)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "default" : "pointer",
    flexShrink: 0,
    transition: "transform 0.1s, background 0.2s",
  }),
};


// ─── Message renderer ─────────────────────────────────────────────────────────
function MessageContent({ content }) {
  if (!content) return null;
  const { text, list } = content;

  // Bold markdown **text**
  const renderText = (t) =>
    (t || "").split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
    );

  return (
    <div>
      <div style={{ whiteSpace: "pre-wrap" }}>{renderText(text)}</div>
      {list && list.length > 0 && (
        <ul style={{ marginTop: "8px", paddingLeft: "18px", lineHeight: "1.8" }}>
          {list.map((item, i) => <li key={i} style={{ fontSize: "13px" }}>{item}</li>)}
        </ul>
      )}
    </div>
  );
}

// ─── QUICK SUGGESTIONS ───────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  "Upcoming events", "Free events", "Event timings", "Ticket prices",
  "Venue locations", "Event capacity", "Pass types", "All categories",
];

// ─── MAIN CHATBOT COMPONENT ───────────────────────────────────────────────────
export default function Chatbot({ userId = null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1, role: "bot",
      content: {
        text: "👋 Hi! I'm EventBot — your smart event assistant. I can help you explore events, check tickets, venues, timings, and more!",
        cards: [],
        list: ["Try: 'Show all upcoming events'", "Try: 'Which events are free?'", "Try: 'What are the timings?'"],
      },
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnread(0);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", content: { text: msg, cards: [] }, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    // Simulate network delay for natural feel
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    // Try API only
    try {
      const data = await chatWithBot(msg, userId);
      if (data && data.reply) {
        botContent = { text: data.reply };
      } else {
        botContent = { text: "I received an empty response from the server." };
      }
    } catch (err) {
      console.error("Chatbot API Error:", err);
      botContent = { text: "My AI connection is currently offline or unreachable. Please try again later." };
    }

    setTyping(false);
    const botMsg = { id: Date.now() + 1, role: "bot", content: botContent, time: new Date() };
    setMessages((prev) => [...prev, botMsg]);

    if (!open) setUnread((n) => n + 1);
  }, [input, userId, open]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fmtTime = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typingBounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
        #eventbot-messages::-webkit-scrollbar { width: 4px; }
        #eventbot-messages::-webkit-scrollbar-thumb { background: #D6DEFF; border-radius: 4px; }
        #eventbot-input:focus { border-color: #4B70F5 !important; box-shadow: 0 0 0 3px rgba(75,112,245,0.12); }
        #eventbot-fab:hover { transform: scale(1.1) translateY(-2px); box-shadow: 0 12px 40px rgba(75,112,245,0.5); }
        .eventbot-sug:hover { background: #E4E9FF !important; }
        #eventbot-send:hover { transform: scale(1.06); }
      `}</style>

      {/* Floating Action Button */}
      <button
        id="eventbot-fab"
        style={S.fab}
        onClick={() => { setOpen((o) => !o); setUnread(0); }}
        aria-label="Open EventBot chat"
      >
        {open ? (
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4"/>
            <rect x="2" y="11" width="2" height="5" rx="1" fill="#4BC43A"/>
            <rect x="20" y="11" width="2" height="5" rx="1" fill="#F64C4C"/>
            <path d="M12 4C8.5 4 6 6.5 6 10v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-6c0-3.5-2.5-6-6-6z" fill="white"/>
            <rect x="8" y="9" width="8" height="4" rx="2" fill="#3563E9"/>
            <circle cx="10.5" cy="11" r="0.8" fill="white">
               <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="13.5" cy="11" r="0.8" fill="white">
               <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <path d="M12 4V2.5" stroke="#4B70F5" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="2" r="1.5" fill="#F9CB43"/>
          </svg>
        )}
        {!open && unread > 0 && <span style={S.fabBadge}>{unread}</span>}
      </button>

      {/* Chat Window */}
      <div style={S.window(open)} role="dialog" aria-label="EventBot chat window">
        {/* Header */}
        <div style={S.header}>
          <div style={{...S.headerAvatar, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)"}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="11" width="2" height="5" rx="1" fill="#4BC43A"/>
              <rect x="20" y="11" width="2" height="5" rx="1" fill="#F64C4C"/>
              <path d="M12 4C8.5 4 6 6.5 6 10v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-6c0-3.5-2.5-6-6-6z" fill="white"/>
              <rect x="8" y="9" width="8" height="4" rx="2" fill="#3563E9"/>
              <circle cx="10.5" cy="11" r="0.8" fill="white"/>
              <circle cx="13.5" cy="11" r="0.8" fill="white"/>
              <path d="M12 4V2.5" stroke="#4B70F5" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="2" r="1.5" fill="#F9CB43"/>
            </svg>
          </div>
          <div style={S.headerInfo}>
            <p style={S.headerName}>EventBot Assistant</p>
            <p style={S.headerStatus}><span style={S.statusDot}/>Online · Assistant</p>
          </div>
          <button style={S.closeBtn} onClick={() => setOpen(false)} aria-label="Close chat">
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div id="eventbot-messages" style={S.messages}>
          {messages.map((msg) => (
            <div key={msg.id}>
              <div style={S.msgRow(msg.role)}>
                <div style={S.avatar(msg.role)}>
                  {msg.role === "bot" ? "🤖" : "U"}
                </div>
                <div style={S.bubble(msg.role)}>
                  <MessageContent content={msg.content} />
                </div>
              </div>
              <div style={S.timestamp(msg.role)}>{fmtTime(msg.time)}</div>
            </div>
          ))}

          {typing && (
            <div style={S.typing}>
              <div style={S.avatar("bot")}>🤖</div>
              <div style={S.typingBubble}>
                {[0, 1, 2].map((i) => <span key={i} style={S.typingDot(i)} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div style={S.suggestions}>
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="eventbot-sug"
              style={S.sugBtn}
              onClick={() => sendMessage(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={S.inputArea}>
          <input
            id="eventbot-input"
            ref={inputRef}
            style={S.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about events, tickets, venues…"
            autoComplete="off"
          />
          <button
            id="eventbot-send"
            style={S.sendBtn(!input.trim())}
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}