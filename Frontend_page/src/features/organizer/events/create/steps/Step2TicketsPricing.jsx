import React, { useState, useEffect, useRef } from "react";
import { Ticket, CreditCard, Search, ChevronDown, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomTimePicker from "../TimePickerClock";

const Step2TicketsPricing = ({ formData, setFormData, showErrors }) => {
  const [isTaxDropdownOpen, setIsTaxDropdownOpen] = useState(false);
  const [taxSearch, setTaxSearch] = useState("");
  const taxDropdownRef = useRef(null);

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const currencyDropdownRef = useRef(null);

  const isPaid = formData.booking?.chargeType === "Paid";

  const currencyOptions = [
    "Indian Rupee - INR (₹)", "US Dollar - USD ($)", "Euro - EUR (€)",
    "British Pound - GBP (£)", "Australian Dollar - AUD (A$)", "Canadian Dollar - CAD (C$)",
    "Japanese Yen - JPY (¥)", "Singapore Dollar - SGD (S$)", "Swiss Franc - CHF (CHF)",
  ];

  const taxOptions = ["Ticket - CGST", "Ticket - SGST", "Ticket - IGST", "Food - GST"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (taxDropdownRef.current && !taxDropdownRef.current.contains(e.target)) setIsTaxDropdownOpen(false);
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target)) setIsCurrencyDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set booking defaults
  useEffect(() => {
    setFormData((prev) => {
      const b = { ...(prev.booking || {}) };
      let changed = false;
      if (b.passType === undefined) { b.passType = "Single Pass"; changed = true; }
      if (b.entryType === undefined) { b.entryType = "Single Entry"; changed = true; }
      if (b.titleType === undefined) { b.titleType = "Editable"; changed = true; }
      if (b.designationType === undefined) { b.designationType = "Editable"; changed = true; }
      if (b.companyType === undefined) { b.companyType = "Editable"; changed = true; }
      if (b.chargeType === undefined) { b.chargeType = "Free"; changed = true; }
      return changed ? { ...prev, booking: b } : prev;
    });
  }, [setFormData]);

  // Sync booking dates from event dates
  useEffect(() => {
    const eventStart = formData.eventDetails?.startDate;
    const eventEnd = formData.eventDetails?.endDate;
    if (eventStart || eventEnd) {
      setFormData((prev) => {
        const nb = { ...(prev.booking || {}) };
        let updated = false;
        const expectedStart = eventStart ? eventStart.split("-").reverse().join("/") : "";
        const expectedEnd = eventEnd ? eventEnd.split("-").reverse().join("/") : "";
        if (expectedStart && (!nb.bookingStartDate || nb._lastEventStart !== eventStart)) {
          nb.bookingStartDate = expectedStart; nb._lastEventStart = eventStart; updated = true;
        }
        if (expectedEnd && (!nb.bookingEndDate || nb._lastEventEnd !== eventEnd)) {
          nb.bookingEndDate = expectedEnd; nb._lastEventEnd = eventEnd; updated = true;
        }
        return updated ? { ...prev, booking: nb } : prev;
      });
    }
  }, [formData.eventDetails?.startDate, formData.eventDetails?.endDate, setFormData]);

  // Combine early bird date+time into ISO
  useEffect(() => {
    if (formData.booking?.earlyBirdExpireDate && formData.booking?.earlyBirdExpireTime) {
      const dp = formData.booking.earlyBirdExpireDate.split("/");
      if (dp.length === 3) {
        const yyyymmdd = `${dp[2]}-${dp[1]}-${dp[0]}`;
        let [time, mod] = formData.booking.earlyBirdExpireTime.split(" ");
        let [hrs, mins] = time.split(":");
        if (hrs === "12") hrs = "00";
        if (mod === "PM") hrs = parseInt(hrs, 10) + 12;
        const combined = `${yyyymmdd}T${String(hrs).padStart(2, "0")}:${mins}`;
        if (formData.booking.earlyBirdExpire !== combined) {
          setFormData((prev) => ({ ...prev, booking: { ...prev.booking, earlyBirdExpire: combined } }));
        }
      }
    }
  }, [formData.booking?.earlyBirdExpireDate, formData.booking?.earlyBirdExpireTime]);

  const updateBooking = (field, value) => {
    setFormData((prev) => {
      const updated = { ...(prev.booking || {}), [field]: value };
      if (field === "totalCapacity" || field === "capacity") {
        updated.capacity = value;
        updated.totalCapacity = value;
        updated.total_capacity = value;
      }
      if (field === "maxPerUser" || field === "maxPass") {
        updated.maxPass = value;
        updated.maxPerUser = value;
        updated.max_pass = value;
      }
      if (field === "price" || field === "priceINR" || field === "price_inr") {
        updated.price = value;
        updated.priceINR = value;
        updated.price_inr = value;
      }
      return { ...prev, booking: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "includeTax" && !checked) {
      setIsTaxDropdownOpen(false);
      setTaxSearch("");
    }
    updateBooking(name, type === "checkbox" ? checked : value);
    if (name === "includeTax" && !checked) {
      updateBooking("taxes", []);
    }
  };

  const handleTaxToggle = (tax) => {
    const current = formData.booking?.taxes || [];
    const next = current.includes(tax) ? current.filter((t) => t !== tax) : [...current, tax];
    updateBooking("taxes", next);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const parseDateStr = (str) => {
    if (!str) return null;
    if (typeof str === "string" && str.includes("-")) {
      const parts = str.split("-");
      if (parts[0].length === 4) return new Date(str);
      return new Date(parts.reverse().join("-"));
    }
    if (typeof str === "string" && str.includes("/")) {
      const parts = str.split("/");
      if (parts[2]?.length === 4) return new Date(parts.reverse().join("-"));
    }
    return new Date(str);
  };

  const eventStartDate = formData.eventDetails?.startDate ? new Date(formData.eventDetails.startDate) : null;
  const eventMaxDate = formData.eventDetails?.endDate ? new Date(formData.eventDetails.endDate) : eventStartDate;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ─── LEFT: Booking Config ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-50 rounded-lg">
            <Ticket className="w-4 h-4 text-cyan-600" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Booking Configuration</h3>
        </div>

        {/* Booking Date & Time Range */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Booking Period & Times <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">Start Date</span>
              <DatePicker
                selected={parseDateStr(formData.booking?.bookingStartDate)}
                onChange={(date) => updateBooking("bookingStartDate", formatDate(date))}
                openToDate={eventStartDate || new Date()}
                minDate={new Date()}
                maxDate={eventMaxDate || undefined}
                dateFormat="dd/MM/yyyy"
                placeholderText="Start Date"
                className={`w-full h-9 bg-slate-50 border rounded-lg px-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer ${
                  showErrors && !formData.booking?.bookingStartDate ? "border-red-400" : "border-slate-200"
                }`}
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">End Date</span>
              <DatePicker
                selected={parseDateStr(formData.booking?.bookingEndDate)}
                onChange={(date) => updateBooking("bookingEndDate", formatDate(date))}
                openToDate={eventMaxDate || new Date()}
                minDate={parseDateStr(formData.booking?.bookingStartDate) || new Date()}
                maxDate={eventMaxDate || undefined}
                dateFormat="dd/MM/yyyy"
                placeholderText="End Date"
                className={`w-full h-9 bg-slate-50 border rounded-lg px-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer ${
                  showErrors && !formData.booking?.bookingEndDate ? "border-red-400" : "border-slate-200"
                }`}
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">Booking Start Time (24h/12h)</span>
              <CustomTimePicker
                value={formData.booking?.bookingStartTime || "12:00 AM"}
                onChange={(val) => updateBooking("bookingStartTime", val)}
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">Booking End Time (Max {formData.eventDetails?.startTime || "06:00 PM"})</span>
              <CustomTimePicker
                value={formData.booking?.bookingEndTime || formData.eventDetails?.startTime || "06:00 PM"}
                onChange={(val) => {
                  const eventStartTime = formData.eventDetails?.startTime || "06:00 PM";
                  const eventStartDateStr = formData.eventDetails?.startDate || "";
                  const bookingEndDateStr = formData.booking?.bookingEndDate || "";
                  const normBookingEnd = bookingEndDateStr ? bookingEndDateStr.split("/").reverse().join("-") : "";

                  // Format times to 24h for comparison
                  const to24 = (t) => {
                    if (!t) return "00:00";
                    const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
                    if (!m) return t;
                    let h = parseInt(m[1], 10);
                    if (m[3]?.toUpperCase() === "PM" && h < 12) h += 12;
                    if (m[3]?.toUpperCase() === "AM" && h === 12) h = 0;
                    return `${h.toString().padStart(2, "0")}:${m[2]}`;
                  };

                  const event24 = to24(eventStartTime);
                  const selected24 = to24(val);

                  if (normBookingEnd && eventStartDateStr && normBookingEnd === eventStartDateStr && selected24 > event24) {
                    // Cap at eventStartTime if user tries to set time past event start
                    updateBooking("bookingEndTime", eventStartTime);
                  } else {
                    updateBooking("bookingEndTime", val);
                  }
                }}
              />
            </div>
          </div>
          <p className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 p-2 rounded-lg mt-2 border border-cyan-200/60 leading-tight">
            ℹ️ <strong>Booking Time Rule:</strong> Bookings start at 12:00 AM (00:00) on Start Date and MUST end on or before Event Start Time ({formData.eventDetails?.startTime || "06:00 PM"}) on {formData.eventDetails?.startDate || "Event Date"}.
          </p>
        </div>

        {/* Pass Type Redesign */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Pass Type</label>
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
            {["Single Pass", "Group Pass"].map((opt) => (
              <label key={opt} className="flex-1 cursor-pointer">
                <input type="radio" name="passType" value={opt} className="hidden peer"
                  checked={(formData.booking?.passType || "Single Pass") === opt}
                  onChange={(e) => updateBooking("passType", e.target.value)} />
                <div className="text-center py-2 rounded-xl text-xs font-bold transition-all
                  peer-checked:bg-white peer-checked:text-cyan-700 peer-checked:shadow-sm text-slate-500">
                  {opt}
                </div>
              </label>
            ))}
          </div>

          {/* If Group Pass selected, show Group Member Limit input */}
          {formData.booking?.passType === "Group Pass" && (
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-cyan-900">
                  Group Member Limit (Per Pass) <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-cyan-700">Max headcount per ticket</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  max="50"
                  name="groupMemberLimit"
                  placeholder="e.g. 5 members"
                  value={formData.booking?.groupMemberLimit || "5"}
                  onChange={(e) => updateBooking("groupMemberLimit", e.target.value)}
                  className="w-full h-9 bg-white border border-cyan-300 rounded-lg px-3 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <p className="text-[10px] text-cyan-800 font-medium leading-tight">
                👥 <strong>Group Pass Rule:</strong> 1 purchase grants gate access for up to {formData.booking?.groupMemberLimit || 5} members under 1 master QR pass.
              </p>
            </div>
          )}
        </div>

        {/* Entry Type Redesign */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Entry Type</label>
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
            {["Single Entry", "Multi Entry"].map((opt) => (
              <label key={opt} className="flex-1 cursor-pointer">
                <input type="radio" name="entryType" value={opt} className="hidden peer"
                  checked={(formData.booking?.entryType || "Single Entry") === opt}
                  onChange={(e) => updateBooking("entryType", e.target.value)} />
                <div className="text-center py-2 rounded-xl text-xs font-bold transition-all
                  peer-checked:bg-white peer-checked:text-cyan-700 peer-checked:shadow-sm text-slate-500">
                  {opt}
                </div>
              </label>
            ))}
          </div>

          {/* If Multi Entry selected, show Re-entry Scan Tracking Options */}
          {formData.booking?.entryType === "Multi Entry" && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-purple-900">
                  Multi-Entry Scan Tracking & Limit
                </label>
                <span className="text-[10px] font-bold text-purple-700">Gate re-entry counter</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  name="maxReentries"
                  value={formData.booking?.maxReentries || "Unlimited"}
                  onChange={(e) => updateBooking("maxReentries", e.target.value)}
                  className="w-full h-9 bg-white border border-purple-300 rounded-lg px-3 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="Unlimited">Unlimited Re-entries (tracked with timestamps)</option>
                  <option value="2">Max 2 Scans (1 Exit + 1 Re-entry)</option>
                  <option value="3">Max 3 Scans per Day</option>
                  <option value="5">Max 5 Scans per Event</option>
                </select>
              </div>
              <p className="text-[10px] text-purple-800 font-medium leading-tight">
                📲 <strong>Gate Tracking:</strong> Every entry scan is logged with live timestamps. Gate Scanner staff will see real-time counter: <em>"Scan #3 Logged"</em>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Pricing & Payment ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Pricing & Payment</h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            {formData.booking?.chargeType || "Free"}
          </span>
        </div>

        {/* Charge Type Radio Selection */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Event Access Pricing Model</label>
            <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200">
              {["Free", "Paid"].map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    type="radio"
                    name="chargeType"
                    value={type}
                    className="hidden peer"
                    checked={(formData.booking?.chargeType || "Free") === type}
                    onChange={(e) => updateBooking("chargeType", e.target.value)}
                  />
                  <div className="text-center py-2 rounded-lg text-xs font-extrabold transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 peer-checked:text-white text-slate-500 hover:text-slate-900">
                    {type === "Free" ? "🎟️ Free Entry Pass" : "💳 Paid Ticket Pass"}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* If FREE Event */}
          {!isPaid && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Pass Capacity / Seat Limit</label>
                <input
                  type="number"
                  name="totalCapacity"
                  placeholder="e.g. 500 Total Passes"
                  value={formData.booking?.totalCapacity || ""}
                  onChange={(e) => updateBooking("totalCapacity", e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Passes Per Booking</label>
                <select
                  name="maxPerUser"
                  value={formData.booking?.maxPerUser || "5"}
                  onChange={(e) => updateBooking("maxPerUser", e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="1">1 Pass per attendee</option>
                  <option value="2">2 Passes per attendee</option>
                  <option value="5">5 Passes per attendee</option>
                  <option value="10">10 Passes per attendee</option>
                  <option value="unlimited">Unlimited Passes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">RSVP Issuance Approval</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "Instant", label: "Instant Entry Pass" },
                    { id: "Approval", label: "Organizer Approval" },
                  ].map((mode) => (
                    <label key={mode.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="approvalMode"
                        value={mode.id}
                        className="hidden peer"
                        checked={(formData.booking?.approvalMode || "Instant") === mode.id}
                        onChange={(e) => updateBooking("approvalMode", e.target.value)}
                      />
                      <div className="p-2 rounded-xl border border-slate-200 text-center text-[10px] font-bold text-slate-600 peer-checked:border-cyan-500 peer-checked:bg-cyan-50 peer-checked:text-cyan-800 transition-all">
                        {mode.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* If PAID Event */}
          {isPaid && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Price Amount *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-black text-slate-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    placeholder="499"
                    value={formData.booking?.price || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateBooking("price", val);
                      updateBooking("priceINR", val);
                      updateBooking("price_inr", val);
                    }}
                    className="w-full h-9 bg-white border border-slate-200 rounded-xl pl-7 pr-3 text-xs font-extrabold outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Pass Quantity Available</label>
                <input
                  type="number"
                  name="totalCapacity"
                  placeholder="e.g. 1000 Passes"
                  value={formData.booking?.totalCapacity || ""}
                  onChange={(e) => updateBooking("totalCapacity", e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 rounded-xl px-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Price Type Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price Tier</label>
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => { updateBooking("priceType", "National"); updateBooking("currency", "Indian Rupee - INR (₹)"); }}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all border-none bg-transparent cursor-pointer ${
                      (formData.booking?.priceType || "National") === "National" ? "text-cyan-700 border-b-cyan-600" : "text-slate-400 border-b-transparent"
                    }`}
                  >
                    National (INR)
                  </button>
                  {formData.eventDetails?.isInternationalInclude && (
                    <button
                      type="button"
                      onClick={() => { updateBooking("priceType", "International"); updateBooking("currency", "US Dollar - USD ($)"); }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all border-none bg-transparent cursor-pointer ${
                        formData.booking?.priceType === "International" ? "text-cyan-700 border-b-cyan-600" : "text-slate-400 border-b-transparent"
                      }`}
                    >
                      International (USD)
                    </button>
                  )}
                </div>
              </div>

              {/* Include Tax Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="includeTax"
                  checked={formData.booking?.includeTax || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-xs font-bold text-slate-700">Include GST / Taxes (18%)</span>
              </label>

              {/* Refund Policy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refund & Cancellation Terms</label>
                <select
                  name="refundPolicy"
                  value={formData.booking?.refundPolicy || "Standard"}
                  onChange={(e) => updateBooking("refundPolicy", e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 rounded-xl px-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="Standard">100% Refund until 48 hrs before event</option>
                  <option value="Strict">50% Refund until 7 days before event</option>
                  <option value="NoRefund">Non-Refundable Ticket</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2TicketsPricing;
