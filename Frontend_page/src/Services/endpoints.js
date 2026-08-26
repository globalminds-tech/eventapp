/**
 * Centralized API Endpoint Directory
 * Grouped logically by domain module
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/api/login",
    REGISTER: "/auth/api/register",
  },
  ADMIN: {
    USERS: "/admin/users",
  },
  EVENTS: {
    LIST: "/superadmin/api/events_detail",
    SAVED_EVENTS: "/events",
    DETAILS: "/superadmin/api/event-details",
    COMPLETE: "/superadmin/api/complete_event",
    UPDATE: (id) => `/superadmin/api/update_event/${id}`,
    DELETE: (id) => `/superadmin/api/delete_event/${id}`,
  },
  VENUES: {
    DETAILS: "/superadmin/api/venues_details",
    LIST: "/superadmin/api/venues",
    SINGLE: (id) => `/superadmin/api/venuedetail/${id}`,
    CREATE: "/superadmin/api/create_venue",
    UPDATE: (id) => `/superadmin/api/update_venue/${id}`,
    DELETE: (id) => `/superadmin/api/delete_venue/${id}`,
    EXPORT_EXCEL: "/superadmin/api/venues/export/excel",
    EXPORT_PDF: "/superadmin/api/venues/export/pdf",
  },
  VENDORS: {
    LIST: "/superadmin/api/vendors",
    TYPES: "/superadmin/api/get-vendor-types",
    NAMES: "/superadmin/api/get-vendor-names",
    SINGLE: (id) => `/superadmin/api/vendor/${id}`,
    CREATE: "/superadmin/api/create_vendor",
    UPDATE: (id) => `/superadmin/api/update_vendor/${id}`,
    DELETE: (id) => `/superadmin/api/delete_vendor/${id}`,
    EXPORT_EXCEL: "/superadmin/api/vendors/export/excel",
    EXPORT_PDF: "/superadmin/api/vendors/export/pdf",
  },
  SPONSORS: {
    NAMES: "/superadmin/api/get-sponsor-names",
    CREATE: "/superadmin/api/sponsorship",
    UPDATE: (id) => `/superadmin/api/update-sponsor-name/${id}`,
  },
  POLICIES: {
    LIST: "/superadmin/api/policies",
    SINGLE: (id) => `/superadmin/api/policy/${id}`,
    CREATE: "/superadmin/api/create_policy",
    UPDATE: (id) => `/superadmin/api/update_policy/${id}`,
    DELETE: (id) => `/superadmin/api/delete_policy/${id}`,
    EXPORT_EXCEL: "/superadmin/api/policies/export/excel",
    EXPORT_PDF: "/superadmin/api/policies/export/pdf",
  },
};

export default ENDPOINTS;
