import axiosClient from "@/shared/api/axiosClient";
import { SUPERUSER_ENDPOINTS } from "./superuser.endpoints";

export const superuserApi = {
  getDashboardStats: async (period = "30d") => {
    const res = await axiosClient.get(SUPERUSER_ENDPOINTS.DASHBOARD_STATS(period));
    return res.data;
  },

  getAllEvents: async () => {
    const res = await axiosClient.get(SUPERUSER_ENDPOINTS.ALL_EVENTS);
    return res.data;
  },

  updateEventStatus: async (eventId, status) => {
    const res = await axiosClient.put(SUPERUSER_ENDPOINTS.UPDATE_EVENT_STATUS(eventId), { status });
    return res.data;
  },

  getPendingOrganizers: async () => {
    const res = await axiosClient.get(SUPERUSER_ENDPOINTS.PENDING_ORGANIZERS);
    return res.data;
  },

  updateOrganizerKycStatus: async (userId, status) => {
    const res = await axiosClient.put(SUPERUSER_ENDPOINTS.UPDATE_KYC(userId), { status });
    return res.data;
  },
};

export default superuserApi;
