import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, CheckCircle, XCircle, Info, AlertTriangle,
  Send, Loader2, Edit, Calendar, Utensils, Ticket, ChevronRight, ArrowLeft
} from "lucide-react";
import {
  getEventById, sendOtp, verifyOtp, resendOtp, bookEvent,
} from "@/Services/api";

const C = {
  dark:   "#0f172a",
  dark2:  "#1e293b",
  dark3:  "#0f172a",
  border: "#334155",
  gold:   "#fb923c", // Orange branding matching mobile
  goldL:  "#fdba74",
  white:  "#fafafa",
  gray:   "#94a3b8",
  grayL:  "#cbd5e1",
  green:  "#10b981",
  greenBg:"rgba(16,185,129,0.1)",
  red:    "#ef4444",
  amber:  "#f59e0b",
  blue:   "#3b82f6",
};

const inputStyle = {
  width: "100%",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "12px 14px",
  color: "#f8fafc",
  fontFamily: "sans-serif",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontWeight: "600",
};

const Toast = ({ show, message, type, onClose }) => {
  if (!show) return null;
  const tc = {
    success: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", color: C.green },
    error: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", color: C.red },
    warning: { bg: "rgba(245,98,11,0.15)", border: "rgba(245,98,11,0.3)", color: C.amber },
    info: { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", color: C.blue },
  }[type] || { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", color: C.blue };

  const Icon = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }[type] || Info;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md animate-fade-in font-bold text-xs"
      style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
      <Icon size={14} />
      <span>{message}</span>
      <button onClick={onClose} className="bg-transparent border-none p-0 cursor-pointer flex items-center ml-2" style={{ color: tc.color }}>
        <XCircle size={14} />
      </button>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</label>
    {children}
  </div>
);

export function Userbooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent]       = useState(null);
  const [form, setForm]         = useState({ name:"", email:"", phone:"", food_preference:"Veg" });
  const [otp, setOtp]           = useState("");
  const [otpSent, setOtpSent]   = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(1);
  const [agreed, setAgreed]     = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast]       = useState({ show:false, message:"", type:"info" });
  const [redirectTimer, setRedirectTimer] = useState(10);

  const showToast = (message, type="info") => {
    setToast({ show:true, message, type });
    setTimeout(() => setToast({ show:false, message:"", type:"info" }), 3500);
  };

  useEffect(() => {
    getEventById(id).then(setEvent).catch(console.error);
  }, [id]);

  useEffect(() => {
    let interval;
    if (step === 3 && successData && redirectTimer > 0) {
      interval = setInterval(() => {
        setRedirectTimer((prev) => prev - 1);
      }, 1000);
    } else if (redirectTimer === 0) {
      navigate("/");
    }
    return () => clearInterval(interval);
  }, [step, successData, redirectTimer, navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!form.email)               return showToast("Enter your email first", "warning");
    if (!validateEmail(form.email)) return showToast("Enter a valid email address", "error");
    try {
      setLoading(true);
      await sendOtp(form.email);
      setOtpSent(true);
      showToast("OTP sent to your email", "success");
    } catch { showToast("Failed to send OTP", "error"); }
    finally  { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showToast("Enter the OTP", "warning");
    try {
      setLoading(true);
      await verifyOtp(form.email, otp);
      setVerified(true);
      showToast("Email verified!", "success");
    } catch { showToast("Invalid OTP. Try again.", "error"); }
    finally  { setLoading(false); }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(form.email);
      setOtp("");
      showToast("OTP resent", "success");
    } catch { showToast("Failed to resend OTP", "error"); }
  };

  const handleBook = async () => {
    if (!verified) return showToast("Verify your email first", "warning");
    try {
      setLoading(true);
      const res = await bookEvent({ event_id:id, ...form, food_preference: event?.food==1 ? form.food_preference : "None" });
      setSuccessData(res);
      setStep(3);
      showToast("Booking confirmed!", "success");
    } catch { showToast("Booking failed. Try again.", "error"); }
    finally  { setLoading(false); }
  };

  return (
    <div className="min-h-full bg-[#0f172a] text-[#f8fafc] flex flex-col font-sans select-none pb-24">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, show:false }))} />

      {/* Top Header Row */}
      <div className="h-14 px-4 border-b border-[#1e293b] flex items-center gap-3 bg-[#0f172a] sticky top-0 z-30">
        <button
          onClick={() => {
            if (step > 1 && step < 3) setStep(step - 1);
            else navigate("/");
          }}
          className="p-1 hover:bg-slate-800 rounded-full cursor-pointer text-slate-400 hover:text-white border-none bg-transparent"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-base font-bold tracking-tight">Book Event Pass</span>
      </div>

      {/* Steps Pill Indicator */}
      {step < 3 && (
        <div className="px-6 pt-5 pb-1 flex gap-2 justify-center">
          {[1, 2].map((num) => (
            <div key={num} className="flex-1 flex flex-col gap-1 items-center">
              <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${step >= num ? "bg-[#fb923c]" : "bg-[#334155]"}`} />
              <span className={`text-[10px] font-bold tracking-tight uppercase ${step === num ? "text-white" : "text-slate-500"}`}>
                {num === 1 ? "Details" : "Review"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: SUCCESS PASS VIEW */}
      {step === 3 && successData && (
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center px-6 py-4">
          <div className="w-16 h-16 bg-[#10b981]/15 border border-[#10b981]/30 rounded-full flex items-center justify-center mb-3">
            <CheckCircle size={28} className="text-[#10b981]" />
          </div>
          <h2 className="text-xl font-black text-white text-center mb-1">Booking Confirmed</h2>
          <p className="text-xs text-slate-400 text-center mb-6 font-semibold">Your entry ticket has been generated</p>

          {/* Ticket Card - Exact Mobile Spec */}
          <div className="w-full bg-[#1e293b] border border-[#334155] rounded-3xl overflow-hidden shadow-2xl mb-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 border-b border-[#334155]">
              <div className="flex justify-between items-center mb-3">
                <Ticket size={16} className="text-[#fb923c]" />
                <span className="text-[9px] font-black text-[#fb923c] tracking-widest uppercase">Entry Pass</span>
              </div>
              <h3 className="text-base font-black text-white leading-snug">{successData.event_details.name}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-slate-450 text-[11px] font-bold">
                <MapPin size={12} className="text-slate-500" />
                <span className="line-clamp-1">{successData.event_details.venue}</span>
              </div>
            </div>

            {/* Ticket QR + Guest Details */}
            <div className="p-5 flex gap-4 items-center">
              <div className="p-2 bg-white rounded-2xl flex-shrink-0 shadow-lg">
                <img src={`data:image/png;base64,${successData.qr_code}`} alt="QR Code" className="w-20 h-20 block" />
              </div>
              <div className="flex-1 flex flex-col gap-2.5">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Date</span>
                  <p className="text-xs font-bold text-white mt-0.5">{successData.event_details.date}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Visitor</span>
                  <p className="text-xs font-bold text-white mt-0.5">{form.name}</p>
                </div>
                {event?.food == 1 && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Meal</span>
                    <span className={`inline-block mt-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      successData.event_details.food === "Veg" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {successData.event_details.food}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#1e293b] border border-[#334155] text-slate-400 hover:text-white rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home ({redirectTimer}s)
          </button>
        </div>
      )}

      {/* Steps Content Form Container */}
      {step < 3 && (
        <div className="w-full max-w-md mx-auto px-6 py-6 flex-1 flex flex-col justify-center">
          {/* Step 1: Guest Details */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="mb-2">
                <h2 className="text-lg font-black text-white">Complete your details</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Fill in the fields below to register.</p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Full Name */}
                <Field label="Full Name">
                  <input
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </Field>

                {/* Email Verification */}
                <Field label="Email Address">
                  <div className="flex gap-2">
                    <input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={verified}
                      style={{ ...inputStyle, flex: 1, opacity: verified ? 0.6 : 1 }}
                    />
                    {!verified ? (
                      <button
                        onClick={otpSent ? handleResendOtp : handleSendOtp}
                        disabled={loading || !form.email}
                        className="bg-[#fb923c] text-[#0f172a] rounded-xl px-4 font-black text-xs hover:bg-[#fdba74] active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        {loading && !otpSent ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : otpSent ? (
                          "Resend"
                        ) : (
                          "Get OTP"
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black whitespace-nowrap">
                        <CheckCircle size={14} /> Verified
                      </div>
                    )}
                  </div>
                </Field>

                {/* OTP verify cell */}
                {otpSent && !verified && (
                  <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase text-[#fb923c] tracking-wider">Enter email verification OTP</span>
                    <div className="flex gap-2">
                      <input
                        value={otp}
                        maxLength={6}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="○ ○ ○ ○ ○ ○"
                        className="flex-1 bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-center text-base font-black tracking-widest text-[#fb923c] outline-none"
                      />
                      <button
                        onClick={handleVerifyOtp}
                        disabled={loading || !otp}
                        className="bg-[#fb923c] text-[#0f172a] rounded-xl px-4 text-xs font-black uppercase hover:bg-[#fdba74] transition-colors border-none cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}

                {/* Phone */}
                <Field label="Phone Number">
                  <input
                    name="phone"
                    type="text"
                    placeholder="10 digit number"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) setForm({ ...form, phone: val });
                    }}
                    style={inputStyle}
                  />
                </Field>

                {/* Meal Preference */}
                {event?.food == 1 && (
                  <Field label="Meal Preference">
                    <div className="flex gap-3">
                      {["Veg", "Non-Veg"].map((opt) => {
                        const isSelected = form.food_preference === opt;
                        const accentColor = opt === "Veg" ? "#10b981" : "#ef4444";
                        return (
                          <button
                            key={opt}
                            onClick={() => setForm({ ...form, food_preference: opt })}
                            className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-slate-700/20"
                                : "bg-transparent border-[#334155] text-slate-500"
                            }`}
                            style={{ borderColor: isSelected ? accentColor : "#334155", color: isSelected ? accentColor : "#64748b" }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: isSelected ? accentColor : "#475569" }} />
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                )}
              </div>

              {/* Continue button */}
              {verified ? (
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#fb923c] text-[#0f172a] rounded-xl py-3.5 mt-4 flex items-center justify-center gap-1 font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-orange-500/10 hover:bg-[#fdba74] transition-all"
                >
                  <span>Continue to Summary</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <div className="w-full bg-[#1e293b] text-slate-500 border border-[#334155] rounded-xl py-3.5 mt-4 text-center text-xs font-black uppercase tracking-wider">
                  Verify your email to continue
                </div>
              )}
            </div>
          )}

          {/* Step 2: Summary Review */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Review &amp; Confirm</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Please check your details.</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 bg-transparent border-none text-[#fb923c] font-black text-xs cursor-pointer hover:underline"
                >
                  <Edit size={12} /> Edit
                </button>
              </div>

              {/* Details table */}
              <div className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden divide-y divide-[#334155]">
                {[
                  { label: "Visitor Name", value: form.name },
                  { label: "Email Address", value: form.email },
                  { label: "Phone Number", value: form.phone || "—" },
                  ...(event?.food == 1 ? [{ label: "Meal Preference", value: form.food_preference, pill: true }] : []),
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3.5 text-xs font-bold">
                    <span className="text-slate-450">{row.label}</span>
                    {row.pill ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        form.food_preference === "Veg" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {row.value}
                      </span>
                    ) : (
                      <span className="text-white">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Display */}
              <div className="flex justify-between items-center p-4 bg-orange-500/5 border border-orange-500/15 rounded-2xl">
                <span className="text-xs font-extrabold text-slate-350">Total Pass Price</span>
                <span className="text-lg font-black text-[#fb923c]">₹ 0.00</span>
              </div>

              {/* Terms Checkbox */}
              <label className="flex gap-3 items-start bg-[#1e293b]/50 border border-[#334155]/60 rounded-2xl p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-800 text-[#fb923c] focus:ring-0 cursor-pointer mt-0.5"
                />
                <span className="text-[11px] text-slate-400 leading-snug font-medium select-none">
                  I confirm all details are correct and agree to the event's{" "}
                  <span className="text-[#fb923c] underline font-bold">Terms &amp; Participation Policies</span>.
                </span>
              </label>

              {/* Book Ticket Button */}
              <button
                onClick={handleBook}
                disabled={loading || !agreed}
                className="w-full bg-[#fb923c] text-[#0f172a] rounded-xl py-3.5 mt-2 flex items-center justify-center gap-1.5 font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-orange-500/10 hover:bg-[#fdba74] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Confirm &amp; Generate Ticket</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
