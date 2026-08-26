import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

export const loginUser = (formData) => {
  return apiClient.post(ENDPOINTS.AUTH.LOGIN, formData);
};

export const registerUser = (formData) => {
  return apiClient.post(ENDPOINTS.AUTH.REGISTER, formData);
};

export const sendOtp = async (email) => {
  const res = await apiClient.post("/otp/send-otp", { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await apiClient.post("/otp/verify-otp", { email, otp });
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await apiClient.post("/otp/resend-otp", { email });
  return res.data;
};

export const resetsendOtp = async (data) => {
  const res = await apiClient.post("/otp/reset/send-otp", data);
  return res.data;
};

export const resetverifyOtp = async (data) => {
  const res = await apiClient.post("/otp/reset/verify-otp", data);
  return res.data;
};

export const resetresendOtp = async (data) => {
  const res = await apiClient.post("/otp/reset/resend-otp", data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await apiClient.post("/otp/reset-password", data);
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
