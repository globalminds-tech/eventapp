import { logout, setCredentials } from "@/app/store/authSlice";
import { clearUser, setUser } from "@/app/store/userSlice";
import axiosClient from "@/shared/api/axiosClient";

/**
 * Universal Unified Logout Service
 * Wipes all storage (localStorage & sessionStorage), resets Redux auth/user states,
 * and seamlessly navigates to /login via React Router.
 */
export const performLogout = async (dispatch, navigate) => {
  // 1. Clear Authorization header and Redux store immediately
  try {
    delete axiosClient.defaults.headers.common["Authorization"];
    if (dispatch) {
      dispatch(logout());
      dispatch(clearUser());
    }
  } catch (err) {
    console.error("Logout dispatch note:", err);
  }

  // 2. Call backend logout to invalidate and delete the HttpOnly refresh_token cookie
  try {
    await axiosClient.post("/api/v1/auth/logout").catch(() => {});
  } catch (err) {
    console.error("Backend logout call note:", err);
  }

  // 3. Clear client storage
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  const rememberedRememberMe = localStorage.getItem("rememberMe");

  localStorage.clear();
  sessionStorage.clear();

  if (rememberedEmail) localStorage.setItem("rememberedEmail", rememberedEmail);
  if (rememberedRememberMe) localStorage.setItem("rememberMe", rememberedRememberMe);

  // Set explicit logged-out flag to prevent AuthInitializer from attempting token refresh
  localStorage.setItem("is_logged_out", "true");
  sessionStorage.setItem("is_logged_out", "true");

  if (navigate) {
    navigate("/login", { replace: true });
  } else {
    window.location.replace("/login");
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

  const rawRoles = Array.isArray(user.roles) ? user.roles.map((r) => String(r).toLowerCase()) : [];
  const activeRole = String(user.active_role || user.role || "").toLowerCase();

  // 1. Strict Super Administrator Isolation:
  // Super admins cannot be attendees, organizers, or exhibitors
  const isSuper = (
    rawRoles.includes("superadmin") ||
    rawRoles.includes("superuser") ||
    rawRoles.includes("admin") ||
    activeRole === "superadmin" ||
    activeRole === "superuser" ||
    activeRole === "admin"
  );

  if (isSuper) {
    return ["superadmin", "superuser"];
  }

  // 2. Normal users start with default "user" role
  const roles = new Set(["user"]);

  rawRoles.forEach((r) => r && roles.add(String(r).toLowerCase()));

  // 3. Extract from attached profiles (must be an object with valid status)
  const orgProfile = user.profiles?.organizer || user.organizer_profile;
  if (orgProfile && typeof orgProfile === "object" && orgProfile.kyc_status !== "REJECTED") {
    roles.add("organizer");
  }

  const exhProfile = user.profiles?.exhibitor || user.exhibitor_profile;
  if (exhProfile && typeof exhProfile === "object" && exhProfile.kyc_status !== "REJECTED") {
    roles.add("exhibitor");
  }

  // 4. Fallback from legitimate stored roles list
  try {
    const storedRolesStr = localStorage.getItem("roles") || sessionStorage.getItem("roles");
    if (storedRolesStr) {
      const parsed = JSON.parse(storedRolesStr);
      if (Array.isArray(parsed)) {
        parsed.forEach((r) => r && roles.add(String(r).toLowerCase()));
      }
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
  return userRoles.includes(cleanRole);
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

