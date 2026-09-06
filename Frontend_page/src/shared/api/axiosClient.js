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
  timeout: 15000,
});

// Request Interceptor: Attach Bearer token & track request start for slow-network detection
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

    // Set slow request timer (warn if an active request takes > 4000ms)
    if (typeof window !== "undefined") {
      const slowTimer = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("network:slow-request", {
            detail: { message: "Server request is taking longer than expected. Retrying in background..." },
          })
        );
      }, 4000);
      config._slowTimer = slowTimer;
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

// Response Interceptor: Global 401 handling, 429 rate limit toasts, and slow-network cleanup
axiosClient.interceptors.response.use(
  (response) => {
    if (response.config?._slowTimer) {
      clearTimeout(response.config._slowTimer);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest?._slowTimer) {
      clearTimeout(originalRequest._slowTimer);
    }

    // Intercept HTTP 429 Rate Limit
    if (error.response?.status === 429) {
      if (typeof window !== "undefined") {
        const retryAfter =
          error.response.data?.retry_after ||
          parseInt(error.response.headers?.["retry-after"], 10) ||
          60;
        const detail =
          error.response.data?.detail ||
          `Rate limit exceeded. Please slow down and wait ${retryAfter}s.`;
        window.dispatchEvent(
          new CustomEvent("network:rate-limited", {
            detail: { detail, retry_after: retryAfter },
          })
        );
      }
      return Promise.reject(error);
    }

    // Auto-retry once for idempotent GET requests on network failure or timeout
    if (
      originalRequest &&
      originalRequest.method?.toLowerCase() === "get" &&
      !originalRequest._retry &&
      !originalRequest._networkRetry &&
      (!error.response || error.code === "ECONNABORTED")
    ) {
      originalRequest._networkRetry = true;
      await new Promise((res) => setTimeout(res, 1200));
      return axiosClient(originalRequest);
    }

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

