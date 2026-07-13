import { useState } from "react";
import api from "../api/api";

function UploadZip({ onProjectLoaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setMessage("");
    setFiles([]);
  }

  async function handleUpload() {
    if (!file) {
      setMessage("Please select a ZIP file.");
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await api.post("/api/upload-zip", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
        err.response?.data?.detail || "Failed to upload ZIP file."
      );
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        📦 Upload Project ZIP
      </h2>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Upload"}
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
            {files.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-xs text-gray-600 py-1 border-b last:border-b-0"
              >
                <span>{item.path}</span>
                <span className="text-gray-400">
                  {item.lines} lines
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadZip;