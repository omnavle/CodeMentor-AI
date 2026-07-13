import os
import stat
import shutil
import zipfile

WORKSPACE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "workspace", "current_project")
)

IGNORE_DIRS = {
    "node_modules",
    ".git",
    "venv",
    "env",
    ".venv",
    "__pycache__",
    "dist",
    "build",
    ".next",
    "target",
    ".idea",
    ".vscode",
    "coverage",
}

ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".go",
    ".rb",
    ".php",
    ".cs",
    ".rs",
    ".kt",
    ".swift",
    ".html",
    ".css",
    ".json",
    ".md",
    ".txt",
    ".yml",
    ".yaml",
}

MAX_FILE_SIZE = 500000


def remove_readonly(func, path, exc_info):
    os.chmod(path, stat.S_IWRITE)
    func(path)


def clear_workspace():
    if os.path.exists(WORKSPACE_DIR):
        shutil.rmtree(WORKSPACE_DIR, onerror=remove_readonly)

    os.makedirs(WORKSPACE_DIR, exist_ok=True)


def extract_zip(zip_path):
    with zipfile.ZipFile(zip_path, "r") as zip_file:
        zip_file.extractall(WORKSPACE_DIR)


def is_allowed_file(file_path):
    _, ext = os.path.splitext(file_path)

    if ext.lower() not in ALLOWED_EXTENSIONS:
        return False

    try:
        if os.path.getsize(file_path) > MAX_FILE_SIZE:
            return False
    except OSError:
        return False

    return True


def read_project_files():
    files_data = []

    for root, dirs, files in os.walk(WORKSPACE_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            full_path = os.path.join(root, file)

            if not is_allowed_file(full_path):
                continue

            relative_path = os.path.relpath(full_path, WORKSPACE_DIR)

            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except:
                continue

            files_data.append(
                {
                    "path": relative_path.replace("\\", "/"),
                    "size_bytes": os.path.getsize(full_path),
                    "lines": len(content.splitlines()),
                }
            )

    return files_data


def read_project_files_with_content():
    files_data = []

    for root, dirs, files in os.walk(WORKSPACE_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            full_path = os.path.join(root, file)

            if not is_allowed_file(full_path):
                continue

            relative_path = os.path.relpath(full_path, WORKSPACE_DIR)

            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except:
                continue

            if not content.strip():
                continue

            files_data.append(
                {
                    "path": relative_path.replace("\\", "/"),
                    "content": content,
                }
            )

    return files_data