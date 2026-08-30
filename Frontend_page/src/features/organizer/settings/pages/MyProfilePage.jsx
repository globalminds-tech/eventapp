import { useState, useEffect, useRef } from "react";
import { FaCloudUploadAlt, FaSave, FaUserCircle, FaChevronDown, FaTimes, FaSpinner, FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getUserProfile, updateUserProfile, getCountries, getStates, getCities } from "@/Services/api";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/store/userSlice";


const MyProfile = () => {
  const { t } = useTranslation();
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const dispatch = useDispatch();

  const userId = sessionStorage.getItem("userId") || sessionStorage.getItem("User_id") || sessionStorage.getItem("id");

  const [countries, setCountries] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    id: userId,
    name: "",
    mobile: "",
    email: "",
    address: "",
    country: "",
    state: "",
    city: "",
    profile_image: "",
    organization_name: ""
  });

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
    loadCountries();
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Click away listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
        setCountrySearch(formData.country || "");
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setShowStateDropdown(false);
        setStateSearch(formData.state || "");
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowCityDropdown(false);
        setCitySearch(formData.city || "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formData.country, formData.state, formData.city]);


  const loadCountries = async () => {
    try {
      const res = await getCountries();
      setCountries(res);
    } catch (err) {
      console.error("Error loading countries:", err);
    }
  };

  // Fetch states when country changes
  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(c => c.country_name === formData.country);
      if (selectedCountry) {
        loadStates(selectedCountry.id);
      }
    } else {
      setStatesList([]);
      setCitiesList([]);
    }
  }, [formData.country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state && formData.country) {
      const selectedCountry = countries.find(c => c.country_name === formData.country);
      const selectedState = statesList.find(s => s.state_name === formData.state);
      if (selectedCountry && selectedState) {
        loadCities(selectedCountry.id, selectedState.id);
      }
    } else {
      setCitiesList([]);
    }
  }, [formData.state, statesList, formData.country, countries]);

  const loadStates = async (countryCode) => {
    setLoadingStates(true);
    try {
      const res = await getStates(countryCode);
      setStatesList(res);
    } catch (err) {
      console.error("Error loading states:", err);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (countryCode, stateCode) => {
    setLoadingCities(true);
    try {
      const res = await getCities(countryCode, stateCode);
      setCitiesList(res);
    } catch (err) {
      console.error("Error loading cities:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCountrySelect = (c) => {
    setFormData(prev => ({ ...prev, country: c.country_name, state: "", city: "" }));
    setCountrySearch(c.country_name);
    setStateSearch("");
    setCitySearch("");
    setShowCountryDropdown(false);
    loadStates(c.id);
  };

  const handleStateSelect = (s) => {
    setFormData(prev => ({ ...prev, state: s.state_name, city: "" }));
    setStateSearch(s.state_name);
    setCitySearch("");
    setShowStateDropdown(false);
    const country = countries.find(c => c.country_name === formData.country);
    if (country) {
      loadCities(country.id, s.id);
    }
  };

  const handleCitySelect = (c) => {
    setFormData(prev => ({ ...prev, city: c.city_name }));
    setCitySearch(c.city_name);
    setShowCityDropdown(false);
  };

  const handleClearCountry = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, country: "", state: "", city: "" }));
    setCountrySearch("");
    setStateSearch("");
    setCitySearch("");
    setStatesList([]);
    setCitiesList([]);
    setShowCountryDropdown(true);
  };

  const handleClearState = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, state: "", city: "" }));
    setStateSearch("");
    setCitySearch("");
    setCitiesList([]);
    setShowStateDropdown(true);
  };

  const handleClearCity = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, city: "" }));
    setCitySearch("");
    setShowCityDropdown(true);
  };

  const filteredCountries = countrySearch && countrySearch !== formData.country
    ? countries.filter(c => c.country_name.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  const filteredStates = stateSearch && stateSearch !== formData.state
    ? statesList.filter(s => s.state_name.toLowerCase().includes(stateSearch.toLowerCase()))
    : statesList;

  const filteredCities = citySearch && citySearch !== formData.city
    ? citiesList.filter(c => c.city_name.toLowerCase().includes(citySearch.toLowerCase()))
    : citiesList;


  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile(userId);
      if (res.status === "success") {
        const data = res.data;

        setFormData({
          id: data.id,
          name: data.name || "",
          mobile: data.mobile || "",
          email: data.email || "",
          address: data.address || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          profile_image: data.profile_image || "",
          organization_name: data.organization_name || ""
        });

        setCountrySearch(data.country || "");
        setStateSearch(data.state || "");
        setCitySearch(data.city || "");

        if (data.profile_image) setProfileImage(data.profile_image);
      }

    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setFormData(prev => ({ ...prev, profile_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await updateUserProfile(formData);
      if (res.status === "success") {
        setMessage({ type: "success", text: "Profile updated successfully!" });

        // 🔥 Instant sync with Redux & Header
        sessionStorage.setItem("name", formData.name);
        sessionStorage.setItem("profile_image", formData.profile_image);

        dispatch(setUser({
          id: formData.id,
          name: formData.name,
          role: sessionStorage.getItem("role") || "organizer",
          profile_image: formData.profile_image
        }));

      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }

    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({ type: "error", text: "Error connecting to server." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-['Times_New_Roman',Times,serif]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            My Profile
          </h1>
          <p className="text-slate-500 font-medium">Update your account details and preferences</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${saving ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30"
            }`}
        >
          {saving ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <FaSave size={20} />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}>
          {message.text}
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* PROFILE PICTURE CARD */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-slate-800 self-start mb-8 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Profile Photo
          </h2>

          <div className="relative group">
            <div className="w-48 h-48 rounded-[3rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-50 flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <FaUserCircle className="text-slate-200 w-full h-full" />
              )}
            </div>
            <label className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/40 cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all active:scale-90">
              <FaCloudUploadAlt size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="mt-12 text-slate-400 text-sm font-medium leading-relaxed">
            <p>Supported formats: JPG, PNG, WEBP</p>
            <p className="mt-1">Max size: 5MB</p>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* PERSONAL INFO */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Identity Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Contact Number  <span className="text-red-500">*</span></label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Allow only digits and optional '+' at start
                    if (/^\+?\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="e.g. +91 98765 43210"
                  maxLength={13} // +91 + 10 digits
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Email Address (Locked)</label>
                <input
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 px-5 py-4 rounded-2xl text-slate-400 font-bold cursor-not-allowed"
                />
                <p className="mt-2 text-[11px] text-slate-400 ml-1">Contact support to change your registered email</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Organization Name <span className="text-red-500">*</span></label>
                <input
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* GEOLOCATION */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Location & Address <span className="text-red-500">*</span>
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Work/Home Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Street, Building, Apartment..."
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* COUNTRY */}
                <div className="relative" ref={countryRef}>
                  <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Country</label>
                  <div className="relative flex items-center">
                    <FaSearch className="absolute left-4 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search Country"
                      value={countrySearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCountrySearch(val);
                        setShowCountryDropdown(true);
                        if (val === "") {
                          setFormData(prev => ({ ...prev, country: "", state: "", city: "" }));
                          setStateSearch("");
                          setCitySearch("");
                        }
                      }}
                      onFocus={() => setShowCountryDropdown(true)}
                      className="w-full bg-slate-50 border border-slate-200 pl-11 pr-16 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-800"
                    />
                    <div className="absolute right-4 flex items-center gap-1.5">
                      {countrySearch && (
                        <button
                          type="button"
                          onClick={handleClearCountry}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="text-slate-400 hover:text-slate-600 p-1 transition-transform"
                      >
                        <FaChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCountryDropdown ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>
                  {showCountryDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-2xl bottom-full mb-2 max-h-48 overflow-y-auto shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                      {filteredCountries.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 font-bold text-sm">
                          No countries found
                        </div>
                      ) : (
                        filteredCountries.map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleCountrySelect(c)}
                            className={`p-3 cursor-pointer rounded-xl transition-all font-bold text-sm ${
                              formData.country === c.country_name
                                ? "bg-blue-600 text-white"
                                : "hover:bg-blue-50 hover:text-blue-600 text-slate-700"
                            }`}
                          >
                            {c.country_name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* STATE */}
                <div className="relative" ref={stateRef}>
                  <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">State</label>
                  <div className="relative flex items-center">
                    <FaSearch className="absolute left-4 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={formData.country ? "Search State" : "Select Country first"}
                      value={stateSearch}
                      disabled={!formData.country}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStateSearch(val);
                        setShowStateDropdown(true);
                        if (val === "") {
                          setFormData(prev => ({ ...prev, state: "", city: "" }));
                          setCitySearch("");
                        }
                      }}
                      onFocus={() => setShowStateDropdown(true)}
                      className={`w-full border pl-11 pr-16 py-4 rounded-2xl outline-none font-bold transition-all ${
                        !formData.country
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
                      }`}
                    />
                    <div className="absolute right-4 flex items-center gap-1.5">
                      {stateSearch && formData.country && (
                        <button
                          type="button"
                          onClick={handleClearState}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      )}
                      {loadingStates ? (
                        <FaSpinner className="w-3.5 h-3.5 animate-spin text-blue-600 mr-1" />
                      ) : (
                        <button
                          type="button"
                          disabled={!formData.country}
                          onClick={() => setShowStateDropdown(!showStateDropdown)}
                          className="text-slate-400 hover:text-slate-600 p-1 transition-transform disabled:opacity-50"
                        >
                          <FaChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showStateDropdown ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  {showStateDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-2xl bottom-full mb-2 max-h-48 overflow-y-auto shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                      {loadingStates ? (
                        <div className="p-4 text-center text-slate-400 font-bold text-sm flex items-center justify-center gap-2">
                          <FaSpinner className="animate-spin text-blue-600 w-4 h-4" />
                          Loading states...
                        </div>
                      ) : filteredStates.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 font-bold text-sm">
                          No states found
                        </div>
                      ) : (
                        filteredStates.map(s => (
                          <div
                            key={s.id}
                            onClick={() => handleStateSelect(s)}
                            className={`p-3 cursor-pointer rounded-xl transition-all font-bold text-sm ${
                              formData.state === s.state_name
                                ? "bg-blue-600 text-white"
                                : "hover:bg-blue-50 hover:text-blue-600 text-slate-700"
                            }`}
                          >
                            {s.state_name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* CITY */}
                <div className="relative" ref={cityRef}>
                  <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">City</label>
                  <div className="relative flex items-center">
                    <FaSearch className="absolute left-4 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={formData.state ? "Search City" : "Select State first"}
                      value={citySearch}
                      disabled={!formData.state}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCitySearch(val);
                        setShowCityDropdown(true);
                        if (val === "") {
                          setFormData(prev => ({ ...prev, city: "" }));
                        }
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      className={`w-full border pl-11 pr-16 py-4 rounded-2xl outline-none font-bold transition-all ${
                        !formData.state
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
                      }`}
                    />
                    <div className="absolute right-4 flex items-center gap-1.5">
                      {citySearch && formData.state && (
                        <button
                          type="button"
                          onClick={handleClearCity}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      )}
                      {loadingCities ? (
                        <FaSpinner className="w-3.5 h-3.5 animate-spin text-blue-600 mr-1" />
                      ) : (
                        <button
                          type="button"
                          disabled={!formData.state}
                          onClick={() => setShowCityDropdown(!showCityDropdown)}
                          className="text-slate-400 hover:text-slate-600 p-1 transition-transform disabled:opacity-50"
                        >
                          <FaChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCityDropdown ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  {showCityDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-2xl bottom-full mb-2 max-h-48 overflow-y-auto shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
                      {loadingCities ? (
                        <div className="p-4 text-center text-slate-400 font-bold text-sm flex items-center justify-center gap-2">
                          <FaSpinner className="animate-spin text-blue-600 w-4 h-4" />
                          Loading cities...
                        </div>
                      ) : filteredCities.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 font-bold text-sm">
                          No cities found
                        </div>
                      ) : (
                        filteredCities.map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleCitySelect(c)}
                            className={`p-3 cursor-pointer rounded-xl transition-all font-bold text-sm ${
                              formData.city === c.city_name
                                ? "bg-blue-600 text-white"
                                : "hover:bg-blue-50 hover:text-blue-600 text-slate-700"
                            }`}
                          >
                            {c.city_name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
