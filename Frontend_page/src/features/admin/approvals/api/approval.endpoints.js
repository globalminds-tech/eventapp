/**
 * Admin Event Approvals API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const APPROVAL_ENDPOINTS = {
  LIST: "/superuser/get-events",
  UPDATE_STATUS: (id) => `/superuser/update-status/${id}`,
  INSPECTION_DETAILS: (id) => `/superuser/event-full-details/${id}`,
};

export default APPROVAL_ENDPOINTS;
