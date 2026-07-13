import { useEffect, useRef, useState } from "react";
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

  const indexRef = useRef(null);
  const chatRef = useRef(null);

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

    setTimeout(() => {
      indexRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 500);
  }

  function handleIndexed() {
    setIndexed(true);

    setTimeout(() => {
      chatRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 700);
  }

  return (
    <div className="app">

      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      <section className="hero">

        <div className="hero-badge">
          AI Powered RAG Assistant
        </div>

        <h1>
          AI Code Mentor
        </h1>

        <p>
          Upload a ZIP or Import any Public GitHub Repository.
          <br />
          Build embeddings and chat with your code using AI.
        </p>

        <div
          className={`status ${
            connected ? "online" : "offline"
          }`}
        >
          {connected ? "🟢" : "🔴"} {status}
        </div>

      </section>

      <section className="features">

        <div className="feature-card">
          ⚡
          <h3>AI Powered</h3>
          <p>Gemini + LangChain</p>
        </div>

        <div className="feature-card">
          📂
          <h3>ZIP Upload</h3>
          <p>Import any project</p>
        </div>

        <div className="feature-card">
          🌐
          <h3>GitHub Import</h3>
          <p>Clone public repositories</p>
        </div>

        <div className="feature-card">
          🧠
          <h3>Semantic Search</h3>
          <p>Powered by RAG</p>
        </div>

      </section>

      <section className="glass-card">

        <h2>Choose Your Project</h2>

        <UploadZip onProjectLoaded={handleProjectLoaded} />

        <div className="divider">
          <span>OR</span>
        </div>

        <ImportGithub onProjectLoaded={handleProjectLoaded} />

      </section>

      {files.length > 0 && (
        <section
          ref={indexRef}
          className="glass-card fade"
        >

          <div className="step">
            ✅ Project Loaded
          </div>

          <div className="summary">

            <div>
              <h3>{files.length}</h3>
              <p>Files</p>
            </div>

            <div>
              <h3>Ready</h3>
              <p>Status</p>
            </div>

            <div>
              <h3>AI</h3>
              <p>Embeddings</p>
            </div>

          </div>

          <IndexProject onIndexed={handleIndexed} />

        </section>
      )}

      {indexed && (
        <section
          ref={chatRef}
          className="glass-card fade"
        >

          <div className="step">
            🤖 AI Assistant Ready
          </div>

          <ChatBox />

        </section>
      )}

    </div>
  );
}

export default App;