import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/authSlice";
import { setUser } from "@/app/store/userSlice";
import { authApi } from "@/features/auth/api/auth.api";
import BrandLogo from "@/components/ui/BrandLogo";
import {
  Store,
  Building2,
  Landmark,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function UpgradeExhibitorPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);
  const reduxUser = useSelector((state) => state.user);
  const user = reduxAuth?.user || reduxUser;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Legal / Business
    company_name: "",
    vendor_category: "Food & Beverage",
    gstin: "",
    pan_number: "",
    business_address: "",
    city: "",
    state: "",
    pincode: "",
    website_url: "",
    mobile: "",

    // Step 2: Payout & Refund Bank Account
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
    upi_id: "",
  });

  // On mount: check if user is already an exhibitor or has saved partial KYC step
  useEffect(() => {
    const exhProfile = user?.profiles?.exhibitor || user?.exhibitor_profile;
    const sharedKyc = user?.shared_kyc || {};

    if (exhProfile?.kyc_status === "VERIFIED") {
      sessionStorage.setItem("role", "exhibitor");
      localStorage.setItem("role", "exhibitor");
      dispatch(setCredentials({ ...reduxAuth, role: "exhibitor" }));
      navigate("/exhibitor/dashboard", { replace: true });
      return;
    }

    // Pre-fill existing fields from exhibitor profile or shared cross-fill KYC data (e.g. from organizer profile)
    const initialData = {
      company_name: exhProfile?.company_name || sharedKyc?.company_name || user?.organization_name || "",
      vendor_category: exhProfile?.vendor_category || "Food & Beverage",
      gstin: exhProfile?.gstin || sharedKyc?.gstin || "",
      pan_number: exhProfile?.pan_number || sharedKyc?.pan_number || "",
      business_address: exhProfile?.business_address || sharedKyc?.business_address || user?.address || "",
      city: exhProfile?.city || sharedKyc?.city || user?.city || "",
      state: exhProfile?.state || sharedKyc?.state || user?.state || "",
      pincode: exhProfile?.pincode || sharedKyc?.pincode || "",
      website_url: exhProfile?.website_url || sharedKyc?.website_url || "",
      mobile: user?.mobile || "",
      bank_name: exhProfile?.bank_name || sharedKyc?.bank_name || "",
      account_number: exhProfile?.account_number || sharedKyc?.account_number || "",
      ifsc_code: exhProfile?.ifsc_code || sharedKyc?.ifsc_code || "",
      account_holder: exhProfile?.account_holder || sharedKyc?.account_holder || user?.name || "",
      upi_id: exhProfile?.upi_id || sharedKyc?.upi_id || "",
    };

    setFormData(initialData);

    // Step resumption: if step 1 was saved previously, resume directly at step 2
    if (exhProfile?.kyc_step >= 1) {
      setStep(2);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1 Submission: Partial Save
  const handleSaveStep1 = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.company_name) {
      setError("Company or Vendor Brand name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.upgradeExhibitorStep1({
        company_name: formData.company_name,
        vendor_category: formData.vendor_category,
        gstin: formData.gstin,
        pan_number: formData.pan_number,
        business_address: formData.business_address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        website_url: formData.website_url,
        mobile: formData.mobile,
      });

      if (res?.data?.user) {
        dispatch(setUser(res.data.user));
      }

      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to save Step 1 details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Submission: Final Complete
  const handleCompleteKYC = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.bank_name || !formData.account_number || !formData.ifsc_code) {
      setError("Bank Name, Account Number, and IFSC Code are required for stall payout and refund setup.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.upgradeExhibitorComplete(formData);
      const resData = res?.data || res;
      const newToken = resData?.access_token || resData?.token;
      const updatedUser = resData?.user || resData;

      if (newToken) {
        dispatch(setCredentials({ user: updatedUser, token: newToken, role: "exhibitor" }));
      }
      if (updatedUser) {
        dispatch(setUser(updatedUser));
      }

      setSuccessMsg("Exhibitor KYC verified! Redirecting to your Exhibitor Portal...");
      setTimeout(() => {
        navigate("/exhibitor/dashboard", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to complete KYC onboarding.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepsConfig = [
    { s: 1, title: "Vendor & Business Details", icon: Building2 },
    { s: 2, title: "Payout & Refund Bank", icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex items-center justify-center p-3 sm:p-5 font-sans select-none overflow-x-hidden">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 my-auto">
        
        {/* RICH BLUE GRADIENT HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 text-white p-5 sm:p-7 relative border-b border-cyan-500/20 shadow-md">
          {/* Top Bar: Back Button & Centered Logo */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(step - 1) : navigate("/profile"))}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <BrandLogo textColor="text-white text-xl font-[900]" />
            </div>

            <div className="w-12" /> {/* Spacer for symmetry */}
          </div>

          {/* Clean Heading & Description */}
          <div className="mb-5 text-center">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Book Vendor Stalls — Exhibitor Onboarding
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-md mx-auto">
              Complete your vendor brand registration and refund bank details to book stalls.
            </p>
          </div>

          {/* STEPPER TRACKER */}
          <div className="relative max-w-md mx-auto pt-1 pb-1">
            <div className="relative flex justify-between items-start">
              <div className="absolute top-[20px] left-[25%] right-[25%] h-0.5 bg-slate-700/80 -z-0" />
              <div
                className="absolute top-[20px] left-[25%] h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300 -z-0"
                style={{ width: step === 1 ? "0%" : "50%" }}
              />

              {stepsConfig.map((item) => {
                const Icon = item.icon;
                const isCompleted = step > item.s;
                const isActive = step === item.s;

                return (
                  <div
                    key={item.s}
                    className="flex flex-col items-center cursor-pointer group z-10 w-1/2"
                    onClick={() => {
                      if (item.s < step) setStep(item.s);
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/40"
                          : isActive
                          ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 ring-4 ring-emerald-400/30 shadow-lg scale-105 font-black"
                          : "bg-slate-800/90 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <Icon className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 text-center transition-colors px-1 ${
                        isActive ? "text-emerald-300 font-black" : isCompleted ? "text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM FORM CONTENT */}
        <div className="p-5 sm:p-7 bg-white space-y-4">
          
          {/* Identity Pre-filled Banner */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-xs">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-bold text-slate-900">{user?.name || "Logged In User"}</p>
                <p className="text-[11px] text-slate-500">{user?.email || ""}</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ Verified User Session
            </span>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Vendor & Business Details */}
          {step === 1 && (
            <form onSubmit={handleSaveStep1} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Gourmet Delights & Co"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vendor Category</label>
                  <select
                    name="vendor_category"
                    value={formData.vendor_category}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  >
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Handicrafts & Apparel">Handicrafts & Apparel</option>
                    <option value="Tech & Electronics">Tech & Electronics</option>
                    <option value="Sponsor / Corporate">Sponsor / Corporate</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold uppercase focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold uppercase focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business Address</label>
                <input
                  type="text"
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  placeholder="Street, Building, Area"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="600001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50"
                >
                  <span>{isLoading ? "Saving Step 1..." : "Continue to Step 2"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payout & Refund Bank Account */}
          {step === 2 && (
            <form onSubmit={handleCompleteKYC} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  name="account_holder"
                  value={formData.account_holder}
                  onChange={handleChange}
                  placeholder="Gourmet Delights & Co"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name *</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder="ICICI Bank"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="000401234567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    placeholder="ICIC0000004"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold uppercase focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UPI ID / Settlement Preference</label>
                  <input
                    type="text"
                    name="upi_id"
                    value={formData.upi_id}
                    onChange={handleChange}
                    placeholder="gourmet@icici"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5 border-none"
                >
                  <ArrowLeft size={14} />
                  <span>Previous Step</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-7 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-none"
                >
                  <span>{isLoading ? "Verifying..." : "COMPLETE VERIFICATION"}</span>
                  <Check size={16} className="stroke-[3]" />
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
