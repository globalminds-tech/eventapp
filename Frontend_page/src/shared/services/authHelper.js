import { logout } from "@/app/store/authSlice";
import { clearUser } from "@/app/store/userSlice";

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
