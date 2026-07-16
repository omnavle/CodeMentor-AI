import { useState } from "react";
import api from "../api/api";

function ImportGithub({ onProjectLoaded }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);

  async function importRepository() {
    const url = repoUrl.trim();

    if (!url) {
      setMessage("Please enter a GitHub repository URL.");
      setError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await api.post("/api/import-github", {
        repo_url: url,
      });

      setMessage(`Imported (${response.data.total_files} files)`);
      setFiles(response.data.files);

      if (onProjectLoaded) {
        onProjectLoaded(response.data.files);
      }
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "Failed to import repository."
      );
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="github-box">
      <h3 className="github-title">
        🌐 Import GitHub Repo
      </h3>

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

      <button
        className="github-btn"
        onClick={importRepository}
        disabled={loading}
      >
        {loading ? "Importing..." : "Import Repository"}
      </button>

      {message && (
        <div className={error ? "alert error" : "alert success"}>
          {message}
        </div>
      )}

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