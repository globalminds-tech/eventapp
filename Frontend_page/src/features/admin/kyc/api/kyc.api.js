import axiosClient from "@/shared/api/axiosClient";
import { KYC_ENDPOINTS } from "./kyc.endpoints";

export const kycApi = {
  getPendingOrganizers: async () => {
    const res = await axiosClient.get(KYC_ENDPOINTS.PENDING_ORGANIZERS);
    return res.data;
  },

  updateKycStatus: async (userId, status) => {
    const res = await axiosClient.put(KYC_ENDPOINTS.UPDATE_STATUS(userId), { status });
    return res.data;
  },
};

export default kycApi;
