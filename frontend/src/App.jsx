import { useEffect, useState } from "react";
import api from "./api/api";
import UploadZip from "./components/UploadZip";
import ImportGithub from "./components/ImportGithub";
import IndexProject from "./components/IndexProject";
import ChatBox from "./components/ChatBox";

function App() {
  const [status, setStatus] = useState("Checking backend connection...");
  const [isConnected, setIsConnected] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [isIndexed, setIsIndexed] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/api/health");
        setStatus(response.data.message);
        setIsConnected(true);
      } catch (error) {
        setStatus("Failed to connect to backend. Is FastAPI running?");
        setIsConnected(false);
      }
    };

    checkBackend();
  }, []);

  const handleProjectLoaded = (files) => {
    setProjectFiles(files);
    setIsIndexed(false); // a new project was loaded, so old index is no longer valid
  };

  const handleIndexed = () => {
    setIsIndexed(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 gap-6">
      <h1 className="text-3xl font-bold text-gray-800">🤖 AI Code Mentor</h1>

      <div
        className={`px-6 py-3 rounded-lg shadow-md text-lg font-medium ${
          isConnected
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-red-100 text-red-700 border border-red-400"
        }`}
      >
        {status}
      </div>

      <UploadZip onProjectLoaded={handleProjectLoaded} />

      <div className="text-gray-400 text-sm">— OR —</div>

      <ImportGithub onProjectLoaded={handleProjectLoaded} />

      {projectFiles.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            ✅ {projectFiles.length} files loaded and ready to index
          </p>
          <IndexProject onIndexed={handleIndexed} />
        </>
      )}

      {isIndexed && <ChatBox />}
    </div>
  );
}

export default App;