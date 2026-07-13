import { useState } from "react";
import api from "../api/api";

function IndexProject({ onIndexed }) {
  const [isIndexing, setIsIndexing] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleIndex = async () => {
    setIsIndexing(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await api.post("/api/index-project");

      setMessage(
        `${response.data.message} — ${response.data.total_files} files, ${response.data.total_chunks} chunks embedded`
      );
      setIsError(false);

      if (onIndexed) {
        onIndexed();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Failed to index the project.";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        🧠 Build AI Index (RAG)
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        This reads your project, splits it into chunks, creates embeddings,
        and stores them so you can chat with your code.
      </p>

      <button
        onClick={handleIndex}
        disabled={isIndexing}
        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
      >
        {isIndexing ? "Indexing... please wait" : "Index Project"}
      </button>

      {isIndexing && (
        <p className="text-xs text-gray-400 mt-2">
          First-time indexing downloads the embedding model — this may take a
          minute.
        </p>
      )}

      {message && (
        <p
          className={`text-sm mt-3 ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default IndexProject;