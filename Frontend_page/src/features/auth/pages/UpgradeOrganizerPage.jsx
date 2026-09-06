import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/app/store/authSlice";
import { setUser } from "@/app/store/userSlice";
import { getUserAvailableRoles } from "@/shared/services/authHelper";
import { authApi } from "@/features/auth/api/auth.api";
import BrandLogo from "@/components/ui/BrandLogo";
import { Select, SelectItem } from "@/components/ui/Select";
import {
  validateGSTIN,
  validatePAN,
  validateIFSC,
  validateBankAccountNumber,
  validateMobile,
  validatePincode,
} from "@/shared/utils/kycValidation";
import {
  Sparkles,
  Building2,
  Landmark,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  MapPin
} from "lucide-react";
import { lookupPincode } from "@/shared/services/pincodeService";

export default function UpgradeOrganizerPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state) => state.auth);
  const reduxUser = useSelector((state) => state.user);
  const user = reduxAuth?.user || reduxUser;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Legal / Business
    company_name: "",
    business_type: "Private Limited",
    gstin: "",
    pan_number: "",
    business_address: "",
    city: "",
    state: "",
    pincode: "",
    website_url: "",
    mobile: "",

    // Step 2: Payout Bank Account
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
    upi_id: "",
  });

  // On mount: check if user is already an organizer or has saved partial KYC step
  useEffect(() => {
    const orgProfile = user?.profiles?.organizer || user?.organizer_profile;
    const sharedKyc = user?.shared_kyc || {};

    if (orgProfile?.kyc_status === "VERIFIED") {
      sessionStorage.setItem("role", "organizer");
      localStorage.setItem("role", "organizer");
      dispatch(setCredentials({ ...reduxAuth, role: "organizer" }));
      navigate("/OrganizerHome", { replace: true });
      return;
    }

    // Pre-fill existing fields from organizer profile or shared cross-fill KYC data (e.g. from exhibitor profile)
    const initialData = {
      company_name: orgProfile?.company_name || sharedKyc?.company_name || user?.organization_name || "",
      business_type: orgProfile?.business_type || "Private Limited",
      gstin: orgProfile?.gstin || sharedKyc?.gstin || "",
      pan_number: orgProfile?.pan_number || sharedKyc?.pan_number || "",
      business_address: orgProfile?.business_address || sharedKyc?.business_address || user?.address || "",
      city: orgProfile?.city || sharedKyc?.city || user?.city || "",
      state: orgProfile?.state || sharedKyc?.state || user?.state || "",
      pincode: orgProfile?.pincode || sharedKyc?.pincode || "",
      website_url: orgProfile?.website_url || sharedKyc?.website_url || "",
      mobile: orgProfile?.mobile || sharedKyc?.mobile || user?.mobile || "",
      bank_name: orgProfile?.bank_name || sharedKyc?.bank_name || "",
      account_number: orgProfile?.account_number || sharedKyc?.account_number || "",
      ifsc_code: orgProfile?.ifsc_code || sharedKyc?.ifsc_code || "",
      account_holder: orgProfile?.account_holder || sharedKyc?.account_holder || user?.name || "",
      upi_id: orgProfile?.upi_id || sharedKyc?.upi_id || "",
    };

    setFormData(initialData);

    // Step resumption: if step 1 was saved previously, resume directly at step 2
    if (orgProfile?.kyc_step >= 1) {
      setStep(2);
    }
  }, [user, navigate]);

  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  const handlePincodeLookup = async (pin) => {
    const clean = String(pin || "").replace(/\D/g, "").slice(0, 6);
    if (clean.length === 6) {
      setIsPincodeLoading(true);
      setPincodeSuccess(false);
      try {
        const res = await lookupPincode(clean);
        if (res.success) {
          setFormData((prev) => ({
            ...prev,
            pincode: clean,
            city: res.city || prev.city,
            state: res.state || prev.state,
          }));
          setFieldErrors((prev) => ({ ...prev, pincode: "", city: "", state: "" }));
          setPincodeSuccess(true);
          setTimeout(() => setPincodeSuccess(false), 3500);
        }
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (["gstin", "pan_number", "ifsc_code"].includes(name)) {
      value = value.toUpperCase();
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "gstin" && value.length >= 12) {
        const derivedPan = value.slice(2, 12);
        if (!prev.pan_number || prev.pan_number === prev.gstin?.slice(2, 12)) {
          next.pan_number = derivedPan;
        }
      }
      return next;
    });
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "pincode") {
      const clean = value.replace(/\D/g, "").slice(0, 6);
      if (clean.length === 6) {
        handlePincodeLookup(clean);
      }
    }
  };

  // Step 1 Submission: Partial Save
  const handleSaveStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errs = {};
    if (!formData.company_name?.trim()) {
      errs.company_name = "Company Name is required.";
    }
    if (!formData.business_type) {
      errs.business_type = "Business Entity Type is required.";
    }
    const mobCheck = validateMobile(formData.mobile);
    if (!mobCheck.isValid) {
      errs.mobile = mobCheck.error;
    }
    const panCheck = validatePAN(formData.pan_number, formData.gstin);
    if (!panCheck.isValid) {
      errs.pan_number = panCheck.error;
    }
    const gstinCheck = validateGSTIN(formData.gstin);
    if (!gstinCheck.isValid) {
      errs.gstin = gstinCheck.error;
    }
    if (!formData.business_address?.trim()) {
      errs.business_address = "Business Address is required.";
    }
    const pinCheck = validatePincode(formData.pincode);
    if (!pinCheck.isValid) {
      errs.pincode = pinCheck.error;
    }
    if (!formData.city?.trim()) {
      errs.city = "City is required.";
    }
    if (!formData.state?.trim()) {
      errs.state = "State is required.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fix the highlighted field errors below.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.upgradeOrganizerStep1({
        company_name: formData.company_name,
        business_type: formData.business_type,
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
    setFieldErrors({});

    const errs = {};
    if (!formData.account_holder?.trim()) {
      errs.account_holder = "Account Holder Name is required.";
    }
    if (!formData.bank_name?.trim()) {
      errs.bank_name = "Bank Name is required.";
    }
    const accCheck = validateBankAccountNumber(formData.account_number);
    if (!accCheck.isValid) {
      errs.account_number = accCheck.error;
    }
    const ifscCheck = validateIFSC(formData.ifsc_code);
    if (!ifscCheck.isValid) {
      errs.ifsc_code = ifscCheck.error;
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fix the highlighted bank details below.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.upgradeOrganizerComplete(formData);
      const resData = res?.data || res;
      const newToken = resData?.access_token || resData?.token;
      const rawUser = resData?.user || resData;

      const fullRoles = getUserAvailableRoles({ ...rawUser, role: "organizer" });
      const userToStore = {
        ...rawUser,
        roles: fullRoles,
        active_role: "organizer",
        role: "organizer",
        profiles: {
          ...(rawUser?.profiles || {}),
          organizer: resData?.organizer_profile || rawUser?.profiles?.organizer || true,
        },
      };

      localStorage.setItem("user", JSON.stringify(userToStore));
      sessionStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.setItem("role", "organizer");
      sessionStorage.setItem("role", "organizer");
      localStorage.setItem("active_role", "organizer");
      sessionStorage.setItem("active_role", "organizer");
      localStorage.setItem("roles", JSON.stringify(fullRoles));
      sessionStorage.setItem("roles", JSON.stringify(fullRoles));

      if (newToken) {
        dispatch(setCredentials({ user: userToStore, token: newToken, role: "organizer" }));
      } else {
        dispatch(setCredentials({ user: userToStore, role: "organizer" }));
      }
      dispatch(setUser(userToStore));

      setSuccessMsg("Organizer KYC verified! Redirecting to your Organizer Dashboard...");
      setTimeout(() => {
        navigate("/OrganizerHome", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Failed to complete KYC onboarding.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepsConfig = [
    { s: 1, title: "Business & Legal GST", icon: Building2 },
    { s: 2, title: "Payout Bank Account", icon: Landmark },
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
              Host Live Events — Organizer Onboarding
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-md mx-auto">
              Complete your business verification and payout bank details to start hosting shows.
            </p>
          </div>

          {/* STEPPER TRACKER */}
          <div className="relative max-w-md mx-auto pt-1 pb-1">
            <div className="relative flex justify-between items-start">
              <div className="absolute top-[20px] left-[25%] right-[25%] h-0.5 bg-slate-700/80 -z-0" />
              <div
                className="absolute top-[20px] left-[25%] h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 -z-0"
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
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 ring-4 ring-cyan-400/30 shadow-lg scale-105 font-black"
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
                        isActive ? "text-cyan-300 font-black" : isCompleted ? "text-emerald-400" : "text-slate-400"
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
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white font-black flex items-center justify-center text-xs">
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

          {/* STEP 1: Legal / Business Details */}
          {step === 1 && (
            <form onSubmit={handleSaveStep1} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Organization Name <span className="text-red-500 font-bold ml-1">*</span></label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Acme Events Pvt Ltd"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.company_name
                      ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                  }`}
                />
                {fieldErrors.company_name && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0 text-red-500" />
                    <span>{fieldErrors.company_name}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Select
                    label="Business Entity Type *"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    placeholder="Select entity type"
                    triggerClassName={`bg-slate-50 rounded-xl h-[38px] text-xs font-semibold ${
                      fieldErrors.business_type
                        ? "border-red-500 bg-red-50/20"
                        : "border-slate-200/90 focus:border-cyan-500 focus:bg-white"
                    }`}
                  >
                    <SelectItem value="Private Limited">Private Limited</SelectItem>
                    <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="Partnership / LLP">Partnership / LLP</SelectItem>
                    <SelectItem value="Individual / Freelancer">Individual / Freelancer</SelectItem>
                  </Select>
                  {fieldErrors.business_type && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.business_type}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Mobile Number <span className="text-red-500 font-bold ml-1">*</span></label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.mobile
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.mobile && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.mobile}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">PAN Card Number <span className="text-red-500 font-bold ml-1">*</span></label>
                    <span className="text-[10px] text-slate-400 font-mono">10 characters</span>
                  </div>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="e.g. ABCDE1234F"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold uppercase focus:outline-none transition ${
                      fieldErrors.pan_number
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.pan_number && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.pan_number}</span>
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">GSTIN Number <span className="text-red-500 font-bold ml-1">*</span></label>
                    <span className="text-[10px] text-slate-400 font-mono">15 characters</span>
                  </div>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="e.g. 27ABCDE1234F2Z5"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold uppercase focus:outline-none transition ${
                      fieldErrors.gstin
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.gstin && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.gstin}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Business Address <span className="text-red-500 font-bold ml-1">*</span></label>
                <input
                  type="text"
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  placeholder="Street, Building, Area"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.business_address
                      ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                  }`}
                />
                {fieldErrors.business_address && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0 text-red-500" />
                    <span>{fieldErrors.business_address}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Pincode (First for automatic city/state lookup) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Pincode <span className="text-red-500 font-bold ml-1">*</span></label>
                    {isPincodeLoading && (
                      <span className="text-[10px] text-cyan-600 font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Fetching...
                      </span>
                    )}
                    {pincodeSuccess && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Auto-filled
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="600001"
                      className={`w-full p-2.5 pr-8 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                        fieldErrors.pincode
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                      }`}
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isPincodeLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                  {fieldErrors.pincode && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.pincode}</span>
                    </p>
                  )}
                </div>

                {/* 2. City */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City <span className="text-red-500 font-bold ml-1">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.city
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.city && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.city}</span>
                    </p>
                  )}
                </div>

                {/* 3. State */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State <span className="text-red-500 font-bold ml-1">*</span></label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.state
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.state && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.state}</span>
                    </p>
                  )}
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
                  className="bg-[#00b4d8] hover:bg-[#0096c7] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50"
                >
                  <span>{isLoading ? "Saving Step 1..." : "Continue to Step 2"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payout Bank Account */}
          {step === 2 && (
            <form onSubmit={handleCompleteKYC} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Holder Name <span className="text-red-500 font-bold ml-1">*</span></label>
                <input
                  type="text"
                  name="account_holder"
                  value={formData.account_holder}
                  onChange={handleChange}
                  placeholder="Acme Events Pvt Ltd"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.account_holder
                      ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                  }`}
                />
                {fieldErrors.account_holder && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0 text-red-500" />
                    <span>{fieldErrors.account_holder}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name <span className="text-red-500 font-bold ml-1">*</span></label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder="HDFC Bank"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.bank_name
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.bank_name && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.bank_name}</span>
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Bank Account Number <span className="text-red-500 font-bold ml-1">*</span></label>
                    <span className="text-[10px] text-slate-400 font-mono">9-18 digits</span>
                  </div>
                  <input
                    type="text"
                    name="account_number"
                    maxLength={18}
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="50100234567890"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.account_number
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.account_number && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.account_number}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">IFSC Code <span className="text-red-500 font-bold ml-1">*</span></label>
                    <span className="text-[10px] text-slate-400 font-mono">11 characters</span>
                  </div>
                  <input
                    type="text"
                    name="ifsc_code"
                    maxLength={11}
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    placeholder="HDFC0001234"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold uppercase focus:outline-none transition ${
                      fieldErrors.ifsc_code
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200/90 focus:bg-white focus:border-cyan-500"
                    }`}
                  />
                  {fieldErrors.ifsc_code && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0 text-red-500" />
                      <span>{fieldErrors.ifsc_code}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UPI ID / Settlement Preference</label>
                  <input
                    type="text"
                    name="upi_id"
                    value={formData.upi_id}
                    onChange={handleChange}
                    placeholder="acme@hdfcbank"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
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
                  className="bg-[#00b4d8] hover:bg-[#0096c7] text-white font-black text-xs px-7 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-none"
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
