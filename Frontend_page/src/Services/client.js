import axios from "axios";

// Read API Base URL from environment variables with fallback
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// Create configured Axios client instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically attach authorization bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling and logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized API access - token may be invalid or expired.");
    } else if (!error.response || error.code === "ERR_NETWORK" || error.message.includes("ERR_CERT")) {
      console.warn("Network Error / SSL Certificate issue detected on API endpoint:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
