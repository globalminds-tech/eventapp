import axiosClient from "@/shared/api/axiosClient";
import { APPROVAL_ENDPOINTS } from "./approval.endpoints";

export const approvalApi = {
  getEvents: async () => {
    const res = await axiosClient.get(APPROVAL_ENDPOINTS.LIST);
    return res.data;
  },

  updateEventStatus: async (eventId, status, rejectionReason = "") => {
    const res = await axiosClient.put(APPROVAL_ENDPOINTS.UPDATE_STATUS(eventId), { status, rejection_reason: rejectionReason });
    return res.data;
  },

  getInspectionDetails: async (eventId) => {
    const res = await axiosClient.get(APPROVAL_ENDPOINTS.INSPECTION_DETAILS(eventId));
    return res.data;
  },
};

export default approvalApi;
