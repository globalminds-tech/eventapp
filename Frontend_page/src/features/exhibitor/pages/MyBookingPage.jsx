import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMyBookings, getBookingById, updateBooking, getCountries, getStates, getCities } from "@/Services/api";
import { X, ChevronDown } from "lucide-react";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [modalType, setModalType] = useState("");
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Country, State, City search states
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

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const reduxUser = useSelector((state) => state.user);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const user = reduxUser?.id ? reduxUser : storedUser;

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalType]);

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

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBookings(user.id);
      if (res.success) {
        setBookings(res.data);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (err) {
      setError("An error occurred while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const openView = async (id) => {
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setSelectedData(res.data);
        setModalType("view");
      }
    } catch (err) {
      setError("Failed to load booking details");
    }
  };

  const openEdit = async (id) => {
    try {
      const res = await getBookingById(id);
      if (res.success) {
        setForm(res.data);
        setModalType("edit");

        // Initialize search fields
        setCountrySearch(res.data.country || "");
        setStateSearch(res.data.state || "");
        setCitySearch(res.data.city || "");

        // Load all countries first
        const countriesList = await getCountries();
        setCountries(countriesList);

        // Find Country ISO code by name to load States
        if (res.data.country) {
          const matchedCountry = countriesList.find(
            (c) => c.country_name.toLowerCase() === res.data.country.toLowerCase()
          );
          if (matchedCountry) {
            const statesList = await getStates(matchedCountry.id);
            setStates(statesList);

            // Find State ISO code by name to load Cities
            if (res.data.state) {
              const matchedState = statesList.find(
                (s) => s.state_name.toLowerCase() === res.data.state.toLowerCase()
              );
              if (matchedState) {
                const citiesList = await getCities(matchedCountry.id, matchedState.id);
                setCities(citiesList);
              }
            }
          }
        }
      }
    } catch (err) {
      setError("Failed to load booking for editing");
    }
  };

  const closeModal = () => {
    setModalType("");
    setSelectedData(null);
    setForm({});
    setError("");
    setFieldErrors({});
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 1. Spacing Restriction
    if (typeof value === "string") {
      if (name === "email" || name === "mobile" || name === "pin_code") {
        value = value.replace(/\s/g, ""); // No spaces allowed at all
      } else {
        value = value.trimStart(); // No leading spaces allowed
      }
    }

    // 2. Number field restriction (Contact Number / PinCode)
    if (name === "mobile") {
      if (value !== "" && !/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }
    if (name === "pin_code") {
      if (value !== "" && !/^\d*$/.test(value)) return;
      if (value.length > 6) return;
    }

    // 3. Alphabet restriction for specific text fields
    if (["first_name", "last_name", "city", "state", "country"].includes(name)) {
      if (value !== "" && !/^[a-zA-Z\s]*$/.test(value)) {
        return; // Disallow numbers/special characters
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "mobile",
      "company_name",
      "country",
      "state",
      "city",
      "address",
      "stall_area",
      "products",
      "pin_code",
    ];

    requiredFields.forEach((field) => {
      if (
        !form[field] ||
        (typeof form[field] === "string" && form[field].trim() === "")
      ) {
        newErrors[field] = "This field is required";
      }
    });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (form.mobile && !/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setError("");
      const res = await updateBooking(form.id, form);
      if (res.success) {
        showNotification("Booking updated successfully!", "success");
        closeModal();
        fetchBookings();
      } else {
        setError("Failed to update booking");
        showNotification("Failed to update booking", "error");
      }
    } catch (err) {
      setError("An error occurred while updating");
      showNotification("An error occurred while updating", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                My Stall Bookings
              </h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                Manage and view your event stall bookings
              </p>
              <button
                onClick={() => navigate("/exhibitor/dashboard")}
                className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-all hover:-translate-x-1"
              >
                ← Back to Home
              </button>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-blue-700 font-semibold">
                {bookings.length} Booking{bookings.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-300">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-12 h-12">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin"
                style={{ opacity: 0.2 }}
              ></div>
              <div className="absolute inset-2 bg-white rounded-full"></div>
            </div>
            <p className="text-slate-500 mt-4 font-medium">
              Loading your bookings...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-slate-500 text-center">
              You haven't made any stall bookings yet. Start by creating your
              first booking!
            </p>
          </div>
        ) : (
          /* CARD GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((item, index) => (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* STATUS BADGE */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${item.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {item.status?.charAt(0).toUpperCase() +
                      item.status?.slice(1) || "Pending"}
                  </span>
                </div>

                {/* EVENT NAME */}
                <h2 className="text-lg font-bold text-slate-900 mb-1 pr-20 line-clamp-2">
                  {item.event_name}
                </h2>

                {/* DIVIDER */}
                <div className="h-px bg-gradient-to-r from-slate-200 to-transparent my-3"></div>

                {/* INFO GRID */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">👤</span>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Organizer
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.first_name} {item.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📞</span>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Contact
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.mobile}
                      </p>
                    </div>
                  </div>

                  {item.company_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🏢</span>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Company
                        </p>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {item.company_name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => openView(item.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => openEdit(item.id)}
                    disabled={
                      item.status === "approved" || item.status === "confirmed"
                    }
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all duration-200
    ${item.status === "approved" || item.status === "confirmed"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:scale-95"
                      }
  `}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {modalType && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shrink-0">
              <h2 className="text-2xl font-bold text-slate-900">
                {modalType === "view" ? "Booking Details" : "Edit Booking"}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors duration-200 text-slate-500 hover:text-slate-700 font-semibold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar p-8">
              {/* ERROR IN MODAL */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* VIEW MODAL */}
              {modalType === "view" && selectedData && (
                <div className="space-y-6">
                  {/* EVENT INFO */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                      Event
                    </h3>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedData.event_name}
                    </p>
                  </div>

                  {/* TWO COLUMN GRID */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* PERSONAL INFO */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Full Name
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.first_name} {selectedData.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Email
                        </label>
                        <p className="text-slate-900 font-semibold mt-1 break-all">
                          {selectedData.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Mobile
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.mobile}
                        </p>
                      </div>
                    </div>

                    {/* COMPANY INFO */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Company
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.company_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Designation
                        </label>
                        <p className="text-slate-900 font-semibold mt-1">
                          {selectedData.designation}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Status
                        </label>
                        <p className="text-slate-900 font-semibold mt-1 capitalize">
                          {selectedData.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS INFO */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Address
                    </label>
                    <p className="text-slate-900 font-semibold mt-2">
                      {selectedData.address}
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          City
                        </p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {selectedData.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          State
                        </p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {selectedData.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Pincode
                        </p>
                        <p className="text-slate-900 font-semibold text-sm">
                          {selectedData.pin_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STALL & PRODUCTS */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Stall Area
                      </label>
                      <p className="text-slate-900 font-semibold mt-1">
                        {selectedData.stall_area}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Products
                      </label>
                      <p className="text-slate-900 font-semibold mt-1">
                        {selectedData.products}
                      </p>
                    </div>
                  </div>

                  {/* MESSAGES */}
                  {selectedData.messages && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <label className="text-xs font-bold uppercase tracking-wide text-blue-700">
                        Additional Messages
                      </label>
                      <p className="text-slate-900 mt-2 leading-relaxed">
                        {selectedData.messages}
                      </p>
                    </div>
                  )}

                  {/* VISITING CARD PREVIEW */}
                  {selectedData.visiting_card_url && (
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-3">
                        Visiting Card
                      </label>
                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 transition-all hover:shadow-lg">
                        <img
                          src={selectedData.visiting_card_url}
                          alt="Visiting Card"
                          className="w-full h-auto object-contain max-h-[300px] mx-auto"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <a
                            href={selectedData.visiting_card_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block text-center py-2 bg-white/90 text-slate-900 rounded-lg font-bold text-sm backdrop-blur hover:bg-white transition-colors"
                          >
                            Open Original Large Image ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EDIT MODAL */}
              {modalType === "edit" && (
                <div>
                  <div className="space-y-4">
                    {/* NAME FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={form.first_name || ""}
                          onChange={handleChange}
                          placeholder="First Name"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.first_name ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.first_name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.first_name}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={form.last_name || ""}
                          onChange={handleChange}
                          placeholder="Last Name"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.last_name ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.last_name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.last_name}</p>}
                      </div>
                    </div>

                    {/* CONTACT FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email || ""}
                          onChange={handleChange}
                          placeholder="Email"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.email ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.email}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Mobile
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={form.mobile || ""}
                          onChange={handleChange}
                          placeholder="Mobile"
                          maxLength="10"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.mobile ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.mobile && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.mobile}</p>}
                      </div>
                    </div>

                    {/* COMPANY FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          value={form.company_name || ""}
                          onChange={handleChange}
                          placeholder="Company Name"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.company_name ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.company_name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.company_name}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Designation
                        </label>
                        <input
                          type="text"
                          name="designation"
                          value={form.designation || ""}
                          onChange={handleChange}
                          placeholder="Designation"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium"
                        />
                      </div>
                    </div>

                    {/* LOCATION FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative" ref={countryRef}>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Country
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search Country"
                            value={countrySearch}
                            onChange={(e) => {
                              setCountrySearch(e.target.value);
                              setShowCountryDropdown(true);
                              setFieldErrors(prev => ({ ...prev, country: "" }));
                            }}
                            onFocus={() => setShowCountryDropdown(true)}
                            className={`w-full px-4 py-3 pr-14 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.country ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {countrySearch && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm({ ...form, country: "", state: "", city: "" });
                                  setCountrySearch("");
                                  setStateSearch("");
                                  setCitySearch("");
                                  setShowCountryDropdown(true);
                                  setFieldErrors(prev => ({ ...prev, country: "", state: "", city: "" }));
                                }}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
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
                              className="text-slate-400 hover:text-slate-600 p-0.5 transition-transform"
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
                          <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {countries
                              .filter((c) =>
                                c.country_name.toLowerCase().includes(countrySearch.toLowerCase())
                              )
                              .map((c) => (
                                <div
                                  key={c.id}
                                  onClick={() => {
                                    setForm({ ...form, country: c.country_name, state: "", city: "" });
                                    setCountrySearch(c.country_name);
                                    setStateSearch("");
                                    setCitySearch("");
                                    setShowCountryDropdown(false);
                                    setFieldErrors(prev => ({ ...prev, country: "", state: "", city: "" }));
                                    loadStates(c.id);
                                  }}
                                  className="p-2 cursor-pointer hover:bg-blue-50 text-sm text-slate-700"
                                >
                                  {c.country_name}
                                </div>
                              ))}
                            {countries.filter((c) =>
                              c.country_name.toLowerCase().includes(countrySearch.toLowerCase())
                            ).length === 0 && (
                                <div className="p-2 text-slate-400 text-sm">No results found</div>
                              )}
                          </div>
                        )}
                        {fieldErrors.country && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.country}</p>}
                      </div>

                      <div className="relative" ref={stateRef}>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          State
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search State"
                            value={stateSearch}
                            onChange={(e) => {
                              setStateSearch(e.target.value);
                              setShowStateDropdown(true);
                              setFieldErrors(prev => ({ ...prev, state: "" }));
                            }}
                            onFocus={() => setShowStateDropdown(true)}
                            className={`w-full px-4 py-3 pr-14 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.state ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {stateSearch && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm({ ...form, state: "", city: "" });
                                  setStateSearch("");
                                  setCitySearch("");
                                  setShowStateDropdown(true);
                                  setFieldErrors(prev => ({ ...prev, state: "", city: "" }));
                                }}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
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
                              className="text-slate-400 hover:text-slate-600 p-0.5 transition-transform"
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
                          <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {states
                              .filter((s) =>
                                s.state_name.toLowerCase().includes(stateSearch.toLowerCase())
                              )
                              .map((s) => (
                                <div
                                  key={s.id}
                                  onClick={() => {
                                    setForm({ ...form, state: s.state_name, city: "" });
                                    setStateSearch(s.state_name);
                                    setCitySearch("");
                                    setShowStateDropdown(false);
                                    setFieldErrors(prev => ({ ...prev, state: "", city: "" }));
                                    const country = countries.find(c => c.country_name === form.country);
                                    if (country) {
                                      loadCities(country.id, s.id);
                                    }
                                  }}
                                  className="p-2 cursor-pointer hover:bg-blue-50 text-sm text-slate-700"
                                >
                                  {s.state_name}
                                </div>
                              ))}
                            {states.filter((s) =>
                              s.state_name.toLowerCase().includes(stateSearch.toLowerCase())
                            ).length === 0 && (
                                <div className="p-2 text-slate-400 text-sm italic">
                                  {!form.country ? "Please select a country first" : "No results found"}
                                </div>
                              )}
                          </div>
                        )}
                        {fieldErrors.state && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.state}</p>}
                      </div>
                    </div>

                    {/* CITY & PINCODE */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative" ref={cityRef}>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          City
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search City"
                            value={citySearch}
                            onChange={(e) => {
                              setCitySearch(e.target.value);
                              setShowCityDropdown(true);
                              setFieldErrors(prev => ({ ...prev, city: "" }));
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            className={`w-full px-4 py-3 pr-14 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.city ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {citySearch && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm({ ...form, city: "" });
                                  setCitySearch("");
                                  setShowCityDropdown(true);
                                  setFieldErrors(prev => ({ ...prev, city: "" }));
                                }}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
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
                              className="text-slate-400 hover:text-slate-600 p-0.5 transition-transform"
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
                          <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {cities
                              .filter((c) =>
                                c.city_name.toLowerCase().includes(citySearch.toLowerCase())
                              )
                              .map((c) => (
                                <div
                                  key={c.id}
                                  onClick={() => {
                                    setForm({ ...form, city: c.city_name });
                                    setCitySearch(c.city_name);
                                    setShowCityDropdown(false);
                                    setFieldErrors(prev => ({ ...prev, city: "" }));
                                  }}
                                  className="p-2 cursor-pointer hover:bg-blue-50 text-sm text-slate-700"
                                >
                                  {c.city_name}
                                </div>
                              ))}
                            {cities.filter((c) =>
                              c.city_name.toLowerCase().includes(citySearch.toLowerCase())
                            ).length === 0 && (
                                <div className="p-2 text-slate-400 text-sm italic">
                                  {!form.state ? "Please select a state first" : "No results found"}
                                </div>
                              )}
                          </div>
                        )}
                        {fieldErrors.city && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.city}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pin_code"
                          value={form.pin_code || ""}
                          onChange={handleChange}
                          placeholder="Pincode"
                          maxLength="6"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.pin_code ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.pin_code && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.pin_code}</p>}
                      </div>
                    </div>

                    {/* STALL & PRODUCTS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Stall Area
                        </label>
                        <input
                          type="text"
                          name="stall_area"
                          value={form.stall_area || ""}
                          onChange={handleChange}
                          placeholder="Stall Area"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.stall_area ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.stall_area && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.stall_area}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                          Products
                        </label>
                        <input
                          type="text"
                          name="products"
                          value={form.products || ""}
                          onChange={handleChange}
                          placeholder="Products"
                          className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium ${fieldErrors.products ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                        />
                        {fieldErrors.products && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.products}</p>}
                      </div>
                    </div>

                    {/* TEXTAREA FIELDS */}
                    <div>
                      <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={form.address || ""}
                        onChange={handleChange}
                        placeholder="Full Address"
                        rows="3"
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 font-medium resize-none ${fieldErrors.address ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                      />
                      {fieldErrors.address && <p className="text-red-500 text-[10px] mt-1 font-semibold">{fieldErrors.address}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold  tracking-wide text-slate-600 mb-2 block">
                        Additional Messages
                      </label>
                      <textarea
                        name="messages"
                        value={form.messages || ""}
                        onChange={handleChange}
                        placeholder="Any additional messages or notes"
                        rows="3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200 font-medium resize-none"
                      />
                    </div>

                    {/* CURRENT VISITING CARD PREVIEW (In Edit Modal) */}
                    {form.visiting_card_url && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="text-xs font-bold  tracking-wide text-slate-500 block mb-2">
                          Current Visiting Card
                        </label>
                        <img
                          src={form.visiting_card_url}
                          alt="Current Card"
                          className="h-32 w-auto rounded border border-slate-300 object-contain shadow-sm"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">Uploading a new card in the main form will replace this.</p>
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:shadow-lg active:scale-95"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[200] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 border ${toast.type === "success"
            ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
            : "bg-rose-600 text-white border-rose-500 shadow-rose-200"
          }`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <p className="font-bold text-sm tracking-wide">{toast.message}</p>
        </div>
      )}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
