import axiosClient from "@/shared/api/axiosClient";
import { USER_ENDPOINTS } from "./user.endpoints";

export const userApi = {
  getUsers: async () => {
    const res = await axiosClient.get(USER_ENDPOINTS.LIST);
    return res.data;
  },

  getPendingOrganizers: async () => {
    const res = await axiosClient.get(USER_ENDPOINTS.PENDING_ORGANIZERS);
    return res.data;
  },

  updateKycStatus: async (userId, status) => {
    const res = await axiosClient.put(USER_ENDPOINTS.UPDATE_KYC(userId), { status });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await axiosClient.get(USER_ENDPOINTS.SINGLE(id));
    return res.data;
  },
};

export default userApi;
