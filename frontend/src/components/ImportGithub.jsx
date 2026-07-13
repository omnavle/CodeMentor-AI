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

      setMessage(
        `${res.data.message} (${res.data.total_files} files loaded)`
      );

      setFiles(res.data.files);

      if (onProjectLoaded) {
        onProjectLoaded(res.data.files);
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
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🌐 Import Public GitHub Repository
      </h2>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repo"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </div>

      {message && (
        <p
          className={`text-sm mb-3 ${
            error ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Loaded Files ({files.length})
          </h3>

          <div className="max-h-64 overflow-y-auto border rounded-md p-2 bg-gray-50">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between text-xs text-gray-600 py-1 border-b last:border-b-0"
              >
                <span>{file.path}</span>
                <span className="text-gray-400">
                  {file.lines} lines
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportGithub;