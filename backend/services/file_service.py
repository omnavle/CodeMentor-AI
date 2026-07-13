import os
import shutil
import zipfile

# Folder where we extract and keep the currently loaded project
WORKSPACE_DIR = os.path.join(os.path.dirname(__file__), "..", "workspace", "current_project")
WORKSPACE_DIR = os.path.abspath(WORKSPACE_DIR)

# Folder names we should completely skip while reading files
IGNORE_DIRS = {
    "node_modules", ".git", "venv", "env", ".venv",
    "__pycache__", "dist", "build", ".next", "target",
    ".idea", ".vscode", "coverage",
}

# Only read files with these extensions (source code + docs/config)
ALLOWED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".cpp", ".h", ".hpp",
    ".go", ".rb", ".php", ".cs", ".rs", ".kt", ".swift", ".html", ".css",
    ".json", ".md", ".txt", ".yml", ".yaml",
}

# Skip files larger than this (in bytes) to avoid huge/binary files
MAX_FILE_SIZE_BYTES = 500_000  # ~500 KB


def clear_workspace():
    """
    Deletes any previously loaded project so we always
    start fresh with the newly uploaded/imported project.
    """
    if os.path.exists(WORKSPACE_DIR):
        shutil.rmtree(WORKSPACE_DIR)
    os.makedirs(WORKSPACE_DIR, exist_ok=True)


def extract_zip(zip_path: str):
    """
    Extracts the given ZIP file into the workspace directory.
    """
    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(WORKSPACE_DIR)


def is_allowed_file(file_path: str) -> bool:
    """
    Checks whether a file should be read, based on its extension and size.
    """
    _, ext = os.path.splitext(file_path)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        return False

    try:
        if os.path.getsize(file_path) > MAX_FILE_SIZE_BYTES:
            return False
    except OSError:
        return False

    return True


def read_project_files():
    """
    Walks through the workspace directory, skips ignored folders,
    and returns metadata about every valid source file found.
    """
    files_info = []

    for root, dirs, files in os.walk(WORKSPACE_DIR):
        # Modify dirs in-place to skip ignored folders during os.walk
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file_name in files:
            full_path = os.path.join(root, file_name)

            if not is_allowed_file(full_path):
                continue

            # Path relative to workspace, so it looks clean (e.g. "src/App.jsx")
            relative_path = os.path.relpath(full_path, WORKSPACE_DIR)

            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except Exception:
                continue

            files_info.append({
                "path": relative_path.replace("\\", "/"),  # normalize Windows paths
                "size_bytes": os.path.getsize(full_path),
                "lines": len(content.splitlines()),
            })

    return files_info