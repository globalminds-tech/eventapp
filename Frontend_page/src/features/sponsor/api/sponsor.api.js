import axiosClient from "@/shared/api/axiosClient";
import { SPONSOR_ENDPOINTS } from "./sponsor.endpoints";

export const sponsorApi = {
  getSponsors: async () => {
    const res = await axiosClient.get(SPONSOR_ENDPOINTS.LIST);
    return res.data;
  },

  getSponsorById: async (id) => {
    const res = await axiosClient.get(SPONSOR_ENDPOINTS.SINGLE(id));
    return res.data;
  },

  createSponsor: async (data) => {
    const res = await axiosClient.post(SPONSOR_ENDPOINTS.CREATE, data);
    return res.data;
  },

  updateSponsor: async (id, data) => {
    const res = await axiosClient.put(SPONSOR_ENDPOINTS.UPDATE(id), data);
    return res.data;
  },

  deleteSponsor: async (id) => {
    const res = await axiosClient.delete(SPONSOR_ENDPOINTS.DELETE(id));
    return res.data;
  },
};

export default sponsorApi;
