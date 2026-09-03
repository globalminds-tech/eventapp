import { logout } from "@/app/store/authSlice";
import { clearUser } from "@/app/store/userSlice";
import axiosClient from "@/shared/api/axiosClient";

/**
 * Universal Unified Logout Service
 * Wipes all storage (localStorage & sessionStorage), resets Redux auth/user states,
 * and seamlessly navigates to /login via React Router.
 */
export const performLogout = (dispatch, navigate) => {
  try {
    if (dispatch) {
      dispatch(logout());
      dispatch(clearUser());
    }
  } catch (err) {
    console.error("Logout dispatch note:", err);
  } finally {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedRememberMe = localStorage.getItem("rememberMe");

    localStorage.clear();
    sessionStorage.clear();

    if (rememberedEmail) localStorage.setItem("rememberedEmail", rememberedEmail);
    if (rememberedRememberMe) localStorage.setItem("rememberMe", rememberedRememberMe);

    if (navigate) {
      navigate("/login", { replace: true });
    } else {
      window.location.replace("/login");
    }
  }
};

/**
 * Resolves default destination portal URL based on user role.
 */
export const getRedirectPathForUser = (role) => {
  const cleanRole = (role || "").toLowerCase();

  if (cleanRole === "organizer") {
    return "/OrganizerHome";
  }
  if (cleanRole === "exhibitor") {
    return "/exhibitor/dashboard";
  }
  if (["superuser", "superadmin", "admin"].includes(cleanRole)) {
    return "/superuser/dashboard";
  }
  return "/";
};

/**
 * Universal Helper: Resolves authenticated User ID from Redux, JSON user object, or storage keys
 */
export const getAuthUserId = (reduxUser) => {
  if (reduxUser && reduxUser.id) return reduxUser.id;
  const storedUserStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (storedUserStr) {
    try {
      const u = JSON.parse(storedUserStr);
      if (u && u.id) return u.id;
    } catch (e) {}
  }
  return sessionStorage.getItem("id") || localStorage.getItem("id") || sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
};

/**
 * Derives uppercase initials from user's full name (e.g. "John Doe" -> "JD", "Admin" -> "A")
 */
export const getUserInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Computes all accessible roles for a user based on backend roles array & profiles object
 */
export const getUserAvailableRoles = (user) => {
  if (!user) return ["user"];
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }
  const roles = ["user"];
  const currentRole = (user.role || "").toLowerCase();
  if (["organizer", "exhibitor", "admin", "superadmin", "superuser"].includes(currentRole)) {
    if (!roles.includes(currentRole)) roles.push(currentRole);
  }
  if (user.profiles?.organizer || user.organizer_profile) {
    if (!roles.includes("organizer")) roles.push("organizer");
  }
  if (user.profiles?.exhibitor || user.exhibitor_profile) {
    if (!roles.includes("exhibitor")) roles.push("exhibitor");
  }
  return roles;
};

/**
 * Checks if user has attached profile for specific role
 */
export const hasProfile = (user, roleName) => {
  if (!user) return false;
  const cleanRole = (roleName || "").toLowerCase();
  if (cleanRole === "organizer") {
    return Boolean(user.profiles?.organizer || user.organizer_profile || (user.role || "").toLowerCase() === "organizer");
  }
  if (cleanRole === "exhibitor") {
    return Boolean(user.profiles?.exhibitor || user.exhibitor_profile || (user.role || "").toLowerCase() === "exhibitor");
  }
  return true;
};

/**
 * Switches the active workspace role across LocalStorage, SessionStorage, Redux, and Backend API
 */
export const switchWorkspaceRole = async (targetRole, dispatch, navigate) => {
  const cleanRole = (targetRole || "user").toLowerCase();
  sessionStorage.setItem("role", cleanRole);
  localStorage.setItem("role", cleanRole);
  sessionStorage.setItem("userRole", cleanRole);
  localStorage.setItem("userRole", cleanRole);

  try {
    const res = await axiosClient.post("/api/v1/auth/switch-role", { role: cleanRole });
    const newToken = res.data?.data?.token || res.data?.data?.access_token;
    if (newToken) {
      sessionStorage.setItem("token", newToken);
      localStorage.setItem("token", newToken);
      sessionStorage.setItem("accessToken", newToken);
      localStorage.setItem("accessToken", newToken);
    }
  } catch (err) {
    console.warn("Server-side role switch note:", err?.message || err);
  }

  const destination = getRedirectPathForUser(cleanRole);
  if (navigate) navigate(destination);
};

