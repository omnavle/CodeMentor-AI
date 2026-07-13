import {
  FaCloudUploadAlt,
  FaGithub,
  FaFolderOpen,
  FaBrain,
  FaFolder,
  FaChartBar,
} from "react-icons/fa";

function Sidebar({ active, setActive, files }) {

  return (

    <div className="sidebar">

      {/* Sidebar Title */}

      <h2>
        🤖 <span>AI Code Mentor</span>
      </h2>

      {/* Upload ZIP */}

      <button
        className={active === "upload" ? "active" : ""}
        onClick={() => setActive("upload")}
      >
        <FaCloudUploadAlt />
        Upload ZIP
      </button>

      {/* Import GitHub Repository */}

      <button
        className={active === "upload" ? "active" : ""}
        onClick={() => setActive("upload")}
      >
        <FaGithub />
        GitHub Repo
      </button>

      {/* Project Information */}

      <button
        disabled={files.length === 0}
        className={active === "project" ? "active" : ""}
        onClick={() => setActive("project")}
      >
        <FaFolderOpen />
        Project Info
      </button>

      {/* Build Project Index */}

      <button
        disabled={files.length === 0}
        className={active === "index" ? "active" : ""}
        onClick={() => setActive("index")}
      >
        <FaBrain />
        Build Index
      </button>

      {/* View Files */}

      <button
        disabled={files.length === 0}
        className={active === "files" ? "active" : ""}
        onClick={() => setActive("files")}
      >
        <FaFolder />
        Files
      </button>

      {/* Project Statistics */}

      <button
        disabled={files.length === 0}
        className={active === "stats" ? "active" : ""}
        onClick={() => setActive("stats")}
      >
        <FaChartBar />
        Stats
      </button>

    </div>

  );
}

export default Sidebar;