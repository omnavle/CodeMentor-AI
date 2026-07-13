import { useState } from "react";
import api from "../api/api";

function ImportGithub({ onProjectLoaded }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [files, setFiles] = useState([]);

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      setMessage("Please enter a GitHub repository URL.");
      setIsError(true);
      return;
    }

    setIsImporting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await api.post("/api/import-github", {
        repo_url: repoUrl.trim(),
      });

      setMessage(
        `${response.data.message} (${response.data.total_files} files loaded)`
      );
      setIsError(false);
      setFiles(response.data.files);

      if (onProjectLoaded) {
        onProjectLoaded(response.data.files);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Failed to import repository.";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🌐 Import Public GitHub Repository
      </h2>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="https://github.com/user/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleImport}
          disabled={isImporting}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isImporting ? "Importing..." : "Import"}
        </button>
      </div>

      {message && (
        <p
          className={`text-sm mb-3 ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Loaded Files ({files.length}):
          </h3>
          <div className="max-h-64 overflow-y-auto border rounded-md p-2 bg-gray-50">
            {files.map((f, idx) => (
              <div
                key={idx}
                className="flex justify-between text-xs text-gray-600 py-1 border-b last:border-b-0"
              >
                <span>{f.path}</span>
                <span className="text-gray-400">{f.lines} lines</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportGithub;