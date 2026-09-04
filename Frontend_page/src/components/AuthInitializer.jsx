import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Loader2, ShieldCheck } from "lucide-react";
import { ENV } from "@/config/env";
import { setCredentials, setAuthLoading } from "@/app/store/authSlice";
import { setUser } from "@/app/store/userSlice";
import BrandLogo from "@/components/ui/BrandLogo";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if a stored user exists (indicating a returning authenticated session)
  const isExplicitlyLoggedOut = (
    localStorage.getItem("is_logged_out") === "true" ||
    sessionStorage.getItem("is_logged_out") === "true"
  );

  const hasStoredSession = !isExplicitlyLoggedOut && Boolean(
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("role") ||
    sessionStorage.getItem("role")
  );

  useEffect(() => {
    let isMounted = true;

    const restoreSessionWithRetry = async (attempt = 1, maxAttempts = 3) => {
      // If user explicitly logged out, do not attempt to restore session
      if (isExplicitlyLoggedOut) {
        if (isMounted) {
          dispatch(setAuthLoading(false));
          setIsInitializing(false);
        }
        return;
      }

      // If access token is already present in Redux, no initialization refresh needed
      if (accessToken) {
        if (isMounted) setIsInitializing(false);
        return;
      }

      dispatch(setAuthLoading(true));

      try {
        console.log(`[AuthInitializer] Attempting session restore (attempt ${attempt}/${maxAttempts})...`);
        const response = await axios.post(
          `${ENV.API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const resData = response.data?.data || response.data;
        const newAccessToken = resData?.access_token || resData?.token;
        const userObj = resData?.user;

        if (isMounted && newAccessToken && userObj) {
          console.log(`[AuthInitializer] Session restored successfully for user:`, userObj.email, `roles:`, userObj.roles);
          const activeRole = userObj.active_role || (userObj.roles && userObj.roles[0]) || "user";

          dispatch(
            setCredentials({
              user: userObj,
              token: newAccessToken,
              accessToken: newAccessToken,
              role: activeRole,
            })
          );
          dispatch(
            setUser({
              ...userObj,
              active_role: activeRole,
              role: activeRole,
            })
          );
        }
      } catch (err) {
        // If 401 Unauthorized or 403 Forbidden, session cookie is invalid or dead -> clean up completely
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log(`[AuthInitializer] No active session cookie or session expired.`);
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
          localStorage.removeItem("role");
          sessionStorage.removeItem("role");
          localStorage.removeItem("roles");
          sessionStorage.removeItem("roles");
          if (isMounted) {
            dispatch(setAuthLoading(false));
            setIsInitializing(false);
          }
          return;
        }

        // If it's a network error or 5xx error and we have attempts left, retry with backoff
        const isNetworkOrServerError = !err.response || err.response.status >= 500;
        if (isNetworkOrServerError && attempt < maxAttempts && isMounted) {
          const delayMs = attempt * 800;
          console.warn(`[AuthInitializer] Transient restore error. Retrying in ${delayMs}ms...`, err.message);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return restoreSessionWithRetry(attempt + 1, maxAttempts);
        }
        console.log(`[AuthInitializer] Session refresh ended:`, err?.response?.data?.detail || err.message);
      } finally {
        if (isMounted) {
          dispatch(setAuthLoading(false));
          setIsInitializing(false);
        }
      }
    };

    restoreSessionWithRetry();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // While restoring a previously active session, show a sleek centered professional light-theme loader
  // to avoid route protection race conditions or prematurely flashing login screens
  if (isInitializing && hasStoredSession) {
    return (
      <div className="relative flex h-screen w-screen items-center justify-center bg-gradient-to-b from-slate-50 via-[#f8fafc] to-slate-100 text-slate-900 select-none px-4 overflow-hidden">
        <style>{`
          @keyframes bmeProgressSlide {
            0% { transform: translateX(-100%); width: 35%; }
            50% { transform: translateX(65%); width: 55%; }
            100% { transform: translateX(200%); width: 35%; }
          }
        `}</style>

        {/* Ambient background decorative glow */}
        <div className="absolute w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-3xl -top-24 -left-24 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -bottom-24 -right-24 pointer-events-none" />

        {/* Center Card */}
        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-8 flex flex-col items-center text-center">
          {/* Brand Logo */}
          <div className="mb-6">
            <BrandLogo textColor="text-slate-900 text-lg font-black" />
          </div>

          {/* Smooth Linear Progress Bar */}
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative my-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 rounded-full"
              style={{ animation: "bmeProgressSlide 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite" }}
            />
          </div>

          {/* Text Labels */}
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mt-3">
            Preparing your workspace
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Synchronizing session & permissions...
          </p>

          {/* Enterprise Security Badge */}
          <div className="flex items-center gap-1.5 mt-6 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Encrypted Workspace Session</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
