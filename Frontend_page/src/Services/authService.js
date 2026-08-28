import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

export const loginUser = (formData) => {
  return apiClient.post(ENDPOINTS.AUTH.LOGIN, formData);
};

export const registerUser = (formData) => {
  return apiClient.post(ENDPOINTS.AUTH.REGISTER, formData);
};

export const registerOrganizer = (formData) => {
  return apiClient.post(ENDPOINTS.AUTH.REGISTER_ORGANIZER, formData);
};

export const registerExhibitor = (formData) => {
  return apiClient.post(ENDPOINTS.AUTH.REGISTER_EXHIBITOR, formData);
};

export const sendOtp = async (email) => {
  try {
    const res = await apiClient.post("/api/v1/auth/otp/send", { email });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      const res = await apiClient.post("/api/v1/auth/otp/send-otp", { email });
      return res.data;
    }
    throw err;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const res = await apiClient.post("/api/v1/auth/otp/verify", { email, otp });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      const res = await apiClient.post("/api/v1/auth/otp/verify-otp", { email, otp });
      return res.data;
    }
    throw err;
  }
};

export const resendOtp = async (email) => {
  try {
    const res = await apiClient.post("/api/v1/auth/otp/resend", { email });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      const res = await apiClient.post("/api/v1/auth/otp/resend-otp", { email });
      return res.data;
    }
    throw err;
  }
};

export const resetsendOtp = async (data) => {
  const email = typeof data === "string" ? data : data.email;
  return sendOtp(email);
};

export const resetverifyOtp = async (data) => {
  const email = data.email;
  const otp = data.otp;
  return verifyOtp(email, otp);
};

export const resetresendOtp = async (data) => {
  const email = typeof data === "string" ? data : data.email;
  return resendOtp(email);
};

export const resetPassword = async (data) => {
  const res = await apiClient.post("/api/v1/auth/reset-password", data);
  return res.data;
};

export const getUserProfile = async (userId) => {
  const res = await apiClient.get(`/superadmin/api/user/profile/${userId}`);
  return res.data;
};

export const updateUserProfile = async (formData) => {
  const res = await apiClient.post("/superadmin/api/user/update_profile", formData);
  return res.data;
};
