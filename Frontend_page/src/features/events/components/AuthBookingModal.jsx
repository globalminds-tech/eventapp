import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Sparkles, UserPlus, AlertCircle, Eye, EyeOff, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { loginUser } from "@/Services/api";
import apiClient from "@/shared/services/client";
import { setUser } from "@/app/store/userSlice";
import { setCredentials } from "@/app/store/authSlice";
import { getUserAvailableRoles } from "@/shared/services/authHelper";

export default function AuthBookingModal({
  isOpen,
  onClose,
  event,
  onLoginSuccess,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const eventName = event?.event_name || event?.eventName || "Event Pass";
  const bannerUrl =
    event?.banner_url ||
    event?.banner ||
    event?.image ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";
  const eventId = event?.id || event?._id;

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg("");

      const res = await loginUser({ email: email.trim(), password });
      const raw = res?.data || res;
      const payload = raw?.data || raw;
      const token = payload?.access_token || payload?.token || payload?.accessToken || raw?.token || raw?.access_token;
      const userObj = payload?.user || raw?.user || payload || {};
      const detectedRoles = getUserAvailableRoles(userObj);
      const userRole = (userObj?.active_role || userObj?.role || (detectedRoles.includes("user") ? "user" : detectedRoles[0]) || "user").toLowerCase();

      if (!token) {
        throw new Error("No authorization token received.");
      }

      const userId = userObj.id || userObj.user_id || userObj.userId || "";
      const userName = userObj.name || userObj.full_name || "User";
      const userEmail = userObj.email || email.trim();

      const userToStore = {
        ...userObj,
        id: userId,
        email: userEmail,
        name: userName,
        role: userRole,
        active_role: userRole,
        roles: detectedRoles.length ? detectedRoles : [userRole],
      };

      sessionStorage.setItem("token", token);
      localStorage.setItem("token", token);
      sessionStorage.setItem("role", userRole);
      localStorage.setItem("role", userRole);
      sessionStorage.setItem("roles", JSON.stringify(detectedRoles));
      localStorage.setItem("roles", JSON.stringify(detectedRoles));
      sessionStorage.setItem("id", userId.toString());
      localStorage.setItem("id", userId.toString());
      sessionStorage.setItem("userId", userId.toString());
      localStorage.setItem("userId", userId.toString());
      sessionStorage.setItem("name", userName);
      localStorage.setItem("name", userName);
      sessionStorage.setItem("email", userEmail);
      localStorage.setItem("email", userEmail);
      sessionStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.removeItem("is_logged_out");
      sessionStorage.removeItem("is_logged_out");

      if (apiClient?.defaults?.headers?.common) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      dispatch(setCredentials({ user: userToStore, token, role: userRole }));
      dispatch(setUser(userToStore));

      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate(`/usersbooking/${eventId}`);
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid email or password. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    const returnUrl = encodeURIComponent(`/usersbooking/${eventId}`);
    const nameParam = encodeURIComponent(eventName);
    const bannerParam = encodeURIComponent(bannerUrl);
    navigate(`/register?returnUrl=${returnUrl}&eventName=${nameParam}&eventBanner=${bannerParam}`);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={false}>
      {/* Event Context Header */}
      <div className="relative h-28 bg-slate-900 overflow-hidden">
        <img
          src={bannerUrl}
          alt={eventName}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        {/* Prominent Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/20 shadow-md flex items-center justify-center group"
          aria-label="Close dialog"
        >
          <X size={15} className="group-hover:scale-110 transition-transform" />
        </button>

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <Badge className="bg-orange-500/90 text-white font-extrabold text-[10px] px-2 py-0.5 border-none">
              Holding Your Ticket
            </Badge>
          </div>
          <h3 className="text-sm font-extrabold truncate text-white drop-shadow-sm pr-6">
            {eventName}
          </h3>
        </div>
      </div>

      <DialogHeader className="p-5 pb-2">
        <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>Sign In to Continue Booking</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-500">
          Sign in or create an account to reserve your spot and link your digital QR entry pass.
        </DialogDescription>
      </DialogHeader>

      <DialogContent className="p-5 pt-2 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleQuickLogin} className="space-y-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
          />

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-tight">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md border-none cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In &amp; Proceed to Checkout</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Don't have an account?</span>
          <button
            type="button"
            onClick={handleRegisterRedirect}
            className="font-extrabold text-orange-600 hover:underline cursor-pointer bg-transparent border-none flex items-center gap-1.5 text-xs"
          >
            <UserPlus size={14} />
            <span>Create Free Account →</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-center bg-transparent border-none"
        >
          Cancel and return to event
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 pt-1">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Encrypted Secure Login • Instant Pass Binding</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
