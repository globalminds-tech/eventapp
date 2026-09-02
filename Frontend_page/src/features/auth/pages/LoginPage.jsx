import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Compass, ShieldCheck, Zap, Store } from "lucide-react";
import { loginUser } from "@/Services/api";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/app/store/userSlice";
import { setCredentials } from "@/app/store/authSlice";
import BrandLogo from "@/components/ui/BrandLogo";
import RoleSelectionModal from "@/components/RoleSelectionModal";

import { getRedirectPathForUser } from "@/shared/services/authHelper";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, accessToken, role: authRole } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Multi-role selection modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // 1. Persistent Active Session Auto-Redirect
    const role = (authRole || localStorage.getItem("role") || sessionStorage.getItem("role"))?.toLowerCase();
    
    if (isAuthenticated && accessToken) {
      if (role === "organizer") {
        navigate("/OrganizerHome", { replace: true });
        return;
      } else if (role === "exhibitor") {
        navigate("/exhibitor/dashboard", { replace: true });
        return;
      } else if (["superuser", "superadmin", "admin"].includes(role)) {
        navigate("/superuser/dashboard", { replace: true });
        return;
      }
    }

    // 2. Remembered Email Initialization
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe && savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [navigate, isAuthenticated, accessToken, authRole]);

  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      } else {
        setFieldErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "password") {
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
      } else {
        setFieldErrors((prev) => ({ ...prev, password: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ email: "", password: "" });

    let errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      const data = response.data?.data || response.data;
      const userObj = data.user || data;

      const userRole = (userObj?.role || data.role || "user").toLowerCase();
      const userId = userObj?.id || data.User_id || "";
      const userName = userObj?.name || data.name || "User";
      const userEmail = userObj?.email || formData.email || "";
      const userMobile = userObj?.mobile || "";
      const userOrg = userObj?.organization_name || "";
      const token = data.token || data.access_token || "";

      // Compute all available active roles for the user
      const detectedRoles = [userRole];
      if (userObj.organizer_profile && !detectedRoles.includes("organizer")) detectedRoles.push("organizer");
      if (userObj.exhibitor_profile && !detectedRoles.includes("exhibitor")) detectedRoles.push("exhibitor");
      if (Array.isArray(userObj.roles)) {
        userObj.roles.forEach((r) => {
          if (!detectedRoles.includes(r.toLowerCase())) detectedRoles.push(r.toLowerCase());
        });
      }

      // Store non-sensitive user identifiers for layout metadata
      sessionStorage.setItem("role", userRole);
      sessionStorage.setItem("id", userId.toString());
      sessionStorage.setItem("userId", userId.toString());
      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("email", userEmail);
      if (userMobile) sessionStorage.setItem("mobile", userMobile);
      if (userOrg) sessionStorage.setItem("organization_name", userOrg);

      localStorage.setItem("role", userRole);
      localStorage.setItem("id", userId.toString());
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("name", userName);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("user", JSON.stringify(userObj));
      sessionStorage.setItem("user", JSON.stringify(userObj));

      // Dispatch token strictly to Redux state memory (XSS Safe)
      dispatch(setCredentials({ user: userObj, token: token, role: userRole }));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      dispatch(
        setUser({
          id: userId,
          name: userName,
          role: userRole,
          email: userEmail,
          mobile: userMobile,
          organization_name: userOrg,
        })
      );

      // Multi-Role Check: If user has > 1 role, open Role Selection Modal
      if (detectedRoles.length > 1) {
        setUserRoles(detectedRoles);
        setLoggedInUser(userObj);
        setIsRoleModalOpen(true);
        return;
      }

      if (userRole === "organizer") {
        navigate("/OrganizerHome", { replace: true });
      } else if (userRole === "exhibitor") {
        navigate("/exhibitor/dashboard", { replace: true });
      } else if (["superuser", "superadmin", "admin"].includes(userRole)) {
        navigate("/superuser/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Invalid email or password. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans select-none">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[620px]">
        
        {/* LEFT COLUMN: Platform Experience Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-7 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 sm:w-60 h-48 sm:h-60 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-48 sm:w-60 h-48 sm:h-60 bg-blue-600/10 rounded-full blur-3xl" />

          <div className="relative z-10 cursor-pointer mb-4 lg:mb-0" onClick={() => navigate("/")}>
            <BrandLogo textColor="text-white text-lg sm:text-xl font-[900]" />
          </div>

          <div className="relative z-10 my-4 sm:my-6 lg:my-8 space-y-4 sm:space-y-6">
            <div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Welcome Back
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-2 sm:mt-3">
                Discover, Host & Connect
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1 sm:mt-1.5 leading-relaxed">
                Your premier destination for live concerts, tech expos, business summits, and cultural festivals.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5 pt-1 sm:pt-2">
              <div className="flex gap-2.5 sm:gap-3 items-center bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-cyan-300">Seamless Event Discovery</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Explore events & book instant passes.</p>
                </div>
              </div>

              <div className="flex gap-2.5 sm:gap-3 items-center bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Verified QR Passports</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Secure mobile check-in & gate access.</p>
                </div>
              </div>

              <div className="flex gap-2.5 sm:gap-3 items-center bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-300">All-in-One Workspace</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Host shows or reserve vendor stalls.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="relative z-10 pt-4 sm:pt-6 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Trusted by 500,000+ users nationwide
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login Form */}
        <div className="lg:col-span-7 p-5 sm:p-7 md:p-10 flex flex-col justify-between">
          <div>
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            </div>

            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Enter your account credentials to continue
              </p>
            </div>

            {/* Global Error Notification */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 sm:p-3.5 rounded-xl sm:rounded-2xl mb-4">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 border ${
                    fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-cyan-500"
                  } rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all duration-200`}
                />
                {fieldErrors.email && <span className="text-[11px] font-semibold text-red-500">{fieldErrors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 sm:py-3 bg-slate-50 border ${
                      fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-cyan-500"
                    } rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all duration-200 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="text-[11px] font-semibold text-red-500">{fieldErrors.password}</span>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-bold text-cyan-600 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-extrabold text-xs py-3 rounded-xl sm:rounded-2xl border-none cursor-pointer shadow-md shadow-cyan-500/20 hover:brightness-105 transition flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "Signing In..." : "SIGN IN"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>New to BookMyEvent?</span>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-extrabold text-cyan-600 hover:underline cursor-pointer bg-transparent border-none"
              >
                Create Account →
              </button>
            </div>

            <div className="mt-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Sparkles size={16} className="text-cyan-500 shrink-0" />
                <span>Host an Event or Book a Stall?</span>
              </div>
              <button
                onClick={() => setShowPartnerModal(true)}
                className="text-xs font-extrabold text-cyan-600 hover:text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0"
              >
                Partner Options
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Partner Onboarding Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPartnerModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition"
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 font-extrabold text-[11px] uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                <span>Partner Network</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Become a Partner</h2>
              <p className="text-xs text-slate-500 mt-1">Host live events or exhibit products with BookMyEvent.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setShowPartnerModal(false); navigate("/register/partner"); }}
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black text-xs py-3.5 rounded-2xl border-none cursor-pointer shadow-md shadow-cyan-500/20 hover:brightness-105 transition flex items-center justify-center gap-2"
              >
                <span>Register as Partner →</span>
              </button>

              <button
                onClick={() => { setShowPartnerModal(false); }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-extrabold text-xs py-2.5 rounded-2xl transition cursor-pointer"
              >
                Already Registered? Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Role Portal Switcher Modal */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        roles={userRoles}
        user={loggedInUser}
      />
    </div>
  );
}
