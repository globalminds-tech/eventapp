import axiosClient from "@/shared/api/axiosClient";
import { VENUE_ENDPOINTS } from "./venue.endpoints";

export const venueApi = {
  getVenues: async (organizerId) => {
    const url = organizerId ? `${VENUE_ENDPOINTS.DETAILS}?organizer_id=${organizerId}` : VENUE_ENDPOINTS.DETAILS;
    const res = await axiosClient.get(url);
    return res.data;
  },

  getVenueDetails: async (venueId) => {
    const res = await axiosClient.get(VENUE_ENDPOINTS.SINGLE(venueId));
    return res.data;
  },

  createVenue: async (data) => {
    const res = await axiosClient.post(VENUE_ENDPOINTS.CREATE, data);
    return res.data;
  },

  updateVenue: async (venueId, data) => {
    const res = await axiosClient.put(VENUE_ENDPOINTS.UPDATE(venueId), data);
    return res.data;
  },

  deleteVenue: async (venueId) => {
    const res = await axiosClient.delete(VENUE_ENDPOINTS.DELETE(venueId));
    return res.data;
  },
};

export default venueApi;
