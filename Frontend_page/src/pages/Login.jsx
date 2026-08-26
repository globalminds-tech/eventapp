import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { loginUser } from "../Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../Redux/userSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe && savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: "Enter a valid email" }));
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
    let errors = { email: "", password: "" };

    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";

    setFieldErrors(errors);

    if (errors.email || errors.password) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      const data = response.data;

      sessionStorage.setItem("token", data.token || "");
      sessionStorage.setItem("role", data.role || "");
      sessionStorage.setItem("id", data.User_id?.toString() || "");
      sessionStorage.setItem("name", data.name || "");
      sessionStorage.setItem("profile_image", data.profile_image || "");

      localStorage.setItem("token", data.token || "");
      localStorage.setItem("role", data.role || "");
      localStorage.setItem("name", data.name || "");

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      dispatch(
        setUser({
          id: data.User_id,
          name: data.name,
          role: data.role,
          email: data.email,
          profile_image: data.profile_image,
        })
      );

      if (data.role === "organizer") {
        navigate("/OrganizerHome");
      } else if (data.role === "exhibitor") {
        navigate("/exhibitor/dashboard");
      } else if (data.role === "superuser") {
        navigate("/superuser/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response) {
        const message = err.response.data.message;
        if (message === "Email Id is not registered") {
          setFieldErrors((prev) => ({ ...prev, email: message }));
        } else if (message === "Incorrect password") {
          setFieldErrors((prev) => ({ ...prev, password: message }));
        } else {
          setError(message);
        }
      } else {
        setError("Server error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0f172a] text-[#f8fafc] flex flex-col font-sans select-none px-6 py-8">
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-3 mb-8 mt-4">
        <div className="w-10 h-10 bg-[#0ea5e9] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-black text-[#38bdf8] tracking-tight">BookMyEvent</span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
        <h2 className="text-2xl font-black text-center text-white mb-1.5">Welcome Back</h2>
        <p className="text-xs text-slate-400 text-center mb-8 font-medium">Sign in to your account</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-5">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-300 font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">
              Email Id <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`bg-slate-700/30 border ${
                fieldErrors.email ? "border-red-500" : "border-slate-700 hover:border-slate-600"
              } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-blue-500 transition-colors`}
            />
            {fieldErrors.email && <span className="text-[11px] text-red-400 font-bold">{fieldErrors.email}</span>}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full bg-slate-700/30 border ${
                  fieldErrors.password ? "border-red-500" : "border-slate-700 hover:border-slate-600"
                } rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-blue-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 border-none bg-transparent cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="text-[11px] text-red-400 font-bold">{fieldErrors.password}</span>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between mt-1 text-xs select-none">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-400 font-semibold">Remember me</span>
            </label>
            <span
              onClick={() => navigate("/reset-password")}
              className="text-[#38bdf8] font-bold cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0ea5e9] text-white rounded-xl py-3.5 mt-2 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-blue-500/10 hover:bg-[#0284c7] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-700/50" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New to BookMyEvent?</span>
          <div className="flex-1 h-px bg-slate-700/50" />
        </div>

        {/* Create Account */}
        <button
          onClick={() => navigate("/register")}
          className="w-full border border-slate-700 hover:border-slate-600 text-slate-300 bg-transparent rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm cursor-pointer hover:text-white transition-colors"
        >
          <span>Create Account (Attendee)</span>
          <ArrowRight size={16} />
        </button>

        {/* Organizer and Exhibitor Links */}
        <div className="flex gap-2.5 mt-3.5">
          <button
            onClick={() => navigate("/OrganizerHome")}
            className="flex-1 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-xl py-2.5 text-xs font-bold hover:bg-orange-500/25 transition-colors cursor-pointer"
          >
            List Your Show
          </button>
          <button
            onClick={() => navigate("/exhibitor/dashboard")}
            className="flex-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl py-2.5 text-xs font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer"
          >
            Exhibitor Portal
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <span className="text-center text-[10px] font-bold text-slate-500 mt-auto pt-8">
        By signing in, you agree to our Terms of Service
      </span>
    </div>
  );
}
