import axios from "axios";
import { ENV } from "../../config/env";
import { setCredentials, logout } from "@/app/store/authSlice";

let storeRef = null;

export const injectStore = (_store) => {
  storeRef = _store;
};

const axiosClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Attach Bearer token from Redux in-memory state or localStorage fallback
axiosClient.interceptors.request.use(
  (config) => {
    let token = null;
    if (storeRef?.getState) {
      token = storeRef.getState()?.auth?.accessToken;
    }
    if (!token) {
      token = localStorage.getItem("token") || sessionStorage.getItem("token");
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Global 401 handling & automatic silent token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Do not attempt refresh if the failed request was login, register, or refresh itself
      const requestUrl = originalRequest.url || "";
      if (
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${ENV.API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const resData = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = resData?.access_token || resData?.token;
        const userObj = resData?.user;

        if (newAccessToken) {
          if (storeRef?.dispatch) {
            storeRef.dispatch(
              setCredentials({
                user: userObj,
                token: newAccessToken,
                role: userObj?.active_role || (userObj?.roles && userObj.roles[0]) || "user",
              })
            );
          }
          axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return axiosClient(originalRequest);
        } else {
          throw new Error("No token returned from refresh endpoint");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (storeRef?.dispatch) {
          storeRef.dispatch(logout());
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

