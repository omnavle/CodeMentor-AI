import { useState } from "react";
import api from "../api/api";

function UploadZip({ onProjectLoaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
    setFiles([]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a ZIP file first.");
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsUploading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await api.post("/api/upload-zip", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(
        `${response.data.message} (${response.data.total_files} files loaded)`
      );
      setIsError(false);
      setFiles(response.data.files);

      // Notify parent component (App.jsx) that a project is now loaded
      if (onProjectLoaded) {
        onProjectLoaded(response.data.files);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Failed to upload ZIP file.";
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsUploading(false);
    }
  };

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
          disabled={isUploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isUploading ? "Uploading..." : "Upload"}
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

export default UploadZip;