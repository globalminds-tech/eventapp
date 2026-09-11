/**
 * Admin Event Approvals API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const APPROVAL_ENDPOINTS = {
  LIST: "/superadmin/get-events",
  UPDATE_STATUS: (id) => `/superadmin/api/update-status/${id}`,
  INSPECTION_DETAILS: (id) => `/superadmin/api/event-full-details/${id}`,
};

export default APPROVAL_ENDPOINTS;
