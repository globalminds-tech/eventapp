import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetsendOtp, resetverifyOtp, resetresendOtp, resetPassword } from "../Services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await resetsendOtp({ email });
      setMessage(res.message || "OTP sent successfully");
      setStep(2);
    } catch (err) {
      setError("Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await resetverifyOtp({ email, otp });
      if (res.status) {
        setMessage("OTP verified");
        setStep(3);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Invalid OTP");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await resetresendOtp({ email });
      setMessage("OTP resent");
    } catch (err) {
      setError("Resend failed");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await resetPassword({ email, password });
      setMessage("Password updated successfully 🎉");
      setTimeout(() => {
        setStep(1);
        setEmail("");
        setOtp("");
        setPassword("");
        navigate("/Login");
      }, 2000);
    } catch (err) {
      setError("Reset failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Forgot Password</h2>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:border-indigo-500"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
            />
            <button 
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg font-semibold text-base transition-colors flex items-center justify-center cursor-pointer border-none"
              onClick={handleSendOtp} 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:border-indigo-500"
              placeholder="Enter OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button 
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg font-semibold text-base transition-colors flex items-center justify-center cursor-pointer border-none"
              onClick={handleVerifyOtp} 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </button>
            <button 
              onClick={handleResendOtp} 
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline text-center cursor-pointer bg-transparent border-none"
            >
              Resend OTP
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full bg-gray-50 border border-green-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:outline-none focus:border-green-500"
              placeholder="Enter new password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              className="w-full py-3.5 bg-green-600 hover:bg-green-750 text-white rounded-lg font-semibold text-base transition-colors flex items-center justify-center cursor-pointer border-none"
              onClick={handleResetPassword} 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        )}

        {message && (
          <p className="text-green-600 text-center mt-4 text-sm font-medium">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-center mt-4 text-sm font-medium">{error}</p>
        )}

        {step === 1 && (
          <button 
            onClick={() => navigate("/Login")} 
            className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-medium underline text-center mt-6 cursor-pointer bg-transparent border-none"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}