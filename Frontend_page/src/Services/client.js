import axios from "axios";

// Read API Base URL from environment variables with fallback
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventsapi.sportalytics.in";

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
    // Optionally handle global 401 unauthorized errors
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized API access - token may be invalid or expired.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
