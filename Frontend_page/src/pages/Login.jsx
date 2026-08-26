import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Compass, ShieldCheck, Zap } from "lucide-react";
import { loginUser } from "../Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../Redux/userSlice";
import BrandLogo from "../components/ui/BrandLogo";

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

  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
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
    setError("");
    setFieldErrors({ email: "", password: "" });

    let errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      const data = response.data?.data || response.data;

      const userRole = (data.user?.role || data.role || "user").toLowerCase();
      const userId = data.user?.id || data.User_id || "";
      const userName = data.user?.name || data.name || "User";
      const userEmail = data.user?.email || formData.email || "";
      const userMobile = data.user?.mobile || "";
      const userOrg = data.user?.organization_name || "";
      const token = data.token || "authenticated-user-token";

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", userRole);
      sessionStorage.setItem("id", userId.toString());
      sessionStorage.setItem("name", userName);
      sessionStorage.setItem("email", userEmail);
      if (userMobile) sessionStorage.setItem("mobile", userMobile);
      if (userOrg) sessionStorage.setItem("organization_name", userOrg);

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("name", userName);
      localStorage.setItem("email", userEmail);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      dispatch(
        setUser({
          id: userId,
          name: userName,
          role: userRole,
          email: userEmail,
          mobile: userMobile,
          organization_name: userOrg,
        })
      );

      // Automatic Role-Based Navigation Routing
      if (userRole === "organizer") {
        navigate("/OrganizerHome", { replace: true });
      } else if (userRole === "exhibitor") {
        navigate("/exhibitor/dashboard", { replace: true });
      } else if (userRole === "superuser" || userRole === "superadmin" || userRole === "admin") {
        navigate("/superuser/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Invalid email or password. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-3 sm:p-5 md:p-8 font-sans select-none">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[620px]">
        
        {/* LEFT COLUMN: Platform Experience Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-7 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 sm:w-60 h-48 sm:h-60 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-48 sm:w-60 h-48 sm:h-60 bg-blue-600/10 rounded-full blur-3xl" />

          <div className="relative z-10 cursor-pointer mb-4 lg:mb-0" onClick={() => navigate("/")}>
            <BrandLogo textColor="text-white text-lg sm:text-xl font-[900]" />
          </div>

          <div className="relative z-10 my-4 sm:my-6 lg:my-8 space-y-4 sm:space-y-6">
            <div>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Welcome Back
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-2 sm:mt-3">
                Discover, Host & Connect
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1 sm:mt-1.5 leading-relaxed">
                Your premier destination for live concerts, tech expos, business summits, and cultural festivals.
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

          <div className="relative z-10 pt-3 sm:pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
            <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
            <span className="truncate">Trusted by over 500,000 event enthusiasts nationwide</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Single Login Form */}
        <div className="lg:col-span-7 p-5 sm:p-8 md:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer mb-3"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Enter your account credentials to continue
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 sm:p-3.5 rounded-xl sm:rounded-2xl mb-4 leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">
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
                {fieldErrors.email && (
                  <span className="text-[11px] text-red-500 font-bold">{fieldErrors.email}</span>
                )}
              </div>

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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-semibold">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  className="text-cyan-600 hover:underline font-extrabold border-none bg-transparent cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white rounded-xl py-3 sm:py-3.5 mt-1 sm:mt-2 flex items-center justify-center gap-2 font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-cyan-500/25 hover:brightness-105 transition-all active:scale-[0.99] disabled:opacity-50"
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
          </div>

          <div className="pt-4 sm:pt-6 mt-6 sm:mt-8 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs">
              <span className="text-slate-500 font-semibold">New to BookMyEvent?</span>
              <button
                onClick={() => navigate("/register")}
                className="text-cyan-600 font-extrabold hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Create Account →
              </button>
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Sparkles size={16} className="text-cyan-500 shrink-0" />
                <span>Want to Host an Event or Reserve a Stall?</span>
              </div>
              <button
                onClick={() => setShowPartnerModal(true)}
                className="text-xs font-black text-cyan-600 hover:text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 w-full sm:w-auto text-center"
              >
                View Partner Options
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Onboarding Modal Dialog */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPartnerModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-none bg-transparent cursor-pointer transition"
            >
              ✕
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-cyan-500" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600">Partner Onboarding Hub</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">List Your Show or Book Vendor Stalls</h2>
              <p className="text-xs text-slate-500 mt-1">Select your partner account type to register or sign in to your workspace</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Option 1: Event Organizer */}
              <div className="p-5 rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-white via-cyan-50/20 to-sky-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2.5 py-0.5 rounded-full">ORGANIZER</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">List Your Show (As Event Organizer)</h4>
                  <p className="text-xs text-slate-500 leading-snug mt-1.5">
                    Host concerts, tech expos & workshops. Setup custom ticket tiers, gate scanners & instant bank payouts.
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => { setShowPartnerModal(false); navigate("/register/organizer"); }}
                    className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black text-xs py-2.5 rounded-xl border-none cursor-pointer shadow-sm shadow-cyan-500/20 hover:brightness-105 transition"
                  >
                    New Organizer? Register →
                  </button>
                  <button
                    onClick={() => { setShowPartnerModal(false); navigate("/login"); }}
                    className="w-full bg-white border border-cyan-300 text-cyan-700 hover:bg-cyan-50 font-extrabold text-xs py-2 rounded-xl transition cursor-pointer"
                  >
                    Already Registered? Sign In
                  </button>
                </div>
              </div>

              {/* Option 2: Exhibitor Vendor */}
              <div className="p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">EXHIBITOR</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Exhibit & Book Stalls (As Exhibitor)</h4>
                  <p className="text-xs text-slate-500 leading-snug mt-1.5">
                    Reserve booth stalls on interactive floor plans, showcase products, capture trade leads & get tax invoices.
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => { setShowPartnerModal(false); navigate("/register/exhibitor"); }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs py-2.5 rounded-xl border-none cursor-pointer shadow-sm shadow-emerald-500/20 hover:brightness-105 transition"
                  >
                    New Exhibitor? Register →
                  </button>
                  <button
                    onClick={() => { setShowPartnerModal(false); navigate("/login"); }}
                    className="w-full bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-extrabold text-xs py-2 rounded-xl transition cursor-pointer"
                  >
                    Already Registered? Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Sign In Banner */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Already have an Organizer or Exhibitor Account?</span>
              <button
                onClick={() => { setShowPartnerModal(false); navigate("/login"); }}
                className="text-xs font-extrabold text-cyan-600 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Sign In to Partner Account →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
