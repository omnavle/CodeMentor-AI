import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.file_service import (
    clear_workspace,
    extract_zip,
    read_project_files,
)
from services.github_service import clone_github_repo

# Load environment variables from .env file
load_dotenv()

# Create the FastAPI application instance
app = FastAPI(title="AI Code Mentor Backend")

# Allow the React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GithubImportRequest(BaseModel):
    """Request body schema for importing a GitHub repository."""
    repo_url: str


@app.get("/")
def root():
    """Simple root endpoint to check if server is alive."""
    return {"message": "AI Code Mentor Backend is running"}


@app.get("/api/health")
def health_check():
    """Used by the frontend to confirm the backend is connected."""
    return {"status": "success", "message": "Backend Connected Successfully"}


@app.post("/api/upload-zip")
async def upload_zip(file: UploadFile = File(...)):
    """
    Accepts a ZIP file upload, extracts it, and reads all
    valid source files inside it.
    """
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")

    clear_workspace()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as temp_zip:
        shutil.copyfileobj(file.file, temp_zip)
        temp_zip_path = temp_zip.name

    try:
        extract_zip(temp_zip_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract ZIP: {str(e)}")
    finally:
        os.remove(temp_zip_path)

    files_info = read_project_files()

    if len(files_info) == 0:
        raise HTTPException(
            status_code=400,
            detail="No readable source files found in this ZIP",
        )

    return {
        "status": "success",
        "message": "Project uploaded and extracted successfully",
        "total_files": len(files_info),
        "files": files_info,
    }


@app.post("/api/import-github")
def import_github(request: GithubImportRequest):
    """
    Accepts a public GitHub repository URL, clones it,
    and reads all valid source files inside it.
    """
    try:
        clone_github_repo(request.repo_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    files_info = read_project_files()

    if len(files_info) == 0:
        raise HTTPException(
            status_code=400,
            detail="No readable source files found in this repository",
        )

    return {
        "status": "success",
        "message": "Repository imported successfully",
        "total_files": len(files_info),
        "files": files_info,
    }


@app.get("/api/files")
def list_current_files():
    """
    Returns the list of files currently loaded in the workspace.
    """
    files_info = read_project_files()
    return {
        "status": "success",
        "total_files": len(files_info),
        "files": files_info,
    }