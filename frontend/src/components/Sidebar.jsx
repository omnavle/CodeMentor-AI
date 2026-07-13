import {
    FaCloudUploadAlt,
    FaGithub,
    FaFolderOpen,
    FaBrain,
    FaFolder,
    FaChartBar
} from "react-icons/fa";

function Sidebar({ active, setActive, files }) {

    return (

        <div className="sidebar">

            <h2>

                🤖

                <span>
                    AI Code Mentor
                </span>

            </h2>

            <button
                className={active === "upload" ? "active" : ""}
                onClick={() => setActive("upload")}
            >
                <FaCloudUploadAlt />
                Upload ZIP
            </button>

            <button
                className={active === "upload" ? "active" : ""}
                onClick={() => setActive("upload")}
            >
                <FaGithub />
                GitHub Repo
            </button>

            <button
                disabled={!files.length}
                className={active === "project" ? "active" : ""}
                onClick={() => setActive("project")}
            >
                <FaFolderOpen />
                Project Info
            </button>

            <button
                disabled={!files.length}
                className={active === "index" ? "active" : ""}
                onClick={() => setActive("index")}
            >
                <FaBrain />
                Build Index
            </button>

            <button
                disabled={!files.length}
                className={active === "files" ? "active" : ""}
                onClick={() => setActive("files")}
            >
                <FaFolder />
                Files
            </button>

            <button
                disabled={!files.length}
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