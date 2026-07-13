from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create the FastAPI application instance
app = FastAPI(title="AI Code Mentor Backend")

# Allow the React frontend (running on a different port) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Simple root endpoint to check if server is alive."""
    return {"message": "AI Code Mentor Backend is running"}


@app.get("/api/health")
def health_check():
    """
    This endpoint is used by the frontend to confirm
    that the backend is connected and working.
    """
    return {"status": "success", "message": "Backend Connected Successfully"}