/**
 * SuperUser API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const SUPERUSER_ENDPOINTS = {
  DASHBOARD_STATS: (period) => `/superuser/dashboard-stats?period=${period || '30d'}`,
  ALL_EVENTS: "/superuser/get-events",
  UPDATE_EVENT_STATUS: (id) => `/superuser/update-status/${id}`,
  PENDING_ORGANIZERS: "/api/admin/organizers/kyc-pending",
  UPDATE_KYC: (userId) => `/api/admin/organizers/${userId}/kyc-status`,
};

export default SUPERUSER_ENDPOINTS;
