/**
 * Admin KYC Verification API Endpoints
 */
export const KYC_ENDPOINTS = {
  PENDING_ORGANIZERS: "/superadmin/api/organizers/pending",
  UPDATE_STATUS: (userId) => `/superadmin/api/organizers/${userId}/kyc-status`,
};

export default KYC_ENDPOINTS;
