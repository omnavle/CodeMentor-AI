import { useState, useEffect, useRef } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaTrash } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import api from "../api/api";

function ChatBox() {

  // Stores the text typed by the user
  const [question, setQuestion] = useState("");

  // Stores all chat messages
  const [messages, setMessages] = useState([]);

  // Shows loading while AI is generating answer
  const [loading, setLoading] = useState(false);

  // Stores error message
  const [error, setError] = useState("");

  // Used to automatically scroll to the latest message
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever new message is added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Send question to backend
  async function askQuestion() {

    // Don't send empty question
    if (question.trim() === "") {
      return;
    }

    const userQuestion = question.trim();

    // Add user message
    setMessages((oldMessages) => [
      ...oldMessages,
      {
        role: "user",
        text: userQuestion,
      },
    ]);

    // Clear textarea
    setQuestion("");

    setLoading(true);
    setError("");

    try {

      // Call backend API
      const response = await api.post("/api/chat", {
        question: userQuestion,
      });

      // Add AI response
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

  // Clear chat
  async function clearChat() {

    try {
      await api.post("/api/chat/clear");
    } catch (err) {
      // Ignore error
    }

    setMessages([]);
    setError("");
  }

  // Press Enter to send message
  function handleEnter(e) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();
      askQuestion();

    }
  }

  return (

    <div className="chat-wrapper">

      {/* Header */}

      <div className="chat-header">

        <div>

          <h2>🤖 CodeMentor</h2>

          <p>Ask anything about your codebase</p>

        </div>

        {/* Show clear button only if messages exist */}

        {messages.length > 0 && (

          <button
            className="clear-btn"
            onClick={clearChat}
          >
            <FaTrash />
          </button>

        )}

      </div>

      {/* Chat Area */}

      <div className="chat-body">

        {/* Welcome Screen */}

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

        {/* Show all messages */}

        {messages.map((message, index) => (

          <div
            key={index}
            className={
              message.role === "user"
                ? "message user"
                : "message ai"
            }
          >

            {/* Avatar */}

            <div className="avatar">

              {message.role === "user" ? (
                <FaUser />
              ) : (
                <FaRobot />
              )}

            </div>

            {/* Message */}

            <div className="bubble">

              <ReactMarkdown>
                {message.text}
              </ReactMarkdown>

              {/* Sources */}

              {message.sources && message.sources.length > 0 && (

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

        {/* Loading Animation */}

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

        {/* Auto Scroll */}

        <div ref={chatEndRef}></div>

      </div>

      {/* Error Message */}

      {error && (

        <div className="alert error">
          {error}
        </div>

      )}

      {/* Input Box */}

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