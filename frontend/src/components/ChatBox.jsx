import { useState, useEffect, useRef } from "react";
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

  async function askQuestion() {
    const userQuestion = question.trim();

    if (!userQuestion) {
      return;
    }

    setMessages((oldMessages) => [
      ...oldMessages,
      {
        role: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/chat", {
        question: userQuestion,
      });

      setMessages((oldMessages) => [
        ...oldMessages,
        {
          role: "ai",
          text: response.data.answer,
          sources: response.data.sources,
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    try {
      await api.post("/api/chat/clear");
    } catch {}

    setMessages([]);
    setError("");
  }

  function handleEnter(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  }

  return (
        <div className="chat-wrapper">
      <div className="chat-header">
        <div>
          <h2>🤖 CodeMentor</h2>
          <p>Ask anything about your codebase</p>
        </div>

        {messages.length > 0 && (
          <button
            className="clear-btn"
            onClick={clearChat}
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

            <p>Try asking:</p>

            <ul>
              <li onClick={() => setQuestion("Where is API configured?")}>
                Where is API configured?
              </li>

              <li onClick={() => setQuestion("Summarize this project")}>
                Summarize this project
              </li>
            </ul>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role}`}
          >
            <div className="avatar">
              {message.role === "user" ? (
                <FaUser />
              ) : (
                <FaRobot />
              )}
            </div>

            <div className="bubble">
              <ReactMarkdown>
                {message.text}
              </ReactMarkdown>

              {message.sources?.length > 0 && (
                <div className="sources">
                  {message.sources.map((source, i) => (
                    <span
                      key={i}
                      className="source-chip"
                    >
                      {source}
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
          placeholder="Ask about your project..."
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleEnter}
        />

        <button
          onClick={askQuestion}
          disabled={loading}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default ChatBox;