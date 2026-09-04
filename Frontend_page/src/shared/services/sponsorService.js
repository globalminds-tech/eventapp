import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

export const getSponsors = async (organizerId) => {
  const url = organizerId ? `/superadmin/api/sponsors?organizer_id=${organizerId}` : "/superadmin/api/sponsors";
  const res = await apiClient.get(url);
  return res.data;
};

export const getSponsorNames = async () => {
  const res = await apiClient.get(ENDPOINTS.SPONSORS.NAMES);
  return res.data;
};

export const createSponsor = async (formData) => {
  const res = await apiClient.post("/superadmin/api/sponsorship", formData);
  return res.data;
};

export const getSponsorById = async (id) => {
  const res = await apiClient.get(`/superadmin/api/sponsor/${id}`);
  return res.data;
};

export const updateSponsor = async (id, data) => {
  const res = await apiClient.put(`/superadmin/api/update_sponsor/${id}`, data);
  return res.data;
};

export const deleteSponsor = async (id) => {
  const res = await apiClient.delete(`/superadmin/api/delete_sponsor/${id}`);
  return res.data;
};

export const exportSponsorsExcel = async () => {
  const res = await apiClient.get("/superadmin/api/sponsors/export/excel", { responseType: "blob" });
  return res;
};

export const exportSponsorsPdf = async () => {
  const res = await apiClient.get("/superadmin/api/sponsors/export/pdf", { responseType: "blob" });
  return res;
};
