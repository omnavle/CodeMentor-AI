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
        `${response.data.total_chunks} chunks embedded`
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
    <div>
      <button className="index-btn" onClick={handleIndex} disabled={isIndexing}>
        {isIndexing ? "Indexing..." : "🧠 Index Project"}
      </button>

      {isIndexing && (
        <p className="index-note">
          First-time indexing downloads the embedding model — may take a minute.
        </p>
      )}

      {message && (
        <div className={isError ? "alert error" : "alert success"}>
          {message}
        </div>
      )}
    </div>
  );
}

export default IndexProject;