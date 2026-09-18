/**
 * User API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const USER_ENDPOINTS = {
  LIST: "/superadmin/api/users",
  PENDING_ORGANIZERS: "/superadmin/api/organizers/pending",
  UPDATE_KYC: (userId) => `/superadmin/api/organizers/${userId}/kyc-status`,
  SINGLE: (id) => `/superadmin/api/users/${id}`,
};

export default USER_ENDPOINTS;
