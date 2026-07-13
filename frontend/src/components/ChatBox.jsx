import { useEffect, useRef, useState } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaTrash } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import api from "../api/api";

function ChatBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleAsk() {
    if (!question.trim()) return;

    const text = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/chat", {
        question: text,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    try {
      await api.post("/api/chat/clear");
    } catch {}

    setMessages([]);
    setError("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <div className="chat-wrapper">

      <div className="chat-header">

        <div>

          <h2>🤖 AI Code Mentor</h2>

          <p>
            Ask anything about your codebase
          </p>

        </div>

        {messages.length > 0 && (

          <button
            onClick={handleClear}
            className="clear-btn"
          >
            <FaTrash />
          </button>

        )}

      </div>

      <div className="chat-body">

        {messages.length === 0 && (

          <div className="welcome-card">

            <FaRobot size={50} />

            <h3>Ready to help!</h3>

            <p>
              Try asking:

            </p>

            <ul>

              <li>
                Explain authentication flow
              </li>

              <li>
                Where is API configured?
              </li>

              <li>
                Summarize this project
              </li>

            </ul>

          </div>

        )}

        {messages.map((msg, index) => (

          <div
            key={index}
            className={
              msg.role === "user"
                ? "message user"
                : "message ai"
            }
          >

            <div className="avatar">

              {msg.role === "user"
                ? <FaUser />
                : <FaRobot />}

            </div>

            <div className="bubble">

              <ReactMarkdown>

                {msg.text}

              </ReactMarkdown>

              {msg.sources?.length > 0 && (

                <div className="sources">

                  {msg.sources.map((src, i) => (

                    <span
                      key={i}
                      className="source-chip"
                    >
                      {src}
                    </span>

                  ))}

                </div>

              )}

            </div>

          </div>

        ))}

        {loading && (

          <div className="message ai">

            <div className="avatar">
              <FaRobot />
            </div>

            <div className="typing">

              <span></span>
              <span></span>
              <span></span>

            </div>

          </div>

        )}

        <div ref={chatEndRef}></div>

      </div>

      {error && (

        <div className="alert error">
          {error}
        </div>

      )}

      <div className="chat-input">

        <textarea
          rows="1"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask about your project..."
        />

        <button
          onClick={handleAsk}
          disabled={loading}
        >

          <FaPaperPlane />

        </button>

      </div>

    </div>
  );
}

export default ChatBox;