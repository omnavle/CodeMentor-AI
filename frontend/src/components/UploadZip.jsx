import { useState } from "react";
import api from "../api/api";

function UploadZip({ onProjectLoaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [files, setFiles] = useState([]);

  function handleFileChange(e) {
    if (!e.target.files.length) return;

    setFile(e.target.files[0]);
    setFiles([]);
    setMessage("");
    setError(false);
  }

  async function handleUpload() {
    if (!file) {
      setMessage("Please choose a ZIP file.");
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

      setMessage(`Uploaded (${res.data.total_files} files)`);
      setFiles(res.data.files);

      if (onProjectLoaded) {
        onProjectLoaded(res.data.files);
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to upload ZIP.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 className="upload-title">📦 Upload ZIP Project</h3>

      <label className="drop-zone">
        <input type="file" accept=".zip" hidden onChange={handleFileChange} />

        <div className="upload-icon">📂</div>
        <h4>Drag & Drop ZIP File</h4>
        <p>or click to browse</p>
      </label>

      {file && (
        <div className="selected-file">
          <div>
            <strong>{file.name}</strong>
            <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div>✅</div>
        </div>
      )}

      <button className="upload-btn" disabled={loading} onClick={handleUpload}>
        {loading ? (
          <>
            <span className="loader"></span>
            Uploading...
          </>
        ) : (
          <>🚀 Upload Project</>
        )}
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

export default UploadZip;