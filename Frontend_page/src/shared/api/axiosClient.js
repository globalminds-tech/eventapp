import axios from "axios";
import { ENV } from "../../config/env";

const axiosClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Attach Bearer token from localStorage/sessionStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling & response unwrapping
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Clear tokens or redirect on auth expiration
      console.warn("Unauthorized request (401). Session may have expired.");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
