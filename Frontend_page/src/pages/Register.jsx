import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../Redux/userSlice";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Compass, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import BrandLogo from "../components/ui/BrandLogo";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      const userRole = (data?.user?.role || data?.role || "user").toLowerCase();
      const userId = data?.user?.id || data?.User_id || "";
      const userName = data?.user?.name || data?.name || formData.name;
      const token = data?.token || "authenticated-user-token";

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", userRole);
      sessionStorage.setItem("id", userId.toString());
      sessionStorage.setItem("name", userName);

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("name", userName);

      dispatch(setUser({ id: userId, name: userName, role: userRole, email: formData.email }));

      setMessage("Account created successfully! Logging you in...");
      setTimeout(() => navigate("/", { replace: true }), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans select-none">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[620px]">
        
        {/* LEFT COLUMN: Universal Responsive Platform Experience Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-7 md:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Glow Accents */}
          <div className="absolute -top-20 -left-20 w-48 sm:w-60 h-48 sm:h-60 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-48 sm:w-60 h-48 sm:h-60 bg-blue-600/10 rounded-full blur-3xl" />

          {/* Logo Header */}
          <div className="relative z-10 cursor-pointer mb-4 lg:mb-0" onClick={() => navigate("/")}>
            <BrandLogo textColor="text-white text-lg sm:text-xl font-[900]" />
          </div>

          {/* Unified Platform Highlights */}
          <div className="relative z-10 my-4 sm:my-6 lg:my-8 space-y-4 sm:space-y-6">
            <div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Join Us Today
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-2 sm:mt-3">
                Experience Live Events Like Never Before
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1 sm:mt-1.5 leading-relaxed">
                Create your account to unlock instant tickets, personal itineraries, and exclusive show passes.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5 pt-1 sm:pt-2">
              <div className="flex gap-2.5 sm:gap-3 items-start bg-slate-800/40 border border-slate-700/50 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl backdrop-blur-md">
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg sm:rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 sm:w-[18px] h-4 sm:h-[18px]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-cyan-300">Seamless Event Discovery</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-normal">
                    Explore curated events across categories, filter by location, and book instant passes.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 sm:gap-3 items-start bg-slate-800/40 border border-slate-700/50 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl backdrop-blur-md">
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 sm:w-[18px] h-4 sm:h-[18px]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Verified Digital Passports</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-normal">
                    Enjoy secure QR code tickets with instant mobile check-ins and hassle-free entry.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 sm:gap-3 items-start bg-slate-800/40 border border-slate-700/50 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl backdrop-blur-md">
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 sm:w-[18px] h-4 sm:h-[18px]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-300">All-in-One Dashboard</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-normal">
                    Manage bookings, view invoices, host shows, or reserve vendor booths from a single account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="relative z-10 pt-3 sm:pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
            <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
            <span className="truncate">Trusted by over 500,000 event enthusiasts nationwide</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Single Signup Form */}
        <div className="lg:col-span-7 p-5 sm:p-8 md:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer mb-3"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Enter your details to create your account
              </p>
            </div>

            {/* Success Banner */}
            {message && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl mb-4 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl mb-4 text-xs font-bold text-red-600">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`bg-slate-50 border ${
                    fieldErrors.name ? "border-red-500" : "border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white"
                  } rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-all`}
                />
                {fieldErrors.name && <span className="text-[11px] text-red-500 font-bold">{fieldErrors.name}</span>}
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`bg-slate-50 border ${
                    fieldErrors.email ? "border-red-500" : "border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white"
                  } rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-all`}
                />
                {fieldErrors.email && <span className="text-[11px] text-red-500 font-bold">{fieldErrors.email}</span>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`w-full bg-slate-50 border ${
                      fieldErrors.password ? "border-red-500" : "border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white"
                    } rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 pr-12 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="text-[11px] text-red-500 font-bold">{fieldErrors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={(e) => handleChange("confirm_password", e.target.value)}
                    className={`w-full bg-slate-50 border ${
                      fieldErrors.confirm_password ? "border-red-500" : "border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white"
                    } rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 pr-12 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.confirm_password && (
                  <span className="text-[11px] text-red-500 font-bold">{fieldErrors.confirm_password}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white rounded-xl py-3 sm:py-3.5 mt-1 sm:mt-2 flex items-center justify-center gap-2 font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-cyan-500/25 hover:brightness-105 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Navigation to Login */}
          <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Already registered?</span>
            <button
              onClick={() => navigate("/login")}
              className="text-cyan-600 font-extrabold hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
            >
              <span>Sign In Instead</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
