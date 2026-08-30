import axiosClient from "@/shared/api/axiosClient";
import { EVENT_ENDPOINTS } from "./event.endpoints";

export const eventApi = {
  getEvents: async (organizerId) => {
    const url = organizerId ? `${EVENT_ENDPOINTS.LIST}?organizer_id=${organizerId}` : EVENT_ENDPOINTS.LIST;
    const res = await axiosClient.get(url);
    return res.data;
  },

  getEventshow: async (organizerId) => {
    const url = organizerId ? `${EVENT_ENDPOINTS.GET_EVENTS_SHOW}?organizer_id=${organizerId}` : EVENT_ENDPOINTS.GET_EVENTS_SHOW;
    const res = await axiosClient.get(url);
    return res.data;
  },

  getEventFullDetails: async (eventId) => {
    const res = await axiosClient.get(EVENT_ENDPOINTS.FULL_DETAILS(eventId));
    return res.data;
  },

  saveEventDetails: async (data) => {
    const res = await axiosClient.post(EVENT_ENDPOINTS.SAVE_DETAILS, data);
    return res.data;
  },

  saveBooking: async (data) => {
    const res = await axiosClient.post(EVENT_ENDPOINTS.SAVE_BOOKING, data);
    return res.data;
  },

  saveLayout: async (data) => {
    const res = await axiosClient.post(EVENT_ENDPOINTS.SAVE_LAYOUT, data);
    return res.data;
  },

  saveDocuments: async (data) => {
    const res = await axiosClient.post(EVENT_ENDPOINTS.SAVE_DOCUMENTS, data);
    return res.data;
  },

  saveTerms: async (data) => {
    const res = await axiosClient.post(EVENT_ENDPOINTS.SAVE_TERMS, data);
    return res.data;
  },

  saveVendors: async (data) => {
    const res = await axiosClient.post(EVENT_ENDPOINTS.SAVE_VENDORS, data);
    return res.data;
  },

  completeEvent: async (data) => {
    const res = await axiosClient.post(EVENT_ENDPOINTS.COMPLETE, data);
    return res.data;
  },

  updateEvent: async (eventId, data) => {
    const res = await axiosClient.put(EVENT_ENDPOINTS.UPDATE(eventId), data);
    return res.data;
  },

  deleteEvent: async (eventId) => {
    const res = await axiosClient.delete(EVENT_ENDPOINTS.DELETE(eventId));
    return res.data;
  },
};

export default eventApi;
