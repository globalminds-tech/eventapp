import React, { useState, useEffect } from "react";
import { Trash2, AlertCircle, X, Edit, Plus } from "lucide-react";

const formatSizeRange = (val, unit, isDeleting) => {
  // Strip any character that is not a digit or slash
  const clean = val.replace(/[^0-9/]/g, "");
  const parts = clean.split("/");
  const limit = unit === "Inches" ? 4 : 2;

  let length = parts[0] || "";
  let width = parts[1] || "";

  // Enforce limit on length
  if (length.length > limit) {
    if (parts.length === 1) {
      width = length.slice(limit) + width;
    }
    length = length.slice(0, limit);
  }

  // Enforce limit on width
  if (width.length > limit) {
    width = width.slice(0, limit);
  }

  // Construct display value
  let displayVal = length;
  if (parts.length > 1 || (length.length === limit && !isDeleting)) {
    displayVal = `${length}/${width}`;
  }

  return {
    length,
    width,
    sizeRange: displayVal
  };
};

const Step3LayoutStall = ({ formData, setFormData, showStep3Errors }) => {
  // ✅ ALWAYS take from formData (NO local state)
  const stallList = formData.layout?.stalls || [];
  const amenitiesList = formData.layout?.amenities || [];

  useEffect(() => {
    setFormData((prev) => {
      const updated = { ...(prev.layout || {}) };
      let changed = false;

      if (updated.visibility === undefined) {
        updated.visibility = "Public";
        changed = true;
      }
      if (updated.stallType === undefined) {
        updated.stallType = "Paid";
        changed = true;
      }
      if (updated.floorType === undefined) {
        updated.floorType = "Stall";
        changed = true;
      }

      if (changed) {
        return { ...prev, layout: updated };
      }
      return prev;
    });
  }, [setFormData]);

  const [amenity, setAmenity] = useState("");
  const [qty, setQty] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [viewData, setViewData] = useState(null); // { data, type }
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null, type: "" }); // type: 'stall' | 'amenity'
  const [editModal, setEditModal] = useState({ isOpen: false, index: null, type: "", data: {} });

  const [taxSearch, setTaxSearch] = useState("");
  const [isTaxDropdownOpen, setIsTaxDropdownOpen] = useState(false);

  const taxOptions = [
    "Ticket - CGST",
    "Ticket - SGST",
    "Ticket - IGST",
    "Food - GST"
  ];

  const [warning, setWarning] = useState({
    show: false,
    message: "",
  });

  const showModal = (msg) => {
    setWarning({ show: true, message: msg });
    // Increase timeout for readability if needed, or keep at 5s
    setTimeout(() => setWarning({ show: false, message: "" }), 5000);
  };

  const stallType = formData.layout?.stallType;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "stallSize") {
      const limit = value === "Inches" ? 4 : 2;
      const currentLength = formData.layout?.length || "";
      const currentWidth = formData.layout?.width || "";
      const newLength = currentLength.slice(0, limit);
      const newWidth = currentWidth.slice(0, limit);
      setFormData({
        ...formData,
        layout: {
          ...formData.layout,
          stallSize: value,
          length: newLength,
          width: newWidth,
          sizeRange: `${newLength}/${newWidth}`,
        },
      });
      return;
    }

    setFormData({
      ...formData,
      layout: {
        ...formData.layout,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const handleTaxToggle = (tax) => {
    const currentTaxes = formData.layout?.taxes || [];
    let newTaxes;
    if (currentTaxes.includes(tax)) {
      newTaxes = currentTaxes.filter(t => t !== tax);
    } else {
      newTaxes = [...currentTaxes, tax];
    }
    setFormData({
      ...formData,
      layout: {
        ...formData.layout,
        taxes: newTaxes
      }
    });
  };

  const handleSelectAllTaxes = () => {
    const currentTaxes = formData.layout?.taxes || [];
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
      layout: { ...formData.layout, taxes: newTaxes }
    });
  };

  // ADD STALL
  const addStall = () => {
    const layout = formData.layout || {};

    // Validation: Empty not allowed
    if (!layout.stallName?.trim()) return showModal("Stall Name is required");
    if (!layout.sizeRange?.trim()) return showModal("Size Range is required");
    const parts = layout.sizeRange.split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return showModal("Please enter both Length and Width dimensions (e.g. 10/10)");
    }
    if (!layout.visibility) return showModal("Stall Visibility is required");
    if (!layout.stallType) return showModal("Stall Type is required");

    if (layout.stallType === "Paid") {
      if (!layout.priceINR || layout.priceINR === "0") return showModal("Price in INR is required for Paid stalls");
      if (!layout.priceUSD || layout.priceUSD === "0") return showModal("Price in USD is required for Paid stalls");
    }

    const newStall = {
      stallName: layout.stallName,
      size: `${layout.length || ""}/${layout.width || ""} ${layout.stallSize || "Feet"}`,
      sizeRange: layout.sizeRange,
      visibility: layout.visibility,
      type: layout.stallType,
      priceINR: layout.stallType === "Free" ? "Free" : (layout.priceINR || "Free"),
      priceUSD: layout.stallType === "Free" ? "Free" : (layout.priceUSD || "Free"),
      primeSeat: layout.stallType === "Free" ? false : (layout.primeSeat || false),
      primePriceINR: layout.stallType === "Free" ? "" : layout.primePriceINR,
      primePriceUSD: layout.stallType === "Free" ? "" : layout.primePriceUSD,
      taxes: layout.stallType === "Free" ? [] : (layout.taxes || []),
    };

    // Validation: Same value not allowed (Duplicate Name) - ONLY for new stalls
    const isDuplicate = stallList.some(
      (s) => s.stallName.toLowerCase() === layout.stallName.toLowerCase()
    );
    if (isDuplicate) return showModal("Stall Name already exists");

    const updatedStalls = [...stallList, newStall];

    setFormData({
      ...formData,
      layout: {
        ...formData.layout,
        stalls: updatedStalls,
        // Clear inputs after adding/updating
        stallName: "",
        sizeRange: "",
        priceINR: "",
        priceUSD: "",
        primeSeat: false,
        primePriceINR: "",
        primePriceUSD: "",
        length: "",
        width: "",
        taxes: [],
      },
    });
  };

  // ADD AMENITIES
  const addAmenity = () => {
    if (!formData.layout?.stallName) return showModal("Please enter/select a Stall Name first");
    if (!amenity.trim()) return showModal("Amenity Name is required");
    if (!qty || qty <= 0) return showModal("Valid Quantity is required");

    // Check for duplicate amenity for the same stall
    const isDuplicate = amenitiesList.some(
      (a) => a.stallName === formData.layout.stallName && a.amenity.toLowerCase() === amenity.toLowerCase()
    );
    if (isDuplicate) return showModal("This amenity is already added for this stall");

    const newAmenity = {
      stallName: formData.layout?.stallName,
      amenity,
      qty,
    };

    const updatedAmenities = [...amenitiesList, newAmenity];

    // ✅ SAVE to formData
    setFormData({
      ...formData,
      layout: {
        ...formData.layout,
        amenities: updatedAmenities,
      },
    });

    setAmenity("");
    setQty("");
  };

  // EDIT STALL MODAL OPEN
  const openEditStall = (index) => {
    const stall = stallList[index];
    const sizeParts = stall.size.split(" ");
    const dimParts = sizeParts[0].split("/");

    setEditModal({
      isOpen: true,
      index,
      type: "stall",
      data: {
        stallName: stall.stallName,
        stallSize: sizeParts[1] || "Feet",
        length: dimParts[0] || "",
        width: dimParts[1] || "",
        sizeRange: stall.sizeRange,
        visibility: stall.visibility,
        stallType: stall.type,
        priceINR: stall.priceINR === "Free" ? "" : stall.priceINR,
        priceUSD: stall.priceUSD === "Free" ? "" : stall.priceUSD,
        primeSeat: stall.primeSeat,
        primePriceINR: stall.primePriceINR,
        primePriceUSD: stall.primePriceUSD,
        taxes: stall.taxes || [],
      }
    });
  };

  // EDIT AMENITY MODAL OPEN
  const openEditAmenity = (index) => {
    const a = amenitiesList[index];
    setEditModal({
      isOpen: true,
      index,
      type: "amenity",
      data: { ...a }
    });
  };

  const handleUpdateStall = () => {
    const { data, index } = editModal;
    if (!data.stallName?.trim()) return showModal("Stall Name is required");
    const parts = (data.sizeRange || "").split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return showModal("Please enter both Length and Width dimensions (e.g. 10/10)");
    }

    const oldStallName = stallList[index].stallName;
    const newStallName = data.stallName;

    const updatedStall = {
      ...stallList[index],
      stallName: newStallName,
      size: `${data.length || ""}/${data.width || ""} ${data.stallSize || "Feet"}`,
      sizeRange: `${data.length || ""}/${data.width || ""}`,
      visibility: data.visibility,
      type: data.stallType,
      priceINR: data.stallType === "Free" ? "Free" : (data.priceINR || "Free"),
      priceUSD: data.stallType === "Free" ? "Free" : (data.priceUSD || "Free"),
      primeSeat: data.stallType === "Free" ? false : data.primeSeat,
      primePriceINR: data.stallType === "Free" ? "" : data.primePriceINR,
      primePriceUSD: data.stallType === "Free" ? "" : data.primePriceUSD,
      taxes: data.stallType === "Free" ? [] : (data.taxes || []),
    };

    const updatedStalls = [...stallList];
    updatedStalls[index] = updatedStall;

    // ✅ Automatically update stall name in amenities list
    const updatedAmenities = amenitiesList.map(a =>
      a.stallName === oldStallName ? { ...a, stallName: newStallName } : a
    );

    setFormData({
      ...formData,
      layout: {
        ...formData.layout,
        stalls: updatedStalls,
        amenities: updatedAmenities
      }
    });
    setEditModal({ isOpen: false, index: null, type: "", data: {} });
  };

  const handleUpdateAmenity = () => {
    const { data, index } = editModal;
    if (!data.amenity?.trim()) return showModal("Amenity name is required");

    const updatedAmenities = [...amenitiesList];
    updatedAmenities[index] = { ...data };

    setFormData({
      ...formData,
      layout: { ...formData.layout, amenities: updatedAmenities }
    });
    setEditModal({ isOpen: false, index: null, type: "", data: {} });
  };

  // DELETE STALL
  const handleDeleteConfirm = () => {
    const { index, type } = deleteModal;
    if (index === null) return;

    if (type === "stall") {
      const updatedStalls = stallList.filter((_, i) => i !== index);
      // Also remove amenities associated with this stall
      const stallName = stallList[index].stallName;
      const updatedAmenities = amenitiesList.filter((a) => a.stallName !== stallName);

      setFormData({
        ...formData,
        layout: {
          ...formData.layout,
          stalls: updatedStalls,
          amenities: updatedAmenities,
        },
      });
    } else if (type === "amenity") {
      const updatedAmenities = amenitiesList.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        layout: {
          ...formData.layout,
          amenities: updatedAmenities,
        },
      });
    }
    setDeleteModal({ isOpen: false, index: null, type: "" });
  };

  const inputClasses =
    "w-full h-9 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400 text-xs font-semibold";
  const selectClasses = `${inputClasses} cursor-pointer`;
  const labelClasses = "block text-xs font-bold text-slate-700 mb-1 ml-1";
  const cardClasses =
    "bg-white p-4 rounded-xl shadow-xs border border-slate-200/80";
  const sectionTitleClasses =
    "text-sm font-extrabold text-slate-900 mb-3 border-l-4 border-cyan-500 pl-2.5";
  const tableHeaderClasses =
    "bg-slate-50 text-slate-700 text-[11px] font-bold tracking-wider p-2.5 text-left border-b border-slate-200";
  const tableCellClasses = "p-2.5 text-xs text-slate-800 border-b border-slate-100 font-semibold";

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT SIDE: FORM */}
        <div className={`${cardClasses} space-y-4`}>
          <h2 className={sectionTitleClasses}>Layout Information</h2>

          {/* Flooring & Booking Options Side-by-Side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Flooring Type */}
            <div className="space-y-2">
              <label className={labelClasses}>Flooring Type <span className="text-red-500">*</span></label>
              <div className="px-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="floorType"
                    value="Stall"
                    checked={formData.layout?.floorType === "Stall"}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-2 border-blue-400 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Stall
                  </span>
                </label>
              </div>
            </div>

            {/* Stall Booking */}
            <div className="space-y-2">
              <label className={`${labelClasses} flex items-center gap-1.5`}>
                Stall Booking
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTips(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  title="Info"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </label>
              <div className="px-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="dayBased"
                    checked={formData.layout?.dayBased || false}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-2 border-blue-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    Is Day Based
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Stall Size & Pricing */}
          <div className="space-y-3">
            <label className={labelClasses}>
              How much do you want to charge for Stall? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
              <input
                maxLength={20}
                name="stallName"
                placeholder="Stall Name"
                value={formData.layout?.stallName || ""}
                onChange={handleChange}
                className={inputClasses}
              />
              <div className="flex gap-2">
                <select
                  name="stallSize"
                  value={formData.layout?.stallSize || "Feet"}
                  onChange={handleChange}
                  className={`${selectClasses} flex-1`}
                >
                  <option>Feet</option>
                  <option>Inches</option>
                </select>

                {/* Automated Length/Width Input */}
                <input
                  type="text"
                  placeholder={formData.layout?.stallSize === "Inches" ? "Length/Width" : "Length/Width"}
                  value={formData.layout?.sizeRange || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isDeleting = val.length < (formData.layout?.sizeRange || "").length;
                    const unit = formData.layout?.stallSize || "Feet";
                    const formatted = formatSizeRange(val, unit, isDeleting);
                    setFormData({
                      ...formData,
                      layout: {
                        ...formData.layout,
                        length: formatted.length,
                        width: formatted.width,
                        sizeRange: formatted.sizeRange
                      }
                    });
                  }}
                  className={`${inputClasses} flex-1 text-center font-semibold`}
                />
              </div>

              {/* Stall Visibility & Type */}
              <div className="sm:col-span-2 pt-4 border-t border-gray-100 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClasses}>Stall Visibility <span className="text-red-500">*</span></label>
                  <div className="flex gap-4 px-2">
                    {["Public", "Private"].map((option) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="visibility"
                          value={option}
                          checked={formData.layout?.visibility === option}
                          onChange={handleChange}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClasses}>Stall Type <span className="text-red-500">*</span></label>
                  <div className="flex gap-4 px-2">
                    {["Paid", "Free"].map((option) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="stallType"
                          value={option}
                          checked={formData.layout?.stallType === option}
                          onChange={handleChange}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* PRICE FIELDS FOR PAID STALLS */}
              {stallType === "Paid" && (
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-4 animate-in slide-in-from-top-4 duration-300 sm:col-span-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-gray-500 ml-4">PRICE IN INR</label>
                      <input
                        name="priceINR"
                        placeholder="₹ 0.00"
                        value={formData.layout?.priceINR || ""}
                        maxLength={10}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "priceINR",
                              value: e.target.value.replace(/[^0-9.]/g, "")
                            }
                          })
                        }
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-gray-500 ml-4">PRICE IN USD</label>
                      <input
                        name="priceUSD"
                        placeholder="$ 0.00"
                        value={formData.layout?.priceUSD || ""}
                        maxLength={10}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9.]/g, "");
                          if (/^\d*\.?\d{0,2}$/.test(value)) {
                            handleChange({ target: { name: "priceUSD", value } });
                          }
                        }}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-200 pt-3">
                    <label className="flex items-center gap-3 cursor-pointer group px-2">
                      <input
                        type="checkbox"
                        name="primeSeat"
                        checked={formData.layout?.primeSeat}
                        onChange={handleChange}
                        className="w-5 h-5 rounded text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">Mark as Prime Stall</span>
                    </label>
                    {formData.layout?.primeSeat && (
                      <div className="grid grid-cols-2 gap-3 animate-in zoom-in-95 duration-200">
                        <input
                          name="primePriceINR"
                          placeholder="+ ₹ Prime Add-on"
                          value={formData.layout?.primePriceINR || ""}
                          onChange={handleChange}
                          className={inputClasses}
                        />
                        <input
                          name="primePriceUSD"
                          placeholder="+ $ Prime Add-on"
                          value={formData.layout?.primePriceUSD || ""}
                          onChange={handleChange}
                          className={inputClasses}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Person Pass */}
              <div className="sm:col-span-2 pt-4 border-t border-gray-100 mt-1">
                <label className={labelClasses}>No. of Person Passes Allowed <span className="text-red-500">*</span></label>
                <input
                  name="personPass"
                  type="text"
                  value={formData.layout?.personPass || ""}
                  inputMode="numeric"
                  maxLength={5}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    handleChange({ target: { name: "personPass", value } });
                  }}
                  className={`${inputClasses} ${showStep3Errors && !formData.layout?.personPass ? "border-red-500 ring-2 ring-red-100" : ""}`}
                />
                {showStep3Errors && !formData.layout?.personPass && (
                  <p className="text-red-500 text-xs mt-1.5 ml-4">No. of Person Passes Allowed is required</p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 sm:col-span-2">
                <h3 className="text-xs font-extrabold text-slate-900 border-l-4 border-cyan-500 pl-2">
                  Add Amenities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    placeholder="Amenity Name (e.g. Chair, Table)"
                    value={amenity}
                    maxLength={50}
                    onChange={(e) => setAmenity(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    placeholder="Quantity"
                    value={qty}
                    type="number"
                    min="0"
                    onChange={(e) => setQty(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setAmenity(""); setQty(""); }}
                    className="h-8 px-3 text-xs border border-slate-200 text-slate-600 font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="h-8 px-3 text-xs bg-cyan-50 text-cyan-700 font-bold rounded-lg border border-cyan-200 hover:bg-cyan-100 cursor-pointer"
                  >
                    Add Amenity
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="includeTax"
                    checked={formData.layout?.includeTax || false}
                    onChange={(e) => {
                      handleChange(e);
                      if (!e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          layout: { ...prev.layout, includeTax: false, taxes: [] }
                        }));
                      }
                    }}
                    className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">Include Tax in Final Price</span>
                </label>

                {formData.layout?.includeTax && (
                  <div className="relative animate-in slide-in-from-top-2 duration-300">
                    <label className={labelClasses}>Select Taxes</label>

                    <div
                      className="w-full h-9 px-3 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 text-slate-900 cursor-pointer text-xs font-medium"
                      onClick={() => setIsTaxDropdownOpen(!isTaxDropdownOpen)}
                    >
                      <span className="truncate text-slate-700">
                        {(formData.layout?.taxes || []).length > 0
                          ? (formData.layout?.taxes || []).join(", ")
                          : "Select taxes..."}
                      </span>
                      <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isTaxDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {isTaxDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-white">
                          <input
                            type="checkbox"
                            checked={
                              taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase())).length > 0 &&
                              taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase()))
                                .every(t => (formData.layout?.taxes || []).includes(t))
                            }
                            onChange={handleSelectAllTaxes}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                          <div className="flex-1 flex items-center px-2 py-1 border border-slate-200 rounded-lg bg-slate-50">
                            <input
                              type="text"
                              value={taxSearch}
                              onChange={(e) => setTaxSearch(e.target.value)}
                              placeholder="Search taxes..."
                              className="w-full text-xs outline-none bg-transparent text-slate-900"
                            />
                          </div>
                          <button type="button" onClick={() => { setIsTaxDropdownOpen(false); setTaxSearch(''); }} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                          {taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase())).map((tax, idx) => (
                            <label key={tax} className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors text-xs ${idx === 0 ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white hover:bg-slate-50'}`}>
                              <input
                                type="checkbox"
                                checked={(formData.layout?.taxes || []).includes(tax)}
                                onChange={() => handleTaxToggle(tax)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                              />
                              <span className="text-slate-700 font-medium">{tax}</span>
                            </label>
                          ))}
                          {taxOptions.filter(t => t.toLowerCase().includes(taxSearch.toLowerCase())).length === 0 && (
                            <div className="p-3 text-center text-xs text-slate-400">No options found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addStall}
                  className="w-full h-9 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-xs border-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Confirm & Add Stall</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: SUMMARY TABLES */}
        <div className="space-y-4">
          {/* Layout Summary */}
          <div className={cardClasses}>
            <h2 className={sectionTitleClasses}>Layout Summary</h2>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={tableHeaderClasses}>Action</th>
                      <th className={tableHeaderClasses}>Stall Name</th>
                      <th className={tableHeaderClasses}>Size</th>
                      <th className={tableHeaderClasses}>Visibility</th>
                      <th className={tableHeaderClasses}>Type</th>
                      <th className={tableHeaderClasses}>Price (INR)</th>
                      <th className={tableHeaderClasses}>Price (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stallList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-12 text-center text-gray-400 italic bg-gray-50/30">
                          No stalls added yet. Start by filling the form on the left.
                        </td>
                      </tr>
                    ) : (
                      stallList.map((stall, index) => (
                        <tr key={index} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                          <td className="p-4 border-b border-gray-50 flex gap-3">
                            <button
                              onClick={() => openEditStall(index)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, index, type: "stall" })}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                          <td className={`${tableCellClasses} font-semibold text-purple-700`}>{stall.stallName}</td>
                          <td className={tableCellClasses}>{stall.size}</td>
                          <td className={tableCellClasses}>
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${stall.visibility === "Public" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                              {stall.visibility}
                            </span>
                          </td>
                          <td className={tableCellClasses}>{stall.type}</td>
                          <td className={`${tableCellClasses} font-bold`}>{stall.priceINR}</td>
                          <td className={`${tableCellClasses} font-bold`}>{stall.priceUSD}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Amenities Summary */}
          <div className={cardClasses}>
            <h2 className={sectionTitleClasses}>Included Amenities</h2>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={tableHeaderClasses}>Action</th>
                      <th className={tableHeaderClasses}>Stall Name</th>
                      <th className={tableHeaderClasses}>Amenity</th>
                      <th className={tableHeaderClasses}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amenitiesList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-400 italic bg-gray-50/30">
                          No amenities added.
                        </td>
                      </tr>
                    ) : (
                      amenitiesList.map((a, index) => (
                        <tr key={index} className="hover:bg-sky-50/50 transition-colors duration-200 group">
                          <td className="p-4 border-b border-gray-50 flex gap-3">
                            <button
                              onClick={() => openEditAmenity(index)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, index, type: "amenity" })}
                              className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                          <td className={tableCellClasses}>{a.stallName}</td>
                          <td className={`${tableCellClasses} font-medium text-gray-900`}>{a.amenity}</td>
                          <td className={tableCellClasses}>
                            <span className="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-700">{a.qty}</span>
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

      {/* WARNING TOAST */}
      {warning.show && (
        <div className="fixed bottom-6 right-6 z-[110] animate-in slide-in-from-right-full duration-500">
          <div className="bg-[#ff8a3d] text-white p-5 rounded-xl shadow-2xl flex items-start gap-4 max-w-sm relative overflow-hidden group border-l-8 border-orange-600/30">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-lg mb-1 leading-tight">Warning Message</h3>
              <p className="text-sm font-medium opacity-95">{warning.message}</p>
            </div>
            <button
              onClick={() => setWarning({ show: false, message: "" })}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-sky-600 text-white">
              <h3 className="text-lg font-bold">
                {viewData.type === "stall" ? "Stall Details" : "Amenity Details"}
              </h3>
              <button
                onClick={() => setViewData(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {viewData.type === "stall" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Stall Name</label>
                    <p className="font-semibold text-gray-800 text-lg">{viewData.data.stallName}</p>
                  </div>
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Size</label>
                    <p className="font-semibold text-gray-800">{viewData.data.size}</p>
                  </div>
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Type</label>
                    <p className="font-semibold text-gray-800">{viewData.data.type}</p>
                  </div>
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Price (INR)</label>
                    <p className="font-semibold text-gray-800">{viewData.data.priceINR}</p>
                  </div>
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Price (USD)</label>
                    <p className="font-semibold text-gray-800">{viewData.data.priceUSD}</p>
                  </div>
                  <div className="col-span-2 bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Visibility</label>
                    <p className="font-semibold text-gray-800">{viewData.data.visibility}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Stall Name</label>
                    <p className="font-semibold text-gray-800">{viewData.data.stallName}</p>
                  </div>
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Amenity</label>
                    <p className="font-semibold text-gray-800 text-lg">{viewData.data.amenity}</p>
                  </div>
                  <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <label className="text-[10px] font-bold text-sky-500 uppercase">Quantity</label>
                    <p className="font-semibold text-gray-800 text-lg">{viewData.data.qty}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setViewData(null)}
                className="w-full mt-4 bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-sky-100">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between bg-gradient-to-r from-sky-600 to-blue-700 text-white">
              <div>
                <h3 className="text-xl font-black tracking-tight">
                  Edit {editModal.type === "stall" ? "Stall Details" : "Amenity Details"}
                </h3>
                <p className="text-sky-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">
                  Refining Layout Information
                </p>
              </div>
              <button
                onClick={() => setEditModal({ isOpen: false, index: null, type: "", data: {} })}
                className="p-2 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {editModal.type === "stall" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Stall Name</label>
                    <input
                      className={inputClasses}
                      value={editModal.data.stallName}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, stallName: e.target.value } })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Unit</label>
                    <select
                      className={selectClasses}
                      value={editModal.data.stallSize}
                      onChange={(e) => {
                        const newUnit = e.target.value;
                        const limit = newUnit === "Inches" ? 4 : 2;
                        const newLength = (editModal.data.length || "").slice(0, limit);
                        const newWidth = (editModal.data.width || "").slice(0, limit);
                        setEditModal({
                          ...editModal,
                          data: {
                            ...editModal.data,
                            stallSize: newUnit,
                            length: newLength,
                            width: newWidth,
                            sizeRange: `${newLength}/${newWidth}`
                          }
                        });
                      }}
                    >
                      <option>Feet</option>
                      <option>Inches</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Dimensions (Length / Width)</label>
                    <input
                      type="text"
                      placeholder={editModal.data.stallSize === "Inches" ? "L/W (e.g. 1200/1200)" : "L/W (e.g. 10/10)"}
                      value={editModal.data.sizeRange || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isDeleting = val.length < (editModal.data.sizeRange || "").length;
                        const unit = editModal.data.stallSize || "Feet";
                        const formatted = formatSizeRange(val, unit, isDeleting);
                        setEditModal({
                          ...editModal,
                          data: {
                            ...editModal.data,
                            length: formatted.length,
                            width: formatted.width,
                            sizeRange: formatted.sizeRange
                          }
                        });
                      }}
                      className={`${inputClasses} w-full text-center font-semibold bg-gray-50`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Visibility</label>
                    <select
                      className={selectClasses}
                      value={editModal.data.visibility}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, visibility: e.target.value } })}
                    >
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Type</label>
                    <select
                      className={selectClasses}
                      value={editModal.data.stallType}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, stallType: e.target.value } })}
                    >
                      <option>Paid</option>
                      <option>Free</option>
                    </select>
                  </div>

                  {editModal.data.stallType === "Paid" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-sky-600 uppercase ml-2">Price (INR)</label>
                        <input
                          className={inputClasses}
                          value={editModal.data.priceINR}
                          onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, priceINR: e.target.value.replace(/[^0-9.]/g, "") } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-sky-600 uppercase ml-2">Price (USD)</label>
                        <input
                          className={inputClasses}
                          value={editModal.data.priceUSD}
                          onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, priceUSD: e.target.value.replace(/[^0-9.]/g, "") } })}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Stall Name</label>
                    <p className="bg-gray-50 px-6 py-3 rounded-2xl font-bold text-gray-700 border border-gray-100">{editModal.data.stallName}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Amenity Name</label>
                    <input
                      className={inputClasses}
                      value={editModal.data.amenity}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, amenity: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-sky-600 uppercase ml-2">Quantity</label>
                    <input
                      type="number"
                      className={inputClasses}
                      value={editModal.data.qty}
                      onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, qty: e.target.value } })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => setEditModal({ isOpen: false, index: null, type: "", data: {} })}
                className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={editModal.type === "stall" ? handleUpdateStall : handleUpdateAmenity}
                className="flex-[2] py-4 bg-gradient-to-r from-sky-600 to-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl transition-all active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-sky-100 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-sky-900 mb-2">Delete {deleteModal.type === "stall" ? "Stall" : "Amenity"}</h2>
            <p className="text-slate-600 mb-8">
              Are you sure you want to delete this {deleteModal.type}? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setDeleteModal({ isOpen: false, index: null, type: "" })}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg w-full"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIPS MODAL */}
      {showTips && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Stall Booking - Tips</h3>
              <button
                onClick={() => setShowTips(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-5 space-y-4 text-sm">
                <div className="flex items-center gap-2 text-orange-800 font-bold mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Stall Booking Modes
                </div>

                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-800 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p>
                      <span className="font-bold text-gray-900">Day-Based Booking:</span> Exhibitors can book stalls for specific days only. - Price & tax are calculated per day.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm mt-0.5 flex-shrink-0"></div>
                    <p>
                      <span className="font-bold text-gray-900">Full Event Booking:</span> Stalls are booked for the entire event duration. - One-time price & tax for all days.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-orange-200 mt-2 flex items-center gap-2 text-orange-800 font-bold">
                  <span className="text-orange-500">⚡</span>
                  Choose wisely! Pricing & availability depend on your selection.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3LayoutStall;