import { useState } from "react";
import api from "../api/api";

function ImportGithub({ onProjectLoaded }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);

  async function handleImport() {
    if (!repoUrl.trim()) {
      setMessage("Please enter a GitHub repository URL.");
      setError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await api.post("/api/import-github", {
        repo_url: repoUrl.trim(),
      });

      setMessage(`Imported (${res.data.total_files} files)`);
      setFiles(res.data.files);

      if (onProjectLoaded) {
        onProjectLoaded(res.data.files);
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to import repository.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="github-box">
      <h3 className="github-title">🌐 Import GitHub Repo</h3>

      <div className="github-input-box">
        <span className="github-icon">🔗</span>

        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repo"
          className="github-input"
        />
      </div>

      <button className="github-btn" onClick={handleImport} disabled={loading}>
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
            {files.slice(0, 8).map((item, index) => (
              <div key={index} className="file-row">
                <span>📄 {item.path}</span>
                <span>{item.lines} ln</span>
              </div>
            ))}

            {files.length > 8 && (
              <div className="more-files">+ {files.length - 8} more...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportGithub;