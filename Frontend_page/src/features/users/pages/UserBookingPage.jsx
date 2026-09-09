import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin, CheckCircle2, XCircle, Info, AlertTriangle, AlertCircle,
  Loader2, ChevronRight, ArrowLeft, ShieldCheck, CreditCard, UserCheck, QrCode,
  Calendar, Printer, Ticket, Check, Users, Utensils, Car, Plus, Minus,
  FileText, ExternalLink, Sparkles, Clock
} from "lucide-react";
import {
  getEventById, bookEvent, createRazorpayOrder, getUserProfile,
} from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/Dialog";
import { isEventConcluded } from "@/shared/utils/eventDateUtils";

const Toast = ({ show, message, type, onClose }) => {
  if (!show) return null;
  const tc = {
    success: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    error: { bg: "bg-rose-50 text-rose-800 border-rose-200" },
    warning: { bg: "bg-amber-50 text-amber-800 border-amber-200" },
    info: { bg: "bg-orange-50 text-orange-800 border-orange-200" },
  }[type] || { bg: "bg-orange-50 text-orange-800 border-orange-200" };

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
  const auth = useSelector((state) => state.auth);

  const getStoredUserInfo = () => {
    try {
      const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  };

  const storedUser = getStoredUserInfo();
  const initialUserId =
    auth?.user?.id ||
    auth?.user?.user_id ||
    storedUser?.id ||
    storedUser?.user_id ||
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId") ||
    null;

  const [eventData, setEventData] = useState(null);
  const [form, setForm]         = useState({
    name: auth?.user?.name || storedUser?.name || storedUser?.full_name || localStorage.getItem("name") || "",
    email: auth?.user?.email || storedUser?.email || localStorage.getItem("email") || "",
    phone: auth?.user?.mobile || storedUser?.mobile || storedUser?.phone || "",
    food_preference: "Veg"
  });

  // Ticket & Provision State
  const [quantity, setQuantity]           = useState(1);
  const [groupSize, setGroupSize]         = useState(2);
  const [selectedFoods, setSelectedFoods] = useState([]); // [{ caterer_name, meal_type, food_type, price_inr, count }]
  const [selectedVehicles, setSelectedVehicles] = useState([]); // [{ vehicle_type, price_inr, count }]
  const [selectedAddons, setSelectedAddons]     = useState([]); // [{ addon_name, price }]
  const [vehicleNumber, setVehicleNumber]       = useState("");

  const [loading, setLoading]         = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [step, setStep]               = useState(1);
  const [agreed, setAgreed]           = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast]             = useState({ show: false, message: "", type: "info" });
  const [redirectTimer, setRedirectTimer] = useState(10);
  const [userId, setUserId]           = useState(initialUserId);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3500);
  };

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
          phone: u.phone || u.phone_number || u.mobile || prev.phone,
        }));
      })
      .catch((err) => {
        console.warn("Could not fetch remote profile, using cached user:", err);
      });
  }, [id]);

  // 2. Fetch Event Data
  useEffect(() => {
    setDataLoading(true);
    getEventById(id)
      .then((res) => {
        const payload = res?.data || res;
        setEventData(payload);

        // Pre-set default group size if Group Pass
        const b = payload?.booking || {};
        const pType = b?.pass_type || b?.passType || "";
        const limit = Number(b?.group_member_limit || b?.groupMemberLimit || 5);
        if (pType.toLowerCase().includes("group")) {
          setGroupSize(Math.min(limit, 3));
        }
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [id]);

  // 3. Auto Redirect to My Account / Passes after successful purchase
  useEffect(() => {
    let interval;
    if (step === 3 && successData && redirectTimer > 0) {
      interval = setInterval(() => {
        setRedirectTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 3 && redirectTimer === 0) {
      navigate("/my-passes");
    }
    return () => clearInterval(interval);
  }, [step, successData, redirectTimer, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Safe DB Property Extraction
  const ev = eventData?.eventDetails || eventData?.event_details || eventData || {};
  const booking = eventData?.booking || {};
  const foodProvision = eventData?.food_provision || eventData?.foodProvision || {};
  const vehicleProvision = eventData?.vehicle_provision || eventData?.vehicleProvision || {};
  const availableFoods = foodProvision?.food_items || foodProvision?.foodItems || eventData?.food_items || [];
  const availableVehicles = vehicleProvision?.vehicles || eventData?.vehicles || [];
  const availableAddons = vehicleProvision?.addons || eventData?.addons || [];
  const termsList = eventData?.terms || eventData?.terms_details?.policies || [];

  const eventStatus = (ev.status || eventData?.status || "Active").toUpperCase();
  const isSuspended = eventStatus === "SUSPENDED";

  // Booking Window Check
  const isConcluded = isEventConcluded(ev || eventData);
  const todayStr = new Date().toISOString().split("T")[0];
  const bStartDate = booking?.booking_start_date || "";
  const bEndDate = booking?.booking_end_date || "";
  const isBookingNotStarted = Boolean(bStartDate && todayStr < bStartDate);
  const isBookingEnded = Boolean(bEndDate && todayStr > bEndDate);
  const isBookingClosed = isConcluded || isBookingNotStarted || isBookingEnded;

  // Pass configuration
  const rawPassType = booking?.pass_type || booking?.passType || "Single Pass";
  const isGroupPass = rawPassType.toLowerCase().includes("group");
  const groupMemberLimit = Math.max(2, Number(booking?.group_member_limit || booking?.groupMemberLimit || 5));
  const maxPass = Math.max(1, Number(booking?.max_pass || booking?.maxPass || 4));
  const totalCapacity = Number(booking?.capacity || 0);

  // Pricing calculations
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

  const unitPassPrice = Number(rawPrice) || 0;
  const chargeType = String(booking?.charge_type || booking?.chargeType || ev?.charge_type || ev?.entry_type || "").toLowerCase();
  const isBasePaid = (chargeType === "paid") || (unitPassPrice > 0);

  // Subtotals
  const passSubtotal = isBasePaid ? (unitPassPrice * quantity) : 0;
  const foodSubtotal = selectedFoods.reduce((sum, item) => sum + (Number(item.price_inr || 0) * (item.count || 1)), 0);
  const vehicleSubtotal = selectedVehicles.reduce((sum, item) => sum + (Number(item.price_inr || 0) * (item.count || 1)), 0) +
    selectedAddons.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const netSubtotal = passSubtotal + foodSubtotal + vehicleSubtotal;

  // Tax computation
  const includeTax = Boolean(booking?.include_tax);
  const taxAmount = includeTax ? Math.round(netSubtotal * 0.18) : 0;
  const grandTotal = netSubtotal + taxAmount;
  const isPaidEvent = grandTotal > 0;

  const totalReservedSeats = isGroupPass ? (quantity * groupSize) : quantity;

  const bannerUrl = ev?.banner_url || ev?.banner || ev?.image || eventData?.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";
  const eventName = ev?.event_name || ev?.eventName || "Event Pass";
  const eventVenue = ev?.venue || "Exhibition Venue";
  const eventDate = ev?.start_date || ev?.startDate || "Upcoming Date";
  const eventTime = ev?.start_time || ev?.startTime || "";

  // Food selection helper
  const handleFoodToggle = (item) => {
    setSelectedFoods((prev) => {
      const idx = prev.findIndex((f) => f.meal_type === item.meal_type && f.caterer_name === item.caterer_name);
      if (idx >= 0) {
        return prev.filter((_, i) => i !== idx);
      } else {
        return [...prev, { ...item, count: quantity }];
      }
    });
  };

  // Vehicle selection helper
  const handleVehicleToggle = (item) => {
    setSelectedVehicles((prev) => {
      const idx = prev.findIndex((v) => v.vehicle_type === item.vehicle_type);
      if (idx >= 0) {
        return prev.filter((_, i) => i !== idx);
      } else {
        return [...prev, { ...item, count: 1 }];
      }
    });
  };

  // Vehicle Add-on toggle
  const handleAddonToggle = (item) => {
    setSelectedAddons((prev) => {
      const idx = prev.findIndex((a) => a.addon_name === item.addon_name);
      if (idx >= 0) {
        return prev.filter((_, i) => i !== idx);
      } else {
        return [...prev, item];
      }
    });
  };

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
    const effectiveUserId =
      userId ||
      auth?.user?.id ||
      auth?.user?.user_id ||
      storedUser?.id ||
      storedUser?.user_id ||
      localStorage.getItem("userId") ||
      sessionStorage.getItem("userId") ||
      null;

    if (!effectiveUserId) {
      showToast("Authentication required: Please sign in to book your ticket.", "warning");
      navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isConcluded) {
      showToast("This event has already concluded. Ticket bookings are closed.", "error");
      return;
    }

    if (!form.name.trim()) return showToast("Enter your full name", "warning");
    if (!form.email || !validateEmail(form.email)) return showToast("Enter a valid email address", "warning");

    // Require vehicle number if vehicle pass selected and organizer enabled vehicle_number
    if (ev?.vehicle_number && (selectedVehicles.length > 0 || selectedAddons.length > 0) && !vehicleNumber.trim()) {
      return showToast("Vehicle number / license plate is required for parking passes.", "warning");
    }

    // Build rich details JSON snapshots
    const foodDetailsStr = selectedFoods.length > 0
      ? JSON.stringify(selectedFoods)
      : (ev?.food == 1 ? form.food_preference : null);

    const vehicleDetailsStr = (selectedVehicles.length > 0 || selectedAddons.length > 0)
      ? JSON.stringify({ passes: selectedVehicles, addons: selectedAddons })
      : null;

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
            amount: grandTotal,
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
          amount: grandTotal * 100,
          currency: "INR",
          name: "BookMyEvent",
          description: `${isGroupPass ? 'Group Pass' : 'Entry Ticket'}: ${eventName}`,
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
                user_id: effectiveUserId,
                name: form.name,
                email: form.email,
                phone: form.phone,
                food_preference: form.food_preference,
                quantity: quantity,
                pass_type: isGroupPass ? "Group Pass" : "Single Pass",
                group_size: isGroupPass ? groupSize : 1,
                food_details: foodDetailsStr,
                vehicle_details: vehicleDetailsStr,
                vehicle_number: vehicleNumber || null,
                subtotal_amount: netSubtotal,
                tax_amount: taxAmount,
                amount_paid: grandTotal,
                currency_code: "INR",
                payment_id: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
                razorpay_order_id: response.razorpay_order_id || "",
                razorpay_signature: response.razorpay_signature || "",
              });
              setSuccessData(res);
              setStep(3);
              showToast("✓ Payment & Pass Confirmed!", "success");
            } catch (err) {
              showToast(err?.response?.data?.detail || "Booking verification failed. Try again.", "error");
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
        showToast(`Payment error: ${err.message || "Failed to initialize payment"}`, "error");
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const res = await bookEvent({
          event_id: id,
          user_id: effectiveUserId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          food_preference: form.food_preference,
          quantity: quantity,
          pass_type: isGroupPass ? "Group Pass" : "Single Pass",
          group_size: isGroupPass ? groupSize : 1,
          food_details: foodDetailsStr,
          vehicle_details: vehicleDetailsStr,
          vehicle_number: vehicleNumber || null,
          subtotal_amount: 0,
          tax_amount: 0,
          amount_paid: 0,
          currency_code: "INR"
        });
        setSuccessData(res);
        setStep(3);
        showToast("✓ Free Pass Confirmed!", "success");
      } catch (err) {
        showToast(err?.response?.data?.detail || "Booking failed. Try again.", "error");
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
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, show: false }))} />

      {/* Top Desktop Web Navbar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                if (step > 1 && step < 3) setStep(step - 1);
                else navigate(-1);
              }}
              className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 border-none bg-transparent transition flex items-center gap-1.5 font-bold text-xs"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Event Pass Registration
            </h1>
          </div>

          <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-xs px-3 py-1 truncate max-w-[200px] sm:max-w-none">
            {dataLoading ? <Skeleton className="h-4 w-28" /> : eventName}
          </Badge>
        </div>
      </div>

      {/* Suspended Event Notice */}
      {isSuspended && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-5">
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 shadow-sm">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Event Booking Temporarily Suspended</h4>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                This event has been temporarily paused by platform administration. Pass registration and ticket purchases are currently unavailable. Please check back later or contact the event host.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Date Window Alerts */}
      {isConcluded && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-5">
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 shadow-sm">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">This Event Has Concluded</h4>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                The scheduled date and time for this event have passed. Ticket sales and pass reservations are closed.
              </p>
            </div>
          </div>
        </div>
      )}

      {isBookingNotStarted && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-5">
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 shadow-sm">
            <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Ticket Sales Have Not Started</h4>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Pass booking for this event will open on <strong>{bStartDate}</strong>. Please check back then to reserve your seats.
              </p>
            </div>
          </div>
        </div>
      )}

      {isBookingEnded && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-5">
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 shadow-sm">
            <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Ticket Booking Window Closed</h4>
              <p className="text-xs text-rose-800 leading-relaxed font-medium">
                Pass booking for this event concluded on <strong>{bEndDate}</strong>. Online registrations are no longer accepted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      {step < 3 && (
        <div className="max-w-md mx-auto w-full px-6 pt-6 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-8 right-8 top-4.5 h-0.5 bg-slate-200 z-0 rounded-full" />
            <div
              className="absolute left-8 top-4.5 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 z-0 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? "0%" : "calc(100% - 64px)" }}
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                step >= 1 ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md ring-4 ring-orange-100" : "bg-white text-slate-400 border border-slate-300"
              }`}>
                {step > 1 ? <Check size={16} /> : "1"}
              </div>
              <span className="text-[11px] font-extrabold mt-1.5 uppercase text-orange-700">Pass &amp; Contact</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                step >= 2 ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md ring-4 ring-orange-100" : "bg-white text-slate-400 border border-slate-300"
              }`}>
                2
              </div>
              <span className={`text-[11px] font-extrabold mt-1.5 uppercase ${step === 2 ? "text-orange-700" : "text-slate-400"}`}>Review &amp; Pay</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS TICKET PASS VIEW */}
      {step === 3 && successData && (
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-6 sm:pt-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-md animate-bounce">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center">Ticket Pass Confirmed!</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold text-center mt-1 mb-6">
            Your official digital pass has been issued and linked to your account.
          </p>

          {/* Ticket Pass Card */}
          <Card className="w-full bg-white border-slate-200/90 shadow-xl rounded-3xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 space-y-2">
              <div className="flex justify-between items-center">
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[10px] border-none px-2.5 py-0.5">
                  {isGroupPass ? `Group Entry Pass (${groupSize} Members)` : 'Single Entry Pass'}
                </Badge>
                <span className="text-[11px] font-mono text-amber-300 font-bold">
                  REF: {successData.booking_id || successData.data?.booking_id || `BKG-${Date.now().toString().slice(-6)}`}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">{successData.event_details?.name || eventName}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-400" />
                <span>{successData.event_details?.venue || eventVenue}</span>
              </p>
            </div>

            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0 flex flex-col items-center justify-center">
                {qrImageSrc ? (
                  <img
                    src={qrImageSrc}
                    alt="Entry QR Pass Code"
                    className="w-36 h-36 block object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2">
                    <QrCode size={40} className="text-slate-400" />
                    <span className="text-[10px] font-bold">QR Pass Issued</span>
                  </div>
                )}
                <span className="text-[10px] font-mono text-slate-500 mt-2 font-bold">Scan at Entrance</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 font-semibold text-center sm:text-left flex-1">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Primary Booker</span>
                  <p className="text-sm font-extrabold text-slate-900">{form.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contact &amp; Email</span>
                  <p className="text-slate-700">{form.email} {form.phone && `• ${form.phone}`}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pass Count</span>
                    <p className="text-slate-900 font-extrabold">{quantity} Pass ({totalReservedSeats} Seats)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                    <p className="text-emerald-600 font-extrabold">{isPaidEvent ? `₹ ${grandTotal.toLocaleString('en-IN')}` : 'FREE PASS'}</p>
                  </div>
                </div>

                {/* Provision Badges */}
                <div className="pt-1 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {selectedFoods.length > 0 ? (
                    selectedFoods.map((f, i) => (
                      <Badge key={i} className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                        🍽️ {f.meal_type} ({f.food_type})
                      </Badge>
                    ))
                  ) : (ev?.food == 1 && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      🍽️ Meal: {form.food_preference}
                    </Badge>
                  ))}

                  {selectedVehicles.map((v, i) => (
                    <Badge key={i} className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                      🚗 Parking: {v.vehicle_type} {vehicleNumber ? `(${vehicleNumber})` : ''}
                    </Badge>
                  ))}

                  {selectedAddons.map((a, i) => (
                    <Badge key={i} className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                      ✨ {a.addon_name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>Present this QR code at the turnstile or gate scanner</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs font-bold text-slate-700 border-slate-200 hover:bg-white rounded-xl gap-1.5"
              >
                <Printer size={14} />
                <span>Print Ticket</span>
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              onClick={() => navigate("/my-passes")}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md border-none cursor-pointer"
            >
              View in My Passes ({redirectTimer}s)
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full text-slate-700 font-extrabold text-xs py-3.5 rounded-2xl border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Back to Home
            </Button>
          </div>
        </div>
      )}

      {/* LOADING SKELETON */}
      {dataLoading ? (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
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
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: FORM / REVIEW (2 COLS WIDE) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* STEP 1: PASS SELECTION & CONTACT DETAILS */}
              {step === 1 && (
                <>
                  {/* Pass Type & Quantity Card */}
                  <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                          <Ticket className="text-orange-600" size={20} />
                          <span>Pass Selection &amp; Capacity</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Configure your event entry pass and attendee group size.
                        </p>
                      </div>

                      {isGroupPass ? (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-extrabold text-xs px-3 py-1 gap-1">
                          <Users size={14} />
                          <span>Group Pass</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-xs px-3 py-1 gap-1">
                          <Ticket size={14} />
                          <span>Single Pass</span>
                        </Badge>
                      )}
                    </div>

                    {/* Group Pass Notice & Stepper (Option 2 Implementation) */}
                    {isGroupPass ? (
                      <div className="p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-orange-950 flex items-center gap-1.5">
                              <Users size={16} className="text-orange-600" />
                              <span>Group Entry Configuration</span>
                            </h4>
                            <p className="text-xs text-orange-800 font-medium leading-relaxed">
                              This event accepts Group Passes. Select how many attendees will be in your group (between 2 and {groupMemberLimit} members per pass).
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-xs shrink-0">
                            Max {groupMemberLimit} / Pass
                          </Badge>
                        </div>

                        {/* Attendees per group pass stepper */}
                        <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-orange-200 shadow-xs">
                          <div>
                            <span className="text-xs font-black text-slate-900 block">Attendees in Your Group</span>
                            <span className="text-[11px] text-slate-500 font-medium">All members enter on this pass</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setGroupSize((prev) => Math.max(2, prev - 1))}
                              disabled={groupSize <= 2}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 font-bold border-none cursor-pointer transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-black text-sm text-slate-900">{groupSize}</span>
                            <button
                              type="button"
                              onClick={() => setGroupSize((prev) => Math.min(groupMemberLimit, prev + 1))}
                              disabled={groupSize >= groupMemberLimit}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 font-bold border-none cursor-pointer transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          Number of {isGroupPass ? 'Group Passes' : 'Tickets'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Limit up to {maxPass} pass{maxPass > 1 ? 'es' : ''} per order
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          disabled={quantity <= 1}
                          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 font-black border border-slate-200 cursor-pointer shadow-xs transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-black text-base text-slate-900">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.min(maxPass, prev + 1))}
                          disabled={quantity >= maxPass}
                          className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 font-black border border-slate-200 cursor-pointer shadow-xs transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Seat Reservation summary & capacity display */}
                    <div className="flex items-center justify-between px-3 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>Reserves <strong>{totalReservedSeats} Total Seat{totalReservedSeats > 1 ? 's' : ''}</strong></span>
                      </span>
                      {totalCapacity > 0 && (
                        <span className="text-slate-500 font-medium">
                          Venue Capacity: <strong className="text-slate-800">{totalCapacity}</strong>
                        </span>
                      )}
                    </div>
                  </Card>

                  {/* Primary Contact Details Card (Primary booker only) */}
                  <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">Primary Booker Contact</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Digital pass and gate scan confirmation will be delivered to this contact.
                        </p>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-xs px-3 py-1 gap-1">
                        <UserCheck size={14} />
                        <span>Verified Account</span>
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Full Name *"
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />

                      <Input
                        label="Email Address *"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />

                      <Input
                        label="Mobile Phone Number"
                        name="phone"
                        placeholder="10 digit mobile number"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) setForm({ ...form, phone: val });
                        }}
                      />
                    </div>
                  </Card>

                  {/* Optional Food Provisions Add-on (If enabled for event) */}
                  {(ev?.food == 1 || availableFoods.length > 0) && (
                    <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-5">
                      <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                            <Utensils size={18} className="text-emerald-600" />
                            <span>Event Catering &amp; Meal Vouchers</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Add refreshments or caterer meal passes to your entry ticket.
                          </p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-xs">
                          Optional Add-on
                        </Badge>
                      </div>

                      {availableFoods.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {availableFoods.map((item, idx) => {
                            const isSelected = selectedFoods.some((f) => f.meal_type === item.meal_type && f.caterer_name === item.caterer_name);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleFoodToggle(item)}
                                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                                  isSelected
                                    ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200 shadow-xs"
                                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/80"
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-white text-emerald-800 border-emerald-200 text-[10px] font-extrabold">
                                      {item.meal_type || 'Meal'}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-slate-500">{item.food_type}</span>
                                  </div>
                                  <h4 className="text-xs font-black text-slate-900">{item.caterer_name || 'Caterer Meal'}</h4>
                                  {item.menu_details && (
                                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.menu_details}</p>
                                  )}
                                  <p className="text-xs font-black text-emerald-700 pt-1">
                                    {Number(item.price_inr) > 0 ? `+ ₹ ${Number(item.price_inr).toLocaleString('en-IN')}` : 'Complimentary'}
                                  </p>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 transition ${
                                  isSelected ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                                }`}>
                                  {isSelected && <Check size={12} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700 tracking-tight block">
                            Complimentary Meal Preference
                          </label>
                          <div className="flex gap-3">
                            {["Veg", "Non-Veg"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setForm({ ...form, food_preference: opt })}
                                className={`flex-1 py-3 rounded-xl font-extrabold text-xs border cursor-pointer transition ${
                                  form.food_preference === opt
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Optional Vehicle Passes & Parking Add-on (If enabled for event) */}
                  {(ev?.vehicle_pass == 1 || availableVehicles.length > 0) && (
                    <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-5">
                      <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                            <Car size={18} className="text-blue-600" />
                            <span>Vehicle Parking Passes &amp; Valet</span>
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Reserved venue parking access linked to your entry QR code.
                          </p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-extrabold text-xs">
                          Optional Add-on
                        </Badge>
                      </div>

                      {availableVehicles.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {availableVehicles.map((item, idx) => {
                            const isSelected = selectedVehicles.some((v) => v.vehicle_type === item.vehicle_type);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleVehicleToggle(item)}
                                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                                  isSelected
                                    ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-200 shadow-xs"
                                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/80"
                                }`}
                              >
                                <div className="space-y-1">
                                  <Badge className="bg-white text-blue-800 border-blue-200 text-[10px] font-extrabold">
                                    {item.vehicle_type}
                                  </Badge>
                                  <h4 className="text-xs font-black text-slate-900">Reserved Parking Pass</h4>
                                  <p className="text-xs font-black text-blue-700 pt-1">
                                    {Number(item.price_inr) > 0 ? `+ ₹ ${Number(item.price_inr).toLocaleString('en-IN')}` : 'Free Parking'}
                                  </p>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 transition ${
                                  isSelected ? "bg-blue-600 text-white" : "border border-slate-300 bg-white"
                                }`}>
                                  {isSelected && <Check size={12} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Vehicle Add-ons (Valet, etc.) */}
                      {availableAddons.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <label className="text-xs font-bold text-slate-700 block">Premium Parking Services</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availableAddons.map((item, idx) => {
                              const isSelected = selectedAddons.some((a) => a.addon_name === item.addon_name);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleAddonToggle(item)}
                                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                    isSelected
                                      ? "bg-purple-50 border-purple-300 text-purple-900"
                                      : "bg-slate-50 border-slate-200 text-slate-700"
                                  }`}
                                >
                                  <span className="text-xs font-extrabold">{item.addon_name}</span>
                                  <span className="text-xs font-black text-purple-700">
                                    + ₹ {Number(item.price).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Vehicle License Plate (If parking selected or required) */}
                      {(ev?.vehicle_number || selectedVehicles.length > 0 || selectedAddons.length > 0) && (
                        <div className="pt-2">
                          <Input
                            label={`Vehicle License Plate Number ${ev?.vehicle_number ? '*' : '(Optional)'}`}
                            placeholder="e.g. TN 09 AB 1234"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                            required={Boolean(ev?.vehicle_number)}
                          />
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Continue Button */}
                  <Button
                    onClick={() => {
                      if (isSuspended) return showToast("This event is suspended and cannot accept bookings", "error");
                      if (isBookingClosed) return showToast("Booking window is currently closed for this event", "error");
                      if (!form.name.trim()) return showToast("Enter your full name", "warning");
                      if (!form.email || !validateEmail(form.email)) return showToast("Enter a valid email address", "warning");
                      if (ev?.vehicle_number && (selectedVehicles.length > 0 || selectedAddons.length > 0) && !vehicleNumber.trim()) {
                        return showToast("Please provide vehicle number for the parking pass", "warning");
                      }
                      setStep(2);
                    }}
                    disabled={isSuspended || isBookingClosed}
                    className={`w-full font-extrabold text-xs py-4 rounded-2xl shadow-md border-none gap-2 cursor-pointer transition ${
                      isSuspended || isBookingClosed
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white"
                    }`}
                  >
                    <span>Continue to Order Review</span>
                    <ChevronRight size={16} />
                  </Button>
                </>
              )}

              {/* STEP 2: REVIEW SUMMARY */}
              {step === 2 && (
                <Card className="bg-white border-slate-200/80 shadow-xs rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Review Booking Summary</h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Verify attendee contact details and selected add-ons before issuance.
                      </p>
                    </div>
                    <button 
                      onClick={() => setStep(1)} 
                      className="text-xs font-extrabold text-orange-600 hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Edit Options
                    </button>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-5 space-y-3 border border-slate-200/80 text-xs font-semibold">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-extrabold text-slate-900">{form.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Email Address</span>
                      <span className="font-extrabold text-slate-900">{form.email}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Contact Phone</span>
                      <span className="font-extrabold text-slate-900">{form.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Pass Type</span>
                      <span className="font-extrabold text-orange-700">
                        {isGroupPass ? `Group Pass (${groupSize} Members)` : 'Single Pass'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-500">Pass Quantity</span>
                      <span className="font-extrabold text-slate-900">{quantity} Pass ({totalReservedSeats} Seats)</span>
                    </div>

                    {selectedFoods.length > 0 && (
                      <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span className="text-slate-500">Meal Provisions</span>
                        <span className="font-extrabold text-emerald-700">
                          {selectedFoods.map((f) => `${f.meal_type} (${f.food_type})`).join(", ")}
                        </span>
                      </div>
                    )}

                    {(selectedVehicles.length > 0 || selectedAddons.length > 0) && (
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Vehicle Passes</span>
                        <span className="font-extrabold text-blue-700">
                          {[
                            ...selectedVehicles.map((v) => v.vehicle_type),
                            ...selectedAddons.map((a) => a.addon_name)
                          ].join(", ")}
                          {vehicleNumber ? ` [${vehicleNumber}]` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

            </div>

            {/* RIGHT COLUMN: ORDER & PASS SUMMARY (STICKY) */}
            <div className="sticky top-20 space-y-6">
              <Card className="bg-white border border-slate-200/90 shadow-lg rounded-3xl p-6 space-y-6">
                
                {/* Event Header Banner */}
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
                  <div className="space-y-1 min-w-0">
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
                        <h3 className="text-sm font-extrabold text-slate-900 truncate">{eventName}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{eventVenue}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Line Item Breakdown */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-500">Pass Type</span>
                    <span className="font-extrabold text-slate-900">
                      {isGroupPass ? `Group Pass (${groupSize} Pers.)` : 'Single Pass'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-500">Pass Subtotal ({quantity}x)</span>
                    <span className="font-extrabold text-slate-900">
                      {passSubtotal > 0 ? `₹ ${passSubtotal.toLocaleString('en-IN')}` : 'FREE PASS'}
                    </span>
                  </div>

                  {foodSubtotal > 0 && (
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-500">Catering Add-ons</span>
                      <span className="font-extrabold text-emerald-700">₹ {foodSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {vehicleSubtotal > 0 && (
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-500">Parking &amp; Valet</span>
                      <span className="font-extrabold text-blue-700">₹ {vehicleSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {includeTax && (
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-500">Taxes &amp; GST (18%)</span>
                      <span className="font-extrabold text-slate-700">₹ {taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-slate-500">Convenience &amp; Platform Fee</span>
                    <span className="font-extrabold text-emerald-600">₹ 0 (Waived)</span>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between mt-2">
                    <span className="text-xs font-extrabold text-orange-950 uppercase">Total Payable</span>
                    {dataLoading ? (
                      <Skeleton className="h-7 w-24 rounded-lg" />
                    ) : (
                      <span className="text-xl font-black text-orange-700">
                        {isPaidEvent ? `₹ ${grandTotal.toLocaleString('en-IN')}` : 'FREE PASS'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Terms Modal Trigger & Agreement */}
                {step === 2 && (
                  <div className="space-y-4 pt-2">
                    {termsList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPolicyModalOpen(true)}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                      >
                        <FileText size={14} />
                        <span>Read Event Policies &amp; Gate Guidelines ({termsList.length})</span>
                      </button>
                    )}

                    <label className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 mt-0.5"
                      />
                      <span className="text-[11px] text-slate-600 font-medium">
                        I agree to the organizer guidelines, gate turnstile policies, and terms of service.
                      </span>
                    </label>

                    <Button
                      onClick={handleBook}
                      disabled={loading || !agreed || dataLoading || isSuspended || isBookingClosed}
                      className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-white font-extrabold text-xs py-4 rounded-2xl shadow-md border-none cursor-pointer gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isPaidEvent ? (
                        <>
                          <CreditCard size={16} />
                          <span>Confirm &amp; Pay ₹ {grandTotal.toLocaleString('en-IN')}</span>
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
                    <span>Instant Digital QR Pass • Turnstile Ready</span>
                  </span>
                </div>

              </Card>
            </div>

          </div>
        </div>
      )}

      {/* Event Policies & Terms Modal */}
      <Dialog open={policyModalOpen} onClose={() => setPolicyModalOpen(false)} maxWidth="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="text-orange-600" size={20} />
            <span>Event Policies &amp; Entry Guidelines</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4 max-h-[70vh] overflow-y-auto">
          {termsList.length > 0 ? (
            <div className="space-y-3">
              {termsList.map((p, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] font-bold">
                      {p.policy_group || 'General Policy'}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400">{p.policy_type}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">{p.policy_name}</h4>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">Standard event gate entry guidelines apply.</p>
          )}
          <Button
            onClick={() => setPolicyModalOpen(false)}
            className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl border-none cursor-pointer"
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Userbooking;
