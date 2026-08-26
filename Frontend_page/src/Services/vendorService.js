import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

export const getVendors = (organizerId) => {
  const url = organizerId ? `${ENDPOINTS.VENDORS.LIST}?organizer_id=${organizerId}` : ENDPOINTS.VENDORS.LIST;
  return apiClient.get(url);
};

export const getVendorById = (id) => {
  return apiClient.get(ENDPOINTS.VENDORS.SINGLE(id));
};

export const createVendor = (data) => {
  return apiClient.post(ENDPOINTS.VENDORS.CREATE, data);
};

export const updateVendor = (id, data) => {
  return apiClient.put(ENDPOINTS.VENDORS.UPDATE(id), data);
};

export const deleteVendor = (id) => {
  return apiClient.delete(ENDPOINTS.VENDORS.DELETE(id));
};

export const getVendorTypes = async () => {
  const res = await apiClient.get(ENDPOINTS.VENDORS.TYPES);
  return res.data;
};

export const getVendorNames = async (vendorType) => {
  const res = await apiClient.get(`${ENDPOINTS.VENDORS.NAMES}/${vendorType}`);
  return res.data;
};

export const exportVendorsExcel = () => {
  return apiClient.get(ENDPOINTS.VENDORS.EXPORT_EXCEL, { responseType: "blob" });
};

export const exportVendorsPdf = () => {
  return apiClient.get(ENDPOINTS.VENDORS.EXPORT_PDF, { responseType: "blob" });
};
