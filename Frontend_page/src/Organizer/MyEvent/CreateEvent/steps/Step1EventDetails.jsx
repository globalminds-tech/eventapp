import React, { useEffect, useState, useRef } from "react";
import CustomTimePicker from "../TimePickerClock";
import { get_Venues_details, getVenueDetails } from "../../../../Services/api";
// import { Calendar, Clock } from "lucide-react";
import { Calendar, Clock, Search } from "lucide-react";
const Step1EventDetails = ({ formData, setFormData, organizerId, showStep1Errors }) => {
  const [venues, setVenues] = useState([]);
  /* inside component */
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const categoryRef = useRef(null);
  const venueRef = useRef(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setFormData((prev) => {
          if (prev.eventDetails?.showCategoryDropdown) {
            return {
              ...prev,
              eventDetails: { ...prev.eventDetails, showCategoryDropdown: false },
            };
          }
          return prev;
        });
      }
      if (venueRef.current && !venueRef.current.contains(event.target)) {
        setFormData((prev) => {
          if (prev.eventDetails?.showVenueDropdown) {
            return {
              ...prev,
              eventDetails: { ...prev.eventDetails, showVenueDropdown: false },
            };
          }
          return prev;
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setFormData]);
  const todayLocal = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split("T")[0];

  const validateEventName = (value) => {
    if (!value) {
      return "Event Name is required";
    }

    if (value.length > 50) {
      return "Max 50 characters allowed";
    }

    return "";
  };

  useEffect(() => {
    fetchVenues();

    // Set default values if they are undefined
    setFormData((prev) => {
      const updated = { ...(prev.eventDetails || {}) };
      let changed = false;

      if (updated.visibility === undefined) {
        updated.visibility = "Public";
        changed = true;
      }
      if (updated.includeProgram === undefined) {
        updated.includeProgram = "No";
        changed = true;
      }
      if (updated.visitorName === undefined) {
        updated.visitorName = true;
        changed = true;
      }
      if (updated.eventType === undefined) {
        updated.eventType = "OneTime";
        changed = true;
      }

      if (changed) {
        return { ...prev, eventDetails: updated };
      }
      return prev;
    });
  }, [setFormData, organizerId]);

  const fetchVenues = async () => {
    try {
      const res = await get_Venues_details(organizerId);
      setVenues(res);
    } catch (error) {
      console.error("Error fetching venues", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "startDate") {
      const v = value < todayLocal ? todayLocal : value;
      setFormData((prev) => {
        const next = {
          ...prev,
          eventDetails: {
            ...prev.eventDetails,
            startDate: v,
          },
        };
        if (next.eventDetails.endDate && next.eventDetails.endDate < v) {
          next.eventDetails.endDate = v;
        }

        // Prefill booking start/end dates
        const parts = v.split("-");
        const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : "";
        next.booking = {
          ...(prev.booking || {}),
          bookingStartDate: formattedDate,
          _lastEventStart: v,
        };
        if (next.eventDetails.endDate) {
          const endParts = next.eventDetails.endDate.split("-");
          next.booking.bookingEndDate = endParts.length === 3 ? `${endParts[2]}/${endParts[1]}/${endParts[0]}` : "";
          next.booking._lastEventEnd = next.eventDetails.endDate;
        }
        return next;
      });
      return;
    }
    if (name === "endDate") {
      const minForEnd = formData.eventDetails?.startDate || todayLocal;
      const v = value < minForEnd ? minForEnd : value;
      setFormData((prev) => {
        const parts = v.split("-");
        const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : "";
        return {
          ...prev,
          eventDetails: {
            ...prev.eventDetails,
            endDate: v,
          },
          booking: {
            ...(prev.booking || {}),
            bookingEndDate: formattedDate,
            _lastEventEnd: v,
          }
        };
      });
      return;
    }
    if (name === "vehiclePass" && !checked) {
      setFormData((prev) => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          vehiclePass: false,
          vehicleNumber: false,
        },
      }));
      return;
    }
    if (name === "isInternationalInclude" && !checked) {
      setFormData((prev) => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          isInternationalInclude: false,
          passport: false,
        },
        booking: {
          ...(prev.booking || {}),
          priceType: "National",
        },
      }));
      return;
    }
    if (name === "visitorName" && !checked) {
      return;
    }
    if (name === "mail") {
      setFormData((prev) => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          mail: checked,
          visitorMail: checked,
        },
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      eventDetails: {
        ...prev.eventDetails,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };
  const categoryError = showStep1Errors && !formData.eventDetails?.category ? "Event Category is required." : "";
  
  const eventNameError = (showStep1Errors && !formData.eventDetails?.eventName) 
    ? "Event Name is required." 
    : (formData.eventDetails?.eventName && formData.eventDetails.eventName.length > 50) 
      ? "Max 50 characters allowed" 
      : "";

  const descriptionError = showStep1Errors && !formData.eventDetails?.description ? "Event Description is required." : "";
  
  const startDateError = showStep1Errors && !formData.eventDetails?.startDate ? "Start Date is required." : "";
  const startTimeError = showStep1Errors && !formData.eventDetails?.startTime ? "Start Time is required." : "";
  
  const endDateError = showStep1Errors && !formData.eventDetails?.endDate ? "End Date is required." : "";
  const endTimeError = showStep1Errors && !formData.eventDetails?.endTime ? "End Time is required." : "";
  
  const venueError = showStep1Errors && !formData.eventDetails?.venue ? "Venue Name is required." : "";
  const addressError = showStep1Errors && !formData.eventDetails?.address ? "Address is required." : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ---------------- LEFT SECTION: BASIC INFO ---------------- */}
      <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Event Info</h3>
        </div>

        <div className="space-y-4">
          <div className="group pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Event Category <span className="text-red-500">*</span>
            </label>

            <div className="relative" ref={categoryRef}>
              {/* Main Select Box */}
              <div
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    eventDetails: {
                      ...prev.eventDetails,
                      showCategoryDropdown: !prev.eventDetails?.showCategoryDropdown,
                    },
                  }))
                }
                className={`w-full bg-gray-50 ring-1 p-3 rounded-xl cursor-pointer flex items-center justify-between ${
                  categoryError ? "ring-red-500" : "ring-gray-200"
                }`}
              >
                <span
                  className={
                    formData.eventDetails?.category
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {formData.eventDetails?.category || "Event Category"}
                </span>
              </div>

              {/* Dropdown */}
              {formData.eventDetails?.showCategoryDropdown && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

                  {/* Search Bar INSIDE Dropdown */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Category"
                        value={formData.eventDetails?.categorySearch || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            eventDetails: {
                              ...prev.eventDetails,
                              categorySearch: value,
                            },
                          }));
                        }}
                        className="w-full bg-gray-50 ring-1 ring-gray-200 p-2.5 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Category List */}
                  <div className="max-h-60 overflow-y-auto">
                    {["Music", "Business", "Technology", "Education", "Sports"]
                      .filter((cat) =>
                        cat
                          .toLowerCase()
                          .includes(
                            (
                              formData.eventDetails?.categorySearch || ""
                            ).toLowerCase()
                          )
                      )
                      .map((cat) => (
                        <div
                          key={cat}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              eventDetails: {
                                ...prev.eventDetails,
                                category: cat,
                                showCategoryDropdown: false,
                                categorySearch: "",
                              },
                            }));
                          }}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                          {cat}
                        </div>
                      ))}

                    {["Music", "Business", "Technology", "Education"].filter((cat) =>
                      cat
                        .toLowerCase()
                        .includes(
                          (
                            formData.eventDetails?.categorySearch || ""
                          ).toLowerCase()
                        )
                    ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          No categories found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            {categoryError && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">
                {categoryError}
              </p>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              What’s the Name of Your Event? <span className="text-red-500">*</span>
            </label>
            <input
              name="eventName"
              placeholder="Event Title"
              value={formData.eventDetails?.eventName || ""}
              onChange={handleChange}
              className={`w-full bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${
                eventNameError ? "ring-red-500" : "ring-gray-200"
              }`}
            />
            {eventNameError && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">
                {eventNameError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Explain About Your Event <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Event Description"
              value={formData.eventDetails?.description || ""}
              onChange={handleChange}
              rows="3"
              className={`w-full bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-y ${
                descriptionError ? "ring-red-500" : "ring-gray-200"
              }`}
            />
            {descriptionError && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">
                {descriptionError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Event Amenities Description
            </label>
            <textarea
              name="amenities"
              placeholder="Event Amenities Description"
              value={formData.eventDetails?.amenities || ""}
              onChange={handleChange}
              rows="3"
             className={`w-full bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-y ${
                descriptionError ? "ring-red-500" : "ring-gray-200"
              }`}            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Tags
            </label>
            <input
              name="tags"
              placeholder="Add tags about your event"
              value={formData.eventDetails?.tags || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT SECTION: DATE & VENUE CONFIG ---------------- */}
      <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Event Information</h3>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">


            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Event Visibility <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Public", "Private"].map((opt) => (
                  <label key={opt} className="relative group cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value={opt}
                      className="hidden peer"
                      checked={formData.eventDetails?.visibility === opt}
                      onChange={handleChange}
                    />
                    <div className="bg-gray-50 ring-1 ring-gray-200 rounded-xl py-2.5 text-center text-xs font-semibold text-gray-500 transition-all peer-checked:ring-2 peer-checked:ring-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700">
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Include Program <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="relative group cursor-pointer">
                    <input
                      type="radio"
                      name="includeProgram"
                      value={opt}
                      className="hidden peer"
                      checked={formData.eventDetails?.includeProgram === opt}
                      onChange={handleChange}
                    />
                    <div className="bg-gray-50 ring-1 ring-gray-200 rounded-xl py-2.5 text-center text-xs font-semibold text-gray-500 transition-all peer-checked:ring-2 peer-checked:ring-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700">
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
              Communication
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "mail", label: "Mail ID" },
                { id: "whatsapp", label: "WhatsApp" },
                { id: "print", label: "Print" },
              ].map((item) => (
                <label key={item.id} className="relative group cursor-pointer">
                  <input
                    type="checkbox"
                    name={item.id}
                    className="hidden peer"
                    checked={formData.eventDetails?.[item.id] || false}
                    onChange={handleChange}
                  />
                  <div className="bg-gray-50 ring-1 ring-gray-200 rounded-xl py-2.5 text-center text-xs font-semibold text-gray-500 transition-all peer-checked:ring-2 peer-checked:ring-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700">
                    {item.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
              Mandatory for On-Spot Visitors
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "visitorMail", label: "Mail ID" },
                { id: "visitorName", label: "Visitor Name" },
                { id: "visitorPhoto", label: "Visitor Photo" },
                { id: "visitorMobile", label: "Mobile Number" },
                { id: "documentProof", label: "Document Proof" },
              ].map((item) => (
                <label key={item.id} className="cursor-pointer group">
                  <div className="flex items-center p-2.5 rounded-xl bg-gray-50 ring-1 ring-gray-200 group-hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      name={item.id}
                      checked={item.id === "visitorName" ? true : (formData.eventDetails?.[item.id] || false)}
                      className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      onChange={handleChange}
                      onClick={(e) => {
                        if (item.id === "visitorName") {
                          e.preventDefault();
                        }
                      }}
                    />
                    <span className="ml-2.5 text-xs font-medium text-gray-600">
                      {item.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Pass Validity
              </label>
              <label className="flex items-center p-3 rounded-xl bg-indigo-50/50 ring-1 ring-indigo-100 cursor-pointer hover:bg-indigo-50 transition-all">
                <input
                  type="checkbox"
                  name="dayPass"
                  checked={formData.eventDetails?.dayPass || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-indigo-600 border-indigo-300 focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm font-semibold text-gray-600">
                  Is Day Pass
                </span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Include International
              </label>
              <label className="flex items-center p-3 rounded-xl bg-purple-50/50 ring-1 ring-purple-100 cursor-pointer hover:bg-purple-50 transition-all">
                <input
                  type="checkbox"
                  name="isInternationalInclude"
                  checked={formData.eventDetails?.isInternationalInclude || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-purple-600 border-purple-300 focus:ring-purple-500"
                />
                <span className="ml-3 text-sm font-semibold text-gray-600">
                  Is International
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Mandatory Documents
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 cursor-pointer hover:bg-gray-100 transition-all">
                <input
                  type="checkbox"
                  name="aadhar"
                  checked={formData.eventDetails?.aadhar || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="ml-3 text-sm font-semibold text-gray-600">Is Aadhar</span>
              </label>

              <label className="flex items-center p-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 cursor-pointer hover:bg-gray-100 transition-all">
                <input
                  type="checkbox"
                  name="vehiclePass"
                  checked={formData.eventDetails?.vehiclePass || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="ml-3 text-sm font-semibold text-gray-600">Is Vehicle Pass</span>
              </label>
            </div>

            {(formData.eventDetails?.isInternationalInclude || formData.eventDetails?.vehiclePass) && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {formData.eventDetails?.isInternationalInclude && (
                  <label className="flex items-center p-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 cursor-pointer hover:bg-gray-100 transition-all animate-fadeIn">
                    <input
                      type="checkbox"
                      name="passport"
                      checked={formData.eventDetails?.passport || false}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-600">Passport</span>
                  </label>
                )}
                {formData.eventDetails?.vehiclePass && (
                  <label className="flex items-center p-3 rounded-xl bg-gray-50 ring-1 ring-gray-200 cursor-pointer hover:bg-gray-100 transition-all animate-fadeIn">
                    <input
                      type="checkbox"
                      name="vehicleNumber"
                      checked={formData.eventDetails?.vehicleNumber || false}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-600">Vehicle Number</span>
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Food Provision (LEFT) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Food Provision
              </label>
              <div>
                <label className="flex items-center p-3 rounded-xl bg-purple-50/50 ring-1 ring-purple-100 cursor-pointer hover:bg-purple-50 transition-all">
                  <input
                    type="checkbox"
                    name="food"
                    checked={formData.eventDetails?.food || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-purple-600 border-purple-300 focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-600">
                    Include Food
                  </span>
                </label>
              </div>
            </div>

            {/* Welcome Kit (RIGHT) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Welcome Kit
              </label>
              <div>
                <label className="flex items-center p-3 rounded-xl bg-indigo-50/50 ring-1 ring-indigo-100 cursor-pointer hover:bg-indigo-50 transition-all">
                  <input
                    type="checkbox"
                    name="welcomeKit"
                    checked={formData.eventDetails?.welcomeKit || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-indigo-600 border-indigo-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-600">
                   Welcome Kit
                  </span>
                </label>
              </div>
            </div>

          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Event Date & Location</h3>
          </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            When does Your Event Start and End? <span className="text-red-500">*</span>
          </label>
          <div className="flex bg-gray-50 p-1 rounded-2xl ring-1 ring-gray-200 gap-1">
            {[
              { id: "OneTime", label: "One-Time" },
              { id: "Recurring", label: "Recurring" },
            ].map((opt) => (
              <label key={opt.id} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="eventType"
                  value={opt.id}
                  className="hidden peer"
                  checked={formData.eventDetails?.eventType === opt.id}
                  onChange={handleChange}
                />

                <div className="rounded-xl py-2.5 text-center text-xs font-semibold transition-all duration-300 bg-transparent text-gray-500 peer-checked:bg-white peer-checked:text-indigo-700 peer-checked:ring-2 peer-checked:ring-indigo-500 peer-checked:shadow-sm hover:bg-white/70">
                  {opt.label}
                </div>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                ref={startDateRef}
                type="date"
                name="startDate"
                value={formData.eventDetails?.startDate || ""}
                min={todayLocal}
                onChange={handleChange}
                className={`w-full bg-gray-50 border-0 ring-1 p-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs ${
                  startDateError ? "ring-red-500" : "ring-gray-200"
                }`}
              />
              {startDateError && (
                <p className="text-red-500 text-[10px] mt-0.5">{startDateError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <CustomTimePicker
                value={formData.eventDetails?.startTime || ""}
                hasError={!!startTimeError}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventDetails: {
                      ...prev.eventDetails,
                      startTime: value,
                    },
                  }))
                }
              />
              {startTimeError && (
                <p className="text-red-500 text-[10px] mt-0.5">{startTimeError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                ref={endDateRef}
                type="date"
                name="endDate"
                value={formData.eventDetails?.endDate || ""}
                min={formData.eventDetails?.startDate || todayLocal}
                onChange={handleChange}
                className={`w-full bg-gray-50 border-0 ring-1 p-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs ${
                  endDateError ? "ring-red-500" : "ring-gray-200"
                }`}
              />
              {endDateError && (
                <p className="text-red-500 text-[10px] mt-0.5">{endDateError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                End Time <span className="text-red-500">*</span>
              </label>
              <CustomTimePicker
                value={formData.eventDetails?.endTime || ""}
                hasError={!!endTimeError}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventDetails: {
                      ...prev.eventDetails,
                      endTime: value,
                    },
                  }))
                }
              />
              {endTimeError && (
                <p className="text-red-500 text-[10px] mt-0.5">{endTimeError}</p>
              )}
            </div>
          </div>

          {formData.eventDetails?.eventType === "Recurring" && (
            <div className="animate-slideDown">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                Frequency
              </label>
              <select
                name="occurrence"
                value={formData.eventDetails?.occurrence || ""}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select Frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Where It's Located? <span className="text-red-500">*</span>
            </label>

            <div className="relative" ref={venueRef}>
              {/* Main Select Box */}
              <div
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    eventDetails: {
                      ...prev.eventDetails,
                      showVenueDropdown:
                        !prev.eventDetails?.showVenueDropdown,
                    },
                  }))
                }
                className={`w-full bg-gray-50 ring-1 p-3 rounded-xl cursor-pointer flex items-center justify-between ${
                  venueError ? "ring-red-500" : "ring-gray-200"
                }`}
              >
                <span
                  className={
                    formData.eventDetails?.venue
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {formData.eventDetails?.venue || "Venue Name"}
                </span>
              </div>

              {/* Dropdown */}
              {formData.eventDetails?.showVenueDropdown && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

                  {/* Search Bar INSIDE Dropdown */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Venue"
                        value={formData.eventDetails?.venueSearch || ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          setFormData((prev) => ({
                            ...prev,
                            eventDetails: {
                              ...prev.eventDetails,
                              venueSearch: value,
                            },
                          }));
                        }}
                        className="w-full bg-gray-50 ring-1 ring-gray-200 p-2.5 pr-10 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />

                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Venue List */}
                  <div className="max-h-60 overflow-y-auto">
                    {venues
                      .filter((venue) =>
                        `${venue.venue_name} ${venue.city_name}`
                          .toLowerCase()
                          .includes(
                            (
                              formData.eventDetails?.venueSearch || ""
                            ).toLowerCase()
                          )
                      )
                      .map((venue) => (
                        <div
                          key={venue.id}
                          onClick={async () => {
                            let fullAddress = "";
                            try {
                              const fullVenue = await getVenueDetails(venue.id);
                              const v = fullVenue?.venue || fullVenue;
                              const parts = [];
                              if (v.address) parts.push(v.address);
                              if (v.city_name && (!v.address || !v.address.toLowerCase().includes(v.city_name.toLowerCase()))) {
                                parts.push(v.city_name);
                              }
                              if (v.state_name && (!v.address || !v.address.toLowerCase().includes(v.state_name.toLowerCase()))) {
                                parts.push(v.state_name);
                              }
                              if (v.country_name && (!v.address || !v.address.toLowerCase().includes(v.country_name.toLowerCase()))) {
                                parts.push(v.country_name);
                              }
                              if (v.pin_code && (!v.address || !v.address.toLowerCase().includes(v.pin_code.toLowerCase()))) {
                                parts.push(v.pin_code);
                              }
                              fullAddress = parts.filter(Boolean).join(", ");
                            } catch (error) {
                              console.error("Error fetching detailed venue address:", error);
                              const parts = [];
                              if (venue.address) parts.push(venue.address);
                              if (venue.city_name && (!venue.address || !venue.address.toLowerCase().includes(venue.city_name.toLowerCase()))) {
                                parts.push(venue.city_name);
                              }
                              if (venue.state_name && (!venue.address || !venue.address.toLowerCase().includes(venue.state_name.toLowerCase()))) {
                                parts.push(venue.state_name);
                              }
                              if (venue.country_name && (!venue.address || !venue.address.toLowerCase().includes(venue.country_name.toLowerCase()))) {
                                parts.push(venue.country_name);
                              }
                              if (venue.pin_code && (!venue.address || !venue.address.toLowerCase().includes(venue.pin_code.toLowerCase()))) {
                                parts.push(venue.pin_code);
                              }
                              fullAddress = parts.filter(Boolean).join(", ");
                            }
                            setFormData((prev) => ({
                              ...prev,
                              eventDetails: {
                                ...prev.eventDetails,
                                venue: `${venue.venue_name} (${venue.city_name})`,
                                address: fullAddress,
                                showVenueDropdown: false,
                                venueSearch: "",
                              },
                            }));
                          }}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        >
                          {venue.venue_name} ({venue.city_name})
                        </div>
                      ))}

                    {venues.filter((venue) =>
                      `${venue.venue_name} ${venue.city_name}`
                        .toLowerCase()
                        .includes(
                          (
                            formData.eventDetails?.venueSearch || ""
                          ).toLowerCase()
                        )
                    ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          No venues found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            {venueError && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">
                {venueError}
              </p>
            )}

            <textarea
              name="address"
              placeholder="Address"
              value={formData.eventDetails?.address || ""}
              onChange={handleChange}
              rows="2"
              className={`w-full mt-3 bg-gray-50 border-0 ring-1 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm ${
                addressError ? "ring-red-500" : "ring-gray-200"
              }`}
            />
            {addressError && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">
                {addressError}
              </p>
            )}

            {formData.eventDetails?.address && (
              <div className="mt-4 rounded-xl overflow-hidden ring-1 ring-gray-200 h-48 w-full relative">
                <iframe
                  key={formData.eventDetails.address}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    formData.eventDetails.address
                  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Step1EventDetails;