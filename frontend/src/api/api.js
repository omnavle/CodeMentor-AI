import axios from "axios";

// Base URL of our FastAPI backend
const API_BASE_URL = "http://localhost:8000";

// Create a reusable axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;