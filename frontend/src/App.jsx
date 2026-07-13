import { useEffect, useState } from "react";
import api from "./api/api";

import UploadZip from "./components/UploadZip";
import ImportGithub from "./components/ImportGithub";
import IndexProject from "./components/IndexProject";
import ChatBox from "./components/ChatBox";

import "./App.css";

function App() {

  // Backend status
  const [status, setStatus] = useState("Connecting...");
  const [isConnected, setIsConnected] = useState(false);

  // Store uploaded/imported files
  const [files, setFiles] = useState([]);

  // Check whether project is indexed
  const [isIndexed, setIsIndexed] = useState(false);

  // Check backend when page loads
  useEffect(() => {

    async function checkBackendStatus() {

      try {

        const response = await api.get("/api/health");

        setStatus(response.data.message);
        setIsConnected(true);

      } catch {

        setStatus("Backend Offline");
        setIsConnected(false);

      }

    }

    checkBackendStatus();

  }, []);

  // Called after project is uploaded/imported
  function projectLoaded(projectFiles) {

    setFiles(projectFiles);

    // Reset index status
    setIsIndexed(false);

  }

  // Called after indexing is complete
  function projectIndexed() {

    setIsIndexed(true);

  }

  // Check if project is loaded
  const projectReady = files.length > 0;

  // Chat is available only after indexing
  const chatReady = projectReady && isIndexed;

  return (

    <div className="app">

      {/* Background Effects */}

      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      {/* Header */}

      <header className="topbar">

        <h1>🤖 CodeMentor</h1>

        <div className={`status ${isConnected ? "online" : "offline"}`}>

          {isConnected ? "🟢" : "🔴"} {status}

        </div>

      </header>

      {/* Main Content */}

      <section className="workspace">

        {/* Left Side */}

        <div className="workspace-left">

          <div className="glass-card compact">

            <h2 className="mini-title">

              Choose Your Project

            </h2>

            {/* Upload ZIP */}

            <UploadZip
              onProjectLoaded={projectLoaded}
            />

            <div className="divider small">

              <span>OR</span>

            </div>

            {/* Import GitHub */}

            <ImportGithub
              onProjectLoaded={projectLoaded}
            />

            {/* Show only after project is loaded */}

            {projectReady && (

              <div className="mini-status fade">

                <div className="mini-status-row">

                  <span>

                    📁 <strong>{files.length}</strong> Files

                  </span>

                </div>

                {/* Index Project */}

                <IndexProject
                  onIndexed={projectIndexed}
                />

              </div>

            )}

          </div>

        </div>

        {/* Right Side */}

        <div className="workspace-right">

          <div className="glass-card compact chat-card">

            {chatReady ? (

              <ChatBox />

            ) : (

              <div className="chat-placeholder">

                <div className="placeholder-icon">

                  🤖

                </div>

                <h3>

                  AI Assistant Locked

                </h3>

                <p>

                  {!projectReady
                    ? "Upload a ZIP or import a GitHub repository to get started."
                    : "Now index your project to unlock the chat assistant."}

                </p>

                {/* Steps */}

                <div className="placeholder-steps">

                  <div
                    className={`step-pill ${projectReady ? "done" : ""}`}
                  >

                    {projectReady ? "✅" : "1️⃣"}

                    Load Project

                  </div>

                  <div
                    className={`step-pill ${isIndexed ? "done" : ""}`}
                  >

                    {isIndexed ? "✅" : "2️⃣"}

                    Build Index

                  </div>

                  <div className="step-pill">

                    3️⃣ Chat

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>

    </div>

  );
}

export default App;