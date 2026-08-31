import axiosClient from "@/shared/api/axiosClient";
import { EXHIBITOR_ENDPOINTS } from "./exhibitor.endpoints";

export const exhibitorApi = {
  getEventStalls: async (eventId) => {
    const res = await axiosClient.get(EXHIBITOR_ENDPOINTS.STALLS(eventId));
    return res.data;
  },

  applyStallBooking: async (payload) => {
    const res = await axiosClient.post(EXHIBITOR_ENDPOINTS.APPLY_STALL, payload);
    return res.data;
  },

  getExhibitorBookings: async (userId) => {
    const res = await axiosClient.get(EXHIBITOR_ENDPOINTS.MY_BOOKINGS(userId));
    return res.data;
  },

  reviewStallBooking: async (bookingId, payload) => {
    const res = await axiosClient.put(EXHIBITOR_ENDPOINTS.REVIEW_BOOKING(bookingId), payload);
    return res.data;
  },
};

export default exhibitorApi;
