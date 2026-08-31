/**
 * Sponsor API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const SPONSOR_ENDPOINTS = {
  LIST: "/superadmin/api/sponsorships",
  SINGLE: (id) => `/superadmin/api/sponsorship/${id}`,
  CREATE: "/superadmin/api/create_sponsorship",
  UPDATE: (id) => `/superadmin/api/update_sponsorship/${id}`,
  DELETE: (id) => `/superadmin/api/delete_sponsorship/${id}`,
  EXPORT_EXCEL: "/superadmin/api/sponsorships/export/excel",
  EXPORT_PDF: "/superadmin/api/sponsorships/export/pdf",
};

export default SPONSOR_ENDPOINTS;
