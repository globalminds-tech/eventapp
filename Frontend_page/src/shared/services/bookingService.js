import apiClient from "./client";

export const bookEvent = async (data) => {
  try {
    const res = await apiClient.post("/api/v1/user/book-event", data);
    return res.data;
  } catch (err) {
    // Graceful fallback for legacy root route
    if (err?.response?.status === 404) {
      const fallbackRes = await apiClient.post("/user/book-event", data);
      return fallbackRes.data;
    }
    throw err;
  }
};

export const bookStall = async (formData) => {
  const res = await apiClient.post("/api/v1/exhibitors/book-stall", formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
};

export const getMyBookings = async (userId, params = {}) => {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.search && params.search.trim()) query.append("search", params.search.trim());
  const queryString = query.toString() ? `?${query.toString()}` : "";

  const baseUrl = userId ? `/api/v1/exhibitors/my-bookings/${userId}` : "/api/v1/exhibitors/my-bookings";
  const res = await apiClient.get(`${baseUrl}${queryString}`);
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await apiClient.get(`/api/v1/exhibitors/booking/${id}`);
  return res.data;
};

export const getEventBookingStatus = async (eventId, userId) => {
  const url = userId
    ? `/api/v1/exhibitors/events/${eventId}/booking-status?user_id=${userId}`
    : `/api/v1/exhibitors/events/${eventId}/booking-status`;
  const res = await apiClient.get(url);
  return res.data;
};

export const updateBooking = async (id, data) => {
  const res = await apiClient.put(`/api/v1/exhibitors/update-booking/${id}`, data);
  return res.data;
};

export const getAllBookings = async () => {
  const res = await apiClient.get("/superadmin/api/admin/bookings");
  return res.data;
};

export const getBookingsByEvent = async (eventId) => {
  const res = await apiClient.get(`/superadmin/api/admin/bookings/event/${eventId}`);
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await apiClient.put(`/superadmin/api/admin/update-booking-status/${id}`, { status });
  return res.data;
};

export const getapprovalBookingById = async (id) => {
  const res = await apiClient.get(`/superadmin/api/admin/booking/${id}`);
  return res.data;
};

export const getExhibitorBookings = async () => {
  const res = await apiClient.get("/superadmin/api/exhibitor/bookings_details");
  return res.data;
};

export const createRazorpayOrder = async (data) => {
  const res = await apiClient.post("/api/v1/payments/create-order", data);
  return res.data;
};

export const addExhibitorLead = async (data) => {
  const res = await apiClient.post("/api/v1/exhibitors/leads", data);
  return res.data;
};

export const getExhibitorLeads = async (eventId, search = "") => {
  const query = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const res = await apiClient.get(`/api/v1/exhibitors/leads/${eventId}${query}`);
  return res.data;
};

export const getExhibitorInvoices = async () => {
  const res = await apiClient.get("/api/v1/finances/exhibitor/invoices");
  return res.data;
};
