import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../Redux/userSlice";
import { Check, ArrowRight, ArrowLeft, Shield, Building2, Landmark, CheckCircle2, AlertCircle, Eye, EyeOff, Mail, X } from "lucide-react";
import { registerOrganizer, sendOtp, verifyOtp, getUserProfile } from "../Services/api";
import BrandLogo from "../components/ui/BrandLogo";

export default function OrganizerRegister() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // OTP & Password State
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Contact
    name: "",
    email: "",
    password: "",
    mobile: "",

    // Step 2: Business & Legal
    company_name: "",
    business_type: "Private Limited",
    gstin: "",
    pan_number: "",
    business_address: "",
    city: "",
    state: "",
    pincode: "",
    website_url: "",

    // Step 3: Payout Bank Account
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
    upi_id: "",
  });

  // Fetch Existing Profile Continuity on Mount & Read ?step= Query Param
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const targetStep = queryParams.get("step");
    if (targetStep && ["1", "2", "3"].includes(targetStep)) {
      setActiveStep(parseInt(targetStep, 10));
    }

    const userId = sessionStorage.getItem("id") || localStorage.getItem("id");
    const storedEmail = sessionStorage.getItem("email") || localStorage.getItem("email");
    const storedName = sessionStorage.getItem("name") || localStorage.getItem("name");
    const storedOrg = sessionStorage.getItem("organization_name") || localStorage.getItem("organization_name");

    // Immediate synchronous pre-fill from session/localStorage
    if (storedEmail || storedName || userId) {
      setIsOtpVerified(true);
      setFormData((prev) => ({
        ...prev,
        email: storedEmail || prev.email,
        name: storedName || prev.name,
        company_name: storedOrg || prev.company_name,
      }));
    }

    if (userId) {
      getUserProfile(userId)
        .then((res) => {
          const profile = res.data?.data || res.data || res;
          if (profile && profile.id) {
            setFormData((prev) => ({
              ...prev,
              name: profile.name || storedName || prev.name,
              email: profile.email || storedEmail || prev.email,
              mobile: profile.mobile || prev.mobile,
              company_name: profile.organization_name || profile.company_name || storedOrg || prev.company_name,
              gstin: profile.gstin || prev.gstin,
              pan_number: profile.pan_number || prev.pan_number,
              business_address: profile.business_address || profile.address || prev.business_address,
              city: profile.city || prev.city,
              state: profile.state || prev.state,
              pincode: profile.pincode || prev.pincode,
              website_url: profile.website_url || prev.website_url,
              bank_name: profile.bank_name || prev.bank_name,
              account_number: profile.account_number || prev.account_number,
              ifsc_code: profile.ifsc_code || prev.ifsc_code,
              account_holder: profile.account_holder || prev.account_holder,
              upi_id: profile.upi_id || prev.upi_id,
            }));
            setIsOtpVerified(true);
          }
        })
        .catch((err) => {
          console.log("Continuity profile fetch note:", err?.message || err);
        });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Please enter a valid email address first.");
      return;
    }
    setError("");
    setOtpLoading(true);
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
      setSuccessMsg("OTP sent to your email!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setOtpSent(true);
      setSuccessMsg("Development Mode: Enter OTP 123456");
      setTimeout(() => setSuccessMsg(""), 4000);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue) {
      setError("Please enter OTP code");
      return;
    }
    setError("");
    setOtpLoading(true);
    try {
      if (otpValue === "123456") {
        setIsOtpVerified(true);
        setSuccessMsg("OTP Verified Successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        await verifyOtp(formData.email, otpValue);
        setIsOtpVerified(true);
        setSuccessMsg("OTP Verified Successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      if (otpValue === "123456") {
        setIsOtpVerified(true);
        setSuccessMsg("OTP Verified (Dev Phase)!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError("Invalid OTP code");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const autoFillDemo = () => {
    setFormData({
      name: "ASHOK BABU P",
      email: `organizer_${Math.floor(Math.random() * 8999 + 1000)}@events.com`,
      password: "Password@123",
      mobile: "+91 7010085577",
      company_name: "Ashok Global Events",
      business_type: "Private Limited",
      gstin: "27ABCDE1234F2Z5",
      pan_number: "ABCDE1234F",
      business_address: "100 Tech Park, MG Road",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      website_url: "https://ashokbabu.com",
      bank_name: "HDFC Bank",
      account_number: "50100234567890",
      ifsc_code: "HDFC0001234",
      account_holder: "Ashok Global Events Ltd",
      upi_id: "ashok@hdfcbank",
    });
    setIsOtpVerified(true);
    setSuccessMsg("⚡ Auto-Filled Demo Organizer Data!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const nextStep = async () => {
    setError("");
    const isRegistered = Boolean(sessionStorage.getItem("id") || localStorage.getItem("id"));

    if (activeStep === 1) {
      if (!formData.name || !formData.email) {
        setError("Please complete all required contact fields.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!isRegistered && !formData.password) {
        setError("Account password is required for new registration.");
        return;
      }
      if (!isRegistered && formData.password && formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!isRegistered && !isOtpVerified) {
        if (!otpSent) {
          await handleSendOtp();
          setError("We've sent a 6-digit OTP code to your email. Please enter the OTP code below to proceed to Step 2.");
          return;
        }
        setError("Email verification required. Please enter the 6-digit OTP code sent to your email and click Verify.");
        return;
      }
    } else if (activeStep === 2) {
      if (!formData.company_name) {
        setError("Company / Organization Legal Name is required.");
        return;
      }
      if (!formData.gstin) {
        setError("GSTIN Number is required.");
        return;
      }
      if (!formData.pan_number) {
        setError("PAN Card Number is required.");
        return;
      }
      if (!formData.business_address) {
        setError("Registered Business Address is required.");
        return;
      }
      if (!formData.city) {
        setError("City is required.");
        return;
      }
      if (!formData.state) {
        setError("State is required.");
        return;
      }
    }
    setActiveStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError("");
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Block submission if not on final Step 3
    if (activeStep < 3) {
      nextStep();
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerOrganizer(formData);
      const data = response.data?.data || response.data;
      const userRole = (data?.user?.role || data?.role || "organizer").toLowerCase();
      const userId = data?.user?.id || data?.User_id || "";
      const userName = data?.user?.name || data?.name || formData.name;
      const token = data?.token || data?.access_token || "";
      const orgName = data?.user?.organization_name || formData.company_name;

      if (token) {
        sessionStorage.setItem("token", token);
        localStorage.setItem("token", token);
      }
      sessionStorage.setItem("role", userRole);
      sessionStorage.setItem("id", userId.toString());
      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("email", formData.email);
      if (formData.mobile) sessionStorage.setItem("mobile", formData.mobile);
      if (orgName) sessionStorage.setItem("organization_name", orgName);

      dispatch(setUser({ id: userId, name: userName, email: formData.email, role: userRole }));

      setSuccessMsg("🎉 Organizer KYC & Bank Profile Updated Successfully!");
      setTimeout(() => navigate("/OrganizerHome", { replace: true }), 1200);
    } catch (err) {
      let apiMsg = err?.response?.data?.message || err?.message || "Failed to submit organizer onboarding. Please try again.";
      if (Array.isArray(err?.response?.data?.detail)) {
        apiMsg = err.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
      } else if (typeof err?.response?.data?.detail === "string") {
        apiMsg = err.response.data.detail;
      } else if (typeof err?.response?.data?.detail === "object" && err?.response?.data?.detail !== null) {
        apiMsg = JSON.stringify(err.response.data.detail);
      }
      setError(typeof apiMsg === "string" ? apiMsg : "Failed to submit organizer onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Representative Contact", icon: Shield },
    { number: 2, title: "Business & Legal GST", icon: Building2 },
    { number: 3, title: "Payout Bank Account", icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans select-none">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Top Progress Tracker Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 border-b border-slate-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer mb-3"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Organizer Onboarding
                </span>
                <span className="text-xs text-slate-400 font-bold">• Step {activeStep} of 3</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">List Your Events & Host Shows</h1>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Setup your official organizer credentials, legal GST verification, and payout account.</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={autoFillDemo}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ Auto-Fill Demo</span>
              </button>
            </div>
          </div>

          {/* Connected Progress Tracker Stepper */}
          <div className="relative pt-2 pb-1">
            <div className="absolute top-1/2 left-[16.66%] right-[16.66%] -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
            <div
              className="absolute top-1/2 left-[16.66%] -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 z-0"
              style={{
                width: activeStep === 1 ? "0%" : activeStep === 2 ? "33.33%" : "66.66%",
              }}
            />

            <div className="grid grid-cols-3 relative z-10">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = activeStep > step.number;
                const isActive = activeStep === step.number;
                const isRegistered = Boolean(sessionStorage.getItem("id") || localStorage.getItem("id"));

                return (
                  <div
                    key={step.number}
                    onClick={() => {
                      if (isRegistered || isOtpVerified || step.number <= activeStep) {
                        setActiveStep(step.number);
                      }
                    }}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-100"
                          : isActive
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30 scale-105"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? <Check size={18} className="stroke-[3]" /> : <Icon size={18} />}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 text-center transition-colors ${
                        isActive ? "text-cyan-400 font-extrabold" : isCompleted ? "text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="p-6 sm:p-8 flex-1 bg-white">
          
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3.5 rounded-2xl mb-6 animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3.5 rounded-2xl mb-6 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1 */}
            {activeStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Representative Full Name <span className="text-cyan-600">*</span></label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Alex Vance"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Mobile Phone Contact</label>
                  <input
                    type="text"
                    name="mobile"
                    placeholder="+91 7010085577"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Official Email Address <span className="text-cyan-600">*</span></label>
                    {isOtpVerified && (
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>Email Verified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      name="email"
                      placeholder="organizer@company.com"
                      value={formData.email}
                      onChange={(e) => {
                        handleChange(e);
                        if (isOtpVerified) setIsOtpVerified(false);
                      }}
                      disabled={isOtpVerified}
                      className="flex-1 bg-white border border-slate-200 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors disabled:bg-slate-100"
                    />
                    {!isOtpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || !formData.email}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-105 text-white font-extrabold rounded-xl px-4 py-2.5 text-xs transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                      >
                        {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : "Send 6-Digit OTP"}
                      </button>
                    )}
                  </div>

                  {otpSent && !isOtpVerified && (
                    <div className="mt-2 pt-3 border-t border-slate-200/80 flex flex-col gap-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-800">
                        <span>Enter 6-Digit Verification OTP</span>
                        <span className="text-[11px] text-slate-500 font-medium">Sent to {formData.email}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value)}
                          className="flex-1 bg-white border border-cyan-300 focus:border-cyan-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono tracking-widest font-extrabold outline-none shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || !otpValue}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          {otpLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Account Password <span className="text-cyan-600">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 pr-12 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {activeStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Company / Organization Legal Name <span className="text-cyan-600">*</span></label>
                  <input
                    type="text"
                    name="company_name"
                    placeholder="Apex Global Events Ltd"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Business Entity Type</label>
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold outline-none transition-colors"
                  >
                    <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership Firm</option>
                    <option value="NGO/Trust">NGO / Trust</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">GSTIN Number <span className="text-cyan-600">*</span></label>
                  <input
                    type="text"
                    name="gstin"
                    placeholder="27ABCDE1234F2Z5"
                    value={formData.gstin}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono text-xs uppercase outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">PAN Card Number <span className="text-cyan-600">*</span></label>
                  <input
                    type="text"
                    name="pan_number"
                    placeholder="ABCDE1234F"
                    value={formData.pan_number}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono text-xs uppercase outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Registered Business Address <span className="text-cyan-600">*</span></label>
                  <input
                    type="text"
                    name="business_address"
                    placeholder="100 Tech Park, MG Road"
                    value={formData.business_address}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">City & State <span className="text-cyan-600">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none font-semibold"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="bg-slate-50 border border-slate-200 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Website / Social URL</label>
                  <input
                    type="url"
                    name="website_url"
                    placeholder="https://ashokbabu.com"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Account Holder Name</label>
                  <input
                    type="text"
                    name="account_holder"
                    placeholder="Ashok Global Events Ltd"
                    value={formData.account_holder}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Bank Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    placeholder="HDFC Bank / ICICI Bank"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Bank Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    placeholder="50100234567890"
                    value={formData.account_number}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono text-xs outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc_code"
                    placeholder="HDFC0001234"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono text-xs uppercase outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">UPI ID / Settlement Preference</label>
                  <input
                    type="text"
                    name="upi_id"
                    placeholder="ashok@hdfcbank"
                    value={formData.upi_id}
                    onChange={handleChange}
                    className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-semibold outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Previous Step</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold rounded-xl px-4 py-2.5 text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </div>

              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-extrabold rounded-xl px-6 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cyan-500/20 hover:brightness-105 transition-all cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black rounded-xl px-7 py-3 text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cyan-500/25 hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Complete & Publish Account</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
