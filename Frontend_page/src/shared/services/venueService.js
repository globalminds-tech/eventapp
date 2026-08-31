import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

export const get_Venues_details = async (organizerId) => {
  const url = organizerId ? `${ENDPOINTS.VENUES.DETAILS}?organizer_id=${organizerId}` : ENDPOINTS.VENUES.DETAILS;
  const res = await apiClient.get(url);
  return res.data;
};

export const getVenues = async (organizerId) => {
  const url = organizerId ? `${ENDPOINTS.VENUES.LIST}?organizer_id=${organizerId}` : ENDPOINTS.VENUES.LIST;
  const res = await apiClient.get(url);
  return res.data;
};

export const getVenueDetails = async (id) => {
  const res = await apiClient.get(ENDPOINTS.VENUES.SINGLE(id));
  return res.data;
};

export const createVenue = async (data) => {
  const res = await apiClient.post(ENDPOINTS.VENUES.CREATE, data);
  return res.data;
};

export const updateVenue = async (id, data) => {
  const res = await apiClient.put(ENDPOINTS.VENUES.UPDATE(id), data);
  return res.data;
};

export const deleteVenue = (id) => {
  return apiClient.delete(ENDPOINTS.VENUES.DELETE(id));
};

export const exportVenuesExcel = () => {
  return apiClient.get(ENDPOINTS.VENUES.EXPORT_EXCEL, { responseType: "blob" });
};

export const exportVenuesPdf = () => {
  return apiClient.get(ENDPOINTS.VENUES.EXPORT_PDF, { responseType: "blob" });
};
