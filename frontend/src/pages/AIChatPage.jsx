import React, { useState, useRef, useEffect } from "react";
import { chatWithAI } from "../services/api";
import { Send, Bot, User } from "lucide-react";

const AIChatPage = ({ resumeText }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your career advisor. Ask me anything about your resume, job search, salary negotiation, or career growth.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const r = await chatWithAI(message, resumeText);
      const reply = r?.data?.success
        ? r.data.data.reply
        : r?.data?.error || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Unable to connect to the backend. Please check the server is running." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel">
      <div className="panel-header">
        <div>
          <span className="section-tag">AI Chat</span>
          <h2>Your personal career advisor</h2>
          <p className="panel-description">
            Ask anything about your resume, interview prep, salary, or career
            strategy.{resumeText ? " Your resume is loaded as context." : ""}
          </p>
        </div>
      </div>

      <section className="card chat-card" style={{ display: "grid", gap: 0, padding: 0, overflow: "hidden" }}>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              <div className="chat-avatar">
                {m.role === "ai" ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="chat-text">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai">
              <div className="chat-avatar"><Bot size={16} /></div>
              <div className="chat-text chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your resume, interviews, salary..."
            disabled={loading}
          />
          <button
            type="button"
            className="primary-button chat-send"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default AIChatPage;
