import { useState } from "react";
import api from "../api/api";

function ChatBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    const text = question.trim();

    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
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
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClearChat() {
    try {
      await api.post("/api/chat/clear");
    } catch (err) {
      console.log(err);
    }

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
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          💬 Chat with Your Codebase
        </h2>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="text-xs border border-gray-300 rounded-md px-3 py-1 hover:text-red-600 hover:border-red-400"
          >
            🗑 Clear Chat
          </button>
        )}
      </div>

      <div className="h-80 overflow-y-auto border rounded-md p-3 bg-gray-50 mb-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">
            Ask a question about your project.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}

              {msg.role === "ai" &&
                msg.sources &&
                msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-500">
                    Sources: {msg.sources.join(", ")}
                  </div>
                )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask your question..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;