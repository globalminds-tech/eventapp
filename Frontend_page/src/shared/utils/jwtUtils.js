/**
 * JWT Utility functions for decoding and validating client-side token expiration.
 */

/**
 * Decodes the payload portion of a JWT without external dependencies.
 * @param {string} token
 * @returns {object|null}
 */
export const decodeTokenPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Validates whether a JWT token has expired based on its 'exp' claim.
 * Includes a 15-second buffer for network/clock tolerance.
 *
 * @param {string} token
 * @returns {boolean} True if expired, invalid, or missing; False if strictly valid.
 */
export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") return true;

  // Mock / session placeholder tokens used in development
  if (token.includes("-session-token") || token.includes("authenticated-user-token")) {
    return false;
  }

  const payload = decodeTokenPayload(token);
  if (!payload) return true;

  // If the token has no 'exp' claim, treat as non-expiring
  if (!payload.exp) return false;

  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  // Expired if current time is within 15s of exp or past exp
  return currentTimeSeconds >= (payload.exp - 15);
};
