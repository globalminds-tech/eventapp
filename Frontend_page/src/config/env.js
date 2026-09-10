/**
 * Environment Configuration & Validation
 * Reads from import.meta.env with defaults and safety checks.
 */

export const ENV = {
  // Empty string allows requests (/api, /uploads, etc.) to be Same-Origin
  // routed seamlessly via Vite server.proxy (local) or Vercel rewrites (production)
  API_BASE_URL: (import.meta.env?.VITE_API_BASE_URL || "").trim(),
  SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || "",
  IS_DEV: import.meta.env?.DEV ?? true,
};

export default ENV;
