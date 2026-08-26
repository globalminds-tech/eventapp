import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X } from "lucide-react";
import CustomTimePicker from "../TimePickerClock";

const EarlyBirdDateCustomInput = React.forwardRef(({ value, onClick, placeholder, hasError }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className={`w-full bg-white border rounded-xl shadow-sm flex items-center justify-between cursor-pointer overflow-hidden h-14 ${hasError ? "border-red-500" : "border-gray-200"
      }`}
  >
    <span className={`px-4 text-sm font-medium ${value ? 'text-gray-700' : 'text-gray-400'}`}>
      {value || placeholder || "Select Date"}
    </span>
    <div className="h-full w-14 bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
      <Calendar size={20} />
    </div>
  </div>
));

const Step2Booking = ({ formData, setFormData, showStep2Errors }) => {
  const [taxSearch, setTaxSearch] = useState("");
  const [isTaxDropdownOpen, setIsTaxDropdownOpen] = useState(false);
  const taxDropdownRef = useRef(null);

  const [currencySearch, setCurrencySearch] = useState("");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef(null);

  const eventStartDate = formData.eventDetails?.startDate
    ? new Date(formData.eventDetails.startDate)
    : null;

  const eventMaxDate = formData.eventDetails?.endDate
    ? new Date(formData.eventDetails.endDate)
    : eventStartDate;

  const todayLocal = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split("T")[0];

  const earlyBirdMaxDate = formData.booking?.bookingEndDate
    ? formData.booking.bookingEndDate.split("/").reverse().join("-")
    : formData.eventDetails?.endDate || "";

  const earlyBirdDateValue = formData.booking?.earlyBirdExpireDate
    ? formData.booking.earlyBirdExpireDate.split("/").reverse().join("-")
    : "";

  const handleEarlyBirdDateChange = (e) => {
    const value = e.target.value; // YYYY-MM-DD
    if (!value) {
      setFormData(prev => ({
        ...prev,
        booking: {
          ...prev.booking,
          earlyBirdExpireDate: "",
        }
      }));
      return;
    }

    // Convert YYYY-MM-DD to DD/MM/YYYY
    const parts = value.split("-");
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : "";

    setFormData(prev => ({
      ...prev,
      booking: {
        ...prev.booking,
        earlyBirdExpireDate: formattedDate
      }
    }));
  };

  const handlePriceTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      booking: {
        ...prev.booking,
        priceType: type,
        currency: type === "National" ? "Indian Rupee - INR (₹)" : "US Dollar - USD ($)"
      }
    }));
  };

  const currencyOptions = [
    "Indian Rupee - INR (₹)",
    "US Dollar - USD ($)",
    "Euro - EUR (€)",
    "British Pound - GBP (£)",
    "Australian Dollar - AUD (A$)",
    "Brazilian Real - BRL (R$)",
    "Canadian Dollar - CAD (C$)",
    "Swiss Franc - CHF (CHF)",
    "Chinese Yuan - CNY (¥)",
    "Japanese Yen - JPY (¥)",
    "New Zealand Dollar - NZD (NZ$)",
    "Singapore Dollar - SGD (S$)",
    "South African Rand - ZAR (R)"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (taxDropdownRef.current && !taxDropdownRef.current.contains(event.target)) {
        setIsTaxDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (formData.booking?.chargeType === "Paid") {
      const updates = {};
      let changed = false;

      if (!formData.booking?.priceType) {
        updates.priceType = "National";
        changed = true;
      }

      const currentPriceType = formData.booking?.priceType || updates.priceType;
      if (!formData.booking?.currency) {
        updates.currency = currentPriceType === "International" ? "US Dollar - USD ($)" : "Indian Rupee - INR (₹)";
        changed = true;
      }

      if (changed) {
        setFormData(prev => ({
          ...prev,
          booking: {
            ...prev.booking,
            ...updates
          }
        }));
      }
    }
  }, [formData.booking?.chargeType, formData.booking?.priceType, formData.booking?.currency, setFormData]);

  useEffect(() => {
    setFormData((prev) => {
      const updated = { ...(prev.booking || {}) };
      let changed = false;

      if (updated.passType === undefined) {
        updated.passType = "Single Pass";
        changed = true;
      }
      if (updated.entryType === undefined) {
        updated.entryType = "Single Entry";
        changed = true;
      }
      if (updated.titleType === undefined) {
        updated.titleType = "Editable";
        changed = true;
      }
      if (updated.designationType === undefined) {
        updated.designationType = "Editable";
        changed = true;
      }
      if (updated.companyType === undefined) {
        updated.companyType = "Editable";
        changed = true;
      }
      if (updated.chargeType === undefined) {
        updated.chargeType = "Free";
        changed = true;
      }

      if (changed) {
        return { ...prev, booking: updated };
      }
      return prev;
    });
  }, [setFormData]);

  useEffect(() => {
    const eventStart = formData.eventDetails?.startDate; // YYYY-MM-DD
    const eventEnd = formData.eventDetails?.endDate;     // YYYY-MM-DD

    if (eventStart || eventEnd) {
      setFormData((prev) => {
        const bookingStart = prev.booking?.bookingStartDate;
        const bookingEnd = prev.booking?.bookingEndDate;

        const expectedStart = eventStart ? eventStart.split("-").reverse().join("/") : "";
        const expectedEnd = eventEnd ? eventEnd.split("-").reverse().join("/") : "";

        let updated = false;
        const newBooking = { ...(prev.booking || {}) };

        if (expectedStart && (!bookingStart || (prev.booking?._lastEventStart !== undefined && prev.booking?._lastEventStart !== eventStart))) {
          newBooking.bookingStartDate = expectedStart;
          newBooking._lastEventStart = eventStart;
          updated = true;
        }
        if (expectedEnd && (!bookingEnd || (prev.booking?._lastEventEnd !== undefined && prev.booking?._lastEventEnd !== eventEnd))) {
          newBooking.bookingEndDate = expectedEnd;
          newBooking._lastEventEnd = eventEnd;
          updated = true;
        }

        if (updated) {
          return {
            ...prev,
            booking: newBooking
          };
        }
        return prev;
      });
    }
  }, [formData.eventDetails?.startDate, formData.eventDetails?.endDate, setFormData]);

  const taxOptions = [
    "Ticket - CGST",
    "Ticket - SGST",
    "Ticket - IGST",
    "Food - GST"
  ];

  const handleTaxToggle = (tax) => {
    const currentTaxes = formData.booking?.taxes || [];
    let newTaxes;
    if (currentTaxes.includes(tax)) {
      newTaxes = currentTaxes.filter(t => t !== tax);
    } else {
      newTaxes = [...currentTaxes, tax];
    }
    setFormData({
      ...formData,
      booking: {
        ...formData.booking,
        taxes: newTaxes
      }
    });
  };

  const handleSelectAllTaxes = () => {
    const currentTaxes = formData.booking?.taxes || [];
    const filteredOptions = taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase()));

    // If all currently visible options are selected, deselect them
    const allVisibleSelected = filteredOptions.every(t => currentTaxes.includes(t));

    let newTaxes;
    if (allVisibleSelected) {
      newTaxes = currentTaxes.filter(t => !filteredOptions.includes(t));
    } else {
      const toAdd = filteredOptions.filter(t => !currentTaxes.includes(t));
      newTaxes = [...currentTaxes, ...toAdd];
    }

    setFormData({
      ...formData,
      booking: { ...formData.booking, taxes: newTaxes }
    });
  };

  const formatDate = (date) => {
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`; // DD/MM/YYYY
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for chargeType
    if (name === "chargeType") {
      let updatedData = {
        ...formData,
        booking: {
          ...formData.booking,
          chargeType: value,
        },
      };
      console.log("Updated Booking Data:", formData);

      // If Free or Donation → clear paid fields
      if (value === "Free" || value === "Donation") {
        updatedData.booking = {
          ...updatedData.booking,
          includeTax: false,
          priceType: "",
          currency: "",
          earlyBirdExpire: "",
          earlyBirdExpireDate: "",
          earlyBirdExpireTime: ""
        };
      } else if (value === "Paid") {
        updatedData.booking = {
          ...updatedData.booking,
          priceType: "National",
          currency: "Indian Rupee - INR (₹)"
        };
      }

      setFormData(updatedData);
      return;
    }

    // Special handling for includeTax
    if (name === "includeTax") {
      if (!checked) {
        setIsTaxDropdownOpen(false);
        setTaxSearch("");
      }
      setFormData({
        ...formData,
        booking: {
          ...formData.booking,
          includeTax: checked,
          taxes: [],
        },
      });
      return;
    }

    setFormData({
      ...formData,
      booking: {
        ...formData.booking,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const isPaid = formData.booking?.chargeType === "Paid";

  useEffect(() => {
    if (formData.booking?.earlyBirdExpireDate && formData.booking?.earlyBirdExpireTime) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const dateParts = formData.booking.earlyBirdExpireDate.split("/");
      if (dateParts.length === 3) {
        const yyyymmdd = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        // Convert HH:MM AM/PM to 24hr HH:MM
        let [time, modifier] = formData.booking.earlyBirdExpireTime.split(" ");
        let [hours, minutes] = time.split(":");
        if (hours === "12") hours = "00";
        if (modifier === "PM") hours = parseInt(hours, 10) + 12;
        const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;

        const combined = `${yyyymmdd}T${formattedTime}`;

        if (formData.booking.earlyBirdExpire !== combined) {
          setFormData(prev => ({
            ...prev,
            booking: {
              ...prev.booking,
              earlyBirdExpire: combined
            }
          }));
        }
      }
    } else {
      if (formData.booking?.earlyBirdExpire) {
        setFormData(prev => ({
          ...prev,
          booking: {
            ...prev.booking,
            earlyBirdExpire: ""
          }
        }));
      }
    }
  }, [formData.booking?.earlyBirdExpireDate, formData.booking?.earlyBirdExpireTime]);
  const bookingStartDateError = showStep2Errors && !formData.booking?.bookingStartDate ? "Booking Start Date is required." : "";
  const bookingEndDateError = showStep2Errors && !formData.booking?.bookingEndDate ? "Booking End Date is required." : "";
  const capacityError = showStep2Errors && !formData.booking?.capacity ? "Max Capacity is required." : "";
  const maxPassError = showStep2Errors && !formData.booking?.maxPass ? "Max Passes is required." : "";
  const earlyBirdExpireDateError = showStep2Errors && !formData.booking?.earlyBirdExpireDate ? "Expiry Date is required." : "";
  const earlyBirdExpireTimeError = showStep2Errors && !formData.booking?.earlyBirdExpireTime ? "Expiry Time is required." : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50/50 rounded-2xl">
      {/* LEFT SECTION */}
      <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 md:h-[calc(100vh-290px)] md:overflow-y-auto custom-scrollbar pr-2 ">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Booking Information</h2>
        </div>

        {/* Booking Dates */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 ml-1">
            When does your Booking Start for the event? <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            {/* START DATE */}
            <div className="space-y-1.5">
              <div className="relative group w-full">
                <DatePicker
                  selected={
                    formData.booking?.bookingStartDate
                      ? new Date(
                        formData.booking.bookingStartDate
                          .split("/")
                          .reverse()
                          .join("-"),
                      )
                      : null
                  }
                  onChange={(date) => {
                    setFormData({
                      ...formData,
                      booking: {
                        ...formData.booking,
                        bookingStartDate: formatDate(date),
                      },
                    });
                  }}
                  openToDate={eventStartDate || new Date()}
                  minDate={new Date()}
                  maxDate={eventMaxDate || undefined}
                  dateFormat="dd/MM/yyyy"
                  placeholderText=" Booking Start Date"
                  className={`w-full bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm cursor-pointer ${bookingStartDateError ? "ring-red-500" : "ring-gray-200"
                    }`}
                  wrapperClassName="w-full"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
              </div>
              {bookingStartDateError && (
                <p className="text-red-500 text-xs mt-1 ml-1">{bookingStartDateError}</p>
              )}
            </div>

            {/* END DATE */}
            <div className="space-y-1.5">
              <div className="relative group w-full">
                <DatePicker
                  selected={
                    formData.booking?.bookingEndDate
                      ? new Date(
                        formData.booking.bookingEndDate
                          .split("/")
                          .reverse()
                          .join("-"),
                      )
                      : null
                  }
                  onChange={(date) => {
                    setFormData({
                      ...formData,
                      booking: {
                        ...formData.booking,
                        bookingEndDate: formatDate(date),
                      },
                    });
                  }}
                  openToDate={eventMaxDate || new Date()}
                  minDate={
                    formData.booking?.bookingStartDate
                      ? new Date(
                        formData.booking.bookingStartDate
                          .split("/")
                          .reverse()
                          .join("-"),
                      )
                      : new Date()
                  }
                  maxDate={eventMaxDate || undefined}
                  dateFormat="dd/MM/yyyy"
                  placeholderText=" Booking End Date"
                  className={`w-full bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm cursor-pointer ${bookingEndDateError ? "ring-red-500" : "ring-gray-200"
                    }`}
                  wrapperClassName="w-full"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
              </div>
              {bookingEndDateError && (
                <p className="text-red-500 text-xs mt-1 ml-1">{bookingEndDateError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="group mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Registration Information
          </h2>

          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            What's the Capacity for Your Event? <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="capacity"
            placeholder="Max Capacity"
            inputMode="numeric"
            maxLength={5}
            value={formData.booking?.capacity || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className={`w-full h-16 bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${capacityError ? "ring-red-500" : "ring-gray-200"
              }`}
          />
          {capacityError && (
            <p className="text-red-500 text-xs mt-1.5 ml-1">{capacityError}</p>
          )}
        </div>
        {/* Pass Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 ml-1">
            Pass Configuration
          </label>
          <div className="flex bg-gray-50 p-1 rounded-xl ring-1 ring-gray-200">
            {["Single Pass", "Group Pass"].map((opt) => (
              <label key={opt} className="flex-1">
                <input
                  type="radio"
                  name="passType"
                  value={opt}
                  className="hidden peer"
                  checked={formData.booking?.passType === opt}
                  onChange={handleChange}
                />
                <div className="text-center py-3 rounded-xl transition-all peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:shadow-lg text-gray-500 text-xs font-bold tracking-widest">
                  {opt}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Display On Pass */}
        {formData.booking?.passType === "Single Pass" && (
          <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 space-y-4 animate-fadeIn">
            <label className="block text-sm font-bold text-indigo-900 ml-1">
              Customize Ticket Fields
            </label>

            {[
              {
                id: "title",
                label: "Title",
                type: "titleType",
                selection: "titleSelection",
              },
              {
                id: "designation",
                label: "Designation",
                type: "designationType",
                selection: "designationSelection",
              },
              {
                id: "company",
                label: "Company",
                type: "companyType",
                selection: "companySelection",
              },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    name={field.id}
                    placeholder={field.label}
                    value={formData.booking?.[field.id] || ""}
                    className="flex-1 bg-white border-0 ring-1 ring-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleChange}
                  />
                  <div className="flex bg-white ring-1 ring-gray-200 rounded-lg p-1">
                    {["Editable", "Selection"].map((mode) => (
                      <label key={mode} className="cursor-pointer">
                        <input
                          type="radio"
                          name={field.type}
                          value={mode}
                          className="hidden peer"
                          onChange={handleChange}
                          checked={formData.booking?.[field.type] === mode}
                        />
                        <div className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight text-gray-400 peer-checked:bg-indigo-600 peer-checked:text-white transition-all">
                          {mode}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.booking?.[field.type] === "Selection" && (
                  <input
                    name={field.selection}
                    placeholder="Enter options (comma separated)"
                    value={formData.booking?.[field.selection] || ""}
                    className="w-full bg-white border-0 ring-1 ring-indigo-200 p-2 rounded-lg text-xs italic outline-none focus:ring-2 focus:ring-indigo-400"
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Entry Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 ml-1">
            Entry Permissions <span className="text-red-500">*</span>
          </label>
          <div className="flex bg-gray-50 p-1 rounded-xl ring-1 ring-gray-200">
            {["Single Entry", "Multi Entry"].map((opt) => (
              <label key={opt} className="flex-1">
                <input
                  type="radio"
                  name="entryType"
                  value={opt}
                  className="hidden peer"
                  checked={formData.booking?.entryType === opt}
                  onChange={handleChange}
                />
                <div className="text-center py-3 rounded-xl transition-all peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:shadow-lg text-gray-500 text-xs font-bold tracking-widest">
                  {opt}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 md:h-[calc(100vh-290px)] md:overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-amber-50 rounded-lg">
            <span className="text-xl text-amber-600 font-bold">₹</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Price Information</h2>
        </div>

        {/* Charge Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 ml-1">
            How much do You Want to Charge for Passes?  <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-2xl ring-1 ring-gray-200">
            {["Paid", "Free", "Donation"].map((opt) => (
              <label key={opt} className="cursor-pointer">
                <input
                  type="radio"
                  name="chargeType"
                  value={opt}
                  className="hidden peer"
                  checked={formData.booking?.chargeType === opt}
                  onChange={handleChange}
                />
                <div className="text-center py-3 rounded-xl transition-all peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:shadow-lg text-gray-500 text-xs font-bold tracking-widest">
                  {opt}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Max Number of Passes Allowed/Person<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="maxPass"
              placeholder="Max Passes / Person"
              value={formData.booking?.maxPass || ""}
              inputMode="numeric"
              maxLength={5}
              onChange={(e) => {
                let value = e.target.value;

                // ✅ allow only digits OR empty
                value = value.replace(/\D/g, "");

                handleChange({
                  target: {
                    name: "maxPass",
                    value,
                  },
                });
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className={`w-full bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${maxPassError ? "ring-red-500" : "ring-gray-200"
                }`}
            />
            {maxPassError && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">{maxPassError}</p>
            )}
          </div>



          {/* ONLY PAID */}
          {isPaid && (
            <div className="space-y-5 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm animate-slideDown">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  name="includeTax"
                  checked={formData.booking?.includeTax || false}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-semibold text-gray-700">
                  Include GST/Tax
                </span>
              </label>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Price Type <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm flex h-14 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handlePriceTypeChange("National")}
                      className={`px-8 h-full flex items-center justify-center text-xs font-bold tracking-widest uppercase transition-all border-b-4 ${formData.booking?.priceType === "National"
                        ? "text-blue-600 border-blue-600 bg-blue-50/10"
                        : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
                        }`}
                    >
                      NATIONAL
                    </button>
                    {formData.eventDetails?.isInternationalInclude && (
                      <button
                        type="button"
                        onClick={() => handlePriceTypeChange("International")}
                        className={`px-8 h-full flex items-center justify-center text-xs font-bold tracking-widest uppercase transition-all border-b-4 ${formData.booking?.priceType === "International"
                          ? "text-blue-600 border-blue-600 bg-blue-50/10"
                          : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
                          }`}
                      >
                        INTERNATIONAL
                      </button>
                    )}
                    <div className="flex-1 border-b-4 border-gray-200"></div>
                  </div>
                </div>

                <div className="space-y-1.5 relative" ref={currencyDropdownRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <div
                    className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm flex items-center justify-between cursor-pointer h-14"
                    onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  >
                    <span className="truncate text-gray-700 text-sm font-medium">
                      {formData.booking?.currency || "Select Currency"}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>

                  {isCurrencyDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {/* Search header */}
                      <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                        <div className="flex-1 flex items-center px-3 py-1.5 border border-gray-200 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all bg-white">
                          <input
                            type="text"
                            value={currencySearch}
                            onChange={(e) => setCurrencySearch(e.target.value)}
                            placeholder="Search Currency..."
                            className="w-full text-sm outline-none bg-transparent text-gray-700"
                          />
                          <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="max-h-60 overflow-y-auto bg-white custom-scrollbar">
                        {currencyOptions.filter(c => c.toLowerCase().includes(currencySearch.toLowerCase())).map((curr) => (
                          <div
                            key={curr}
                            className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors hover:bg-indigo-50 
                              ${formData.booking?.currency === curr ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-gray-700'}`}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                booking: {
                                  ...formData.booking,
                                  currency: curr
                                }
                              });
                              setIsCurrencyDropdownOpen(false);
                              setCurrencySearch("");
                            }}
                          >
                            {curr}
                          </div>
                        ))}
                        {currencyOptions.filter(c => c.toLowerCase().includes(currencySearch.toLowerCase())).length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500 bg-white">No currencies found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {formData.booking?.includeTax && (
                  <div className="space-y-1.5 relative" ref={taxDropdownRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                      Select Tax <span className="text-red-500">*</span>
                    </label>
                    <div
                      className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm flex items-center justify-between cursor-pointer h-14"
                      onClick={() => setIsTaxDropdownOpen(!isTaxDropdownOpen)}
                    >
                      <span className="truncate text-gray-700 text-sm font-medium">
                        {(formData.booking?.taxes || []).length > 0
                          ? (formData.booking?.taxes || []).join(", ")
                          : "Select Tax"}
                      </span>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isTaxDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {isTaxDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {/* Search header */}
                        <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white">
                          <input
                            type="checkbox"
                            checked={
                              taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase())).length > 0 &&
                              taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase()))
                                .every(t => (formData.booking?.taxes || []).includes(t))
                            }
                            onChange={handleSelectAllTaxes}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1 flex items-center px-3 py-1.5 border border-gray-200 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all bg-white">
                            <input
                              type="text"
                              value={taxSearch}
                              onChange={(e) => setTaxSearch(e.target.value)}
                              placeholder="Search Tax..."
                              className="w-full text-sm outline-none bg-transparent text-gray-700"
                            />
                            <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsTaxDropdownOpen(false);
                              setTaxSearch('');
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Options */}
                        <div className="max-h-60 overflow-y-auto bg-white">
                          {taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase())).map((tax) => (
                            <label key={tax} className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-indigo-50 bg-white">
                              <input
                                type="checkbox"
                                checked={(formData.booking?.taxes || []).includes(tax)}
                                onChange={() => handleTaxToggle(tax)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 font-medium">{tax}</span>
                            </label>
                          ))}
                          {taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase())).length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500 bg-white">No options found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    When does your Early Bird amount need to Expire for the event? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* EXPIRE DATE */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                        Expire Date
                      </label>
                      <DatePicker
                        selected={
                          formData.booking?.earlyBirdExpireDate
                            ? new Date(
                              formData.booking.earlyBirdExpireDate
                                .split("/")
                                .reverse()
                                .join("-"),
                            )
                            : null
                        }
                        onChange={(date) => {
                          if (!date) {
                            setFormData(prev => ({
                              ...prev,
                              booking: {
                                ...prev.booking,
                                earlyBirdExpireDate: "",
                              }
                            }));
                            return;
                          }
                          const day = String(date.getDate()).padStart(2, "0");
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const year = date.getFullYear();
                          const dateStr = `${day}/${month}/${year}`;
                          setFormData(prev => ({
                            ...prev,
                            booking: {
                              ...prev.booking,
                              earlyBirdExpireDate: dateStr,
                            }
                          }));
                        }}
                        minDate={new Date()}
                        maxDate={
                          formData.booking?.bookingEndDate
                            ? new Date(
                              formData.booking.bookingEndDate
                                .split("/")
                                .reverse()
                                .join("-"),
                            )
                            : eventMaxDate || undefined
                        }
                        dateFormat="dd/MM/yyyy"
                        customInput={<EarlyBirdDateCustomInput placeholder="Select Date" hasError={!!earlyBirdExpireDateError} />}
                        wrapperClassName="w-full"
                      />
                      {earlyBirdExpireDateError && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{earlyBirdExpireDateError}</p>
                      )}
                    </div>

                    {/* EXPIRE TIME */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                        Expire Time
                      </label>
                      <CustomTimePicker
                        value={formData.booking?.earlyBirdExpireTime || ""}
                        isCustomStyle={true}
                        dropdownPosition="top"
                        hasError={!!earlyBirdExpireTimeError}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            booking: {
                              ...prev.booking,
                              earlyBirdExpireTime: value,
                            },
                          }))
                        }
                      />
                      {earlyBirdExpireTimeError && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{earlyBirdExpireTimeError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Booking;