/**
 * Events API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const EVENT_ENDPOINTS = {
  LIST: "/superadmin/api/events_detail",
  GET_EVENTS_SHOW: "/superadmin/api/eventshow",
  SAVED_EVENTS: "/events",
  DETAILS: "/superadmin/api/event-details",
  FULL_DETAILS: (id) => `/superadmin/api/events/${id}/full-details`,
  SAVE_DETAILS: "/superadmin/api/save_event_details",
  SAVE_BOOKING: "/superadmin/api/save_booking",
  SAVE_LAYOUT: "/superadmin/api/save_layout",
  SAVE_DOCUMENTS: "/superadmin/api/save_documents",
  SAVE_TERMS: "/superadmin/api/save_terms",
  SAVE_VENDORS: "/superadmin/api/save_vendors",
  COMPLETE: "/superadmin/api/complete_event",
  UPDATE: (id) => `/superadmin/api/update_event/${id}`,
  DELETE: (id) => `/superadmin/api/delete_event/${id}`,
};

export default EVENT_ENDPOINTS;
