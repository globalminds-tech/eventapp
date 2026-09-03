import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Store, ArrowLeft, ArrowRight, Building2, CreditCard, User, Check, X, Landmark, Eye, EyeOff } from "lucide-react";
import { registerOrganizer, registerExhibitor } from "@/Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/store/userSlice";
import { setCredentials } from "@/app/store/authSlice";
import BrandLogo from "@/components/ui/BrandLogo";
import { Select, SelectItem } from "@/components/ui/Select";

export default function PartnerRegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "exhibitor" ? "exhibitor" : "organizer";

  const [step, setStep] = useState(1);
  const [partnerRole, setPartnerRole] = useState(initialRole); // 'organizer' or 'exhibitor'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Step 1: Contact
    name: "",
    email: "",
    password: "",
    mobile: "",
    
    // Step 2: Legal/Business
    company_name: "",
    business_type: "Private Limited",
    vendor_category: "Food & Beverage",
    gstin: "",
    pan_number: "",
    business_address: "",
    city: "",
    state: "",
    pincode: "",
    website_url: "",

    // Step 3: Payout Bank
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder: "",
    upi_id: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill in all required account credentials.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.company_name) {
        setError("Company or Organization name is required.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let response;
      if (partnerRole === "organizer") {
        response = await registerOrganizer(formData);
      } else {
        response = await registerExhibitor(formData);
      }

      const data = response.data?.data || response.data;
      const userObj = data.user || data;
      const userRole = (userObj.role || partnerRole).toLowerCase();
      const userId = userObj.id || "";
      const userName = userObj.name || formData.name;
      const token = data.token || data.access_token || "";

      dispatch(setCredentials({ user: userObj, token, role: userRole }));
      dispatch(setUser({ id: userId, name: userName, role: userRole, email: formData.email }));

      if (userRole === "organizer") {
        navigate("/OrganizerHome", { replace: true });
      } else {
        navigate("/exhibitor/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Registration failed. An account with this email may already exist."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepsConfig = [
    { s: 1, title: "Representative Contact", icon: User },
    { s: 2, title: "Business & Legal GST", icon: Building2 },
    { s: 3, title: "Payout Bank Account", icon: Landmark },
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
              onClick={() => (step > 1 ? setStep(step - 1) : navigate("/login"))}
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

          {/* Clean Heading & Short Description */}
          <div className="mb-5 text-center">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Host Live Events & Book Vendor Stalls
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-md mx-auto">
              Create your partner account to manage events and booth bookings.
            </p>
          </div>

          {/* PERFECTLY ALIGNED STEPPER TRACKER (Starts at Circle 1 Center, Ends at Circle 3 Center) */}
          <div className="relative max-w-xl mx-auto pt-1 pb-1">
            <div className="relative flex justify-between items-start">
              {/* Dark Track Line: Exact width from Step 1 center (16.66%) to Step 3 center (83.33%) */}
              <div className="absolute top-[20px] left-[16.66%] right-[16.66%] h-0.5 bg-slate-700/80 -z-0" />

              {/* Active Blue Progress Line */}
              <div
                className="absolute top-[20px] left-[16.66%] h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 -z-0"
                style={{
                  width: step === 1 ? "0%" : step === 2 ? "33.33%" : "66.66%"
                }}
              />

              {stepsConfig.map((item) => {
                const Icon = item.icon;
                const isCompleted = step > item.s;
                const isActive = step === item.s;

                return (
                  <div
                    key={item.s}
                    className="flex flex-col items-center cursor-pointer group z-10 w-1/3"
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

        {/* BOTTOM WHITE FORM CONTENT */}
        <div className="p-5 sm:p-7 bg-white">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl mb-4 flex items-center justify-between">
              <span>{error}</span>
              {error.includes("already exist") && (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg hover:bg-red-700 transition"
                >
                  Sign In →
                </button>
              )}
            </div>
          )}

          {/* STEP 1: Representative Contact & Account Credentials */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Account Type Role Switcher */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Account Role</label>
                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/90">
                  <button
                    type="button"
                    onClick={() => setPartnerRole("organizer")}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
                      partnerRole === "organizer"
                        ? "bg-white text-cyan-600 shadow-sm border border-cyan-100"
                        : "text-slate-500 hover:text-slate-800 bg-transparent"
                    }`}
                  >
                    <Sparkles size={16} className={partnerRole === "organizer" ? "text-cyan-600" : "text-slate-400"} />
                    <span>Event Organizer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPartnerRole("exhibitor")}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
                      partnerRole === "exhibitor"
                        ? "bg-white text-emerald-600 shadow-sm border border-emerald-100"
                        : "text-slate-500 hover:text-slate-800 bg-transparent"
                    }`}
                  >
                    <Store size={16} className={partnerRole === "exhibitor" ? "text-emerald-600" : "text-slate-400"} />
                    <span>Exhibitor & Vendor</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business & Legal GST */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Acme Events Pvt Ltd"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {partnerRole === "organizer" ? (
                  <div>
                    <Select
                      label="Business Entity Type"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleChange}
                      placeholder="Select entity type"
                      triggerClassName="bg-slate-50 border-slate-200/90 focus:border-cyan-500 focus:bg-white rounded-xl h-[38px] text-xs font-semibold"
                    >
                      <SelectItem value="Private Limited">Private Limited</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="Partnership / LLP">Partnership / LLP</SelectItem>
                      <SelectItem value="Individual / Freelancer">Individual / Freelancer</SelectItem>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Select
                      label="Vendor Category"
                      name="vendor_category"
                      value={formData.vendor_category}
                      onChange={handleChange}
                      placeholder="Select vendor category"
                      triggerClassName="bg-slate-50 border-slate-200/90 focus:border-cyan-500 focus:bg-white rounded-xl h-[38px] text-xs font-semibold"
                    >
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Handicrafts & Apparel">Handicrafts & Apparel</SelectItem>
                      <SelectItem value="Tech & Electronics">Tech & Electronics</SelectItem>
                      <SelectItem value="Sponsor / Corporate">Sponsor / Corporate</SelectItem>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold uppercase focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold uppercase focus:bg-white focus:border-cyan-500 focus:outline-none transition"
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
                    placeholder="Mumbai"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payout Bank Account */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder"
                  value={formData.account_holder}
                  onChange={handleChange}
                  placeholder="Acme Events Pvt Ltd"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder="Canara Bank"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="78888878787878"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    placeholder="CANB200G"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold uppercase focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UPI ID / Settlement Preference</label>
                  <input
                    type="text"
                    name="upi_id"
                    value={formData.upi_id}
                    onChange={handleChange}
                    placeholder="business@upi"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ACTION FOOTER BUTTONS */}
          <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5 border-none"
                >
                  <ArrowLeft size={14} />
                  <span>Previous Step</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5 border-none"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#00b4d8] hover:bg-[#0096c7] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center gap-1.5 cursor-pointer border-none"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#00b4d8] hover:bg-[#0096c7] text-white font-black text-xs px-7 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-none"
              >
                <span>{isLoading ? "Publishing..." : "COMPLETE & PUBLISH ACCOUNT"}</span>
                <Check size={16} className="stroke-[3]" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
