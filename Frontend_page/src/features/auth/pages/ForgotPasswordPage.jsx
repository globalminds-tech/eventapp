import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  KeyRound, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff,
  ShieldCheck, Check, X, RefreshCw, Lock, Sparkles, Zap, Compass, Clock
} from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import {
  resetsendOtp,
  resetverifyOtp,
  resetresendOtp,
  resetPassword,
} from "@/Services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if passed in query param (e.g. from team invite onboarding)
  const queryEmail = new URLSearchParams(location.search).get("email") || "";

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState(queryEmail);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(300); // 300s = 5 minutes (matches email & backend)
  const [resendTimer, setResendTimer] = useState(60); // 60s cooldown for resend button
  const [canResend, setCanResend] = useState(false);

  const expiryTimerRef = useRef(null);
  const resendTimerRef = useRef(null);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Synchronized 5-minute code validity & 60-second resend cooldown
  const startTimers = () => {
    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);

    // 5-minute code validity countdown (300s)
    setExpirySeconds(300);
    expiryTimerRef.current = setInterval(() => {
      setExpirySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(expiryTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 60-second resend cooldown
    setResendTimer(60);
    setCanResend(false);
    resendTimerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (step === 2) {
      startTimers();
      setTimeout(() => document.getElementById("otp-digit-0")?.focus(), 150);
    }
    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, [step]);

  // Real-time password criteria validation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&#^()_\-+=]/.test(password),
    };
  }, [password]);

  const passwordStrength = useMemo(() => {
    const metCount = Object.values(passwordCriteria).filter(Boolean).length;
    if (metCount <= 2) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-600" };
    if (metCount === 3 || metCount === 4) return { score: 2, label: "Good", color: "bg-amber-500", text: "text-amber-600" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
  }, [passwordCriteria]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Please enter your registered email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Please enter a valid email address.");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await resetsendOtp({ email: email.trim().toLowerCase() });
      setMessage(res.message || "Verification code dispatched successfully.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to dispatch verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      document.getElementById(`otp-digit-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-digit-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      document.getElementById("otp-digit-5")?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 6) return setError("Please enter the full 6-digit verification code.");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await resetverifyOtp({ email: email.trim().toLowerCase(), otp: fullOtp });
      if (res.status || res.success) {
        setMessage("Code verified successfully!");
        setStep(3);
      } else {
        setError(res.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await resetresendOtp({ email: email.trim().toLowerCase() });
      setMessage("A fresh verification code was sent to your inbox.");
      setOtpDigits(["", "", "", "", "", ""]);
      startTimers();
      setTimeout(() => document.getElementById("otp-digit-0")?.focus(), 150);
    } catch (err) {
      setError("Failed to resend code. Please wait a moment and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordCriteria.length) return setError("Password must be at least 8 characters long.");
    if (!passwordCriteria.hasUpper || !passwordCriteria.hasNumber || !passwordCriteria.hasSpecial) {
      return setError("Please satisfy all password security requirements.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await resetPassword({ email: email.trim().toLowerCase(), password });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans select-none">
      <div className="w-full max-w-md lg:max-w-5xl bg-white rounded-3xl lg:rounded-[2.5rem] border border-slate-200/80 shadow-xl lg:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[580px]">

        {/* LEFT COLUMN: Experience Banner Matching Login Theme (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 sm:w-60 h-48 sm:h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 sm:w-60 h-48 sm:h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 cursor-pointer" onClick={() => navigate("/")}>
            <BrandLogo textColor="text-white text-lg sm:text-xl font-[900]" />
          </div>

          <div className="relative z-10 my-6 lg:my-8 space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Security &amp; Recovery
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-3">
                Account Access Recovery
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1.5 leading-relaxed">
                Restore access to your account with encrypted 6-digit one-time authorization and military-grade password hashing.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-center bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-orange-300">Encrypted Email Dispatch</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Instant 6-digit OTP code sent directly to your inbox.</p>
                </div>
              </div>

              <div className="flex gap-3 items-center bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Bcrypt / Salted Hashing</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">High-entropy one-way credential encryption.</p>
                </div>
              </div>

              <div className="flex gap-3 items-center bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Instant Workspace Re-Entry</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Continue managing events immediately after reset.</p>
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

        {/* RIGHT COLUMN: Interactive Password Reset Flow */}
        <div className="w-full lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile Header (Mobile Only) */}
            <div className="flex items-center justify-between mb-5 lg:hidden">
              <button
                type="button"
                onClick={() => {
                  if (step > 1 && step < 4) {
                    setStep(step - 1);
                    setError("");
                    setMessage("");
                  } else {
                    navigate("/login");
                  }
                }}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1 text-xs font-bold bg-transparent border-none cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>{step > 1 && step < 4 ? "Back" : "Sign In"}</span>
              </button>

              <div className="cursor-pointer" onClick={() => navigate("/")}>
                <BrandLogo textColor="text-slate-900 text-lg font-black" />
              </div>

              {step < 4 ? (
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  Step {step}/3
                </span>
              ) : (
                <div className="w-10" />
              )}
            </div>

            {/* Desktop Top Navigation (Desktop Only) */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  if (step > 1 && step < 4) {
                    setStep(step - 1);
                    setError("");
                    setMessage("");
                  } else {
                    navigate("/login");
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer bg-transparent border-none"
              >
                <ArrowLeft size={14} />
                <span>{step > 1 && step < 4 ? "Previous Step" : "Back to Sign In"}</span>
              </button>

              {step < 4 && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  Step <span className="text-orange-600">{step}</span> of 3
                </div>
              )}
            </div>

            {/* Stepper Progress Bar */}
            {step < 4 && (
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s === step
                        ? "w-10 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"
                        : s < step
                        ? "w-5 bg-emerald-500"
                        : "w-5 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Feedback Alerts */}
            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold p-3.5 rounded-2xl mb-4 flex items-center gap-2">
                <AlertCircle size={14} className="text-orange-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1: REQUEST OTP ── */}
            {step === 1 && (
              <div>
                <div className="mb-5 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Forgot Password? 🔑</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Enter your registered email address and we will dispatch a 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Email Address <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3.5 py-3 h-12 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    <span>{loading ? "Sending Code..." : "SEND VERIFICATION CODE"}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 2: VERIFY OTP ── */}
            {step === 2 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Verify Your Email 📩</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Enter the 6-digit code sent to <strong className="text-slate-800">{email}</strong>
                  </p>
                </div>

                {/* 5-Minute OTP Validity Banner */}
                <div className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 mb-4 text-xs border transition-all ${
                  expirySeconds === 0
                    ? "bg-red-50 border-red-200 text-red-700"
                    : expirySeconds <= 60
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className={`h-4 w-4 ${expirySeconds === 0 ? "text-red-500" : "text-amber-600"}`} />
                    {expirySeconds === 0 ? "Code Expired" : "Code Valid For (5 mins):"}
                  </span>
                  <span className={`font-mono font-black text-xs ${
                    expirySeconds === 0 ? "text-red-600" : expirySeconds <= 60 ? "text-red-600 animate-pulse" : "text-slate-900"
                  }`}>
                    {expirySeconds === 0 ? "00:00" : formatTime(expirySeconds)}
                  </span>
                </div>

                {expirySeconds === 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl mb-4 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 text-red-600" />
                    <span>Your 5-minute code has expired. Please click "Resend Code" below to receive a new code.</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                  {/* 6 Individual Code Inputs with comfortable mobile spacing */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-digit-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={expirySeconds === 0}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="h-12 w-10 sm:w-12 text-center text-lg font-black rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 transition shadow-2xs disabled:opacity-50"
                      />
                    ))}
                  </div>

                  {/* Resend Link with Cooldown Timer */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                    <span>Didn't receive code?</span>
                    {canResend || expirySeconds === 0 ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="font-extrabold text-orange-600 hover:underline cursor-pointer bg-transparent border-none flex items-center gap-1 py-1"
                      >
                        <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                        Resend Code
                      </button>
                    ) : (
                      <span className="font-bold text-slate-400">
                        Resend in <span className="text-orange-600 font-extrabold">{resendTimer}s</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length < 6 || expirySeconds === 0}
                    className="w-full mt-2 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    <span>{loading ? "Verifying..." : "VERIFY CODE"}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 3: CREATE NEW PASSWORD ── */}
            {step === 3 && (
              <div>
                <div className="mb-5">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Create New Password 🔒</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Set a secure, high-entropy password for your account.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      New Password <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full pl-10 pr-11 py-2.5 h-11 sm:h-12 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter & Live Security Checklist */}
                    {password && (
                      <div className="mt-2 space-y-2 rounded-xl bg-slate-50 border border-slate-200/70 p-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-500">Password Strength:</span>
                          <span className={`font-black ${passwordStrength.text}`}>
                            {passwordStrength.label}
                          </span>
                        </div>

                        {/* Dynamic Strength Bar */}
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{
                              width: `${(Object.values(passwordCriteria).filter(Boolean).length / 5) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Criteria Checklist */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                          <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                            {passwordCriteria.length ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1" />}
                            8+ characters
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                            {passwordCriteria.hasUpper ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1" />}
                            Uppercase letter
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLower ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                            {passwordCriteria.hasLower ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1" />}
                            Lowercase letter
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                            {passwordCriteria.hasNumber ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1" />}
                            Number (0-9)
                          </div>
                          <div className={`col-span-2 flex items-center gap-1.5 ${passwordCriteria.hasSpecial ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                            {passwordCriteria.hasSpecial ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 ml-0.5 mr-1" />}
                            Special character (!@#$%^&*)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Confirm Password <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-11 py-2.5 h-11 sm:h-12 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {confirmPassword && (
                      <div className="flex items-center gap-1.5 text-[11px] pt-1">
                        {passwordsMatch ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold">
                            <Check className="h-3.5 w-3.5" /> Passwords match
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 font-semibold">
                            <X className="h-3.5 w-3.5" /> Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !passwordsMatch || passwordStrength.score < 2}
                    className="w-full mt-2 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    <span>{loading ? "Updating Password..." : "RESET PASSWORD & SIGN IN"}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 4: SUCCESS CONFIRMATION ── */}
            {step === 4 && (
              <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-md shadow-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Password Reset Complete! 🎉</h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    Your account password has been updated securely. You can now proceed to log in with your new credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full mt-4 h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl border-none cursor-pointer shadow-md shadow-orange-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>SIGN IN NOW</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Bottom Footer */}
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Remember your password?</span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-extrabold text-orange-600 hover:underline cursor-pointer bg-transparent border-none py-1"
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
