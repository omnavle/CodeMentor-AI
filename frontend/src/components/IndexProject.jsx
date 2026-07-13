import { useState } from "react";
import api from "../api/api";

function IndexProject({ onIndexed }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleIndex() {
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await api.post("/api/index-project");

      setMessage(
        `${res.data.message} - ${res.data.total_files} files, ${res.data.total_chunks} chunks created`
      );

      if (onIndexed) {
        onIndexed();
      }
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "Failed to index project."
      );
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        🧠 Build AI Index
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Create embeddings for your project so you can chat with your code.
      </p>

      <button
        onClick={handleIndex}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Indexing..." : "Index Project"}
      </button>

      {loading && (
        <p className="text-xs text-gray-400 mt-2">
          Please wait while the project is being indexed.
        </p>
      )}

      {message && (
        <p
          className={`text-sm mt-3 ${
            error ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default IndexProject;