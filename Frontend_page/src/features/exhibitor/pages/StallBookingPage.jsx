import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Store,
  MapPin,
  Calendar,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  User,
  Building2,
  Hash,
  Upload,
  CreditCard,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  ShieldCheck,
  Layers,
  BadgePercent,
  Star,
  Check,
  Users,
  Info,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  Search,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/Select";
import {
  getEventFullDetails,
  getEventById,
  bookStall,
  getCountries,
  getStates,
  getCities
} from "@/Services/api";
import { getAuthUserId } from "@/shared/services/authHelper";
import { isEventConcluded } from "@/shared/utils/eventDateUtils";
import { getEventBookingStatus } from "@/shared/services/bookingService";

/* ── Modern Shadcn Custom Select Component ─────────────────────── */
function ShadcnSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  options = [],
  disabled = false,
  error = false,
  align = "full",
  className = "",
  renderTrigger,
  renderOption
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedOpt = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer text-left ${
          error
            ? "border-rose-400 ring-1 ring-rose-400"
            : open
            ? "border-slate-800 ring-2 ring-slate-800/10 shadow-slate-900/5"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "text-slate-800"}`}
      >
        <div className="flex-1 min-w-0 pr-2">
          {renderTrigger ? (
            renderTrigger(selectedOpt)
          ) : selectedOpt ? (
            <span className="truncate block font-bold text-slate-900">{selectedOpt.label}</span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-slate-700" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 top-[calc(100%+6px)] max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-80 zoom-in-95 duration-100 ${
            align === "full"
              ? "left-0 right-0 w-full"
              : align === "right"
              ? "right-0 left-auto min-w-full w-36 sm:w-44 max-w-[calc(100vw-2rem)]"
              : "left-0 right-auto min-w-full w-36 sm:w-44 max-w-[calc(100vw-2rem)]"
          }`}
        >
          {options.length === 0 ? (
            <div className="py-3 px-3 text-center text-xs text-slate-400 font-medium">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                  }}
                  className={`relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {renderOption ? renderOption(opt, isSelected) : <span>{opt.label}</span>}
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-slate-900 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ── Modern Shadcn Searchable Combobox Component ───────────────── */
function ShadcnCombobox({
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  options = [],
  disabled = false,
  loading = false,
  error = false,
  align = "full",
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter((o) => o.label?.toLowerCase().includes(q));
  }, [options, searchTerm]);

  const selectedOpt = options.find((o) => String(o.value) === String(value) || String(o.label) === String(value));

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          if (!disabled && !loading) {
            setOpen(!open);
            setSearchTerm("");
          }
        }}
        className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer text-left ${
          error
            ? "border-rose-400 ring-1 ring-rose-400"
            : open
            ? "border-slate-800 ring-2 ring-slate-800/10 shadow-slate-900/5"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled || loading ? "opacity-60 cursor-not-allowed bg-slate-50" : "text-slate-800"}`}
      >
        <div className="flex-1 min-w-0 pr-2">
          {loading ? (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" /> Loading...
            </span>
          ) : selectedOpt ? (
            <span className="truncate block font-bold text-slate-900">{selectedOpt.label}</span>
          ) : value ? (
            <span className="truncate block font-bold text-slate-900">{value}</span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-slate-700" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 top-[calc(100%+6px)] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-80 zoom-in-95 duration-100 flex flex-col ${
            align === "right"
              ? "right-0 left-auto min-w-full w-48 sm:w-60 max-w-[calc(100vw-2rem)]"
              : align === "left"
              ? "left-0 right-auto min-w-full w-48 sm:w-60 max-w-[calc(100vw-2rem)]"
              : "left-0 right-0 w-full min-w-full"
          }`}
        >
          {/* Search Bar inside popover */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-slate-100 mb-1">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent outline-none py-1"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "thin" }}>
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 font-medium">
                No matching options found
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = String(opt.value) === String(value) || String(opt.label) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onValueChange(opt.value, opt.label);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                    className={`relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-slate-900 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Toast Notification Component ───────────────────────────── */
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border-l-4 bg-white max-w-sm animate-in fade-in slide-in-from-right-4 duration-300 ${ok ? "border-emerald-500 shadow-emerald-500/10" : "border-rose-500 shadow-rose-500/10"}`}>
      <div className={`p-1.5 rounded-xl shrink-0 ${ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
        {ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-black text-slate-900">{ok ? "Success" : "Notice"}</p>
        <p className="text-[11px] font-medium text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
        <X size={14} />
      </button>
    </div>
  );
};

/* ── Input Label Wrapper with Consistent Emerald Accents ──── */
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </span>
      </label>
    )}
    {children}
    {error && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {error}</span>}
  </div>
);

