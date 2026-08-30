import React, { useState, useEffect, useRef } from "react";
import { Send, Upload, User, Mail, Phone, Building2, MapPin, FileText, CheckCircle, AlertCircle, X, ChevronDown } from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { bookStall, getEventById, getCountries, getStates, getCities } from "@/Services/api";
import { useSelector } from "react-redux";

const Stall = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);


  const initialFormData = {
    title: "Mr.",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    designation: "",
    companyName: "",
    country: "",
    state: "",
    city: "",
    address: "",
    message: "",
    pinCode: "",
    stallArea: "",
    products: "",
    visitingCard: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  useEffect(() => {
    if (location.state?.event) {
      setEventName(location.state.event.title);
    } else {
      fetchEvent();
    }
    loadCountries();
  }, []);

  // Click away listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-close toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadCountries = async () => {
    try {
      const data = await getCountries();
      setCountries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStates = async (countryCode) => {
    try {
      const data = await getStates(countryCode);
      setStates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCities = async (countryCode, stateCode) => {
    try {
      const data = await getCities(countryCode, stateCode);
      setCities(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (eventName) {
      setFormData((prev) => ({
        ...prev,
        eventName: eventName,
      }));
    }
  }, [eventName]);

  const fetchEvent = async () => {
    try {
      const res = await getEventById(id);
      setEventName(res.event_name);
    } catch (err) {
      console.error(err);
    }
  };



  const handleChange = (e) => {
    let { name, value, type, files } = e.target;
    setErrors({ ...errors, [name]: "" });

    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
      return;
    }

    // 1. Spacing Restriction
    if (typeof value === "string") {
      if (name === "email" || name === "mobile" || name === "pinCode") {
        value = value.replace(/\s/g, ""); // No spaces allowed at all
      } else {
        value = value.trimStart(); // No leading spaces allowed
      }
    }

    // 2. Number field restriction (Contact Number / PinCode)
    if (name === "mobile" || name === "pinCode") {
      if (value !== "" && !/^\d*$/.test(value)) {
        return; // Disallow alphabets/special characters
      }
      if (name === "mobile" && value.length > 10) return;
      if (name === "pinCode" && value.length > 6) return;
    }

    // 3. Alphabet restriction for specific text fields
    if (["firstName", "lastName", "city", "state", "country"].includes(name)) {
      if (value !== "" && !/^[a-zA-Z\s]*$/.test(value)) {
        return; // Disallow numbers/special characters
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'companyName', 'country', 'state', 'city', 'address', 'stallArea', 'products', 'pinCode'];

    const fieldLabels = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      mobile: "Mobile Number",
      companyName: "Company Name",
      country: "Country",
      state: "State",
      city: "City",
      address: "Address",
      stallArea: "Stall Area",
      products: "Products",
      pinCode: "Pin Code"
    };

    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === "")) {
        newErrors[field] = ` ${fieldLabels[field] || field} field is required`;
      }
    });

    // Email Pattern Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    submitData.append("event_id", id);
    submitData.append("user_id", user.id);
    submitData.append("eventName", eventName);

    try {
      const res = await bookStall(submitData);
      showToast("✓ Stall Booked Successfully!", "success");
      setFormData(initialFormData);
      
      // Delay navigation to allow user to see the success toast
      setTimeout(() => {
        navigate("/exhibitor/dashboard");
      }, 3000);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to book stall. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed top-6 right-6 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-right duration-300 border-l-4 ${toast.type === "success"
            ? "bg-white border-emerald-500"
            : "bg-white border-rose-500"
            }`}
        >
          <div className={`p-2 rounded-xl ${toast.type === "success" ? "bg-emerald-100" : "bg-rose-100"}`}>
            {toast.type === "success" ? (
              <CheckCircle size={20} className="text-emerald-600" />
            ) : (
              <AlertCircle size={20} className="text-rose-600" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-slate-800 font-bold text-sm tracking-tight">
              {toast.type === "success" ? "Success" : "Notification"}
            </span>
            <span className="text-slate-500 text-xs font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200 to-transparent rounded-full opacity-20 blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-200 to-transparent rounded-full opacity-20 blur-3xl animate-float-slow"></div>
      </div>



      <div className="relative z-10 w-full flex items-center justify-center px-3 py-4 min-h-screen">
        <div className="w-full max-w-7xl">
          {/* Header Section - Compact */}
          <div className="text-center mb-4 animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-2">
              <Building2 className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Exhibition Booth</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {eventName || "Reserve Your Booth"}
            </h1>
            <p className="text-sm text-gray-600">Showcase your brand at the exhibition</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ backdropFilter: 'blur(10px)' }}>
            {/* Form Header Bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            <form onSubmit={handleSubmit} className="p-5 md:p-8">
              {/* Section 1: Personal Information */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white"
                    >
                      <option>Mr.</option>
                      <option>Ms.</option>
                      <option>Mrs.</option>
                      <option>Dr.</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        placeholder="John"

                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.firstName ? "border-red-500" : "border-gray-200"}`}
                      />
                      {errors.firstName && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        placeholder="Doe"

                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.lastName ? "border-red-500" : "border-gray-200"}`}
                      />
                      {errors.lastName && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.lastName}</p>}
                    </div>
                  </div>
                </div>

                {/* Email & Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      placeholder="john@company.com"

                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.email ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1 relative left-2">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      placeholder="10 Digits"
                      maxLength="10"

                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.mobile ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors.mobile && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.mobile}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      placeholder="Sales Manager"
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white"
                    />
                  </div>
                </div>


                {/* Company, Stall Area, Products */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      placeholder="Your Company"
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.companyName ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors.companyName && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.companyName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stall Area <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="stallArea"
                      value={formData.stallArea}
                      placeholder="Stall Area"
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.stallArea ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors.stallArea && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.stallArea}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Products <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="products"
                      value={formData.products}
                      placeholder="Products"
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.products ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors.products && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.products}</p>}
                  </div>
                </div>
              </div>

              <div className="mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Location <span className="text-red-500">*</span></h2>
                </div>

                {/* Country, State, City Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="relative" ref={countryRef}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Country"
                        value={countrySearch}
                        onChange={(e) => {
                          setCountrySearch(e.target.value);
                          setShowCountryDropdown(true);
                          setErrors(prev => ({ ...prev, country: "" }));
                        }}
                        onFocus={() => setShowCountryDropdown(true)}
                        className={`w-full px-3 py-2 pr-14 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.country ? "border-red-500" : "border-gray-200"
                          }`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {countrySearch && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, country: "", state: "", city: "" });
                              setCountrySearch("");
                              setStateSearch("");
                              setCitySearch("");
                              setShowCountryDropdown(true);
                              setErrors(prev => ({ ...prev, country: "", state: "", city: "" }));
                            }}
                            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCountryDropdown(!showCountryDropdown);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-0.5 transition-transform"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              showCountryDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {countries
                          .filter((c) =>
                            c.country_name.toLowerCase().includes(countrySearch.toLowerCase())
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setFormData({ ...formData, country: c.country_name, state: "", city: "" });
                                setCountrySearch(c.country_name);
                                setStateSearch("");
                                setCitySearch("");
                                setShowCountryDropdown(false);
                                setErrors(prev => ({ ...prev, country: "", state: "", city: "" }));
                                loadStates(c.id);
                              }}
                              className="p-2 cursor-pointer hover:bg-blue-50 text-sm"
                            >
                              {c.country_name}
                            </div>
                          ))}
                        {countries.filter((c) =>
                          c.country_name.toLowerCase().includes(countrySearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-2 text-gray-400 text-sm">No results found</div>
                          )}
                      </div>
                    )}
                    {errors.country && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.country}</p>}
                  </div>

                  <div className="relative" ref={stateRef}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search State"
                        value={stateSearch}
                        onChange={(e) => {
                          setStateSearch(e.target.value);
                          setShowStateDropdown(true);
                          setErrors(prev => ({ ...prev, state: "" }));
                        }}
                        onFocus={() => setShowStateDropdown(true)}
                        className={`w-full px-3 py-2 pr-14 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.state ? "border-red-500" : "border-gray-200"
                          }`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {stateSearch && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, state: "", city: "" });
                              setStateSearch("");
                              setCitySearch("");
                              setShowStateDropdown(true);
                              setErrors(prev => ({ ...prev, state: "", city: "" }));
                            }}
                            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStateDropdown(!showStateDropdown);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-0.5 transition-transform"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              showStateDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {showStateDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {states
                          .filter((s) =>
                            s.state_name.toLowerCase().includes(stateSearch.toLowerCase())
                          )
                          .map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setFormData({ ...formData, state: s.state_name, city: "" });
                                setStateSearch(s.state_name);
                                setCitySearch("");
                                setShowStateDropdown(false);
                                setErrors(prev => ({ ...prev, state: "", city: "" }));
                                // Find current country code
                                const country = countries.find(c => c.country_name === formData.country);
                                if (country) {
                                  loadCities(country.id, s.id);
                                }
                              }}
                              className="p-2 cursor-pointer hover:bg-blue-50 text-sm"
                            >
                              {s.state_name}
                            </div>
                          ))}
                        {states.filter((s) =>
                          s.state_name.toLowerCase().includes(stateSearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-2 text-gray-400 text-sm italic">
                              {!formData.country ? "Please select a country first" : "No results found"}
                            </div>
                          )}
                      </div>
                    )}
                    {errors.state && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.state}</p>}
                  </div>

                  <div className="relative" ref={cityRef}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City/Location <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search City"
                        value={citySearch}
                        onChange={(e) => {
                          setCitySearch(e.target.value);
                          setShowCityDropdown(true);
                          setErrors(prev => ({ ...prev, city: "" }));
                        }}
                        onFocus={() => setShowCityDropdown(true)}
                        className={`w-full px-3 py-2 pr-14 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.city ? "border-red-500" : "border-gray-200"
                          }`}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {citySearch && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ ...formData, city: "" });
                              setCitySearch("");
                              setShowCityDropdown(true);
                              setErrors(prev => ({ ...prev, city: "" }));
                            }}
                            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCityDropdown(!showCityDropdown);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-0.5 transition-transform"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              showCityDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {showCityDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {cities
                          .filter((c) =>
                            c.city_name.toLowerCase().includes(citySearch.toLowerCase())
                          )
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setFormData({ ...formData, city: c.city_name });
                                setCitySearch(c.city_name);
                                setShowCityDropdown(false);
                                setErrors(prev => ({ ...prev, city: "" }));
                              }}
                              className="p-2 cursor-pointer hover:bg-blue-50 text-sm"
                            >
                              {c.city_name}
                            </div>
                          ))}
                        {cities.filter((c) =>
                          c.city_name.toLowerCase().includes(citySearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-2 text-gray-400 text-sm italic">
                              {!formData.state ? "Please select a state first" : "No results found"}
                            </div>
                          )}
                      </div>
                    )}
                    {errors.city && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.city}</p>}
                  </div>
                </div>

                {/* Pin Code Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pin Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      placeholder="Pin Code"
                      maxLength="6"
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white ${errors.pinCode ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors.pinCode && <p className="text-red-400 text-xs mt-1 relative left-1">{errors.pinCode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                    <textarea
                      name="address"
                      value={formData.address}
                      placeholder="Street address"
                      maxLength="100"
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-white h-16 resize-none ${errors.address ? "border-red-500" : "border-gray-200"}`}
                    />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formData.address.length}/100</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Visiting Card
                    </label>
                    <input
                      type="file"
                      name="visitingCard"
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600 cursor-pointer"
                    />
                    {formData.visitingCard && (
                      <p className="text-xs text-blue-600 mt-2 font-medium bg-blue-50 px-2 py-1 inline-block rounded-md border border-blue-100">
                        File selected: {formData.visitingCard.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Message */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  placeholder="Any additional details..."
                  maxLength="100"
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white h-16 resize-none"
                />
                <p className="text-xs text-gray-400 mt-0.5">{formData.message.length}/100</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="py-2.5 px-6 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transform transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Reserve Stall <Send size={14} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                By submitting, you agree to our terms
              </p>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        @supports (animation-timeline: view()) {
          .animate-in {
            opacity: 0;
            animation: slideIn 0.6s ease-out forwards;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Stall;