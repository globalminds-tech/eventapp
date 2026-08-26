import apiClient from "./client";
import { ENDPOINTS } from "./endpoints";

export const getevent = async () => {
  const response = await apiClient.get(ENDPOINTS.EVENTS.LIST);
  return response.data;
};

export const getEventshow = async (organizerId) => {
  const url = organizerId ? `/superadmin/get-events?organizer=${encodeURIComponent(organizerId)}` : "/superadmin/get-events";
  const res = await apiClient.get(url);
  return res.data;
};

export const saveEventDetails = async (data) => {
  const res = await apiClient.post(ENDPOINTS.EVENTS.DETAILS, data);
  return res.data;
};

export const completeEvent = async (formData) => {
  const res = await apiClient.post("/superadmin/api/complete-event", formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
};

export const saveBooking = async (data) => {
  const res = await apiClient.post("/superadmin/api/booking", data);
  return res.data;
};

export const saveLayout = async (data) => {
  const res = await apiClient.post("/superadmin/api/layout", data);
  return res.data;
};

export const saveDocuments = async (data) => {
  const res = await apiClient.post("/superadmin/upload/all-docs", data, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
};

export const saveTerms = async (data) => {
  const res = await apiClient.post("/superadmin/api/save-terms", data);
  return res.data;
};

export const saveVendors = async (data) => {
  const res = await apiClient.post("/superadmin/api/save-vendors-sponsors", data);
  return res.data;
};

export const finalSubmit = async (data) => {
  const res = await apiClient.post("/superadmin/event/final-submit", data);
  return res.data;
};

export const updateEvent = async (id, formData) => {
  const res = await apiClient.put(ENDPOINTS.EVENTS.UPDATE(id), formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
};

export const deleteEvent = async (id) => {
  const res = await apiClient.delete(ENDPOINTS.EVENTS.DELETE(id));
  return res.data;
};

export const getEventFullDetails = async (id) => {
  const res = await apiClient.get(`/superadmin/api/event-full-details/${id}`);
  return res.data;
};

export const getFullEventDetails = async (id) => {
  const res = await apiClient.get(`/superuser/event-full-details/${id}`);
  return res.data;
};

export const getEventById = async (id) => {
  const res = await apiClient.get(`/superadmin/booking/event/${id}`);
  return res.data;
};

export const getEventBulkDetails = async () => {
  const res = await apiClient.get("/superadmin/api/event-bulk-details");
  return res.data;
};

export const getApprovedEvents = async () => {
  const res = await apiClient.get("/superadmin/api/approved-events");
  return res.data;
};

export const getHomeEventshow = async () => {
  const res = await apiClient.get("/superadmin/home/get-events");
  return res.data;
};

export const getAllEvents = async () => {
  const res = await apiClient.get("/superuser/get-events");
  return res.data;
};

export const updateEventStatus = async (id, status) => {
  const res = await apiClient.put(`/superuser/update-status/${id}`, { status });
  return res.data;
};
