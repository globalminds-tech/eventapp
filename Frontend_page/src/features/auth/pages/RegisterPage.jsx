import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "@/Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/store/userSlice";
import { setCredentials } from "@/app/store/authSlice";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Compass, ShieldCheck, Zap } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setFieldErrors({});

    let errors = {};

    if (!formData.name) errors.name = "Full Name is required";
    if (!formData.email) {
      errors.email = "Email Address is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirm_password) {
      errors.confirm_password = "Confirm Password is required";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser(formData);
      const data = response.data?.data || response.data;
      const userObj = data?.user || data || {};
      const userRoles = Array.isArray(userObj?.roles) && userObj.roles.length > 0
        ? userObj.roles.map((r) => String(r).toLowerCase())
        : ["user"];
      const userRole = (userObj?.active_role || userRoles[0] || "user").toLowerCase();
      const userId = userObj?.id || data?.User_id || "";
      const userName = userObj?.name || data?.name || formData.name;
      const token = data?.token || data?.access_token || "";
      const refreshToken = data?.refresh_token || "";

      sessionStorage.setItem("token", token);
      localStorage.setItem("token", token);
      sessionStorage.setItem("accessToken", token);
      localStorage.setItem("accessToken", token);
      if (refreshToken) {
        sessionStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("refreshToken", refreshToken);
      }
      sessionStorage.setItem("roles", JSON.stringify(userRoles));
      localStorage.setItem("roles", JSON.stringify(userRoles));
      sessionStorage.setItem("role", userRole);
      localStorage.setItem("role", userRole);
      sessionStorage.setItem("id", userId.toString());
      sessionStorage.setItem("userId", userId.toString());
      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("email", formData.email);

      localStorage.setItem("id", userId.toString());
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("name", userName);
      localStorage.setItem("email", formData.email);

      const userToStore = {
        ...userObj,
        roles: userRoles,
        active_role: userRole,
        role: userRole,
        profiles: userObj?.profiles || { organizer: null, exhibitor: null },
      };
      sessionStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.setItem("user", JSON.stringify(userToStore));

      dispatch(setCredentials({ user: userToStore, token: token, role: userRole }));
      dispatch(
        setUser({
          ...userToStore,
          id: userId,
          name: userName,
          role: userRole,
          active_role: userRole,
          roles: userRoles,
          email: formData.email,
          profile_image: userObj.profile_image || "",
        })
      );

      setMessage("Account created successfully! Logging you in...");
      setTimeout(() => navigate(returnUrl || "/", { replace: true }), 1000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans select-none">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[580px]">
        
        {/* LEFT COLUMN: Universal Platform Experience Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white p-6 sm:p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 sm:w-60 h-48 sm:h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 sm:w-60 h-48 sm:h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 cursor-pointer mb-4 lg:mb-0" onClick={() => navigate("/")}>
            <BrandLogo textColor="text-white text-lg sm:text-xl font-[900]" />
          </div>

          <div className="relative z-10 my-4 sm:my-6 lg:my-8 space-y-4 sm:space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Join Us Today
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-3">
                Experience Live Events Like Never Before
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1.5 leading-relaxed">
                Create your account to unlock instant tickets, personal itineraries, and exclusive show passes.
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

          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Trusted by 500,000+ users nationwide
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Join to explore live events or manage your partner business
              </p>
            </div>

            {error && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold p-3.5 rounded-2xl mb-4">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3.5 rounded-2xl mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="bme_register_name"
                  id="bme_register_name"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                    fieldErrors.name ? "border-orange-500" : "border-slate-200 focus:border-orange-500"
                  } rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all`}
                />
                {fieldErrors.name && <span className="text-[11px] font-semibold text-orange-600">{fieldErrors.name}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  name="bme_register_email"
                  id="bme_register_email"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                    fieldErrors.email ? "border-orange-500" : "border-slate-200 focus:border-orange-500"
                  } rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all`}
                />
                {fieldErrors.email && <span className="text-[11px] font-semibold text-orange-600">{fieldErrors.email}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="bme_register_password"
                    id="bme_register_password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border ${
                      fieldErrors.password ? "border-orange-500" : "border-slate-200 focus:border-orange-500"
                    } rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="text-[11px] font-semibold text-orange-600">{fieldErrors.password}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="bme_register_confirm_password"
                    id="bme_register_confirm_password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={formData.confirm_password}
                    onChange={(e) => handleChange("confirm_password", e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border ${
                      fieldErrors.confirm_password ? "border-orange-500" : "border-slate-200 focus:border-orange-500"
                    } rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirm_password && (
                  <span className="text-[11px] font-semibold text-orange-600">{fieldErrors.confirm_password}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs py-3.5 rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/25 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => {
                  const query = returnUrl ? `?returnUrl=${returnUrl}` : "";
                  navigate(`/login${query}`);
                }}
                className="font-extrabold text-orange-600 hover:underline cursor-pointer bg-transparent border-none"
              >
                Sign In →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
