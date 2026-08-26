import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

export const getPolicies = async (organizerId) => {
  const res = await apiClient.get(`/superadmin/api/all-policies/${organizerId}`);
  return res.data;
};

export const getPoliciess = () => {
  return apiClient.get(ENDPOINTS.POLICIES.LIST);
};

export const getPolicyById = (id) => {
  return apiClient.get(ENDPOINTS.POLICIES.SINGLE(id));
};

export const createPolicy = (data) => {
  return apiClient.post(ENDPOINTS.POLICIES.CREATE, data);
};

export const updatePolicy = (id, data) => {
  return apiClient.put(ENDPOINTS.POLICIES.UPDATE(id), data);
};

export const deletePolicy = (id) => {
  return apiClient.delete(ENDPOINTS.POLICIES.DELETE(id));
};

export const exportPoliciesExcel = () => {
  return apiClient.get(ENDPOINTS.POLICIES.EXPORT_EXCEL, { responseType: "blob" });
};

export const exportPoliciesPdf = () => {
  return apiClient.get(ENDPOINTS.POLICIES.EXPORT_PDF, { responseType: "blob" });
};
