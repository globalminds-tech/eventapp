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

  resetPassword: async (payload) => {
    const res = await axiosClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
    return res.data;
  },
};

export default authApi;
