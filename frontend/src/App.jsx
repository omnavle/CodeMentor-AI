import { useEffect, useState } from "react";
import api from "./api/api";

function App() {
  const [status, setStatus] = useState("Checking backend connection...");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Call the FastAPI health check endpoint when the app loads
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        🤖 AI Code Mentor
      </h1>

      <div
        className={`px-6 py-3 rounded-lg shadow-md text-lg font-medium ${
          isConnected
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-red-100 text-red-700 border border-red-400"
        }`}
      >
        {status}
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        Milestone 1: Frontend ↔ Backend Connection Test
      </p>
    </div>
  );
}

export default App;