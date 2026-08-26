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
    setFormData((prev) => ({ ...prev, booking: { ...prev.booking, [field]: value } }));
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
    return new Date(str.split("/").reverse().join("-"));
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

        {/* Booking Date Range */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Booking Period <span className="text-red-500">*</span>
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
          </div>
        </div>

        {/* Pass Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Pass Type</label>
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
            {["Single Pass", "Group Pass"].map((opt) => (
              <label key={opt} className="flex-1 cursor-pointer">
                <input type="radio" name="passType" value={opt} className="hidden peer"
                  checked={formData.booking?.passType === opt}
                  onChange={(e) => updateBooking("passType", e.target.value)} />
                <div className="text-center py-2 rounded-xl text-xs font-bold transition-all
                  peer-checked:bg-white peer-checked:text-cyan-700 peer-checked:shadow-sm text-slate-500">
                  {opt}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Ticket Field Customization (Single Pass only) */}
        {formData.booking?.passType === "Single Pass" && (
          <div className="p-3 bg-cyan-50/40 rounded-xl border border-cyan-100 space-y-2">
            <span className="text-[11px] font-extrabold text-cyan-900">Ticket Field Customization</span>
            {[
              { id: "title", label: "Title", type: "titleType", selection: "titleSelection" },
              { id: "designation", label: "Designation", type: "designationType", selection: "designationSelection" },
              { id: "company", label: "Company", type: "companyType", selection: "companySelection" },
            ].map((field) => (
              <div key={field.id} className="flex items-center gap-2">
                <input name={field.id} placeholder={field.label}
                  value={formData.booking?.[field.id] || ""}
                  onChange={(e) => updateBooking(field.id, e.target.value)}
                  className="flex-1 h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                  {["Editable", "Selection"].map((mode) => (
                    <label key={mode} className="cursor-pointer">
                      <input type="radio" name={field.type} value={mode} className="hidden peer"
                        checked={formData.booking?.[field.type] === mode}
                        onChange={(e) => updateBooking(field.type, e.target.value)} />
                      <div className="px-2 py-1 rounded-md text-[9px] font-bold uppercase text-slate-400
                        peer-checked:bg-cyan-600 peer-checked:text-white transition-all">
                        {mode}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entry Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Entry Type</label>
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
            {["Single Entry", "Multi Entry"].map((opt) => (
              <label key={opt} className="flex-1 cursor-pointer">
                <input type="radio" name="entryType" value={opt} className="hidden peer"
                  checked={formData.booking?.entryType === opt}
                  onChange={(e) => updateBooking("entryType", e.target.value)} />
                <div className="text-center py-2 rounded-xl text-xs font-bold transition-all
                  peer-checked:bg-white peer-checked:text-cyan-700 peer-checked:shadow-sm text-slate-500">
                  {opt}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Pricing & Payment ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Pricing & Payment</h3>
        </div>

        {/* Razorpay Key */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay API Key</label>
          <input name="razorpayKey" placeholder="rzp_live_..."
            value={formData.booking?.razorpayKey || ""}
            onChange={(e) => updateBooking("razorpayKey", e.target.value)}
            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Paid-only section */}
        {isPaid && (
          <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* Price Type Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price Type</label>
              <div className="flex border-b border-slate-200">
                <button type="button"
                  onClick={() => { updateBooking("priceType", "National"); updateBooking("currency", "Indian Rupee - INR (₹)"); }}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all border-none bg-transparent cursor-pointer ${
                    formData.booking?.priceType === "National" ? "text-cyan-700 border-b-cyan-600" : "text-slate-400 border-b-transparent"
                  }`}>
                  National
                </button>
                {formData.eventDetails?.isInternationalInclude && (
                  <button type="button"
                    onClick={() => { updateBooking("priceType", "International"); updateBooking("currency", "US Dollar - USD ($)"); }}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all border-none bg-transparent cursor-pointer ${
                      formData.booking?.priceType === "International" ? "text-cyan-700 border-b-cyan-600" : "text-slate-400 border-b-transparent"
                    }`}>
                    International
                  </button>
                )}
              </div>
            </div>

            {/* Currency Dropdown */}
            <div className="relative" ref={currencyDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
              <div onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between cursor-pointer text-sm">
                <span className="truncate text-slate-700 text-xs font-medium">
                  {formData.booking?.currency || "Select Currency"}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCurrencyDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              {isCurrencyDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <input type="text" value={currencySearch} onChange={(e) => setCurrencySearch(e.target.value)}
                      placeholder="Search..." className="w-full h-7 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs outline-none" />
                  </div>
                  <div className="max-h-36 overflow-y-auto">
                    {currencyOptions.filter((c) => c.toLowerCase().includes(currencySearch.toLowerCase())).map((cur) => (
                      <div key={cur}
                        onClick={() => { updateBooking("currency", cur); setIsCurrencyDropdownOpen(false); setCurrencySearch(""); }}
                        className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                          formData.booking?.currency === cur ? "bg-indigo-50 text-indigo-900 font-bold" : "text-slate-700 hover:bg-slate-50"
                        }`}>
                        {cur}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Include Tax */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="includeTax"
                checked={formData.booking?.includeTax || false}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-xs font-bold text-slate-700">Include GST/Tax</span>
            </label>

            {/* Tax Selector */}
            {formData.booking?.includeTax && (
              <div className="relative" ref={taxDropdownRef}>
                <div onClick={() => setIsTaxDropdownOpen(!isTaxDropdownOpen)}
                  className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 flex items-center justify-between cursor-pointer text-xs">
                  <span className="truncate text-slate-600 font-medium">
                    {(formData.booking?.taxes || []).length > 0 ? (formData.booking.taxes).join(", ") : "Select Tax Types"}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
                {isTaxDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                      <input type="text" value={taxSearch} onChange={(e) => setTaxSearch(e.target.value)}
                        placeholder="Search tax..." className="flex-1 h-7 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs outline-none" />
                      <button type="button" onClick={() => { setIsTaxDropdownOpen(false); setTaxSearch(""); }}
                        className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto">
                      {taxOptions.filter((t) => t.toLowerCase().includes(taxSearch.toLowerCase())).map((tax) => (
                        <label key={tax} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-indigo-50 text-xs">
                          <input type="checkbox"
                            checked={(formData.booking?.taxes || []).includes(tax)}
                            onChange={() => handleTaxToggle(tax)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600"
                          />
                          <span className="text-slate-700 font-medium">{tax}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Early Bird */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Early Bird Expiry</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">Date</span>
                  <DatePicker
                    selected={parseDateStr(formData.booking?.earlyBirdExpireDate)}
                    onChange={(date) => {
                      if (!date) { updateBooking("earlyBirdExpireDate", ""); return; }
                      updateBooking("earlyBirdExpireDate", formatDate(date));
                    }}
                    minDate={new Date()}
                    maxDate={parseDateStr(formData.booking?.bookingEndDate) || eventMaxDate || undefined}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Expire Date"
                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    wrapperClassName="w-full"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 mb-0.5 block">Time</span>
                  <CustomTimePicker
                    value={formData.booking?.earlyBirdExpireTime || ""}
                    hasError={false}
                    onChange={(v) => updateBooking("earlyBirdExpireTime", v)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2TicketsPricing;
