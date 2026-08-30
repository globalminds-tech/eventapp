import axiosClient from "@/shared/api/axiosClient";
import { VENDOR_ENDPOINTS } from "./vendor.endpoints";

export const vendorApi = {
  getVendors: async () => {
    const res = await axiosClient.get(VENDOR_ENDPOINTS.LIST);
    return res.data;
  },

  getVendorTypes: async () => {
    const res = await axiosClient.get(VENDOR_ENDPOINTS.TYPES);
    return res.data;
  },

  getVendorNames: async () => {
    const res = await axiosClient.get(VENDOR_ENDPOINTS.NAMES);
    return res.data;
  },

  getVendorById: async (id) => {
    const res = await axiosClient.get(VENDOR_ENDPOINTS.SINGLE(id));
    return res.data;
  },

  createVendor: async (data) => {
    const res = await axiosClient.post(VENDOR_ENDPOINTS.CREATE, data);
    return res.data;
  },

  updateVendor: async (id, data) => {
    const res = await axiosClient.put(VENDOR_ENDPOINTS.UPDATE(id), data);
    return res.data;
  },

  deleteVendor: async (id) => {
    const res = await axiosClient.delete(VENDOR_ENDPOINTS.DELETE(id));
    return res.data;
  },
};

export default vendorApi;
