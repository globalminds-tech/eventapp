import { logout, setCredentials } from "@/app/store/authSlice";
import { clearUser, setUser } from "@/app/store/userSlice";
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
  const roles = new Set(["user"]);

  // 1. Extract from user object
  if (user) {
    if (Array.isArray(user.roles)) {
      user.roles.forEach((r) => r && roles.add(String(r).toLowerCase()));
    }
    if (user.active_role) {
      roles.add(String(user.active_role).toLowerCase());
    }
    if (user.role) {
      roles.add(String(user.role).toLowerCase());
    }
    if (user.profiles?.organizer || user.organizer_profile) {
      roles.add("organizer");
    }
    if (user.profiles?.exhibitor || user.exhibitor_profile) {
      roles.add("exhibitor");
    }
  }

  // 2. Extract from storage fallback
  try {
    const storedRolesStr = localStorage.getItem("roles") || sessionStorage.getItem("roles");
    if (storedRolesStr) {
      const parsed = JSON.parse(storedRolesStr);
      if (Array.isArray(parsed)) {
        parsed.forEach((r) => r && roles.add(String(r).toLowerCase()));
      }
    }
    const storedRole = localStorage.getItem("role") || sessionStorage.getItem("role");
    if (storedRole) {
      roles.add(storedRole.toLowerCase());
    }
  } catch (e) {}

  return Array.from(roles);
};

/**
 * Checks if user has attached profile for specific role
 */
export const hasProfile = (user, roleName) => {
  if (!user) return false;
  const cleanRole = (roleName || "").toLowerCase();
  const userRoles = getUserAvailableRoles(user);
  if (cleanRole === "organizer") {
    return userRoles.includes("organizer");
  }
  if (cleanRole === "exhibitor") {
    return userRoles.includes("exhibitor");
  }
  return true;
};

/**
 * Switches the active workspace role across LocalStorage, SessionStorage, Redux, and Backend API
 * Includes retry logic and diagnostic logging.
 */
export const switchWorkspaceRole = async (targetRole, dispatch, navigate) => {
  const cleanRole = (targetRole || "user").toLowerCase();
  const previousRole = sessionStorage.getItem("role") || localStorage.getItem("role") || "unknown";

  console.log(`%c[WorkspaceSwitch] Switching workspace from "${previousRole}" to "${cleanRole}"`, "color: #38bdf8; font-weight: bold;");

  // 1. Immediately update local and session storage
  sessionStorage.setItem("role", cleanRole);
  localStorage.setItem("role", cleanRole);
  sessionStorage.setItem("userRole", cleanRole);
  localStorage.setItem("userRole", cleanRole);

  // 2. Immediately update Redux auth & user state
  if (dispatch) {
    try {
      dispatch(setUser({ role: cleanRole, active_role: cleanRole }));
      dispatch(setCredentials({ role: cleanRole }));
    } catch (err) {
      console.warn("[WorkspaceSwitch] Redux role sync notice:", err);
    }
  }

  // 3. Immediately resolve destination & navigate
  const destination = getRedirectPathForUser(cleanRole);
  console.log(`[WorkspaceSwitch] Immediate navigation to destination: "${destination}"`);
  if (navigate) {
    navigate(destination);
  }

  // 4. Background server sync with retry logic
  const syncWithServer = async (attempt = 1, maxAttempts = 3) => {
    try {
      console.log(`[WorkspaceSwitch] Syncing with server POST /api/v1/auth/switch-role (attempt ${attempt}/${maxAttempts})...`);
      const res = await axiosClient.post("/api/v1/auth/switch-role", { role: cleanRole });
      const resData = res.data?.data || res.data;
      const newToken = resData?.token || resData?.access_token;
      const updatedUser = resData?.user;

      console.log(`[WorkspaceSwitch] Server sync SUCCESS:`, {
        active_role: resData?.active_role || cleanRole,
        tokenReceived: Boolean(newToken),
        userRoles: updatedUser?.roles
      });

      if (newToken) {
        sessionStorage.setItem("token", newToken);
        localStorage.setItem("token", newToken);
        sessionStorage.setItem("accessToken", newToken);
        localStorage.setItem("accessToken", newToken);
      }

      if (dispatch) {
        if (updatedUser) {
          dispatch(setUser({ ...updatedUser, active_role: cleanRole, role: cleanRole }));
        }
        dispatch(
          setCredentials({
            user: updatedUser,
            token: newToken,
            accessToken: newToken,
            role: cleanRole,
          })
        );
      }
    } catch (err) {
      const isRetryable = !err.response || err.response.status >= 500;
      if (isRetryable && attempt < maxAttempts) {
        const delay = attempt * 800;
        console.warn(`[WorkspaceSwitch] Server sync transient failure. Retrying in ${delay}ms...`, err.message);
        await new Promise((res) => setTimeout(res, delay));
        return syncWithServer(attempt + 1, maxAttempts);
      }
      console.error(`[WorkspaceSwitch] Server sync failed permanently:`, err?.response?.data || err.message);
    }
  };

  syncWithServer();
};

