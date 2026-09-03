import React, { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Award,
  UserPlus,
  Trash2,
  UploadCloud,
  Check,
  AlertCircle,
  ChevronDown,
  Search,
  X,
  Eye,
  Edit,
} from "lucide-react";
import {
  getVendorTypes,
  getVendorNames,
  getSponsorNames,
  createVendor,
  createSponsor
} from "@/Services/api";
import { useSelector } from "react-redux";
import { Select, SelectItem } from "@/components/ui/Select";

const Step6VendorSponsor = ({ formData, setFormData, isReadOnly }) => {
  // ===========================
  // ✅ STATE
  // ===========================

  // Vendor
  const [vendorType, setVendorType] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorTypes, setVendorTypes] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [isVendorTypeOpen, setIsVendorTypeOpen] = useState(false);
  const [vendorTypeSearch, setVendorTypeSearch] = useState("");
  const [isVendorNameOpen, setIsVendorNameOpen] = useState(false);
  const [vendorNameSearch, setVendorNameSearch] = useState("");

  // Sponsor
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorship, setSponsorship] = useState("");
  const [sponsorNames, setSponsorNames] = useState([]);
  const [sponsorList, setSponsorList] = useState([]);
  const [isSponsorNameOpen, setIsSponsorNameOpen] = useState(false);
  const [sponsorNameSearch, setSponsorNameSearch] = useState("");
  const [isSponsorshipOpen, setIsSponsorshipOpen] = useState(false);
  const [sponsorshipSearch, setSponsorshipSearch] = useState("");

  const sponsorshipTiers = ["Title Sponsor", "Event Sponsor", "Gift Sponsor"];

  // Guest
  const [guestImage, setGuestImage] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [designation, setDesignation] = useState("");
  const [contact, setContact] = useState("");
  const [guestList, setGuestList] = useState([]);
  const [croppingImage, setCroppingImage] = useState(null);
  const [previewModal, setPreviewModal] = useState({ open: false, url: "" });

  const Redexorganizer = useSelector((state) => state.user);
  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };
  const organizer = Redexorganizer?.id ? Redexorganizer : storedUser;

  // New states for Quick Add
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [editingVendorIndex, setEditingVendorIndex] = useState(null);
  const [editingSponsorIndex, setEditingSponsorIndex] = useState(null);
  const [editingGuestIndex, setEditingGuestIndex] = useState(null);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const [newVendor, setNewVendor] = useState({
    vendor_type: "",
    vendor_name: "",
    company_name: "",
    primary_contact: "",
    mail_id: "",
    address: "",
    status: "Active"
  });

  const [newSponsor, setNewSponsor] = useState({
    sponsor_name: "",
    primary_contact: "",
    mail_id: "",
    address: "",
    status: "Active"
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const demoVendorTypes = [
    { vendor_type: "Catering & Beverages" },
    { vendor_type: "Audio & Visual Systems" },
    { vendor_type: "Security & Bouncers" },
    { vendor_type: "Stage & Decoration" },
    { vendor_type: "Lighting & Power Backup" },
    { vendor_type: "Photography & Videography" },
  ];

  const demoVendorNames = [
    { vendor_name: "Apex Event Caterers" },
    { vendor_name: "SoundCraft Pro Systems" },
    { vendor_name: "Guardian Security Services" },
    { vendor_name: "Starlight Decorators" },
  ];

  const demoSponsorNames = [
    { sponsor_name: "Red Bull Energy" },
    { sponsor_name: "Tech Corp Global" },
    { sponsor_name: "Monster Energy" },
    { sponsor_name: "Samsung Electronics" },
    { sponsor_name: "Intel Corporation" },
  ];

  const loadVendorTypes = async () => {
    try {
      const data = await getVendorTypes();
      if (data && Array.isArray(data)) {
        const uniqueData = Array.from(
          new Map(data.map((item) => [item.vendor_type, item])).values(),
        );
        setVendorTypes(uniqueData);
      }
    } catch {
      setVendorTypes([]);
    }
  };

  const loadVendorNames = async () => {
    if (!vendorType) return;
    try {
      const data = await getVendorNames(vendorType);
      if (data && Array.isArray(data)) {
        const uniqueData = Array.from(
          new Map(data.map((item) => [item.vendor_name, item])).values(),
        );
        setVendorNames(uniqueData);
      }
    } catch {
      setVendorNames([]);
    }
  };

  const loadSponsors = async () => {
    try {
      const data = await getSponsorNames();
      if (data && Array.isArray(data)) {
        const uniqueData = Array.from(
          new Map(data.map((item) => [item.sponsor_name, item])).values(),
        );
        setSponsorNames(uniqueData);
      }
    } catch {
      setSponsorNames([]);
    }
  };

  // Click away listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".vendor-type-dropdown"))
        setIsVendorTypeOpen(false);
      if (!event.target.closest(".vendor-name-dropdown"))
        setIsVendorNameOpen(false);
      if (!event.target.closest(".sponsor-name-dropdown"))
        setIsSponsorNameOpen(false);
      if (!event.target.closest(".sponsorship-dropdown"))
        setIsSponsorshipOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===========================
  // ✅ LOAD FROM formData (IMPORTANT FIX)
  // ===========================
  useEffect(() => {
    const v = formData?.vendorSponsor || formData?.vendors;
    if (v) {
      if (Array.isArray(v.vendors) && v.vendors.length > 0) setVendorList(v.vendors);
      if (Array.isArray(v.sponsors) && v.sponsors.length > 0) setSponsorList(v.sponsors);
      if (Array.isArray(v.guests) && v.guests.length > 0) setGuestList(v.guests);
    }
  }, [formData?.vendorSponsor, formData?.vendors]);

  // ===========================
  // ✅ SAVE TO formData (SYNC)
  // ===========================
  useEffect(() => {
    if (vendorList.length > 0 || sponsorList.length > 0 || guestList.length > 0) {
      setFormData((prev) => ({
        ...prev,
        vendorSponsor: {
          vendors: vendorList,
          sponsors: sponsorList,
          guests: guestList,
        },
        vendors: {
          vendors: vendorList,
          sponsors: sponsorList,
          guests: guestList,
        },
      }));
    }
  }, [vendorList, sponsorList, guestList]);

  // ===========================
  // ✅ API LOADS
  // ===========================

  // Vendor Types
  useEffect(() => {
    loadVendorTypes();
  }, []);

  // Vendor Names based on type
  useEffect(() => {
    loadVendorNames();
  }, [vendorType]);

  // Sponsor Names
  useEffect(() => {
    loadSponsors();
  }, []);

  // Vendor names filter logic
  const filteredVendorTypes = vendorTypes.filter((v) =>
    v.vendor_type?.toLowerCase().includes(vendorTypeSearch.toLowerCase()),
  );

  const filteredVendorNames = vendorNames.filter((v) =>
    v.vendor_name?.toLowerCase().includes(vendorNameSearch.toLowerCase()),
  );

  const filteredSponsorNamesList = sponsorNames.filter((s) =>
    s.sponsor_name?.toLowerCase().includes(sponsorNameSearch.toLowerCase()),
  );

  const filteredSponsorshipTiers = sponsorshipTiers.filter((t) =>
    t.toLowerCase().includes(sponsorshipSearch.toLowerCase()),
  );

  // ===========================
  // ✅ ACTIONS
  // ===========================

  const addVendor = () => {
    if (!vendorType || !vendorName) {
      showNotification("Please select both category and provider", "error");
      return;
    }

    const newVendorData = {
      vendorType,
      vendorName,
      passCount: 1, // Default to 1 on add
    };

    if (editingVendorIndex !== null) {
      const updated = [...vendorList];
      updated[editingVendorIndex] = newVendorData;
      setVendorList(updated);
      setEditingVendorIndex(null);
      showNotification("Vendor updated in list!");
    } else {
      setVendorList((prev) => [...prev, newVendorData]);
      showNotification("Vendor added to list!");
    }

    setVendorType("");
    setVendorName("");
  };

  const removeVendor = (index) => {
    setVendorList((prev) => prev.filter((_, i) => i !== index));
    showNotification("Vendor removed from list", "error");
  };

  const editVendor = (index) => {
    const item = vendorList[index];
    setVendorType(item.vendorType);
    setVendorName(item.vendorName);
    setEditingVendorIndex(index);
    showNotification("Editing vendor selection...", "success");
  };

  const addSponsor = () => {
    if (!sponsorName || !sponsorship) {
      showNotification("Please select both partner and tier", "error");
      return;
    }

    const newSponsor = {
      sponsorName,
      sponsorship,
    };

    if (editingSponsorIndex !== null) {
      const updated = [...sponsorList];
      updated[editingSponsorIndex] = newSponsor;
      setSponsorList(updated);
      setEditingSponsorIndex(null);
      showNotification("Sponsor updated in list!");
    } else {
      setSponsorList((prev) => [...prev, newSponsor]);
      showNotification("Sponsor added to list!");
    }

    setSponsorName("");
    setSponsorship("");
  };

  const removeSponsor = (index) => {
    setSponsorList((prev) => prev.filter((_, i) => i !== index));
    showNotification("Sponsor removed from list", "error");
  };

  const editSponsor = (index) => {
    const item = sponsorList[index];
    setSponsorName(item.sponsorName);
    setSponsorship(item.sponsorship);
    setEditingSponsorIndex(index);
    showNotification("Editing sponsor selection...", "success");
  };

  const handleGuestImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size should be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCroppingImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addGuest = () => {
    // Basic validation
    if (!guestName.trim() || !contact.trim()) {
      showNotification("Name and contact are required", "error");
      return;
    }

    // Letters Only validation for name
    if (!/^[a-zA-Z\s]*$/.test(guestName)) return;

    // Numbers Only validation for contact
    if (!/^\d*$/.test(contact)) return;

    const newGuest = {
      name: guestName.trim(),
      designation: designation.trim(),
      contact: contact.trim(),
      image: guestImage?.preview || "",
    };

    if (editingGuestIndex !== null) {
      const updated = [...guestList];
      updated[editingGuestIndex] = newGuest;
      setGuestList(updated);
      setEditingGuestIndex(null);
      showNotification("Guest details updated!");
    } else {
      setGuestList((prev) => [...prev, newGuest]);
      showNotification("Guest added to list!");
    }

    setGuestImage(null);
    setGuestName("");
    setDesignation("");
    setContact("");
  };

  const removeGuest = (index) => {
    setGuestList((prev) => prev.filter((_, i) => i !== index));
    showNotification("Guest removed from list", "error");
  };

  const editGuest = (index) => {
    const item = guestList[index];
    setGuestName(item.name);
    setDesignation(item.designation);
    setContact(item.contact);
    if (item.image) {
      setGuestImage({ preview: item.image, file: null });
    } else {
      setGuestImage(null);
    }
    setEditingGuestIndex(index);
    showNotification("Editing guest details...", "success");
  };

  const updateVendorPassCount = (index, delta) => {
    setVendorList(prev => {
      const updated = [...prev];
      const newCount = Math.max(0, (updated[index].passCount || 0) + delta);
      updated[index] = { ...updated[index], passCount: newCount };
      return updated;
    });
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newVendor.vendor_type) errors.vendor_type = "Required";
    if (!newVendor.vendor_name.trim()) {
      errors.vendor_name = "Name required";
    } else if (newVendor.vendor_name.length > 30) {
      errors.vendor_name = "Max 30 chars";
    }

    if (!newVendor.company_name.trim()) errors.company_name = "Required";

    if (!newVendor.primary_contact.trim()) {
      errors.primary_contact = "Required";
    } else if (!/^\d{10}$/.test(newVendor.primary_contact)) {
      errors.primary_contact = "10 digits required";
    }

    if (!newVendor.mail_id.trim()) {
      errors.mail_id = "Required";
    } else if (!emailRegex.test(newVendor.mail_id)) {
      errors.mail_id = "Invalid email";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await createVendor({ ...newVendor, organizer_id: organizer.id });
      await loadVendorTypes();
      await loadVendorNames();
      showNotification("Vendor created successfully!");
      setShowAddVendorModal(false);
      setNewVendor({
        vendor_type: "",
        vendor_name: "",
        company_name: "",
        primary_contact: "",
        mail_id: "",
        address: "",
        status: "Active"
      });
      setFieldErrors({});
    } catch (error) {
      console.error("Vendor Create Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSponsor = async (e) => {
    e.preventDefault();
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newSponsor.sponsor_name.trim()) {
      errors.sponsor_name = "Name required";
    } else if (newSponsor.sponsor_name.length > 30) {
      errors.sponsor_name = "Max 30 chars";
    }

    if (!newSponsor.primary_contact.trim()) {
      errors.primary_contact = "Required";
    } else if (!/^\d{10}$/.test(newSponsor.primary_contact)) {
      errors.primary_contact = "10 digits required";
    }

    if (!newSponsor.mail_id.trim()) {
      errors.mail_id = "Required";
    } else if (!emailRegex.test(newSponsor.mail_id)) {
      errors.mail_id = "Invalid email";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await createSponsor({ ...newSponsor, organizer_id: organizer.id });
      await loadSponsors();
      showNotification("Sponsor created successfully!");
      setShowAddSponsorModal(false);
      setNewSponsor({
        sponsor_name: "",
        primary_contact: "",
        mail_id: "",
        address: "",
        status: "Active"
      });
      setFieldErrors({});
    } catch (error) {
      console.error("Sponsor Create Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // ✅ VALIDATION HELPERS
  // ===========================
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
      if (value.length <= 50) {
        setGuestName(value);
      }
    }
  };

  const handleDesignationChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[a-zA-Z\s]*$/.test(value)) {
      if (value.length <= 30) {
        setDesignation(value);
      }
    }
  };

  const handleContactChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      setContact(val);
    }
  };

  // ===========================
  // ✅ UI STYLES
  // ===========================
  const inputClasses =
    "w-full h-9 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400 text-xs font-semibold";
  const selectClasses = `${inputClasses} cursor-pointer`;
  const labelClasses =
    "block text-xs font-bold text-slate-700 mb-1 ml-1";
  const cardClasses =
    "bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col hover:shadow-sm transition-shadow duration-200";
  const sectionTitleClasses =
    "text-sm font-extrabold text-slate-900 mb-3 border-l-4 border-cyan-500 pl-2.5 flex items-center gap-2";
  const tableHeaderClasses =
    "bg-slate-50 text-slate-700 text-[11px] font-bold tracking-wider p-2.5 text-left border-b border-slate-200";
  const tableCellClasses =
    "p-2.5 text-xs text-slate-800 border-b border-slate-100 font-semibold";
  const actionButtonClasses =
    "w-full h-9 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-xs transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 mt-3 text-xs cursor-pointer border-none";

  return (
    <div className="w-full max-w-full px-1 py-2 space-y-4 overflow-x-hidden animate-in fade-in duration-300">
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[2000] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-4 border ${toast.type === "success"
          ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
          : "bg-rose-600 text-white border-rose-500 shadow-rose-200"
          }`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <p className="font-bold text-sm tracking-wide">{toast.message}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ================= Vendor ================= */}
        <div className={cardClasses} >
          <div>
            <div className="flex justify-between items-center mb-4 border-l-4 border-purple-500 pl-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-xl">
                  <Users size={22} className="text-purple-600" />
                </div>
                Vendor Details
              </h2>
              {!isReadOnly && (
                <button
                  onClick={() => setShowAddVendorModal(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full hover:bg-purple-100 transition-all"
                >
                  <Plus size={12} /> Add New
                </button>
              )}
            </div>

            {!isReadOnly && (
            <div className="space-y-3">
              <div className="space-y-1 relative vendor-type-dropdown">
                <label className={labelClasses}>Service Category <span className="text-red-500">*</span> </label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-purple-400 transition-all duration-300 ${isVendorTypeOpen ? "border-purple-500 ring-4 ring-purple-500/10" : ""}`}
                    onClick={() => setIsVendorTypeOpen(!isVendorTypeOpen)}
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${vendorType ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={vendorType || "Search Category..."}
                      value={isVendorTypeOpen ? vendorTypeSearch : ""}
                      onChange={(e) => setVendorTypeSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVendorTypeOpen(true);
                      }}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isVendorTypeOpen ? "rotate-180 text-purple-500" : ""}`}
                    />
                  </div>

                  {isVendorTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredVendorTypes.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No categories found
                        </div>
                      ) : (
                        filteredVendorTypes.map((v, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-purple-50 group/item ${vendorType === v.vendor_type ? "bg-purple-50/50 text-black font-bold" : "text-black font-bold hover:text-purple-600"}`}
                            onClick={() => {
                              setVendorType(v.vendor_type);
                              setIsVendorTypeOpen(false);
                              setVendorTypeSearch("");
                            }}
                          >
                            <span>{v.vendor_type}</span>
                            {vendorType === v.vendor_type ? (
                              <Check size={14} className="text-purple-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 relative vendor-name-dropdown">
                <label className={labelClasses}>Vendor Name  <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-purple-400 transition-all duration-300 ${isVendorNameOpen ? "border-purple-500 ring-4 ring-purple-500/10" : ""} ${!vendorType ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                    onClick={() =>
                      vendorType && setIsVendorNameOpen(!isVendorNameOpen)
                    }
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${vendorName ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={vendorName || "Search Vendor..."}
                      value={isVendorNameOpen ? vendorNameSearch : ""}
                      onChange={(e) => setVendorNameSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (vendorType) setIsVendorNameOpen(true);
                      }}
                      disabled={!vendorType}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isVendorNameOpen ? "rotate-180 text-purple-500" : ""}`}
                    />
                  </div>

                  {isVendorNameOpen && vendorType && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredVendorNames.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No vendors found
                        </div>
                      ) : (
                        filteredVendorNames.map((v, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-purple-50 group/item ${vendorName === v.vendor_name ? "bg-purple-50/50 text-black font-bold" : "text-black font-bold hover:text-purple-600"}`}
                            onClick={() => {
                              setVendorName(v.vendor_name);
                              setIsVendorNameOpen(false);
                              setVendorNameSearch("");
                            }}
                          >
                            <span>{v.vendor_name}</span>
                            {vendorName === v.vendor_name ? (
                              <Check size={14} className="text-purple-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={addVendor}
                disabled={!vendorType || !vendorName}
                className={actionButtonClasses}
              >
                <Plus size={18} strokeWidth={2.5} /> {editingVendorIndex !== null ? "Update Selection" : "Add to List"}
              </button>
              {editingVendorIndex !== null && (
                <button
                  onClick={() => {
                    setEditingVendorIndex(null);
                    setVendorType("");
                    setVendorName("");
                  }}
                  className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-red-500 transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            )}
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50">
                      <th className={tableHeaderClasses}>Action</th>
                      <th className={tableHeaderClasses}>Vendor</th>
                      <th className={tableHeaderClasses}>Type</th>
                      <th className={tableHeaderClasses}>Passes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-10 text-center text-gray-400">
                          No vendors selected
                        </td>
                      </tr>
                    ) : (
                      vendorList.map((v, i) => (
                        <tr key={i} className={`group hover:bg-gray-50/80 transition-colors ${editingVendorIndex === i ? 'bg-sky-50' : ''}`}>
                          <td className={tableCellClasses}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editVendor(i)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => removeVendor(i)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                          <td className={`${tableCellClasses} font-semibold text-gray-800`}>
                            {v.vendorName || v.vendor_name || "Vendor Provider"}
                          </td>
                          <td className={tableCellClasses}>
                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {v.vendorType || v.vendor_type || v.serviceType || v.service_type || "General Vendor"}
                            </span>
                          </td>
                          <td className={tableCellClasses}>
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100 w-fit">
                              <button
                                onClick={() => updateVendorPassCount(i, -1)}
                                className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-bold border border-gray-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-gray-800 text-xs">
                                {v.passCount || 0}
                              </span>
                              <button
                                onClick={() => updateVendorPassCount(i, 1)}
                                className="w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold border border-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Sponsor ================= */}
        <div className={cardClasses}>
          <div>
            <div className="flex justify-between items-center mb-4 border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Award size={22} className="text-indigo-600" />
                </div>
                Sponsorships
              </h2>
              {!isReadOnly && (
                <button
                  onClick={() => setShowAddSponsorModal(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full hover:bg-indigo-100 transition-all"
                >
                  <Plus size={12} /> Add New
                </button>
              )}
            </div>

            {!isReadOnly && (
            <div className="space-y-3">
              <div className="space-y-1 relative sponsor-name-dropdown">
                <label className={labelClasses}>Sponsor<span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-indigo-400 transition-all duration-300 ${isSponsorNameOpen ? "border-indigo-500 ring-4 ring-indigo-500/10" : ""}`}
                    onClick={() => setIsSponsorNameOpen(!isSponsorNameOpen)}
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${sponsorName ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={sponsorName || "Search Sponsor..."}
                      value={isSponsorNameOpen ? sponsorNameSearch : ""}
                      onChange={(e) => setSponsorNameSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSponsorNameOpen(true);
                      }}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isSponsorNameOpen ? "rotate-180 text-indigo-500" : ""}`}
                    />
                  </div>

                  {isSponsorNameOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredSponsorNamesList.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No sponsors found
                        </div>
                      ) : (
                        filteredSponsorNamesList.map((s, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-indigo-50 group/item ${sponsorName === s.sponsor_name ? "bg-indigo-50/50 text-black font-bold" : "text-black font-bold hover:text-indigo-600"}`}
                            onClick={() => {
                              setSponsorName(s.sponsor_name);
                              setIsSponsorNameOpen(false);
                              setSponsorNameSearch("");
                            }}
                          >
                            <span>{s.sponsor_name}</span>
                            {sponsorName === s.sponsor_name ? (
                              <Check size={14} className="text-indigo-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 relative sponsorship-dropdown">
                <label className={labelClasses}>Sponsorship<span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div
                    className={`flex items-center gap-3 ${inputClasses} cursor-pointer hover:border-indigo-400 transition-all duration-300 ${isSponsorshipOpen ? "border-indigo-500 ring-4 ring-indigo-500/10" : ""}`}
                    onClick={() => setIsSponsorshipOpen(!isSponsorshipOpen)}
                  >
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none w-full placeholder:font-bold text-sm font-bold ${sponsorship ? "placeholder:text-black" : "placeholder:text-gray-400"}`}
                      placeholder={sponsorship || "Search Tier..."}
                      value={isSponsorshipOpen ? sponsorshipSearch : ""}
                      onChange={(e) => setSponsorshipSearch(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSponsorshipOpen(true);
                      }}
                    />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isSponsorshipOpen ? "rotate-180 text-indigo-500" : ""}`}
                    />
                  </div>

                  {isSponsorshipOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] max-h-[250px] overflow-y-auto scrollbar-hide py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {filteredSponsorshipTiers.length === 0 ? (
                        <div className="px-6 py-4 text-xs text-gray-400 text-center italic">
                          No tiers found
                        </div>
                      ) : (
                        filteredSponsorshipTiers.map((t, i) => (
                          <div
                            key={i}
                            className={`px-6 py-2.5 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-indigo-50 group/item ${sponsorship === t ? "bg-indigo-50/50 text-black font-bold" : "text-black font-bold hover:text-indigo-600"}`}
                            onClick={() => {
                              setSponsorship(t);
                              setIsSponsorshipOpen(false);
                              setSponsorshipSearch("");
                            }}
                          >
                            <span>{t}</span>
                            {sponsorship === t ? (
                              <Check size={14} className="text-indigo-500" />
                            ) : (
                              <Plus
                                size={12}
                                className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={addSponsor}
                disabled={!sponsorName || !sponsorship}
                className={actionButtonClasses}
              >
                <Plus size={18} strokeWidth={2.5} /> {editingSponsorIndex !== null ? "Update Selection" : "Confirm Sponsor"}
              </button>
              {editingSponsorIndex !== null && (
                <button
                  onClick={() => {
                    setEditingSponsorIndex(null);
                    setSponsorName("");
                    setSponsorship("");
                  }}
                  className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-red-500 transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            )}
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50">
                      <th className={tableHeaderClasses}>Action</th>
                      <th className={tableHeaderClasses}>Sponsor</th>
                      <th className={tableHeaderClasses}>Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsorList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-10 text-center text-gray-400">
                          No sponsors selected
                        </td>
                      </tr>
                    ) : (
                      sponsorList.map((s, i) => (
                        <tr key={i} className={`group hover:bg-gray-50/80 transition-colors ${editingSponsorIndex === i ? 'bg-sky-50' : ''}`}>
                          <td className={tableCellClasses}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editSponsor(i)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => removeSponsor(i)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                          <td className={`${tableCellClasses} font-semibold text-gray-800`}>
                            {s.sponsorName || s.sponsor_name || "Sponsor Partner"}
                          </td>
                          <td className={tableCellClasses}>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {s.sponsorship || s.sponsorshipType || s.sponsorship_type || s.tier || "Title Sponsor"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Guest ================= */}
        <div className={cardClasses}>
          <div>
            <h2 className={sectionTitleClasses}>
              <div className="p-2 bg-blue-50 rounded-xl">
                <UserPlus size={22} className="text-blue-600" />
              </div>
              Special Guests
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4">
                <label
                  className={`relative flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden ${guestImage ? "border-purple-500 bg-purple-50/20" : "border-gray-200 hover:border-purple-400 hover:bg-gray-50 bg-gray-50/50 group"}`}
                >
                  {!guestImage ? (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <UploadCloud
                        size={20}
                        className="text-gray-400 group-hover:text-purple-500 transition-colors mb-1"
                      />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                        Photo
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full group">
                      <img
                        src={guestImage.preview}
                        alt="guest"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                        <Eye
                          size={18}
                          className="text-white hover:scale-110 transition-transform cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPreviewModal({ open: true, url: guestImage.preview });
                          }}
                        />
                        <Trash2
                          size={18}
                          className="text-white hover:scale-110 transition-transform cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setGuestImage(null);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleGuestImage}
                    accept="image/*"
                  />
                </label>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      placeholder="Guest Name"
                      value={guestName}
                      onChange={handleNameChange}
                      className={`${inputClasses} pr-14`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
                      {guestName.length}/50
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      placeholder="Designation"
                      value={designation}
                      onChange={handleDesignationChange}
                      className={`${inputClasses} pr-14`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
                      {designation.length}/30
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  placeholder="Contact Number (Digits only)"
                  maxLength={10}
                  value={contact}
                  onChange={handleContactChange}
                  className={`${inputClasses} pr-14`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
                  {contact.length}/10
                </span>
              </div>

              <button
                onClick={addGuest}
                disabled={!guestName || !contact}
                className={actionButtonClasses}
              >
                <Plus size={18} strokeWidth={2.5} /> {editingGuestIndex !== null ? "Update Guest" : "Invite Guest"}
              </button>
              {editingGuestIndex !== null && (
                <button
                  onClick={() => {
                    setEditingGuestIndex(null);
                    setGuestName("");
                    setDesignation("");
                    setContact("");
                    setGuestImage(null);
                  }}
                  className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-red-500 transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50">
                      <th className={tableHeaderClasses}>Action</th>
                      <th className={tableHeaderClasses}>Photo</th>
                      <th className={tableHeaderClasses}>Guest Name</th>
                      <th className={tableHeaderClasses}>Contact Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-10 text-center text-gray-400">
                          No guests added
                        </td>
                      </tr>
                    ) : (
                      guestList.map((g, i) => (
                        <tr key={i} className={`group hover:bg-gray-50/80 transition-colors ${editingGuestIndex === i ? 'bg-sky-50' : ''}`}>
                          <td className={tableCellClasses}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editGuest(i)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => removeGuest(i)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                          <td className={tableCellClasses}>
                            {g.image ? (
                              <img
                                src={g.image}
                                alt={g.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-100"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                {g.name ? g.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </td>
                          <td className={`${tableCellClasses} font-semibold text-gray-800`}>{g.name}</td>
                          <td className={`${tableCellClasses} text-gray-600 text-sm`}>
                            {g.contact || "NA"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setPreviewModal({ open: false, url: "" })}
              className="absolute -top-10 right-0 z-10 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={20} />
            </button>

            <img
              src={previewModal.url}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* QUICK ADD VENDOR MODAL */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Quick Add Vendor</h2>
              <button onClick={() => setShowAddVendorModal(false)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateVendor} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Select
                    label="Service Category"
                    value={newVendor.vendor_type}
                    onValueChange={(val) => {
                      setNewVendor({ ...newVendor, vendor_type: val });
                      setFieldErrors({ ...fieldErrors, vendor_type: "" });
                    }}
                    placeholder="Select Category"
                    triggerClassName={`rounded-2xl h-11 text-xs font-bold ${fieldErrors.vendor_type ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    {(vendorTypes.length > 0 ? vendorTypes : demoVendorTypes).map((vt, idx) => (
                      <SelectItem key={idx} value={vt.vendor_type}>{vt.vendor_type}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Vendor Name</label>
                  <input
                    placeholder="Vendor Name"
                    maxLength={30}
                    value={newVendor.vendor_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^[a-zA-Z\s]*$/.test(val)) {
                        setNewVendor({ ...newVendor, vendor_name: val });
                        setFieldErrors({ ...fieldErrors, vendor_name: "" });
                      }
                    }}
                    className={`w-full px-5 py-2.5 rounded-2xl border ${fieldErrors.vendor_name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold`}
                  />
                  {fieldErrors.vendor_name && <p className="text-[10px] text-red-500 ml-2 font-bold">{fieldErrors.vendor_name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Company Name</label>
                  <input
                    placeholder="Company Name"
                    value={newVendor.company_name}
                    onChange={(e) => {
                      setNewVendor({ ...newVendor, company_name: e.target.value });
                      setFieldErrors({ ...fieldErrors, company_name: "" });
                    }}
                    className={`w-full px-5 py-2.5 rounded-2xl border ${fieldErrors.company_name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold`}
                  />
                  {fieldErrors.company_name && <p className="text-[10px] text-red-500 ml-2 font-bold">{fieldErrors.company_name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Contact</label>
                  <input
                    placeholder="Primary Contact"
                    maxLength={10}
                    value={newVendor.primary_contact}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setNewVendor({ ...newVendor, primary_contact: val });
                      setFieldErrors({ ...fieldErrors, primary_contact: "" });
                    }}
                    className={`w-full px-5 py-2.5 rounded-2xl border ${fieldErrors.primary_contact ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold`}
                  />
                  {fieldErrors.primary_contact && <p className="text-[10px] text-red-500 ml-2 font-bold">{fieldErrors.primary_contact}</p>}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Email ID</label>
                  <input
                    type="email"
                    placeholder="Email ID"
                    maxLength={50}
                    value={newVendor.mail_id}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/\s/g, "");
                      setNewVendor({ ...newVendor, mail_id: val });
                      setFieldErrors({ ...fieldErrors, mail_id: "" });
                    }}
                    className={`w-full px-5 py-2.5 rounded-2xl border ${fieldErrors.mail_id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold`}
                  />
                  {fieldErrors.mail_id && <p className="text-[10px] text-red-500 ml-2 font-bold">{fieldErrors.mail_id}</p>}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Address</label>
                  <textarea
                    placeholder="Address"
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                    className="w-full px-5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm h-20 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddVendorModal(false)} className="px-6 py-2 font-bold text-slate-400">Cancel</button>
                <button disabled={loading} type="submit" className="px-8 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-100">{loading ? "Saving..." : "Save Vendor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD SPONSOR MODAL */}
      {showAddSponsorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Quick Add Sponsor</h2>
              <button onClick={() => setShowAddSponsorModal(false)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSponsor} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Sponsor Name</label>
                  <input
                    placeholder="Sponsor Name"
                    maxLength={30}
                    value={newSponsor.sponsor_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^[a-zA-Z\s]*$/.test(val)) {
                        setNewSponsor({ ...newSponsor, sponsor_name: val });
                        setFieldErrors({ ...fieldErrors, sponsor_name: "" });
                      }
                    }}
                    className={`w-full px-5 py-2.5 rounded-2xl border ${fieldErrors.sponsor_name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold`}
                  />
                  {fieldErrors.sponsor_name && <p className="text-[10px] text-red-500 ml-2 font-bold">{fieldErrors.sponsor_name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Contact</label>
                  <input
                    placeholder="Contact No"
                    maxLength={10}
                    value={newSponsor.primary_contact}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setNewSponsor({ ...newSponsor, primary_contact: val });
                      setFieldErrors({ ...fieldErrors, primary_contact: "" });
                    }}
                    className={`w-full px-5 py-2.5 rounded-2xl border ${fieldErrors.primary_contact ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold`}
                  />
                  {fieldErrors.primary_contact && <p className="text-[10px] text-red-500 ml-2 font-bold">{fieldErrors.primary_contact}</p>}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Email ID</label>
                  <input
                    type="email"
                    placeholder="Email ID"
                    maxLength={50}
                    value={newSponsor.mail_id}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/\s/g, "");
                      setNewSponsor({ ...newSponsor, mail_id: val });
                      setFieldErrors({ ...fieldErrors, mail_id: "" });
                    }}
                    className={`w-full px-5 py-2.5 rounded-2xl border ${fieldErrors.mail_id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold`}
                  />
                  {fieldErrors.mail_id && <p className="text-[10px] text-red-500 ml-2 font-bold">{fieldErrors.mail_id}</p>}
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-2 uppercase">Address</label>
                  <textarea
                    placeholder="Address"
                    value={newSponsor.address}
                    onChange={(e) => setNewSponsor({ ...newSponsor, address: e.target.value })}
                    className="w-full px-5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-20 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddSponsorModal(false)} className="px-6 py-2 font-bold text-slate-400">Cancel</button>
                <button disabled={loading} type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100">{loading ? "Saving..." : "Save Sponsor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {croppingImage && (
        <ImageCropperModal
          imageSrc={croppingImage}
          onCrop={(croppedBase64) => {
            setGuestImage({ file: null, preview: croppedBase64 });
            setCroppingImage(null);
          }}
          onClose={() => setCroppingImage(null)}
        />
      )}
    </div>

  );
};

const ImageCropperModal = ({ imageSrc, onCrop, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);
  const imageRef = React.useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, fitScale: 1 });

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const containerSize = 240;
    const fitScale = Math.max(containerSize / naturalWidth, containerSize / naturalHeight);
    setDimensions({
      width: naturalWidth,
      height: naturalHeight,
      fitScale
    });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const containerSize = 240;
  const baseW = dimensions.width * dimensions.fitScale;
  const baseH = dimensions.height * dimensions.fitScale;
  const dispW = baseW * zoom;
  const dispH = baseH * zoom;

  const left = (containerSize - dispW) / 2 + offset.x;
  const top = (containerSize - dispH) / 2 + offset.y;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    const maxOffsetX = Math.max(0, (dispW - containerSize) / 2);
    const maxOffsetY = Math.max(0, (dispH - containerSize) / 2);

    newX = Math.min(Math.max(newX, -maxOffsetX), maxOffsetX);
    newY = Math.min(Math.max(newY, -maxOffsetY), maxOffsetY);

    setOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    let newX = touch.clientX - dragStart.x;
    let newY = touch.clientY - dragStart.y;

    const maxOffsetX = Math.max(0, (dispW - containerSize) / 2);
    const maxOffsetY = Math.max(0, (dispH - containerSize) / 2);

    newX = Math.min(Math.max(newX, -maxOffsetX), maxOffsetX);
    newY = Math.min(Math.max(newY, -maxOffsetY), maxOffsetY);

    setOffset({ x: newX, y: newY });
  };

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    canvas.width = containerSize;
    canvas.height = containerSize;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, containerSize, containerSize);
      ctx.drawImage(img, left, top, dispW, dispH);
      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      onCrop(croppedBase64);
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-8 flex flex-col items-center border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">Adjust Guest Photo</h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Drag to position & slide to zoom</p>

        <div 
          ref={containerRef}
          className="relative w-[240px] h-[240px] rounded-full overflow-hidden border-4 border-purple-100 shadow-inner bg-slate-50 cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="To Crop"
            onLoad={handleImageLoad}
            style={{
              position: "absolute",
              width: dispW,
              height: dispH,
              left: left,
              top: top,
              maxWidth: "none",
              pointerEvents: "none"
            }}
          />
          <div className="absolute inset-0 rounded-full border border-purple-500/20 pointer-events-none" />
        </div>

        <div className="w-full mt-6 space-y-2">
          <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => {
              const newZoom = parseFloat(e.target.value);
              setZoom(newZoom);
              setOffset((prev) => {
                const newDispW = baseW * newZoom;
                const newDispH = baseH * newZoom;
                const maxOffsetX = Math.max(0, (newDispW - containerSize) / 2);
                const maxOffsetY = Math.max(0, (newDispH - containerSize) / 2);
                return {
                  x: Math.min(Math.max(prev.x, -maxOffsetX), maxOffsetX),
                  y: Math.min(Math.max(prev.y, -maxOffsetY), maxOffsetY),
                };
              });
            }}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        <div className="flex gap-4 w-full mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-full text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-lg shadow-purple-100 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step6VendorSponsor;