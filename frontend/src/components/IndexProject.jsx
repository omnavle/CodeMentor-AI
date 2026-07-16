import { useState } from "react";
import api from "../api/api";

function IndexProject({ onIndexed }) {

  // Show loading while indexing
  const [loading, setLoading] = useState(false);

  // Store success or error message
  const [message, setMessage] = useState("");

  // Check if message is an error
  const [error, setError] = useState(false);

  // Index the project
  async function indexProject() {

    setLoading(true);
    setMessage("");
    setError(false);

    try {

      // Call backend API
      const response = await api.post("/api/index-project");

      // Show success message
      setMessage(
        `${response.data.total_chunks} chunks embedded`
      );

      // Notify parent component
      if (onIndexed) {
        onIndexed();
      }

    } catch (err) {

      // Show error message
      setMessage(
        err.response?.data?.detail ||
        "Failed to index the project."
      );

      setError(true);

    } finally {

      // Stop loading
      setLoading(false);

    }
  }

  return (

    <div>

      {/* Index Button */}

      <button
        className="index-btn"
        onClick={indexProject}
        disabled={loading}
      >

        {loading ? "Indexing..." : "🧠 Index Project"}

      </button>

      {/* Show note while indexing */}

      {/* {loading && (

        <p className="index-note">

          First-time indexing downloads the embedding model.
          It may take a minute.

        </p>

      )} */}

      {/* Success or Error Message */}

      {message && (

        <div className={error ? "alert error" : "alert success"}>

          {message}

        </div>

      )}

    </div>

  );
}

export default IndexProject;