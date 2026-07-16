import { useState } from "react";
import api from "../api/api";

function IndexProject({ onIndexed }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function indexProject() {
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await api.post("/api/index-project");

      setMessage(`${response.data.total_chunks} chunks embedded`);

      if (onIndexed) {
        onIndexed();
      }
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "Failed to index the project."
      );
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        className="index-btn"
        onClick={indexProject}
        disabled={loading}
      >
        {loading ? "Indexing..." : "🧠 Index Project"}
      </button>

      {message && (
        <div className={error ? "alert error" : "alert success"}>
          {message}
        </div>
      )}
    </div>
  );
}

export default IndexProject;