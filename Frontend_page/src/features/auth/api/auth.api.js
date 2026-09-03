import axiosClient from "@/shared/api/axiosClient";
import { AUTH_ENDPOINTS } from "./auth.endpoints";

export const authApi = {
  login: async (credentials) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.REGISTER, userData);
    return res.data;
  },

  registerOrganizer: async (organizerData) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.REGISTER_ORGANIZER, organizerData);
    return res.data;
  },

  registerExhibitor: async (exhibitorData) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.REGISTER_EXHIBITOR, exhibitorData);
    return res.data;
  },

  upgradeOrganizerStep1: async (data) => {
    const res = await axiosClient.patch(AUTH_ENDPOINTS.UPGRADE_ORGANIZER_STEP1, data);
    return res.data;
  },

  upgradeOrganizerComplete: async (data) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.UPGRADE_ORGANIZER_COMPLETE, data);
    return res.data;
  },

  upgradeExhibitorStep1: async (data) => {
    const res = await axiosClient.patch(AUTH_ENDPOINTS.UPGRADE_EXHIBITOR_STEP1, data);
    return res.data;
  },

  upgradeExhibitorComplete: async (data) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.UPGRADE_EXHIBITOR_COMPLETE, data);
    return res.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.put(AUTH_ENDPOINTS.UPLOAD_AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  getMe: async () => {
    const res = await axiosClient.get(AUTH_ENDPOINTS.ME);
    return res.data;
  },

  resetPassword: async (payload) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
    return res.data;
  },
};

export default authApi;