export default function StallBookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [eventData, setEventData] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [existingBooking, setExistingBooking] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: "Mr.",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
    companyName: "",
    companyType: "Private Limited",
    companyWebsite: "",
    industryType: "",
    businessDescription: "",
    country: "",
    state: "",
    city: "",
    address: "",
    message: "",
    pinCode: "",
    stallArea: "",
    products: "",
    visitingCard: null,
  });

  const [selectedStallId, setSelectedStallId] = useState("");
  const [isOptPrime, setIsOptPrime] = useState(false);
  const [errors, setErrors] = useState({});

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    fetchEventDetails();
    loadCountries();
  }, [id]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Pre-fill exhibitor info if available from user state
  useEffect(() => {
    if (user) {
      const exhProfile = user.profiles?.exhibitor || user.exhibitor_profile || {};
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.first_name || user.name?.split(" ")[0] || "",
        lastName: prev.lastName || user.last_name || user.name?.split(" ").slice(1).join(" ") || "",
        email: prev.email || user.email || "",
        mobile: prev.mobile || user.phone || user.mobile || "",
        companyName: prev.companyName || exhProfile.company_name || user.company || "",
        companyType: prev.companyType || exhProfile.company_type || "Private Limited",
        companyWebsite: prev.companyWebsite || exhProfile.website_url || "",
        industryType: prev.industryType || exhProfile.vendor_category || "",
        designation: prev.designation || exhProfile.designation || "",
        city: prev.city || exhProfile.city || "",
        state: prev.state || exhProfile.state || "",
        country: prev.country || exhProfile.country || "",
        address: prev.address || exhProfile.address || "",
        pinCode: prev.pinCode || exhProfile.pincode || exhProfile.pin_code || ""
      }));
    }
  }, [user]);

  const fetchEventDetails = async () => {
    setInitialLoading(true);
    try {
      let data = null;
      try {
        data = await getEventFullDetails(id);
      } catch {
        data = await getEventById(id);
      }

      const payload = data?.data || data?.event || data;
      if (payload) {
        setEventData(payload);

        // Pre-select first available configured stall if none selected
        const stalls = payload.layout?.stalls || payload.stalls || [];
        if (stalls.length > 0 && !selectedStallId) {
          const firstStall = stalls[0];
          const stallKey = firstStall.id || `${firstStall.stall_name || firstStall.stallName}-${0}`;
          setSelectedStallId(stallKey);
          const stallDesc = `${firstStall.stall_name || firstStall.stallName} (${firstStall.stall_size || firstStall.size || 'Standard'})`;
          setFormData((p) => ({ ...p, stallArea: stallDesc }));
        }
      }

      const effectiveUserId = getAuthUserId(user);
      const effectiveEmail = formData.email || user?.email || user?.email_id;
      if (id && (effectiveUserId || effectiveEmail)) {
        try {
          const bStatus = await getEventBookingStatus(id, effectiveUserId, effectiveEmail);
          if (bStatus?.has_booking && bStatus?.booking) {
            setExistingBooking(bStatus.booking);
          } else {
            setExistingBooking(null);
          }
        } catch (bErr) {
          console.warn("[StallBookingPage] Booking status check error:", bErr);
        }
      }
    } catch (e) {
      console.error("[StallBookingPage] Failed to fetch full event:", e);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const c = await getCountries();
      setCountries(Array.isArray(c) ? c : []);
    } catch (e) {
      console.error("[StallBookingPage] Countries load error:", e);
    }
  };

  const loadStatesForCountry = async (countryName) => {
    try {
      const targetCountry = countryName || formData.country || "India";
      const match = countries.find(
        (c) => c.country_name?.toLowerCase() === targetCountry.toLowerCase() || c.id?.toLowerCase() === targetCountry.toLowerCase()
      );
      const countryCode = match ? match.id : "IN";
      const s = await getStates(countryCode);
      setStates(Array.isArray(s) ? s : []);
    } catch (e) {
      console.error("[StallBookingPage] States load error:", e);
    }
  };

  const loadCitiesForState = async (stateName, countryName = null) => {
    try {
      const targetCountry = countryName || formData.country || "India";
      const matchCountry = countries.find(
        (c) => c.country_name?.toLowerCase() === targetCountry.toLowerCase() || c.id?.toLowerCase() === targetCountry.toLowerCase()
      );
      const countryCode = matchCountry ? matchCountry.id : "IN";

      let matchState = states.find(
        (s) => s.state_name?.toLowerCase() === (stateName || "").toLowerCase() || s.id?.toLowerCase() === (stateName || "").toLowerCase()
      );

      let stateCode = matchState?.id;
      if (!stateCode && countryCode) {
        const directStates = await getStates(countryCode);
        if (Array.isArray(directStates) && directStates.length > 0) {
          setStates(directStates);
          matchState = directStates.find(
            (s) => s.state_name?.toLowerCase() === (stateName || "").toLowerCase() || s.id?.toLowerCase() === (stateName || "").toLowerCase()
          );
          stateCode = matchState?.id;
        }
      }

      if (countryCode && stateCode) {
        const ci = await getCities(countryCode, stateCode);
        setCities(Array.isArray(ci) ? ci : []);
      }
    } catch (e) {
      console.error("[StallBookingPage] Cities load error:", e);
    }
  };

  // Automatically sync states and cities when countries load or when profile pre-populates country/state
  useEffect(() => {
    if (countries.length > 0) {
      const c = formData.country || "India";
      loadStatesForCountry(c);
      if (formData.state) {
        loadCitiesForState(formData.state, c);
      }
    }
  }, [countries.length, formData.country, formData.state]);

  // ── Extract Event Configuration Attributes ─────────────────
  const eventName = eventData?.event_name || eventData?.event_details?.event_name || eventData?.name || "Exhibition Show";
  const eventStatus = (eventData?.status || eventData?.event_details?.status || "Active").toUpperCase();
  const isConcluded = isEventConcluded(eventData);
  const isSuspended = eventStatus === "SUSPENDED";

  const exhibitorProfile = user?.profiles?.exhibitor || user?.exhibitor_profile;
  const exhibitorKycStatus = (exhibitorProfile?.kyc_status || user?.exhibitor_kyc || user?.kyc_status || "PENDING").toUpperCase();
  const isKycPending = exhibitorKycStatus !== "VERIFIED";

  const startDate = eventData?.start_date || eventData?.event_details?.start_date || "";
  const endDate = eventData?.end_date || eventData?.event_details?.end_date || startDate;
  const venueStr = eventData?.venue || eventData?.event_details?.venue || "Exhibition Center";
  const addressStr = eventData?.address || eventData?.event_details?.address || "";

  // Layout & Stall Specifications
  const layout = eventData?.layout || {};
  const floorType = layout.floor_type || layout.floorType || "Stall";
  const isDayBased = Boolean(layout.day_based || layout.dayBased);
  const personPassCount = parseInt(layout.person_pass || layout.personPass || 2, 10);
  const isTaxIncluded = Boolean(layout.include_tax || layout.includeTax);
  const layoutTaxes = layout.taxes || [];

  const configuredStalls = useMemo(() => {
    return (layout.stalls || eventData?.stalls || []).map((s, idx) => {
      const sQty = parseInt(s.quantity !== undefined ? s.quantity : (s.stallQty !== undefined ? s.stallQty : (s.qty !== undefined ? s.qty : 1)), 10) || 1;
      const sPrice = parseFloat(s.price_inr || s.priceINR || s.price || 0);
      const primePrice = parseFloat(s.prime_price_inr || s.primePriceINR || 0);
      const hasPrime = Boolean(s.prime_seat || s.primeSeat);

      return {
        id: s.id || `stall-type-${idx}`,
        name: s.stall_name || s.stallName || `Stall #${idx + 1}`,
        size: s.stall_size || s.size || s.size_range || "10/10 Feet",
        type: s.stall_type || s.type || "Paid",
        visibility: s.visibility || "Public",
        quantity: sQty,
        priceInr: sPrice,
        hasPrime,
        primePriceInr: primePrice,
        currencyCode: s.currency_code || "INR",
        singleAreaSqFt: s.single_area_sqft || 100
      };
    });
  }, [layout.stalls, eventData?.stalls]);

  const amenitiesList = useMemo(() => {
    return layout.amenities || eventData?.amenities || [];
  }, [layout.amenities, eventData?.amenities]);

  // Selected Stall Object
  const selectedStall = useMemo(() => {
    return configuredStalls.find((s) => s.id === selectedStallId) || configuredStalls[0] || null;
  }, [configuredStalls, selectedStallId]);

  // Calculate Days List
  const eventDays = useMemo(() => {
    if (!startDate) return [];
    try {
      const s = new Date(startDate);
      const e = endDate ? new Date(endDate) : new Date(startDate);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return [];

      const curr = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const finalDate = new Date(e.getFullYear(), e.getMonth(), e.getDate());

      const days = [];
      let idx = 1;
      while (curr <= finalDate) {
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, "0");
        const dd = String(curr.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const weekday = curr.toLocaleDateString("en-US", { weekday: "short" });
        const monthDay = curr.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        days.push({
          dateStr,
          dayNum: idx,
          label: `Day ${idx} • ${weekday}, ${monthDay}`,
          shortLabel: `Day ${idx}`,
        });
        curr.setDate(curr.getDate() + 1);
        idx++;
        if (idx > 60) break;
      }
      return days;
    } catch {
      return [];
    }
  }, [startDate, endDate]);

  // Initialize selected days for day-based
  useEffect(() => {
    if (isDayBased && eventDays.length > 0 && selectedDays.length === 0) {
      setSelectedDays(eventDays.map((d) => d.dateStr));
    }
  }, [isDayBased, eventDays]);

  // ── Pricing Calculations ──────────────────────────────────
  const pricingSummary = useMemo(() => {
    if (!selectedStall) {
      return { basePrice: 0, primeFee: 0, dayMultiplier: 1, subtotal: 0, total: 0 };
    }

    const basePrice = selectedStall.priceInr || 0;
    const primeFee = (isOptPrime && selectedStall.hasPrime) ? (selectedStall.primePriceInr || 0) : 0;
    const unitPrice = basePrice + primeFee;

    const dayMultiplier = (isDayBased && eventDays.length > 1) ? Math.max(1, selectedDays.length) : 1;
    const subtotal = unitPrice * dayMultiplier;

    return {
      basePrice,
      primeFee,
      unitPrice,
      dayMultiplier,
      subtotal,
      total: subtotal
    };
  }, [selectedStall, isOptPrime, isDayBased, eventDays, selectedDays]);

  // ── Handle Inputs ──────────────────────────────────────────
  const handleChange = (e) => {
    let { name, value, type, files } = e.target;
    setErrors({ ...errors, [name]: "" });

    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
      return;
    }

    if (typeof value === "string") {
      if (["email", "mobile", "pinCode"].includes(name)) value = value.replace(/\s/g, "");
      else value = value.trimStart();
    }

    if (["mobile", "pinCode"].includes(name)) {
      if (value !== "" && !/^\d*$/.test(value)) return;
      if (name === "mobile" && value.length > 10) return;
      if (name === "pinCode" && value.length > 6) return;
    }

    if (["firstName", "lastName"].includes(name)) {
      if (value !== "" && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSelectStall = (stallId) => {
    setSelectedStallId(stallId);
    const matched = configuredStalls.find((s) => s.id === stallId);
    if (matched) {
      const desc = `${matched.name} (${matched.size})`;
      setFormData((prev) => ({ ...prev, stallArea: desc }));
      if (!matched.hasPrime) {
        setIsOptPrime(false);
      }
    }
    setErrors((prev) => ({ ...prev, stallArea: "" }));
  };

  // ── Form Submit ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isConcluded) {
      setToast({ message: "This exhibition event has concluded. Stall reservations are closed.", type: "error" });
      return;
    }
    if (isSuspended) {
      setToast({ message: "Stall reservations are currently paused for this event.", type: "error" });
      return;
    }
    if (isKycPending) {
      setToast({
        message: "Stall booking locked: Your Exhibitor business KYC is pending approval. You may book stalls once verified.",
        type: "error"
      });
      return;
    }

    const newErrors = {};
    const required = [
      "firstName", "email", "mobile",
      "companyName", "country", "state", "city",
      "address", "stallArea", "products", "pinCode"
    ];
    const labels = {
      firstName: "First Name", lastName: "Last Name", email: "Email", mobile: "Mobile",
      companyName: "Company Name", country: "Country", state: "State", city: "City",
      address: "Address", stallArea: "Stall Type", products: "Products", pinCode: "Pin Code"
    };

    required.forEach((f) => {
      if (!formData[f]?.toString().trim()) newErrors[f] = `${labels[f]} is required`;
    });

    if (formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }
    if (isDayBased && eventDays.length > 1 && selectedDays.length === 0) {
      newErrors.selectedDays = "Please select at least one day for stall reservation";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({ message: "Please resolve the highlighted form errors before proceeding.", type: "error" });
      return;
    }

    setLoading(true);
    const effectiveUserId = user?.id || getAuthUserId();
    const fd = new FormData();
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
    fd.append("event_id", id);
    if (effectiveUserId) fd.append("user_id", effectiveUserId);
    fd.append("eventName", eventName);

    // Append Reservation Spec details
    const bookingNotes = [
      `[Stall Reserved: ${formData.stallArea}]`,
      selectedStall ? `[Stall Dimensions: ${selectedStall.size}]` : "",
      isOptPrime ? `[Prime Location: YES (+₹${selectedStall?.primePriceInr})]` : "[Prime Location: Standard]",
      `[Estimated Cost: ₹${pricingSummary.total.toLocaleString("en-IN")}]`,
      `[Passes Included: ${personPassCount} Representative Badges]`,
      isDayBased && eventDays.length > 1
        ? `[Days Reserved (${selectedDays.length}/${eventDays.length}): ${selectedDays.join(", ")}]`
        : "[Duration: Full Event]",
      formData.message ? `[Exhibitor Notes]: ${formData.message}` : ""
    ].filter(Boolean).join("\n");

    fd.set("message", bookingNotes);

    try {
      await bookStall(fd);
      setToast({ message: "Stall reservation request submitted successfully! Redirecting to your bookings...", type: "success" });
      setTimeout(() => navigate("/exhibitor/my-bookings"), 2500);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.detail || "Failed to submit stall reservation.";
      setToast({ message: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 select-none font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── BREADCRUMB & IN-FLOW PAGE HEADER ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 border-b border-slate-200/80 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back</span>
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <button
                onClick={() => navigate("/exhibitor/upcoming-events")}
                className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Upcoming Events</span>
              </button>
              <span>/</span>
              <span className="text-slate-800 truncate max-w-[200px]">{eventName}</span>
              <span>/</span>
              <span className="text-slate-800 font-bold">Stall Reservation</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-800 flex items-center gap-2">
              <span>Exhibition Stall Reservation</span>
            </h1>
            <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px] px-2.5 py-0.5 shadow-2xs">
              {eventStatus}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Configure your booth preferences and submit your commercial stall reservation for <span className="font-bold text-slate-800">{eventName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/exhibitor/event/${id}`)}
            className="rounded-xl text-xs font-bold border-slate-200 bg-white text-slate-700 hover:bg-slate-50 gap-1.5 cursor-pointer shadow-2xs"
          >
            <Info size={14} className="text-slate-500" />
            <span>Floor Plan &amp; Specs</span>
          </Button>
        </div>
      </div>

      {/* ── CRITICAL NOTICES ─────────────────────────────────────── */}
      {isConcluded && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-extrabold text-amber-950">Exhibition Concluded: </span>
            <span>This event schedule has ended. Stall bookings are permanently closed.</span>
          </div>
          <Badge className="bg-amber-200 text-amber-900 border-amber-300 font-extrabold text-[10px]">
            Concluded
          </Badge>
        </div>
      )}

      {isSuspended && !isConcluded && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-extrabold text-amber-950">Stall Bookings Paused: </span>
            <span>The organizer has temporarily paused new stall reservations for this expo.</span>
          </div>
          <Badge className="bg-amber-200 text-amber-900 border-amber-300 font-extrabold text-[10px]">
            Paused
          </Badge>
        </div>
      )}

      {/* Exhibitor KYC Pending Warning Banner */}
      {isKycPending && !isConcluded && !isSuspended && (
        <div className="bg-amber-50/90 border border-amber-300/80 p-4 rounded-2xl flex items-center gap-3.5 text-amber-950 shadow-xs">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-extrabold text-amber-950 text-sm">Exhibitor KYC Pending Approval</div>
            <p className="text-amber-800/90 mt-0.5">Your business legal profile is awaiting verification by Super Admin. You can prepare this form, and reservation unlocks once approved.</p>
          </div>
          <Badge className="bg-amber-200/80 text-amber-900 border-amber-300 font-bold text-[10px] px-2.5 py-1">
            KYC Pending
          </Badge>
        </div>
      )}

      {/* ── ALREADY SUBMITTED / PENDING REVIEW STATE ── */}
      {existingBooking && (
        <Card className="border-amber-200 bg-gradient-to-b from-amber-50/70 via-white to-white rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      Stall Reservation Application Already Submitted
                    </h2>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-xs px-2.5 py-0.5 uppercase tracking-wide">
                      {(existingBooking.status || "Pending").toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    You have already applied for a stall at <span className="font-bold text-slate-800">{eventName}</span>. Multiple applications for the same exhibition are not permitted while your application is under review.
                  </p>
                </div>
              </div>
            </div>

            {/* Application Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reserved Stall</span>
                <p className="text-sm font-black text-slate-900">{existingBooking.stall_area || "Standard Booth"}</p>
                <p className="text-[11px] font-medium text-emerald-600">Application Submitted</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company / Exhibitor</span>
                <p className="text-sm font-black text-slate-900">{existingBooking.company_name || formData.companyName || "Your Company"}</p>
                <p className="text-[11px] text-slate-500">{existingBooking.first_name} {existingBooking.last_name} ({existingBooking.designation || "Representative"})</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact & Location</span>
                <p className="text-sm font-black text-slate-900">{existingBooking.email || formData.email}</p>
                <p className="text-[11px] text-slate-500">{[existingBooking.city, existingBooking.state].filter(Boolean).join(", ") || "Location Confirmed"}</p>
              </div>
            </div>

            {/* Notice Alert */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">What happens next?</p>
                <p className="text-amber-800 leading-relaxed">
                  The event organizer is reviewing your booth allocation and credentials. You can track your status, download invoice drafts, or review stall specifications directly from your bookings dashboard. You can also explore all event schedules, floor plans, and amenities on the event details page.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => navigate(`/exhibitor/my-bookings/${existingBooking.id}`)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View My Booking Application</span>
                <ArrowRight size={14} />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/exhibitor/event/${id}`)}
                className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store size={14} className="text-slate-500" />
                <span>View Event Details & Floor Plan</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/exhibitor/upcoming-events")}
                className="w-full sm:w-auto h-11 px-4 rounded-xl text-slate-500 hover:text-slate-800 font-semibold text-xs"
              >
                Browse Other Events
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── CARD 1: EVENT CREATION CONFIGURATION AUDIT BAR ────────── */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1">
              <Sparkles size={11} className="text-slate-500" />
              Organizer Layout &amp; Booth Specifications
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Verified Event Floorplan Specifications
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-700">
              <MapPin size={13} className="text-slate-500" />
              <span>{venueStr} {addressStr ? `• ${addressStr}` : ""}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-700">
              <Calendar size={13} className="text-slate-500" />
              <span>{startDate} {endDate && endDate !== startDate ? `to ${endDate}` : ""}</span>
            </span>
          </div>
        </div>

        {/* Inclusions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Floor Structure</span>
            <div className="font-extrabold text-slate-900 text-sm">{floorType}</div>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Passes Included</span>
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
              <Users size={14} className="text-slate-500" />
              <span>{personPassCount} Staff Passes / Stall</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pricing Schedule</span>
            <div className="font-extrabold text-slate-900 text-sm">
              {isDayBased ? "Day-Based Custom Rate" : "Full Event Duration"}
            </div>
          </div>
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Tax Policy</span>
            <div className="font-extrabold text-slate-900 text-sm">
              {isTaxIncluded ? "Price Includes All Taxes" : (layoutTaxes.length > 0 ? `+ ${layoutTaxes.join(", ")}` : "Exclusive of Taxes")}
            </div>
          </div>
        </div>

        {/* Included Amenities Chips */}
        {amenitiesList.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 mr-1">
              <Layers size={13} className="text-slate-400" />
              Included Booth Provisions:
            </span>
            {amenitiesList.map((am, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1">
                <Check size={12} className="text-slate-500" />
                <span>{am.amenity || am.name}</span>
                <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  x{am.qty || 1}
                </span>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ── FORM CONTAINER (3-COLUMN RESPONSIVE LAYOUT) ──────────── */}
      {!existingBooking && (
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* ════════ COLUMN 1: BOOTH & STALL SELECTION ════════ */}
          <div className="h-full flex flex-col">
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-2xs">
                    <Store className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Step 1: Booth Selection</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Select your preferred stall configuration</p>
                  </div>
                </div>

                {/* Stall Area Shadcn Combobox - matching Country dropdown style */}
                <Field label="Configured Stall Type / Area" required error={errors.stallArea}>
                  {configuredStalls.length > 0 ? (
                    <ShadcnCombobox
                      value={selectedStallId}
                      placeholder="Select Stall Type / Booth"
                      searchPlaceholder="Search stall type or booth..."
                      loading={initialLoading}
                      error={Boolean(errors.stallArea)}
                      options={configuredStalls.map((st) => ({
                        value: st.id,
                        label: `${st.name} (${st.size}) • ₹${st.priceInr.toLocaleString("en-IN")} • [${st.quantity} Units]${st.hasPrime ? " • Prime" : ""}`
                      }))}
                      onValueChange={(val) => handleSelectStall(val)}
                    />
                  ) : (
                    <input
                      name="stallArea"
                      value={formData.stallArea}
                      placeholder="e.g. Stall A-1, 10x10 Feet"
                      onChange={handleChange}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400"
                    />
                  )}
                </Field>

                {/* Selected Stall Detail Specs Card */}
                {selectedStall && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-extrabold text-slate-900">
                      <span className="text-slate-900 font-black">{selectedStall.name}</span>
                      <span className="text-slate-900 text-sm font-black">₹{selectedStall.priceInr.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 font-medium block">Dimensions:</span>
                        <span className="font-bold text-slate-800">{selectedStall.size}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Units Available:</span>
                        <span className="font-bold text-slate-800">{selectedStall.quantity} Units</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Single Area:</span>
                        <span className="font-bold text-slate-800">{selectedStall.singleAreaSqFt} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Badges Included:</span>
                        <span className="font-bold text-slate-800">{personPassCount} Passes</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prime Location Option Card */}
                {selectedStall?.hasPrime && (
                  <div
                    onClick={() => setIsOptPrime(!isOptPrime)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isOptPrime
                        ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-200"
                        : "bg-slate-50 border-slate-200 hover:border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOptPrime ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700"}`}>
                        <Star className={`w-4 h-4 ${isOptPrime ? "fill-white" : ""}`} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">
                          Opt for Prime Location Booth
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Prominent aisle placement (+₹{(selectedStall.primePriceInr || 0).toLocaleString("en-IN")})
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isOptPrime ? "bg-amber-500 border-amber-600 text-white" : "border-slate-300 bg-white"}`}>
                      {isOptPrime && <Check size={13} strokeWidth={3} />}
                    </div>
                  </div>
                )}

                {/* Products to Showcase */}
                <Field label="Exhibiting Products / Offerings" required error={errors.products}>
                  <input
                    name="products"
                    value={formData.products}
                    placeholder="e.g. AI Robotics, Smart Sensors, Cloud Hardware"
                    onChange={handleChange}
                    className={`flex h-11 w-full rounded-xl border bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all ${
                      errors.products ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                </Field>

                {/* Day-Based Booking Schedule Selection */}
                {isDayBased && eventDays.length > 1 && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                        Select Reservation Days ({selectedDays.length}/{eventDays.length})
                        <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedDays.length === eventDays.length) setSelectedDays([]);
                          else setSelectedDays(eventDays.map((d) => d.dateStr));
                        }}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        {selectedDays.length === eventDays.length ? "Deselect All" : "Select All Days"}
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {eventDays.map((d) => {
                        const isChecked = selectedDays.includes(d.dateStr);
                        return (
                          <label
                            key={d.dateStr}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                              isChecked
                                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) setSelectedDays(selectedDays.filter((s) => s !== d.dateStr));
                                  else setSelectedDays([...selectedDays, d.dateStr]);
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
                              />
                              <span className="text-[11px]">{d.label}</span>
                            </span>
                            {isChecked && (
                              <span className="text-[9px] font-black bg-white/25 px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
                                Included
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    {errors.selectedDays && (
                      <span className="text-[10px] text-rose-500 font-bold block">{errors.selectedDays}</span>
                    )}
                    <p className="text-[10px] text-slate-500 leading-tight">
                      This expo uses day-based stall pricing. Daily rate is multiplied by the number of selected days.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ════════ COLUMN 2: REPRESENTATIVE & COMPANY DETAILS ════════ */}
          <div className="h-full flex flex-col">
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-2xs">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Step 2: Exhibitor Info</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Authorised representative &amp; company</p>
                  </div>
                </div>

                {/* Title + First Name + Last Name */}
                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-4">
                    <Field label="Title">
                      <ShadcnSelect
                        value={formData.title}
                        onValueChange={(val) => setFormData({ ...formData, title: val })}
                        placeholder="Title"
                        align="left"
                        options={[
                          { value: "Mr.", label: "Mr." },
                          { value: "Ms.", label: "Ms." },
                          { value: "Mrs.", label: "Mrs." },
                          { value: "Dr.", label: "Dr." }
                        ]}
                      />
                    </Field>
                  </div>
                  <div className="col-span-8">
                    <Field label="First Name" required error={errors.firstName}>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        placeholder="e.g. Robert"
                        onChange={handleChange}
                        className={`flex h-11 w-full rounded-xl border bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all ${
                          errors.firstName ? "border-rose-400" : "border-slate-200"
                        }`}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Last Name (Optional)" error={errors.lastName}>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    placeholder="e.g. Vance"
                    onChange={handleChange}
                    className={`flex h-11 w-full rounded-xl border bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all ${
                      errors.lastName ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                </Field>

                {/* Email + Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Work Email" required error={errors.email}>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      placeholder="name@company.com"
                      onChange={handleChange}
                      className={`flex h-11 w-full rounded-xl border bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all ${
                        errors.email ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                  </Field>

                  <Field label="Mobile Number" required error={errors.mobile}>
                    <input
                      name="mobile"
                      value={formData.mobile}
                      placeholder="10-digit mobile"
                      maxLength="10"
                      onChange={handleChange}
                      className={`flex h-11 w-full rounded-xl border bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all ${
                        errors.mobile ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                  </Field>
                </div>

                {/* Company + Designation */}
                <Field label="Company / Entity Name" required error={errors.companyName}>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="companyName"
                      value={formData.companyName}
                      placeholder="e.g. TechCorp Solutions Pvt Ltd"
                      onChange={handleChange}
                      className={`flex h-11 w-full rounded-xl border bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all ${
                        errors.companyName ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                  </div>
                </Field>

                <Field label="Designation">
                  <input
                    name="designation"
                    value={formData.designation}
                    placeholder="e.g. Head of Business Development"
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400"
                  />
                </Field>

                {/* Company Type + Website in a clean 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Company Type">
                    <Select
                      value={formData.companyType}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, companyType: val }))}
                    >
                      <SelectTrigger className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 font-semibold cursor-pointer">
                        <SelectValue placeholder="Select Company Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Private Limited">Private Limited</SelectItem>
                        <SelectItem value="LLP">LLP</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="Public Limited">Public Limited</SelectItem>
                        <SelectItem value="Other / Startup">Other / Startup</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Company Website">
                    <input
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      placeholder="https://company.com"
                      onChange={handleChange}
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400"
                    />
                  </Field>
                </div>

                {/* Special Message / Requirements */}
                <Field label="Special Requirements / Inquiries">
                  <textarea
                    name="message"
                    value={formData.message}
                    rows={2}
                    maxLength={150}
                    placeholder="e.g. Specific electrical power phase, booth corner preference..."
                    onChange={handleChange}
                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 resize-none"
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* ════════ COLUMN 3: ADDRESS & ATTACHMENTS ════════ */}
          <div className="h-full flex flex-col">
            <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-2xs">
                    <MapPin className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Step 3: Company Location</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Billing address &amp; validation</p>
                  </div>
                </div>

                {/* Country Shadcn Combobox */}
                <Field label="Country" required error={errors.country}>
                  <ShadcnCombobox
                    value={formData.country}
                    placeholder="Select Country"
                    searchPlaceholder="Search country..."
                    loading={countries.length === 0}
                    error={Boolean(errors.country)}
                    align="full"
                    options={countries.map((c) => ({
                      value: c.country_name,
                      label: c.country_name,
                      id: c.id
                    }))}
                    onValueChange={(val) => {
                      setFormData((p) => ({ ...p, country: val, state: "", city: "" }));
                      setErrors((p) => ({ ...p, country: "" }));
                      loadStatesForCountry(val);
                    }}
                  />
                </Field>

                {/* State & City Shadcn Comboboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="State" required error={errors.state}>
                    <ShadcnCombobox
                      value={formData.state}
                      placeholder={!formData.country ? "Select Country first" : "Select State"}
                      searchPlaceholder="Search state..."
                      disabled={!formData.country}
                      error={Boolean(errors.state)}
                      align="left"
                      options={states.map((s) => ({
                        value: s.state_name,
                        label: s.state_name,
                        id: s.id
                      }))}
                      onValueChange={(val) => {
                        setFormData((p) => ({ ...p, state: val, city: "" }));
                        setErrors((p) => ({ ...p, state: "" }));
                        loadCitiesForState(val, formData.country);
                      }}
                    />
                  </Field>

                  <Field label="City" required error={errors.city}>
                    <ShadcnCombobox
                      value={formData.city}
                      placeholder={!formData.state ? "Select State first" : "Select City"}
                      searchPlaceholder="Search city..."
                      disabled={!formData.state}
                      error={Boolean(errors.city)}
                      align="right"
                      options={cities.map((ci) => ({
                        value: ci.city_name,
                        label: ci.city_name,
                        id: ci.id
                      }))}
                      onValueChange={(val) => {
                        setFormData((p) => ({ ...p, city: val }));
                        setErrors((p) => ({ ...p, city: "" }));
                      }}
                    />
                  </Field>
                </div>

                {/* Pin Code + Address */}
                <Field label="Postal Pin Code" required error={errors.pinCode}>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="pinCode"
                      value={formData.pinCode}
                      placeholder="6-digit PIN"
                      maxLength="6"
                      onChange={handleChange}
                      className={`flex h-11 w-full rounded-xl border bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all ${
                        errors.pinCode ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                  </div>
                </Field>

                <Field label="Full Street Address" required error={errors.address}>
                  <textarea
                    name="address"
                    value={formData.address}
                    rows={2}
                    maxLength={100}
                    placeholder="Building, street, tech park area..."
                    onChange={handleChange}
                    className={`flex w-full rounded-xl border bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 resize-none transition-all ${
                      errors.address ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                </Field>

                {/* Visiting Card Upload */}
                <Field label="Business Visiting Card (Optional)">
                  <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300 cursor-pointer transition-all group">
                    <input type="file" name="visitingCard" onChange={handleChange} className="hidden" accept="image/*,.pdf" />
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-slate-600 mb-1 transition-colors" />
                    <span className="text-[11px] text-slate-600 font-bold group-hover:text-slate-800">
                      {formData.visitingCard ? formData.visitingCard.name : "Click to attach visiting card"}
                    </span>
                    {!formData.visitingCard && <span className="text-[9px] text-slate-400">PNG, JPG, PDF (Max 5MB)</span>}
                  </label>
                </Field>
              </div>
            </Card>
          </div>

        </div>

        {/* ── FULL-WIDTH RESERVATION SUMMARY & ACTION CARD ───────── */}
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Section: Live Pricing Calculation & Inclusions */}
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-slate-600" />
                  <span>Reservation Order Summary</span>
                </span>
                <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                  {personPassCount} Passes Included
                </Badge>
                {isDayBased && (
                  <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                    Day-Based Schedule
                  </Badge>
                )}
              </div>

              {/* Horizontal Breakdown Badges / Pill Grid */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Base Stall:</span>
                  <span className="font-bold text-slate-900">₹{pricingSummary.basePrice.toLocaleString("en-IN")}</span>
                </div>

                {isOptPrime && selectedStall?.hasPrime && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-center gap-1.5 font-bold">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    <span>Prime Surcharge: +₹{pricingSummary.primeFee.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {isDayBased && eventDays.length > 1 && (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Duration:</span>
                    <span className="font-bold text-slate-900">{pricingSummary.dayMultiplier} Days</span>
                  </div>
                )}

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Tax Policy:</span>
                  <span className="font-bold text-slate-800">{isTaxIncluded ? "Taxes Included" : "GST at Checkout"}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">
                Formal commercial GST tax invoice will be issued upon organizer approval and booking confirmation.
              </p>
            </div>

            {/* Right Section: Total Payable Estimate & Action CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:border-l lg:border-slate-100 lg:pl-6 shrink-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Payable Estimate</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{pricingSummary.total.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="h-12 px-4 rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer shadow-2xs flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading || isSuspended || isConcluded || isKycPending}
                  className={`h-12 px-6 rounded-xl text-white font-black text-xs sm:text-sm border-none cursor-pointer flex items-center justify-center gap-2 transition-all transform active:scale-98 shadow-md flex-1 sm:flex-initial ${
                    isKycPending
                      ? "bg-amber-600 hover:bg-amber-600 cursor-not-allowed opacity-90 shadow-amber-600/20"
                      : isConcluded || isSuspended
                      ? "bg-slate-400 cursor-not-allowed opacity-75"
                      : "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-500 hover:to-green-500 shadow-emerald-600/25"
                  }`}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Reservation…</>
                  ) : isConcluded ? (
                    <><AlertCircle className="w-4 h-4" /> Event Concluded</>
                  ) : isSuspended ? (
                    <><AlertCircle className="w-4 h-4" /> Bookings Paused</>
                  ) : isKycPending ? (
                    <><AlertTriangle className="w-4 h-4" /> KYC Pending Verification</>
                  ) : (
                    <><Send className="w-4 h-4" /> Confirm Stall Reservation</>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </Card>
      </form>
      )}
    </div>
  );
}