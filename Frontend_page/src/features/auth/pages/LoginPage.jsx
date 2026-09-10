import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Compass, ShieldCheck, Zap, Ticket, Mail, Lock } from "lucide-react";
import { loginUser } from "@/Services/api";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/app/store/userSlice";
import { setCredentials } from "@/app/store/authSlice";
import { getUserAvailableRoles } from "@/shared/services/authHelper";
import BrandLogo from "@/components/ui/BrandLogo";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import FirstLoginPasswordModal from "@/components/FirstLoginPasswordModal";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const eventName = searchParams.get("eventName");
  const eventBanner = searchParams.get("eventBanner");
  const isBookingFlow = Boolean(returnUrl && returnUrl.includes("/usersbooking"));
  const { isAuthenticated, accessToken, role: authRole, user: authUser } = useSelector((state) => state.auth);

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

  // Mandatory First-Time Login Password Reset State
  const [isFirstLoginModalOpen, setIsFirstLoginModalOpen] = useState(false);
  const [firstLoginData, setFirstLoginData] = useState(null);

  useEffect(() => {
    // If URL has email and/or password prefill parameters (e.g. from invitation email direct link)
    const emailParam = searchParams.get("email");
    const tempPwParam = searchParams.get("temp_password") || searchParams.get("password");
    if (emailParam || tempPwParam) {
      setFormData((prev) => ({
        ...prev,
        email: emailParam || prev.email,
        password: tempPwParam || prev.password,
      }));
    }

    if (isAuthenticated && accessToken) {
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
      } catch {
        storedUser = null;
      }

      // CRITICAL: If user must change password, DO NOT AUTO-NAVIGATE! Open the modal instead!
      const userMustChange = Boolean(
        storedUser?.must_change_password ||
        authUser?.must_change_password
      );
      if (userMustChange) {
        setFirstLoginData({
          user: storedUser || authUser,
          tempPassword: "",
          token: accessToken,
          userRole: storedUser?.active_role || authUser?.active_role || storedUser?.role || "user",
          detectedRoles: storedUser?.roles || authUser?.roles || [],
          isSuperAdmin: false,
        });
        setIsFirstLoginModalOpen(true);
        return;
      }

      const cleanRole = String(authRole || storedUser?.active_role || storedUser?.role || "").toLowerCase();
      const rolesArr = Array.isArray(storedUser?.roles) ? storedUser.roles.map((r) => String(r).toLowerCase()) : [];
      const isSuper = (
        cleanRole === "superadmin" ||
        cleanRole === "superuser" ||
        cleanRole === "admin" ||
        rolesArr.includes("superadmin") ||
        rolesArr.includes("superuser")
      );

      if (isSuper) {
        navigate("/superuser/dashboard", { replace: true });
        return;
      }
      if (returnUrl && returnUrl !== "/profile") {
        navigate(returnUrl, { replace: true });
        return;
      }
      if (cleanRole === "organizer") {
        navigate("/OrganizerHome", { replace: true });
        return;
      }
      if (cleanRole === "exhibitor") {
        navigate("/exhibitor", { replace: true });
        return;
      }
      navigate("/", { replace: true });
      return;
    }

    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe && savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [navigate, isAuthenticated, accessToken, authRole, authUser, returnUrl, searchParams]);

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
      const detectedRoles = getUserAvailableRoles(userObj);
      const userRole = (userObj?.active_role || data?.active_role || detectedRoles[0] || "user").toLowerCase();
      const userId = userObj?.id || data.User_id || "";
      const userName = userObj?.name || data.name || "User";
      const userEmail = userObj?.email || formData.email || "";
      const userMobile = userObj?.mobile || "";
      const userOrg = userObj?.organization_name || "";
      const token = data.token || data.access_token || "";
      const userProfiles = userObj?.profiles || {
        organizer: userObj?.organizer_profile || null,
        exhibitor: userObj?.exhibitor_profile || null,
      };

      const userToStore = {
        ...userObj,
        roles: detectedRoles,
        active_role: userRole,
        role: userRole,
        profiles: userProfiles,
      };

      const isSuperAdmin = ["superadmin", "superuser"].includes(String(userRole || "").toLowerCase()) ||
        detectedRoles.some((r) => ["superadmin", "superuser"].includes(String(r).toLowerCase()));

      const mustChangePassword = Boolean(
        data.must_change_password ||
        userObj.must_change_password ||
        userToStore.must_change_password
      );

      // CRITICAL: If user must change password, DO NOT dispatch setCredentials yet!
      // Dispatching setCredentials immediately sets isAuthenticated=true in Redux, which triggers
      // the useEffect auto-navigation before the user can set their password!
      if (mustChangePassword) {
        userToStore.must_change_password = true;

        sessionStorage.setItem("role", userRole);
        sessionStorage.setItem("roles", JSON.stringify(detectedRoles));
        sessionStorage.setItem("id", userId.toString());
        sessionStorage.setItem("userId", userId.toString());
        sessionStorage.setItem("name", userName);
        sessionStorage.setItem("email", userEmail);
        localStorage.setItem("role", userRole);
        localStorage.setItem("roles", JSON.stringify(detectedRoles));
        localStorage.setItem("id", userId.toString());
        localStorage.setItem("userId", userId.toString());
        localStorage.setItem("name", userName);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("user", JSON.stringify(userToStore));
        sessionStorage.setItem("user", JSON.stringify(userToStore));
        localStorage.removeItem("is_logged_out");
        sessionStorage.removeItem("is_logged_out");

        dispatch(setCredentials({ user: userToStore, token: token, role: userRole }));
        dispatch(setUser(userToStore));

        setFirstLoginData({
          user: userToStore,
          tempPassword: formData.password,
          token: token,
          userRole,
          detectedRoles,
          isSuperAdmin,
        });
        setIsFirstLoginModalOpen(true);
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem("role", userRole);
      sessionStorage.setItem("roles", JSON.stringify(detectedRoles));
      sessionStorage.setItem("id", userId.toString());
      sessionStorage.setItem("userId", userId.toString());
      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("email", userEmail);
      if (userMobile) sessionStorage.setItem("mobile", userMobile);
      if (userOrg) sessionStorage.setItem("organization_name", userOrg);

      localStorage.setItem("role", userRole);
      localStorage.setItem("roles", JSON.stringify(detectedRoles));
      localStorage.setItem("id", userId.toString());
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("name", userName);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("user", JSON.stringify(userToStore));
      sessionStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.removeItem("is_logged_out");
      sessionStorage.removeItem("is_logged_out");

      dispatch(setCredentials({ user: userToStore, token: token, role: userRole }));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      dispatch(
        setUser({
          ...userToStore,
          id: userId,
          name: userName,
          role: userRole,
          active_role: userRole,
          roles: detectedRoles,
          email: userEmail,
          mobile: userMobile,
          organization_name: userOrg,
          profiles: userProfiles,
        })
      );

      if (isSuperAdmin) {
        navigate("/superuser/dashboard", { replace: true });
        return;
      }

      if (detectedRoles.length > 1 && !returnUrl) {
        setUserRoles(detectedRoles);
        setLoggedInUser(userObj);
        setIsRoleModalOpen(true);
        return;
      }

      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else if (userRole === "organizer") {
        navigate("/OrganizerHome", { replace: true });
      } else if (userRole === "exhibitor") {
        navigate("/exhibitor", { replace: true });
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
      <div className="w-full max-w-md lg:max-w-5xl bg-white rounded-3xl lg:rounded-[2.5rem] border border-slate-200/80 shadow-xl lg:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[580px]">
        
        {/* LEFT COLUMN: Experience Banner with warm sunset amber tones (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 sm:w-60 h-48 sm:h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 sm:w-60 h-48 sm:h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 cursor-pointer" onClick={() => navigate("/")}>
            <BrandLogo textColor="text-white text-lg sm:text-xl font-[900]" />
          </div>

          <div className="relative z-10 my-6 lg:my-8 space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Welcome Back
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-3">
                Discover, Host &amp; Connect
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1.5 leading-relaxed">
                Your premier destination for live concerts, tech expos, business summits, and cultural festivals.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-center bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-orange-300">Seamless Event Discovery</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Explore events &amp; book instant passes.</p>
                </div>
              </div>

              <div className="flex gap-3 items-center bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Verified QR Passports</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Secure mobile check-in &amp; gate access.</p>
                </div>
              </div>

              <div className="flex gap-3 items-center bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">All-in-One Workspace</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Host shows or reserve vendor stalls.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Trusted by 500,000+ users nationwide
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Focused Interactive Login Form */}
        <div className="w-full lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile Header: Back button + BrandLogo (Visible on mobile only) */}
            <div className="flex items-center justify-between mb-5 lg:hidden">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1 text-xs font-bold bg-transparent border-none cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>{isBookingFlow ? "Event" : "Back"}</span>
              </button>
              <div className="cursor-pointer" onClick={() => navigate("/")}>
                <BrandLogo textColor="text-slate-900 text-lg font-black" />
              </div>
              <div className="w-10" />
            </div>

            {/* Desktop Top Navigation (Visible on desktop only) */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft size={14} />
                <span>{isBookingFlow ? "Back to Event" : "Back"}</span>
              </button>
            </div>

            {/* Contextual Booking Hold Alert */}
            {isBookingFlow && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 mb-5 flex items-center gap-3 shadow-xs">
                {eventBanner ? (
                  <img
                    src={eventBanner}
                    alt={eventName || "Event"}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 border border-amber-200 shadow-xs"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100/90 px-2 py-0.5 rounded-md">
                    Ticket Reservation in Progress
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                    {eventName || "Your Selected Event Pass"}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">
                    Sign in to link this pass to your account and complete booking.
                  </p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                {isBookingFlow ? "Sign In to Complete Booking" : "Welcome Back 👋"}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {isBookingFlow ? "Quickly sign in to finalize your pass purchase" : "Enter your account credentials to access your portal"}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold p-3.5 rounded-2xl mb-4">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="bme_login_email"
                    id="bme_login_email"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-3.5 py-3 h-12 bg-slate-50 border ${
                      fieldErrors.email ? "border-orange-500 focus:border-orange-500" : "border-slate-200 focus:border-orange-500"
                    } rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200`}
                  />
                </div>
                {fieldErrors.email && <span className="text-[11px] font-semibold text-orange-600">{fieldErrors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="bme_login_password"
                    id="bme_login_password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-3 h-12 bg-slate-50 border ${
                      fieldErrors.password ? "border-orange-500 focus:border-orange-500" : "border-slate-200 focus:border-orange-500"
                    } rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="text-[11px] font-semibold text-orange-600">{fieldErrors.password}</span>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  className="text-xs font-bold text-orange-600 hover:underline bg-transparent border-none cursor-pointer py-1"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>{isLoading ? "Signing In..." : "SIGN IN"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>New to BookMyEvent?</span>
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (returnUrl) params.set("returnUrl", returnUrl);
                  if (eventName) params.set("eventName", eventName);
                  if (eventBanner) params.set("eventBanner", eventBanner);
                  const query = params.toString() ? `?${params.toString()}` : "";
                  navigate(`/register${query}`);
                }}
                className="font-extrabold text-orange-600 hover:underline cursor-pointer bg-transparent border-none py-1"
              >
                Create Account →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Role Portal Switcher Modal */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        roles={userRoles}
        user={loggedInUser}
      />

      {/* First-Time Login Password Reset Modal */}
      <FirstLoginPasswordModal
        isOpen={isFirstLoginModalOpen}
        user={firstLoginData?.user}
        tempPassword={firstLoginData?.tempPassword}
        token={firstLoginData?.token}
        onSuccess={(updatedUser) => {
          setIsFirstLoginModalOpen(false);
          const rawUser = updatedUser || {};
          const allRoles = Array.isArray(rawUser.roles) ? rawUser.roles : (rawUser.role ? [rawUser.role] : ["user"]);
          const activeRole = rawUser.active_role || (allRoles.includes("organizer") ? "organizer" : (allRoles.includes("exhibitor") ? "exhibitor" : (firstLoginData?.userRole || "organizer")));

          const sanitizedUser = {
            ...rawUser,
            roles: allRoles,
            active_role: activeRole,
            role: activeRole,
            must_change_password: false,
          };

          sessionStorage.setItem("role", activeRole);
          localStorage.setItem("role", activeRole);
          sessionStorage.setItem("active_role", activeRole);
          localStorage.setItem("active_role", activeRole);
          sessionStorage.setItem("roles", JSON.stringify(allRoles));
          localStorage.setItem("roles", JSON.stringify(allRoles));
          localStorage.setItem("user", JSON.stringify(sanitizedUser));
          sessionStorage.setItem("user", JSON.stringify(sanitizedUser));

          dispatch(setCredentials({
            user: sanitizedUser,
            token: firstLoginData?.token,
            role: activeRole,
            active_role: activeRole,
          }));
          dispatch(setUser(sanitizedUser));

          if (firstLoginData?.isSuperAdmin || allRoles.includes("superuser") || allRoles.includes("superadmin")) {
            window.location.replace("/superuser/dashboard");
            return;
          }
          if (returnUrl) {
            window.location.replace(returnUrl);
            return;
          }
          if (activeRole === "organizer" || allRoles.includes("organizer")) {
            window.location.replace("/OrganizerHome");
            return;
          }
          if (activeRole === "exhibitor" || allRoles.includes("exhibitor")) {
            window.location.replace("/exhibitor");
            return;
          }
          window.location.replace("/");
        }}
        onCancel={() => setIsFirstLoginModalOpen(false)}
      />
    </div>
  );
}
