import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, AlertCircle, CheckCircle, ChevronLeft } from "lucide-react";
import {
  resetsendOtp,
  resetverifyOtp,
  resetresendOtp,
  resetPassword,
} from "../Services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimer(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (step === 2) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSendOtp = async () => {
    if (!email) return setError("Please enter your email Id");
    if (!validateEmail(email)) return setError("Enter a valid email address");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await resetsendOtp({ email });
      setMessage(res.message || "OTP sent successfully");
      setStep(2);
    } catch (err) {
      setError("Failed to send OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 6) return setError("Please enter the complete OTP");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await resetverifyOtp({ email, otp: fullOtp });
      if (res.status) {
        setMessage("OTP verified");
        setStep(3);
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await resetresendOtp({ email });
      setMessage("OTP resent to your email");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 100);
      startTimer();
    } catch (err) {
      setError("Resend failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!complexityRegex.test(password)) {
      return setError("Include uppercase, lowercase, number, and special character.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await resetPassword({ email, password });
      setMessage("Password updated successfully");
      setStep(4);
    } catch (err) {
      setError("Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col font-sans select-none pb-24">
      {/* Top Header Row */}
      <div className="h-14 px-4 border-b border-[#1e293b] flex items-center gap-3 bg-[#0f172a] sticky top-0 z-30">
        <button
          onClick={() => {
            if (step > 1 && step < 4) setStep(step - 1);
            else navigate("/login");
          }}
          className="p-1 hover:bg-slate-800 rounded-full cursor-pointer text-slate-400 hover:text-white border-none bg-transparent"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-base font-bold tracking-tight">Reset Password</span>
      </div>

      <div className="px-6 py-6 flex-1 flex flex-col justify-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-indigo-400 tracking-tight">BookMyEvent</span>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md mx-auto bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
          {step < 4 && (
            <div className="mb-6">
              <h2 className="text-xl font-black text-white text-center mb-1">Reset Password</h2>
              <p className="text-xs text-slate-400 text-center font-medium leading-relaxed">
                {step === 1 && "Enter your registered email to receive a verification code."}
                {step === 2 && `Code sent to ${email}`}
                {step === 3 && "Create a secure new password for your account."}
              </p>
            </div>
          )}

          {/* Stepper Status Indicators */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <div className={`px-2.5 py-1 rounded-full ${step === 1 ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                1. Email
              </div>
              <div className="w-4 h-px bg-slate-700" />
              <div className={`px-2.5 py-1 rounded-full ${step === 2 ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                2. Verify
              </div>
              <div className="w-4 h-px bg-slate-700" />
              <div className={`px-2.5 py-1 rounded-full ${step === 3 ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                3. Reset
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {message && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl mb-5">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-xs text-emerald-300 font-bold">{message}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-5">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-xs text-red-300 font-bold leading-tight">{error}</span>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Email ID</label>
                <input
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700/30 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-xl py-3.5 mt-2 flex items-center justify-center font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Sending code..." : "Send code"}
              </button>
            </div>
          )}

          {/* Step 2: OTP Entry */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300 text-center mb-1">Enter Verification Code</label>
                <div className="flex gap-2 justify-center">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 bg-slate-700/30 border border-slate-700 rounded-xl text-center text-lg font-black text-indigo-400 outline-none focus:border-indigo-500 transition-colors"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-xl py-3.5 mt-2 flex items-center justify-center font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center text-xs mt-1">
                {!canResend ? (
                  <span className="text-slate-500 font-semibold">
                    Resend code in <span className="text-indigo-400">{timer}s</span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-indigo-400 font-bold border-none bg-transparent hover:underline cursor-pointer"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Password Reset */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-700/30 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 border-none bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700/30 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-semibold outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-xl py-3.5 mt-2 flex items-center justify-center font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}

          {/* Step 4: Success confirmation */}
          {step === 4 && (
            <div className="text-center py-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Password Updated</h2>
              <p className="text-xs text-slate-400 mb-6 font-medium max-w-xs leading-relaxed">
                Your credentials have been successfully updated. You can now use your new password to sign in.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-indigo-600 text-white rounded-xl py-3.5 flex items-center justify-center font-black text-sm uppercase tracking-wider cursor-pointer border-none"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
