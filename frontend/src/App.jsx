import { useEffect, useState } from "react";
import api from "./api/api";

import UploadZip from "./components/UploadZip";
import ImportGithub from "./components/ImportGithub";
import IndexProject from "./components/IndexProject";
import ChatBox from "./components/ChatBox";

import "./App.css";

function App() {
  const [status, setStatus] = useState("Connecting...");
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
        setStatus("Backend Offline");
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

  const projectReady = files.length > 0;
  const chatReady = projectReady && indexed;

  return (
    <div className="app">
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      <header className="topbar">
        <h1>🤖 AI Code Mentor</h1>

        <div className={`status ${connected ? "online" : "offline"}`}>
          {connected ? "🟢" : "🔴"} {status}
        </div>
      </header>

      <section className="workspace">
        {/* LEFT SIDE */}
        <div className="workspace-left">
          <div className="glass-card compact">
            <h2 className="mini-title">Choose Your Project</h2>

            <UploadZip onProjectLoaded={handleProjectLoaded} />

            <div className="divider small">
              <span>OR</span>
            </div>

            <ImportGithub onProjectLoaded={handleProjectLoaded} />

            {projectReady && (
              <div className="mini-status fade">
                <div className="mini-status-row">
                  <span>
                    📁 <strong>{files.length}</strong> Files
                  </span>
                  <span className="dot-sep">•</span>
                  <span>{indexed ? "✅ Indexed" : "⏳ Not Indexed"}</span>
                  <span className="dot-sep">•</span>
                  <span>🧠 AI Embeddings</span>
                </div>

                <IndexProject onIndexed={handleIndexed} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="workspace-right">
          <div className="glass-card compact chat-card">
            {chatReady ? (
              <ChatBox />
            ) : (
              <div className="chat-placeholder">
                <div className="placeholder-icon">🤖</div>

                <h3>AI Assistant Locked</h3>

                <p>
                  {!projectReady
                    ? "Upload a ZIP or import a GitHub repository to get started."
                    : "Now index your project to unlock the chat assistant."}
                </p>

                <div className="placeholder-steps">
                  <div className={`step-pill ${projectReady ? "done" : ""}`}>
                    {projectReady ? "✅" : "1️⃣"} Load Project
                  </div>
                  <div className={`step-pill ${indexed ? "done" : ""}`}>
                    {indexed ? "✅" : "2️⃣"} Build Index
                  </div>
                  <div className="step-pill">3️⃣ Chat</div>
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