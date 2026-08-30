import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, CheckCircle2, XCircle, Info, AlertTriangle,
  Send, Loader2, Edit, Calendar, Utensils, Ticket, ChevronRight, ArrowLeft, ShieldCheck, CreditCard, Lock, Smartphone, Building
} from "lucide-react";
import {
  getEventById, sendOtp, verifyOtp, resendOtp, bookEvent,
} from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

const Toast = ({ show, message, type, onClose }) => {
  if (!show) return null;
  const tc = {
    success: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    error: { bg: "bg-rose-50 text-rose-800 border-rose-200" },
    warning: { bg: "bg-amber-50 text-amber-800 border-amber-200" },
    info: { bg: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  }[type] || { bg: "bg-cyan-50 text-cyan-800 border-cyan-200" };

  const Icon = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }[type] || Info;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl border font-extrabold text-xs animate-in fade-in slide-in-from-top-4 ${tc.bg}`}>
      <Icon size={16} />
      <span>{message}</span>
      <button onClick={onClose} className="bg-transparent border-none p-0 cursor-pointer flex items-center ml-2 text-current">
        <XCircle size={16} />
      </button>
    </div>
  );
};

export function Userbooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
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
  const [showTestPayModal, setShowTestPayModal] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState("card");

  const showToast = (message, type="info") => {
    setToast({ show:true, message, type });
    setTimeout(() => setToast({ show:false, message:"", type:"info" }), 3500);
  };

  useEffect(() => {
    getEventById(id)
      .then((res) => {
        const payload = res?.data || res;
        setEventData(payload);
      })
      .catch(console.error);
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

  // Safe property extraction from DB response
  const ev = eventData?.eventDetails || eventData || {};
  const booking = eventData?.booking || {};

  const rawPrice = 
    booking?.priceINR ?? 
    booking?.price_inr ?? 
    booking?.price ?? 
    ev?.pass_fee ?? 
    ev?.price ?? 
    ev?.price_inr ?? 
    eventData?.pass_fee ?? 
    eventData?.price ?? 
    eventData?.price_inr ?? 
    0;

  const passFeeNum = Number(rawPrice);
  const chargeType = String(
    booking?.chargeType || 
    booking?.charge_type || 
    ev?.charge_type || 
    ev?.chargeType || 
    ev?.entry_type || 
    ""
  ).toLowerCase();

  const isPaidEvent = (chargeType === "paid") || (passFeeNum > 0);
  const priceDisplay = isPaidEvent ? `₹ ${passFeeNum.toLocaleString('en-IN')}` : "FREE PASS";
  const bannerUrl = ev?.banner_url || ev?.banner || ev?.image || eventData?.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";

  const handleSendOtp = async () => {
    if (!form.email)               return showToast("Enter your email address first", "warning");
    if (!validateEmail(form.email)) return showToast("Enter a valid email address", "error");
    try {
      setLoading(true);
      await sendOtp(form.email);
      setOtpSent(true);
      showToast("OTP sent to your email address", "success");
    } catch { showToast("Failed to send OTP", "error"); }
    finally  { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showToast("Enter the 6-digit OTP", "warning");
    try {
      setLoading(true);
      await verifyOtp(form.email, otp);
      setVerified(true);
      showToast("✓ Email verified successfully!", "success");
    } catch { showToast("Invalid OTP code. Try again.", "error"); }
    finally  { setLoading(false); }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(form.email);
      setOtp("");
      showToast("OTP resent to email", "success");
    } catch { showToast("Failed to resend OTP", "error"); }
  };

  const executeBooking = async (paymentId = null) => {
    try {
      setLoading(true);
      const res = await bookEvent({
        event_id: id,
        ...form,
        food_preference: ev?.food == 1 ? form.food_preference : "None",
        payment_id: paymentId || `pay_test_${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setSuccessData(res);
      setStep(3);
      setShowTestPayModal(false);
      showToast("✓ Booking & Pass Confirmed!", "success");
    } catch {
      showToast("Booking confirmation failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!verified) return showToast("Verify your email first", "warning");

    if (isPaidEvent) {
      setShowTestPayModal(true);
    } else {
      await executeBooking(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-24">
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, show:false }))} />

      {/* Top Desktop Web Navbar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step > 1 && step < 3) setStep(step - 1);
                else navigate(-1);
              }}
              className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 border-none bg-transparent transition flex items-center gap-2 font-bold text-xs"
            >
              <ArrowLeft size={18} />
              <span>Back to Event</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Event Pass Registration
            </h1>
          </div>

          <Badge className="bg-orange-50 text-orange-600 border-orange-200 font-extrabold text-xs px-3.5 py-1">
            {ev?.event_name || ev?.eventName || 'BookMyEvent Pass'}
          </Badge>
        </div>
      </div>

      {/* Progress Tracker Bar */}
      {step < 3 && (
        <div className="max-w-xl mx-auto w-full px-6 pt-8 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-500 to-amber-500 z-0 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />

            {[1, 2].map((num) => (
              <div key={num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                    step >= num
                      ? "bg-orange-500 text-white shadow-md ring-4 ring-orange-100"
                      : "bg-white text-slate-400 border border-slate-300"
                  }`}
                >
                  {num}
                </div>
                <span className={`text-[11px] font-extrabold mt-1.5 uppercase ${step === num ? "text-orange-600" : "text-slate-400"}`}>
                  {num === 1 ? "Visitor Details" : "Review & Pay"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS TICKET PASS VIEW */}
      {step === 3 && successData && (
        <div className="max-w-2xl mx-auto w-full px-6 pt-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-md">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 text-center">Ticket Pass Confirmed!</h2>
          <p className="text-xs text-slate-500 font-semibold text-center mt-1 mb-6">
            Your digital entry QR pass has been generated and issued to your email.
          </p>

          {/* Ticket Pass Card */}
          <Card className="w-full bg-white border-slate-200/90 shadow-xl rounded-3xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 space-y-2">
              <div className="flex justify-between items-center">
                <Badge className="bg-orange-500 text-white font-extrabold text-[10px] border-none">
                  Official Entry Pass
                </Badge>
                <span className="text-[10px] font-mono text-slate-400">BKG-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <h3 className="text-xl font-black text-white">{successData.event_details?.name || ev?.event_name || ev?.eventName}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin size={13} className="text-orange-400" />
                <span>{successData.event_details?.venue || ev?.venue || 'Exhibition Venue'}</span>
              </p>
            </div>

            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0">
                <img
                  src={`data:image/png;base64,${successData.qr_code}`}
                  alt="QR Pass Code"
                  className="w-32 h-32 block"
                />
              </div>

              <div className="space-y-2 text-xs text-slate-600 font-semibold text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Attendee Name</span>
                  <p className="text-sm font-extrabold text-slate-900">{form.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Email Address</span>
                  <p className="text-slate-700">{form.email}</p>
                </div>
                {ev?.food == 1 && (
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Meal Pass</span>
                    <p className="text-emerald-700 font-extrabold">{form.food_preference}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full rounded-2xl font-extrabold text-xs py-3.5 cursor-pointer border-slate-200"
          >
            Return to Home ({redirectTimer}s)
          </Button>
        </div>
      )}

      {/* STEPS 1 & 2: DESKTOP WEB CANVAS (2 COLUMNS) */}
      {step < 3 && (
        <div className="max-w-6xl mx-auto w-full px-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: FORM / REVIEW (2 COLS WIDE) */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-6">
                
                {/* STEP 1: VISITOR DETAILS */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-black text-slate-900">Guest Information</h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Complete your contact details for ticket pass issuance.</p>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">Full Name *</label>
                        <input
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">Email Address *</label>
                        <div className="flex gap-2">
                          <input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            disabled={verified}
                            className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100"
                          />
                          {!verified ? (
                            <Button
                              type="button"
                              onClick={otpSent ? handleResendOtp : handleSendOtp}
                              disabled={loading || !form.email}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-5 rounded-xl cursor-pointer border-none shrink-0"
                            >
                              {loading ? <Loader2 size={14} className="animate-spin" /> : otpSent ? "Resend" : "Get OTP"}
                            </Button>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-xs px-4">
                              Verified ✓
                            </Badge>
                          )}
                        </div>
                      </div>

                      {otpSent && !verified && (
                        <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-2">
                          <span className="text-[10px] font-extrabold text-orange-800 uppercase">Enter 6-Digit Verification OTP</span>
                          <div className="flex gap-2">
                            <input
                              value={otp}
                              maxLength={6}
                              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                              placeholder="000000"
                              className="flex-1 h-10 bg-white border border-orange-200 rounded-xl px-3 text-center text-sm font-black tracking-widest text-orange-900 outline-none"
                            />
                            <Button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={loading || !otp}
                              className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-5 rounded-xl cursor-pointer"
                            >
                              Verify OTP
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">Phone Number *</label>
                        <input
                          name="phone"
                          type="text"
                          placeholder="10 digit mobile number"
                          maxLength={10}
                          value={form.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10) setForm({ ...form, phone: val });
                          }}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      {ev?.food == 1 && (
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">Meal Preference</label>
                          <div className="flex gap-3">
                            {["Veg", "Non-Veg"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setForm({ ...form, food_preference: opt })}
                                className={`flex-1 py-3 rounded-xl font-extrabold text-xs border cursor-pointer transition ${
                                  form.food_preference === opt
                                    ? "bg-orange-50 text-orange-700 border-orange-300 shadow-xs"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {verified ? (
                      <Button
                        onClick={() => setStep(2)}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md border-none cursor-pointer gap-1 mt-2"
                      >
                        <span>Continue to Review &amp; Pay</span>
                        <ChevronRight size={16} />
                      </Button>
                    ) : (
                      <div className="w-full p-3.5 bg-slate-100 text-slate-500 text-center font-extrabold text-xs rounded-xl border border-slate-200 mt-2">
                        Verify email address to continue
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: REVIEW SUMMARY */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Review Summary</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Confirm details before issuing entry pass.</p>
                      </div>
                      <button onClick={() => setStep(1)} className="text-xs font-extrabold text-orange-600 hover:underline bg-transparent border-none cursor-pointer">
                        Edit Details
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-200/80 text-xs font-semibold">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Visitor Name</span>
                        <span className="font-extrabold text-slate-900">{form.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Email Address</span>
                        <span className="font-extrabold text-slate-900">{form.email}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Phone Number</span>
                        <span className="font-extrabold text-slate-900">{form.phone || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}

              </Card>
            </div>

            {/* RIGHT COLUMN: DESKTOP ORDER & PASS SUMMARY (1 COL WIDE, STICKY TOP-20) */}
            <div className="sticky top-20 space-y-6">
              <Card className="bg-white border border-slate-200/90 shadow-md rounded-3xl p-6 space-y-6">
                
                <div className="flex gap-4 items-center border-b border-slate-100 pb-4">
                  <img
                    src={bannerUrl}
                    alt="Event Banner"
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                  />
                  <div>
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-[10px] mb-1">
                      {ev?.category || 'Event Pass'}
                    </Badge>
                    <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{ev?.event_name || ev?.eventName || 'Cultural Fest 2026'}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ev?.venue || 'Exhibition Venue'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Pass Type</span>
                    <span className="font-extrabold text-slate-900">{booking?.passType || booking?.pass_type || 'Single Entry'}</span>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-extrabold text-orange-900 uppercase">Total Pass Fee</span>
                    <span className="text-xl font-black text-orange-700">{priceDisplay}</span>
                  </div>
                </div>

                {step === 2 && (
                  <div className="space-y-4 pt-2">
                    <label className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-0 mt-0.5"
                      />
                      <span className="text-[11px] text-slate-600 font-medium">
                        I agree to the event terms &amp; conditions and cancellation policies.
                      </span>
                    </label>

                    <Button
                      onClick={handleBook}
                      disabled={loading || !agreed}
                      className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold text-xs py-4 rounded-2xl shadow-md border-none cursor-pointer gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isPaidEvent ? (
                        <>
                          <CreditCard size={16} />
                          <span>Confirm &amp; Pay Ticket</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Confirm Free Entry Pass</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="pt-1 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Instant E-Pass Generation &amp; QR Access</span>
                  </span>
                </div>

              </Card>
            </div>

          </div>
        </div>
      )}

      {/* ── TEST MODE PAYMENT SIMULATOR MODAL ── */}
      {showTestPayModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <Card className="bg-white border-slate-200 shadow-2xl rounded-3xl max-w-md w-full p-6 space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <Badge className="bg-orange-500 text-white font-black text-[10px] border-none mb-1">
                  Razorpay Test Gateway
                </Badge>
                <h3 className="text-lg font-black text-slate-900">Complete Test Payment</h3>
              </div>
              <button
                onClick={() => setShowTestPayModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Price Badge */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Amount</span>
                <span className="text-xs font-bold text-slate-700">{ev?.event_name || 'Event Pass'}</span>
              </div>
              <span className="text-2xl font-black text-slate-900">{priceDisplay}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-slate-700 uppercase">Select Test Payment Method</span>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayMethod("card")}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-extrabold cursor-pointer transition ${
                    selectedPayMethod === "card"
                      ? "bg-orange-50 border-orange-400 text-orange-800 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="text-[11px]">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayMethod("upi")}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-extrabold cursor-pointer transition ${
                    selectedPayMethod === "upi"
                      ? "bg-orange-50 border-orange-400 text-orange-800 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <Smartphone size={18} />
                  <span className="text-[11px]">UPI / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayMethod("netbank")}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-extrabold cursor-pointer transition ${
                    selectedPayMethod === "netbank"
                      ? "bg-orange-50 border-orange-400 text-orange-800 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <Building size={18} />
                  <span className="text-[11px]">NetBanking</span>
                </button>
              </div>
            </div>

            {/* Test Security Note */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Lock size={16} className="shrink-0 text-emerald-600" />
              <span>Razorpay Test Sandbox active. No real funds will be charged.</span>
            </div>

            {/* Submit Action */}
            <Button
              onClick={() => executeBooking(`pay_test_${Math.floor(100000 + Math.random() * 900000)}`)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold text-xs py-4 rounded-2xl shadow-lg border-none cursor-pointer gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Simulate Successful Test Payment ({priceDisplay})</span>
                </>
              )}
            </Button>

          </Card>
        </div>
      )}
    </div>
  );
}
