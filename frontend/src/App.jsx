import { useEffect, useState } from "react";
import api from "./api/api";
import UploadZip from "./components/UploadZip";
import ImportGithub from "./components/ImportGithub";
import IndexProject from "./components/IndexProject";
import ChatBox from "./components/ChatBox";

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [connected, setConnected] = useState(false);
  const [files, setFiles] = useState([]);
  const [indexed, setIndexed] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await api.get("/api/health");
        setStatus(res.data.message);
        setConnected(true);
      } catch {
        setStatus("Backend connection failed.");
        setConnected(false);
      }
    }

    checkBackend();
  }, []);

  function handleProjectLoaded(projectFiles) {
    setFiles(projectFiles);
    setIndexed(false);
  }

  function handleIndexed() {
    setIndexed(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center gap-6 py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800">
        🤖 AI Code Mentor
      </h1>

      <div
        className={`px-6 py-3 rounded-lg shadow-md text-lg font-medium ${
          connected
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-red-100 text-red-700 border border-red-400"
        }`}
      >
        {status}
      </div>

      <UploadZip onProjectLoaded={handleProjectLoaded} />

      <div className="text-sm text-gray-400">OR</div>

      <ImportGithub onProjectLoaded={handleProjectLoaded} />

      {files.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            {files.length} files loaded and ready to index
          </p>

          <IndexProject onIndexed={handleIndexed} />
        </>
      )}

      {indexed && <ChatBox />}
    </div>
  );
}

export default App;