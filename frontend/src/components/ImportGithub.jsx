import { useState } from "react";
import api from "../api/api";

function ImportGithub({ onProjectLoaded }) {

  // Store GitHub repository URL
  const [repoUrl, setRepoUrl] = useState("");

  // Show loading while importing
  const [loading, setLoading] = useState(false);

  // Success or error message
  const [message, setMessage] = useState("");

  // Check if message is an error
  const [error, setError] = useState(false);

  // Store imported files
  const [files, setFiles] = useState([]);

  // Import GitHub Repository
  async function importRepository() {

    // Check if URL is empty
    if (repoUrl.trim() === "") {
      setMessage("Please enter a GitHub repository URL.");
      setError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setError(false);

    try {

      // Call backend API
      const response = await api.post("/api/import-github", {
        repo_url: repoUrl.trim(),
      });

      // Show success message
      setMessage(`Imported (${response.data.total_files} files)`);

      // Save files
      setFiles(response.data.files);

      // Send file list to parent component
      if (onProjectLoaded) {
        onProjectLoaded(response.data.files);
      }

    } catch (err) {

      // Show error message
      setMessage(
        err.response?.data?.detail ||
        "Failed to import repository."
      );

      setError(true);

    } finally {

      // Stop loading
      setLoading(false);

    }
  }

  return (

    <div className="github-box">

      {/* Title */}

      <h3 className="github-title">
        🌐 Import GitHub Repo
      </h3>

      {/* Input Box */}

      <div className="github-input-box">

        <span className="github-icon">🔗</span>

        <input
          type="text"
          className="github-input"
          placeholder="https://github.com/user/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

      </div>

      {/* Import Button */}

      <button
        className="github-btn"
        onClick={importRepository}
        disabled={loading}
      >
        {loading ? "Importing..." : "Import Repository"}
      </button>

      {/* Success / Error Message */}

      {message && (

        <div className={error ? "alert error" : "alert success"}>
          {message}
        </div>

      )}

      {/* File List */}

      {files.length > 0 && (

        <div className="files-card">

          <h4>Files ({files.length})</h4>

          <div className="files-list">

            {files.slice(0, 8).map((file, index) => (

              <div
                key={index}
                className="file-row"
              >
                <span>📄 {file.path}</span>

                <span>{file.lines} ln</span>
              </div>

            ))}

            {/* Show remaining file count */}

            {files.length > 8 && (

              <div className="more-files">

                + {files.length - 8} more...

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );
}

export default ImportGithub;