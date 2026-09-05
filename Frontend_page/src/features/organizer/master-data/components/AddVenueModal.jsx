import React, { useState, useEffect } from "react";
import { X, Search, Plus, Loader2 } from "lucide-react";
import axios from "axios";
import { ENV } from "@/config/env";
import { useSelector } from "react-redux";

export default function AddVenueModal({ isOpen, onClose, onSuccess }) {
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    venue_name: "",
    address: "",
    country_name: "",
    state_name: "",
    city_name: "",
    pin_code: "",
    status: "Active",
    latitude: "",
    longitude: "",
    location_details: "", // Maps to google_place_id in backend
    venue_image: "",
  });

  const [documents, setDocuments] = useState([
    { document_type: "", document_number: "", document_file: "" }
  ]);
  
  const [docTypes, setDocTypes] = useState([]);

  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/document-types`);
        setDocTypes(res.data || []);
      } catch (err) {
        console.error("Error fetching doc types", err);
      }
    };
    if (isOpen) {
      fetchDocTypes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocChange = (index, field, value) => {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  };

  const addDocument = () => {
    setDocuments([...documents, { document_type: "", document_number: "", document_file: "" }]);
  };

  const handleImageUpload = () => {
    // Mock file upload
    setFormData((prev) => ({ ...prev, venue_image: "uploaded_venue.jpg" }));
  };

  const handleNativeFileUpload = (e, index) => {
    // Native file input change
    if (e.target.files && e.target.files.length > 0) {
      handleDocChange(index, "document_file", e.target.files[0].name);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        organizer_id: organizerId,
        documents: documents.filter(d => d.document_type || d.document_number) // only valid docs
      };
      await axios.post(`${ENV.API_BASE_URL}/superadmin/api/create_venue`, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating venue:", error);
      alert("Failed to create venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-7xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-cyan-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">New Venue Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* VENUE INFORMATION */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                <h3 className="font-bold text-cyan-800 text-sm tracking-wide">Venue Information</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Venue Image</label>
                <button type="button" onClick={handleImageUpload} className="w-full h-12 border border-dashed border-cyan-200 hover:border-cyan-600 hover:bg-cyan-50 transition-colors rounded-lg flex items-center justify-center text-cyan-600 cursor-pointer bg-white">
                  {formData.venue_image ? (
                    <span className="text-sm font-bold text-emerald-600">Image Selected</span>
                  ) : (
                    <span className="text-sm font-bold">Upload Image</span>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Supported files: jpg, png, jpeg, webp</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Venue Name <span className="text-red-500">*</span></label>
                <input type="text" name="venue_name" value={formData.venue_name} onChange={handleChange} placeholder="Enter venue name" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter address" className="w-full h-24 p-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 resize-none"></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Country <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="country_name" value={formData.country_name} onChange={handleChange} placeholder="Search Country" className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="state_name" value={formData.state_name} onChange={handleChange} placeholder="Select Country first" className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="city_name" value={formData.city_name} onChange={handleChange} placeholder="Select State first" className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pin Code <span className="text-red-500">*</span></label>
                <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} placeholder="Enter 6-digit pin code" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status <span className="text-red-500">*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none bg-slate-50">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* LOCATION DETAILS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                <h3 className="font-bold text-cyan-800 text-sm tracking-wide">Location Details</h3>
              </div>

              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-slate-700">Latitude <span className="text-red-500">*</span></label>
                  <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs font-bold text-slate-700">Longitude <span className="text-red-500">*</span></label>
                  <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Location</label>
                <textarea name="location_details" value={formData.location_details} onChange={handleChange} placeholder="Location" className="w-full h-48 p-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 resize-none bg-slate-50"></textarea>
              </div>
            </div>

            {/* DOCUMENTS DETAILS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                <h3 className="font-bold text-cyan-800 text-sm tracking-wide">Documents Details (Optional)</h3>
              </div>

              {documents.map((doc, index) => {
                const docConfig = docTypes.find(d => d.type === doc.document_type) || {};
                return (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-cyan-600">Document Type</label>
                    <select
                      value={doc.document_type}
                      onChange={(e) => handleDocChange(index, "document_type", e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none"
                    >
                      <option value="">Select Document Type</option>
                      {docTypes.map(d => (
                        <option key={d.type} value={d.type}>{d.type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-cyan-600">Document Number</label>
                    <input
                      type="text"
                      value={doc.document_number}
                      onChange={(e) => {
                        let val = e.target.value.toUpperCase();
                        if (docConfig.type === "Aadhar") {
                          val = val.replace(/\D/g, "");
                        } else {
                          val = val.replace(/[^A-Z0-9]/g, "");
                        }
                        handleDocChange(index, "document_number", val);
                      }}
                      maxLength={docConfig.maxLength || 50}
                      placeholder={docConfig.placeholder || "Enter Document Number"}
                      className="w-full h-9 px-3 rounded-md bg-slate-50 border border-slate-200 text-xs focus:border-cyan-500 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="pt-1 space-y-1 flex flex-col">
                    <label className="text-[11px] font-bold text-cyan-600">Upload Document</label>
                    <input 
                      type="file" 
                      onChange={(e) => handleNativeFileUpload(e, index)}
                      className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
                    />
                  </div>
                </div>
                );
              })}

              <button type="button" onClick={addDocument} className="w-full h-10 bg-white border border-cyan-600 text-cyan-600 rounded-lg text-sm font-bold hover:bg-cyan-50 transition-colors cursor-pointer">
                + Add Another Document
              </button>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-6 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors cursor-pointer flex items-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Venue
          </button>
        </div>
      </div>
    </div>
  );
}
