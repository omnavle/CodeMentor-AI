import { useState } from "react";
import api from "../api/api";

function UploadZip({ onProjectLoaded }) {

  // Store selected ZIP file
  const [file, setFile] = useState(null);

  // Show loading while uploading
  const [loading, setLoading] = useState(false);

  // Success or error message
  const [message, setMessage] = useState("");

  // Check whether message is an error
  const [error, setError] = useState(false);

  // Store uploaded project files
  const [files, setFiles] = useState([]);

  // Select ZIP file
  function selectFile(event) {

    if (event.target.files.length === 0) {
      return;
    }

    setFile(event.target.files[0]);

    // Clear old data
    setFiles([]);
    setMessage("");
    setError(false);
  }

  // Upload ZIP file
  async function uploadProject() {

    // Check if file is selected
    if (!file) {
      setMessage("Please choose a ZIP file.");
      setError(true);
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");
    setError(false);

    try {

      // Send ZIP file to backend
      const response = await api.post(
        "/api/upload-zip",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Show success message
      setMessage(
        `Uploaded (${response.data.total_files} files)`
      );

      // Save file list
      setFiles(response.data.files);

      // Send data to parent component
      if (onProjectLoaded) {
        onProjectLoaded(response.data.files);
      }

    } catch (err) {

      // Show error message
      setMessage(
        err.response?.data?.detail ||
        "Failed to upload ZIP."
      );

      setError(true);

    } finally {

      // Stop loading
      setLoading(false);

    }
  }

  return (

    <div>

      {/* Title */}

      <h3 className="upload-title">
        📦 Upload ZIP Project
      </h3>

      {/* File Upload Area */}

      <label className="drop-zone">

        <input
          type="file"
          accept=".zip"
          hidden
          onChange={selectFile}
        />

        <div className="upload-icon">📂</div>

        <h4>Drag & Drop ZIP File</h4>

        <p>or click to browse</p>

      </label>

      {/* Selected File */}

      {file && (

        <div className="selected-file">

          <div>

            <strong>{file.name}</strong>

            <p>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

          </div>

          <div>✅</div>

        </div>

      )}

      {/* Upload Button */}

      <button
        className="upload-btn"
        onClick={uploadProject}
        disabled={loading}
      >

        {loading ? (

          <>
            <span className="loader"></span>
            Uploading...
          </>

        ) : (

          <>🚀 Upload Project</>

        )}

      </button>

      {/* Success or Error Message */}

      {message && (

        <div className={error ? "alert error" : "alert success"}>

          {message}

        </div>

      )}

      {/* Uploaded Files */}

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

            {/* Show remaining files */}

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

export default UploadZip;