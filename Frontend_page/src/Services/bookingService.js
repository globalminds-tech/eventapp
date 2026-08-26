import apiClient from "./client";

export const bookEvent = async (data) => {
  const res = await apiClient.post("/user/book-event", data);
  return res.data;
};

export const bookStall = async (formData) => {
  const res = await apiClient.post("/exhibitor/api/book-stall", formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
};

export const getMyBookings = async (userId) => {
  const res = await apiClient.get(`/exhibitor/api/my-bookings/${userId}`);
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await apiClient.get(`/exhibitor/api/booking/${id}`);
  return res.data;
};

export const updateBooking = async (id, data) => {
  const res = await apiClient.put(`/exhibitor/api/update-booking/${id}`, data);
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
