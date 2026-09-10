/**
 * SuperUser API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const SUPERUSER_ENDPOINTS = {
  DASHBOARD_STATS: (period) => `/superadmin/api/dashboard-stats?period=${period || '30d'}`,
  ALL_EVENTS: "/superadmin/get-events",
  UPDATE_EVENT_STATUS: (id) => `/superadmin/api/update-status/${id}`,
  PENDING_ORGANIZERS: "/api/admin/organizers/kyc-pending",
  UPDATE_KYC: (userId) => `/api/admin/organizers/${userId}/kyc-status`,
};

export default SUPERUSER_ENDPOINTS;
