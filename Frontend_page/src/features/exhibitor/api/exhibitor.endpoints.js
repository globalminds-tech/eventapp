/**
 * Exhibitor API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const EXHIBITOR_ENDPOINTS = {
  STALLS: (eventId) => `/api/v1/exhibitor/events/${eventId}/stalls`,
  APPLY_STALL: "/api/v1/exhibitor/stall-bookings",
  MY_BOOKINGS: (userId) => `/api/v1/exhibitor/my-bookings?user_id=${userId}`,
  REVIEW_BOOKING: (bookingId) => `/api/v1/organizer/stall-bookings/${bookingId}/review`,
};

export default EXHIBITOR_ENDPOINTS;
