import { useState } from "react";
import api from "../api/api";

function ChatBox() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // { role: "user" | "ai", text, sources }
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    const userMessage = { role: "user", text: trimmedQuestion };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsAsking(true);
    setError("");

    try {
      const response = await api.post("/api/chat", {
        question: trimmedQuestion,
      });

      const aiMessage = {
        role: "ai",
        text: response.data.answer,
        sources: response.data.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || "Failed to get a response.";
      setError(errorMsg);
    } finally {
      setIsAsking(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.post("/api/chat/clear");
    } catch (err) {
      // Even if the backend call fails, we still clear the UI locally
      console.error("Failed to clear backend history:", err);
    } finally {
      setMessages([]);
      setError("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          💬 Chat with Your Codebase
        </h2>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="text-xs text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-400 rounded-md px-3 py-1 transition"
          >
            🗑 Clear Chat
          </button>
        )}
      </div>

      {/* Chat history */}
      <div className="h-80 overflow-y-auto border rounded-md p-3 bg-gray-50 mb-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">
            Ask something like "What does this project do?" or "Explain the
            main function."
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
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

              {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-500">
                  📁 Sources: {msg.sources.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}

        {isAsking && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {/* Input area */}
      <div className="flex gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a follow-up or a new question..."
          rows={1}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleAsk}
          disabled={isAsking || !question.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;