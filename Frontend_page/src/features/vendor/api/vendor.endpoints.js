/**
 * Vendor API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const VENDOR_ENDPOINTS = {
  LIST: "/superadmin/api/vendors",
  TYPES: "/superadmin/api/get-vendor-types",
  NAMES: "/superadmin/api/get-vendor-names",
  SINGLE: (id) => `/superadmin/api/vendor/${id}`,
  CREATE: "/superadmin/api/create_vendor",
  UPDATE: (id) => `/superadmin/api/update_vendor/${id}`,
  DELETE: (id) => `/superadmin/api/delete_vendor/${id}`,
  EXPORT_EXCEL: "/superadmin/api/vendors/export/excel",
  EXPORT_PDF: "/superadmin/api/vendors/export/pdf",
};

export default VENDOR_ENDPOINTS;
