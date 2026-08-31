/**
 * Venue API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const VENUE_ENDPOINTS = {
  DETAILS: "/superadmin/api/venues_details",
  LIST: "/superadmin/api/venues",
  SINGLE: (id) => `/superadmin/api/venuedetail/${id}`,
  CREATE: "/superadmin/api/create_venue",
  UPDATE: (id) => `/superadmin/api/update_venue/${id}`,
  DELETE: (id) => `/superadmin/api/delete_venue/${id}`,
};

export default VENUE_ENDPOINTS;
