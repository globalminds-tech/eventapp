import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../Services/api";
import { Eye, EyeOff, ArrowRight, Sparkles, User, Mail, Shield, Lock } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleChange = (name, value) => {
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setFieldErrors({});

    let errors = {};

    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) {
      errors.email = "Email Id is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email Id is invalid";
    }
    if (!formData.role) errors.role = "Role is required";
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 8 characters and contain a special character (!@#$%^&*)";
    }
    if (!formData.confirm_password) {
      errors.confirm_password = "Confirm password is required";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Password does not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(formData);
      setMessage("Account has been created successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0f172a] text-[#f8fafc] flex flex-col font-sans select-none px-6 py-8">
      {/* Brand Header */}
      <div className="flex items-center justify-center gap-3 mb-6 mt-2">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-black text-purple-400 tracking-tight">BookMyEvent</span>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md mx-auto bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
        <h2 className="text-2xl font-black text-center text-white mb-1.5">Join Us</h2>
        <p className="text-xs text-slate-400 text-center mb-6 font-medium">Create your account to continue</p>

        {message && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl mb-5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-emerald-300 font-bold">{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-5">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-300 font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`bg-slate-700/30 border ${
                fieldErrors.name ? "border-red-500" : "border-slate-700"
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-purple-500 transition-colors`}
            />
            {fieldErrors.name && <span className="text-[10px] text-red-400 font-bold">{fieldErrors.name}</span>}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`bg-slate-700/30 border ${
                fieldErrors.email ? "border-red-500" : "border-slate-700"
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-purple-500 transition-colors`}
            />
            {fieldErrors.email && <span className="text-[10px] text-red-400 font-bold">{fieldErrors.email}</span>}
          </div>

          {/* Role Selection Card Row */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Select Your Role</label>
            <div className="flex gap-3">
              {[
                { value: "organizer", label: "Organizer", icon: Shield },
                { value: "exhibitor", label: "Exhibitor", icon: Sparkles },
              ].map(({ value, label, icon: Icon }) => {
                const isSelected = formData.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange("role", value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-slate-700 bg-slate-700/10 text-slate-400 hover:border-slate-650"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.role && <span className="text-[10px] text-red-400 font-bold">{fieldErrors.role}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full bg-slate-700/30 border ${
                  fieldErrors.password ? "border-red-500" : "border-slate-700"
                } rounded-xl px-4 py-2.5 pr-12 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-purple-500 transition-colors`}
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
              <span className="text-[10px] text-red-400 font-bold leading-tight">{fieldErrors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={(e) => handleChange("confirm_password", e.target.value)}
                className={`w-full bg-slate-700/30 border ${
                  fieldErrors.confirm_password ? "border-red-500" : "border-slate-700"
                } rounded-xl px-4 py-2.5 pr-12 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-purple-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 border-none bg-transparent cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirm_password && (
              <span className="text-[10px] text-red-400 font-bold">{fieldErrors.confirm_password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white rounded-xl py-3.5 mt-3 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-purple-500/10 hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-50"
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

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-700/50" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Already registered?</span>
          <div className="flex-1 h-px bg-slate-700/50" />
        </div>

        {/* Link to Login */}
        <button
          onClick={() => navigate("/login")}
          className="w-full border border-slate-700 hover:border-slate-600 text-slate-300 bg-transparent rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm cursor-pointer hover:text-white transition-colors"
        >
          <span>Sign In Instead</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <span className="text-center text-[10px] font-bold text-slate-500 mt-auto pt-6">
        By creating an account, you agree to our Terms of Service
      </span>
    </div>
  );
}
