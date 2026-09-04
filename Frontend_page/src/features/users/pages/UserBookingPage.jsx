import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin, CheckCircle2, XCircle, Info, AlertTriangle,
  Loader2, ChevronRight, ArrowLeft, ShieldCheck, CreditCard, UserCheck, QrCode
} from "lucide-react";
import {
  getEventById, bookEvent, createRazorpayOrder, getUserProfile,
} from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

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
  const [loading, setLoading]   = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [step, setStep]         = useState(1);
  const [agreed, setAgreed]     = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast]       = useState({ show:false, message:"", type:"info" });
  const [redirectTimer, setRedirectTimer] = useState(6);

  const showToast = (message, type="info") => {
    setToast({ show:true, message, type });
    setTimeout(() => setToast({ show:false, message:"", type:"info" }), 3500);
  };

  const [userId, setUserId] = useState(null);

  // 1. Profile Pre-fill for Logged In User
  useEffect(() => {
    getUserProfile()
      .then((res) => {
        const u = res?.data || res || {};
        const extractedId = u.id || u.user_id || u.userId || localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (extractedId) {
          setUserId(String(extractedId));
        }
        setForm((prev) => ({
          ...prev,
          name: u.full_name || u.name || u.username || prev.name,
          email: u.email || prev.email,
          phone: u.phone || u.phone_number || prev.phone,
        }));
      })
      .catch(console.error);
  }, [id]);

  // 2. Fetch Event Data
  useEffect(() => {
    setDataLoading(true);
    getEventById(id)
      .then((res) => {
        const payload = res?.data || res;
        setEventData(payload);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [id]);

  // 3. Auto Redirect to My Account / Bookings after successful purchase
  useEffect(() => {
    let interval;
    if (step === 3 && successData && redirectTimer > 0) {
      interval = setInterval(() => {
        setRedirectTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 3 && redirectTimer === 0) {
      navigate("/profile");
    }
    return () => clearInterval(interval);
  }, [step, successData, redirectTimer, navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Safe DB Property Extraction
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBook = async () => {
    if (!form.name.trim()) return showToast("Enter your full name", "warning");
    if (!form.email || !validateEmail(form.email)) return showToast("Enter a valid email address", "warning");

    if (isPaidEvent) {
      try {
        setLoading(true);
        const sdkLoaded = await loadRazorpayScript();
        if (!sdkLoaded) {
          showToast("Razorpay SDK failed to load. Check internet connection.", "error");
          setLoading(false);
          return;
        }

        let orderRes = null;
        try {
          orderRes = await createRazorpayOrder({
            amount: passFeeNum,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
          });
        } catch (e) {
          console.warn("Backend Razorpay order creation warning:", e);
        }

        const razorpayData = orderRes?.data || orderRes || {};
        const razorpayOrder = razorpayData?.order || {};
        const keyId = razorpayData?.key_id || razorpayOrder?.key_id || "rzp_test_1DP5mmOlF5G5ag";

        const options = {
          key: keyId,
          amount: passFeeNum * 100,
          currency: "INR",
          name: "BookMyEvent",
          description: `Entry Ticket: ${ev?.event_name || ev?.eventName || "Event Pass"}`,
          image: bannerUrl,
          order_id: razorpayOrder?.id,
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#f97316" },
          handler: async function (response) {
            try {
              setLoading(true);
              const res = await bookEvent({
                event_id: id,
                user_id: userId,
                ...form,
                food_preference: ev?.food == 1 ? form.food_preference : "None",
                payment_id: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
                razorpay_order_id: response.razorpay_order_id || "",
                razorpay_signature: response.razorpay_signature || "",
              });
              setSuccessData(res);
              setStep(3);
              showToast("✓ Payment & Pass Confirmed!", "success");
            } catch {
              showToast("Booking verification failed. Try again.", "error");
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", function (response) {
          console.error("Razorpay Payment Failed:", response.error);
          showToast(`Payment Failed: ${response.error?.description || "Transaction declined"}`, "error");
          setLoading(false);
        });
        razorpayInstance.open();

      } catch (err) {
        showToast(`Razorpay launch error: ${err.message || "Failed to initialize payment"}`, "error");
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const res = await bookEvent({
          event_id: id,
          user_id: userId,
          ...form,
          food_preference: ev?.food == 1 ? form.food_preference : "None",
        });
        setSuccessData(res);
        setStep(3);
        showToast("✓ Ticket Pass Confirmed!", "success");
      } catch {
        showToast("Booking failed. Try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Safe Base64 QR Image Formatting
  const rawQr = successData?.data?.qr_code || successData?.qr_code;
  const qrImageSrc = rawQr 
    ? (rawQr.startsWith("data:") ? rawQr : `data:image/png;base64,${rawQr}`) 
    : null;

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
            {dataLoading ? <Skeleton className="h-4 w-28" /> : (ev?.event_name || ev?.eventName || 'BookMyEvent Pass')}
          </Badge>
        </div>
      </div>

      {/* Improved Fit Progress Stepper */}
      {step < 3 && (
        <div className="max-w-md mx-auto w-full px-6 pt-6 pb-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-8 right-8 top-4.5 h-1 bg-slate-200 z-0 rounded-full" />
            <div
              className="absolute left-8 top-4.5 h-1 bg-gradient-to-r from-orange-500 to-amber-500 z-0 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? "0%" : "calc(100% - 64px)" }}
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                step >= 1 ? "bg-orange-500 text-white shadow-md ring-4 ring-orange-100" : "bg-white text-slate-400 border border-slate-300"
              }`}>
                1
              </div>
              <span className="text-[11px] font-extrabold mt-1.5 uppercase text-orange-600">Visitor Details</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                step >= 2 ? "bg-orange-500 text-white shadow-md ring-4 ring-orange-100" : "bg-white text-slate-400 border border-slate-300"
              }`}>
                2
              </div>
              <span className={`text-[11px] font-extrabold mt-1.5 uppercase ${step === 2 ? "text-orange-600" : "text-slate-400"}`}>Review &amp; Pay</span>
            </div>
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
            Your entry ticket pass and digital QR code have been added to your account.
          </p>

          {/* Ticket Pass Card */}
          <Card className="w-full bg-white border-slate-200/90 shadow-xl rounded-3xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 space-y-2">
              <div className="flex justify-between items-center">
                <Badge className="bg-orange-500 text-white font-extrabold text-[10px] border-none">
                  Official Entry Pass
                </Badge>
                <span className="text-[10px] font-mono text-slate-400">BKG-{successData.booking_id || successData.data?.booking_id || Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <h3 className="text-xl font-black text-white">{successData.event_details?.name || ev?.event_name || ev?.eventName}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin size={13} className="text-orange-400" />
                <span>{successData.event_details?.venue || ev?.venue || 'Exhibition Venue'}</span>
              </p>
            </div>

            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
                {qrImageSrc ? (
                  <img
                    src={qrImageSrc}
                    alt="Entry QR Pass Code"
                    className="w-36 h-36 block object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2">
                    <QrCode size={40} />
                    <span className="text-[10px] font-bold">QR Pass Issued</span>
                  </div>
                )}
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
            onClick={() => navigate("/profile")}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md border-none cursor-pointer"
          >
            Go to My Account / Bookings ({redirectTimer}s)
          </Button>
        </div>
      )}

      {/* LOADING SKELETON */}
      {dataLoading ? (
        <div className="max-w-6xl mx-auto w-full px-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-6">
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <Skeleton className="h-6 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-72 rounded-lg" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 space-y-4">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl mt-4" />
              </Card>
            </div>
          </div>
        </div>
      ) : step < 3 && (
        <div className="max-w-6xl mx-auto w-full px-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: FORM / REVIEW (2 COLS WIDE) */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-6">
                
                {/* STEP 1: VISITOR DETAILS */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Guest Information</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Contact details automatically linked to your account.</p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-xs px-3 py-1 gap-1">
                        <UserCheck size={14} />
                        <span>Logged In Account</span>
                      </Badge>
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
                        <input
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

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

                    <Button
                      onClick={() => {
                        if (!form.name.trim()) return showToast("Enter your full name", "warning");
                        if (!form.email || !validateEmail(form.email)) return showToast("Enter a valid email address", "warning");
                        setStep(2);
                      }}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md border-none cursor-pointer gap-1 mt-2"
                    >
                      <span>Continue to Review &amp; Pay</span>
                      <ChevronRight size={16} />
                    </Button>
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
                  {dataLoading ? (
                    <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                  ) : (
                    <img
                      src={bannerUrl}
                      alt="Event Banner"
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                    />
                  )}
                  <div className="space-y-1">
                    {dataLoading ? (
                      <>
                        <Skeleton className="h-3 w-20 rounded-md" />
                        <Skeleton className="h-4 w-32 rounded-md" />
                      </>
                    ) : (
                      <>
                        <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-[10px] mb-1">
                          {ev?.category || 'Event Pass'}
                        </Badge>
                        <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{ev?.event_name || ev?.eventName || 'Cultural Fest 2026'}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{ev?.venue || 'Exhibition Venue'}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Pass Type</span>
                    <span className="font-extrabold text-slate-900">{booking?.passType || booking?.pass_type || 'Single Entry'}</span>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-extrabold text-orange-900 uppercase">Total Pass Fee</span>
                    {dataLoading ? (
                      <Skeleton className="h-7 w-24 rounded-lg" />
                    ) : (
                      <span className="text-xl font-black text-orange-700">{priceDisplay}</span>
                    )}
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
                      disabled={loading || !agreed || dataLoading}
                      className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs py-4 rounded-2xl shadow-md border-none cursor-pointer gap-2 disabled:opacity-50"
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
    </div>
  );
}
