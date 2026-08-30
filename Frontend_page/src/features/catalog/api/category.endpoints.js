/**
 * Category & Catalog API Endpoint Constants
 * Pure URL strings & URL builder functions only — zero business logic.
 */
export const CATEGORY_ENDPOINTS = {
  LIST: "/superadmin/api/categories",
  CREATE: "/superadmin/api/categories",
  UPDATE: (id) => `/superadmin/api/categories/${id}`,
  DELETE: (id) => `/superadmin/api/categories/${id}`,
  CATEGORY_REQUESTS: "/superadmin/api/category-requests",
  SUBMIT_REQUEST: "/api/v1/organizer/category-requests",
};

export default CATEGORY_ENDPOINTS;
