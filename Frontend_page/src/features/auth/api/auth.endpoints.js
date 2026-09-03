/**
 * Auth API Endpoints Directory
 * Pure URL strings / builder functions only.
 */
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  REGISTER_ORGANIZER: "/api/v1/auth/register/organizer",
  REGISTER_EXHIBITOR: "/api/v1/auth/register/exhibitor",
  UPGRADE_ORGANIZER_STEP1: "/api/v1/auth/upgrade/organizer/step/1",
  UPGRADE_ORGANIZER_COMPLETE: "/api/v1/auth/upgrade/organizer/complete",
  UPGRADE_EXHIBITOR_STEP1: "/api/v1/auth/upgrade/exhibitor/step/1",
  UPGRADE_EXHIBITOR_COMPLETE: "/api/v1/auth/upgrade/exhibitor/complete",
  UPLOAD_AVATAR: "/api/v1/users/profile/avatar",
  ME: "/api/v1/auth/me",
  RESET_PASSWORD: "/api/v1/auth/reset-password",
};

export default AUTH_ENDPOINTS;

