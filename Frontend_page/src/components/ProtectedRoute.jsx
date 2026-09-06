import React, { useMemo, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/authSlice";
import { setUser } from "@/app/store/userSlice";
import { getUserAvailableRoles } from "@/shared/services/authHelper";
import BrandLogo from "@/components/ui/BrandLogo";
import { ShieldCheck } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const reduxAuth = useSelector((state) => state.auth);
  const reduxUser = useSelector((state) => state.user);

  // 1. Resolve token & active role from Redux or persistent storage fallback
  const token = reduxAuth?.accessToken || sessionStorage.getItem("token") || localStorage.getItem("token") || sessionStorage.getItem("accessToken");
  const currentRole = (
    reduxAuth?.role ||
    reduxAuth?.active_role ||
    reduxUser?.active_role ||
    sessionStorage.getItem("role") ||
    localStorage.getItem("role") ||
    sessionStorage.getItem("userRole") ||
    "user"
  )?.toLowerCase();

  // 2. Gather all legitimate roles the authenticated user possesses (memoized)
  const allUserRoles = useMemo(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    } catch {
      storedUser = null;
    }
    const user = {
      ...(storedUser || {}),
      ...(reduxUser || {}),
      ...(reduxAuth?.user || {}),
    };
    return new Set(getUserAvailableRoles(user));
  }, [reduxAuth?.user, reduxUser]);

  const matchingRole = useMemo(() => {
    if (!allowedRoles || !Array.isArray(allowedRoles) || allowedRoles.length === 0) return null;
    return allowedRoles.find((r) => allUserRoles.has(String(r).toLowerCase()));
  }, [allowedRoles, allUserRoles]);

  // 3. Safe active role synchronization inside useEffect (NEVER during render)
  useEffect(() => {
    if (matchingRole && matchingRole !== currentRole && matchingRole !== "user") {
      sessionStorage.setItem("role", matchingRole);
      localStorage.setItem("role", matchingRole);
      sessionStorage.setItem("active_role", matchingRole);
      localStorage.setItem("active_role", matchingRole);
      dispatch(setCredentials({ role: matchingRole }));
      dispatch(setUser({ role: matchingRole, active_role: matchingRole }));
    }
  }, [matchingRole, currentRole, dispatch]);

  // 4. If session is actively being initialized or restored by AuthInitializer, wait before evaluating
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

  // 5. Check valid session token
  const isValidToken = Boolean(token && !token.includes("authenticated-user-token") && !token.includes("-session-token"));

  if (!isValidToken) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    console.warn(`[ProtectedRoute] Unauthenticated access to "${location.pathname}". Redirecting to /login?returnUrl=${returnUrl}`);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  // 6. Role permission evaluation
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((r) => allUserRoles.has(String(r).toLowerCase()));

    if (!hasPermission) {
      // Intelligently redirect to the user's best authorized portal
      if (allUserRoles.has("superuser") || allUserRoles.has("superadmin")) return <Navigate to="/superuser/dashboard" replace />;
      if (allUserRoles.has("organizer")) return <Navigate to="/OrganizerHome" replace />;
      if (allUserRoles.has("exhibitor")) return <Navigate to="/exhibitor/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;