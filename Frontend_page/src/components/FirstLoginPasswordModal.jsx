import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { ShieldCheck, Eye, EyeOff, Lock, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { ENV } from "@/config/env";
import { setUser } from "@/app/store/userSlice";
import { setCredentials, logout } from "@/app/store/authSlice";

export default function FirstLoginPasswordModal({
  isOpen,
  user,
  tempPassword = "",
  token = "",
  onSuccess,
  onCancel,
}) {
  const dispatch = useDispatch();
  const [currentPw, setCurrentPw] = useState(tempPassword || "");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Sync temp password if passed or updated
  React.useEffect(() => {
    if (tempPassword) {
      setCurrentPw(tempPassword);
    }
  }, [tempPassword]);

  if (!isOpen || isDismissed) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPw || newPw.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPw !== confirmPw) {
      setError("New passwords do not match. Please re-enter.");
      return;
    }

    if (currentPw && newPw === currentPw) {
      setError("New password must be different from your temporary password.");
      return;
    }

    setLoading(true);

    try {
      const activeToken = token || sessionStorage.getItem("token") || localStorage.getItem("token") || "";
      const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};

      const response = await axios.post(
        `${ENV.API_BASE_URL}/api/v1/auth/change-password`,
        {
          email: user?.email,
          current_password: currentPw,
          new_password: newPw,
        },
        { headers }
      );

      // Close modal immediately
      setIsDismissed(true);

      const rawUser = response.data?.data?.user || response.data?.user || response.data || user;
      const allRoles = Array.isArray(rawUser.roles) ? rawUser.roles : (rawUser.role ? [rawUser.role] : ["user"]);
      const activeRole = rawUser.active_role || (allRoles.includes("organizer") ? "organizer" : (allRoles.includes("exhibitor") ? "exhibitor" : allRoles[0]));

      // Ensure must_change_password is false
      const sanitizedUser = {
        ...rawUser,
        roles: allRoles,
        active_role: activeRole,
        role: activeRole,
        must_change_password: false,
      };

      // Update Redux state and local storage
      dispatch(setUser(sanitizedUser));
      dispatch(setCredentials({
        user: sanitizedUser,
        token: activeToken || undefined,
        role: activeRole,
        active_role: activeRole,
      }));

      localStorage.setItem("user", JSON.stringify(sanitizedUser));
      sessionStorage.setItem("user", JSON.stringify(sanitizedUser));
      localStorage.setItem("role", activeRole);
      sessionStorage.setItem("role", activeRole);
      localStorage.setItem("active_role", activeRole);
      sessionStorage.setItem("active_role", activeRole);
      localStorage.setItem("roles", JSON.stringify(allRoles));
      sessionStorage.setItem("roles", JSON.stringify(allRoles));

      if (onSuccess) {
        onSuccess(sanitizedUser);
      } else {
        // Direct reliable redirect fallback
        if (allRoles.includes("superuser") || allRoles.includes("superadmin")) {
          window.location.replace("/superuser/dashboard");
        } else if (allRoles.includes("organizer") || activeRole === "organizer") {
          window.location.replace("/OrganizerHome");
        } else if (allRoles.includes("exhibitor") || activeRole === "exhibitor") {
          window.location.replace("/exhibitor");
        } else {
          window.location.replace("/");
        }
      }
    } catch (err) {
      setIsDismissed(false);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update password. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    dispatch(logout());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-7 shadow-2xl relative">
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-200/40 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              First-Time Login Security
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              You're logging in with a temporary password. Please set your new permanent password to secure your account.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Temporary Password *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter temporary password"
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 pr-10 focus:outline-none focus:border-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Permanent Password *
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 pr-10 focus:outline-none focus:border-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 pr-10 focus:outline-none focus:border-cyan-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500 leading-snug flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>After setting your new password, you will be redirected to your dashboard.</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel &amp; Sign Out
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 hover:brightness-105 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Set Password &amp; Continue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
