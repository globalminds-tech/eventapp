import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/authSlice";
import BrandLogo from "@/components/ui/BrandLogo";
import { ShieldCheck } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const reduxAuth = useSelector((state) => state.auth);
  const reduxUser = useSelector((state) => state.user);

  // 1. If session is actively being initialized or restored by AuthInitializer, wait before evaluating
  if (reduxAuth?.loading) {
    return (
      <div className="relative flex h-screen w-screen items-center justify-center bg-gradient-to-b from-slate-50 via-[#f8fafc] to-slate-100 text-slate-900 select-none px-4 overflow-hidden">
        <style>{`
          @keyframes bmeProgressSlidePR {
            0% { transform: translateX(-100%); width: 35%; }
            50% { transform: translateX(65%); width: 55%; }
            100% { transform: translateX(200%); width: 35%; }
          }
        `}</style>

        <div className="absolute w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-3xl -top-24 -left-24 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -bottom-24 -right-24 pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-8 flex flex-col items-center text-center">
          <div className="mb-6">
            <BrandLogo textColor="text-slate-900 text-lg font-black" />
          </div>

          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative my-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 rounded-full"
              style={{ animation: "bmeProgressSlidePR 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite" }}
            />
          </div>

          <h3 className="text-sm font-bold text-slate-800 tracking-tight mt-3">
            Verifying Workspace Access
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Checking role permissions...
          </p>

          <div className="flex items-center gap-1.5 mt-6 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Role Verified Session</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Resolve token & active role from Redux or persistent storage fallback
  const token = reduxAuth?.accessToken || sessionStorage.getItem("token") || localStorage.getItem("token") || sessionStorage.getItem("accessToken");
  const currentRole = (
    reduxAuth?.role ||
    reduxUser?.active_role ||
    sessionStorage.getItem("role") ||
    localStorage.getItem("role") ||
    sessionStorage.getItem("userRole")
  )?.toLowerCase();

  const isValidToken = Boolean(token && !token.includes("authenticated-user-token") && !token.includes("-session-token"));

  if (!isValidToken) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    console.warn(`[ProtectedRoute] Unauthenticated access to "${location.pathname}". Redirecting to /login?returnUrl=${returnUrl}`);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    } catch {
      storedUser = null;
    }
    const user = reduxAuth?.user || reduxUser || storedUser || {};

    // Gather all legitimate roles the authenticated user possesses
    const allUserRoles = new Set();
    if (currentRole) allUserRoles.add(currentRole);

    // Add roles from reduxAuth user, reduxUser, or storedUser
    const candidateRoles = [
      ...(Array.isArray(user?.roles) ? user.roles : []),
      ...(Array.isArray(reduxUser?.roles) ? reduxUser.roles : []),
    ];
    candidateRoles.forEach((r) => r && allUserRoles.add(String(r).toLowerCase()));

    // Fallback from localStorage roles
    try {
      const storedRoles = JSON.parse(localStorage.getItem("roles") || sessionStorage.getItem("roles") || "[]");
      if (Array.isArray(storedRoles)) {
        storedRoles.forEach((r) => r && allUserRoles.add(String(r).toLowerCase()));
      }
    } catch (e) {}

    // Attach profile-inferred roles
    if (user?.profiles?.organizer || user?.organizer_profile || reduxUser?.organization_name) {
      allUserRoles.add("organizer");
    }
    if (user?.profiles?.exhibitor || user?.exhibitor_profile) {
      allUserRoles.add("exhibitor");
    }

    // Superuser has universal access
    if (
      allUserRoles.has("superuser") ||
      allUserRoles.has("superadmin") ||
      allUserRoles.has("admin") ||
      ["superuser", "superadmin", "admin"].includes(currentRole)
    ) {
      allUserRoles.add("superuser");
      allUserRoles.add("superadmin");
      allUserRoles.add("organizer");
      allUserRoles.add("exhibitor");
    }

    // Always include baseline "user" for any authenticated account
    allUserRoles.add("user");

    const hasPermission = allowedRoles.some((r) => allUserRoles.has(String(r).toLowerCase()));

    console.log(
      `%c[ProtectedRoute] Path: "${location.pathname}" | Allowed: [${allowedRoles.join(", ")}] | UserRoles: [${Array.from(allUserRoles).join(", ")}] | Current: "${currentRole}" | Access: ${hasPermission ? "GRANTED" : "DENIED"}`,
      hasPermission ? "color: #34d399; font-weight: bold;" : "color: #f87171; font-weight: bold;"
    );

    if (!hasPermission) {
      // Intelligently redirect to the user's best authorized portal
      if (allUserRoles.has("organizer")) return <Navigate to="/OrganizerHome" replace />;
      if (allUserRoles.has("exhibitor")) return <Navigate to="/exhibitor/dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    // If active role in session differs from the workspace being accessed, sync it
    const matchingRole = allowedRoles.find((r) => allUserRoles.has(String(r).toLowerCase()));
    if (matchingRole && matchingRole !== currentRole && matchingRole !== "user") {
      sessionStorage.setItem("role", matchingRole);
      localStorage.setItem("role", matchingRole);
      dispatch(setCredentials({ role: matchingRole }));
    }
  }

  return children;
};

export default ProtectedRoute;