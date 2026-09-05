import React, { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import axios from "axios";
import { ENV } from "@/config/env";
import { useSelector } from "react-redux";

export default function AddSponsorModal({ isOpen, onClose, onSuccess }) {
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sponsor_name: "",
    mail_id: "",
    primary_contact: "",
    secondary_contact: "",
    status: "Active",
    address: "",
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

  const handleNativeFileUpload = (e, index) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDocChange(index, "document_file", e.target.files[0].name);
    }
  };

  const handleSubmit = async () => {
    if (!formData.sponsor_name || !formData.mail_id || !formData.primary_contact) {
      alert("Please fill in all required fields (Sponsor Name, Mail ID, Primary Contact).");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        organizer_id: organizerId,
        documents: documents.filter(d => d.document_type || d.document_number) // only valid docs
      };
      await axios.post(`${ENV.API_BASE_URL}/superadmin/api/sponsorship`, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating sponsor:", error);
      alert("Failed to create sponsor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Styled to match eventapp cyan/blue design system */}
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">New Sponsor Details</h2>
            <p className="text-sm text-slate-500 font-medium">Manage sponsor information and documents</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors border border-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700">Sponsor Name <span className="text-red-500">*</span></label>
              <input type="text" name="sponsor_name" value={formData.sponsor_name} onChange={handleChange} placeholder="Enter Name" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700">Mail ID <span className="text-red-500">*</span></label>
              <input type="email" name="mail_id" value={formData.mail_id} onChange={handleChange} placeholder="Email ID" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700">Primary Contact <span className="text-red-500">*</span></label>
              <input type="text" name="primary_contact" value={formData.primary_contact} onChange={handleChange} placeholder="Primary No" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-700">Secondary Contact</label>
              <input type="text" name="secondary_contact" value={formData.secondary_contact} onChange={handleChange} placeholder="Secondary No" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-slate-50" />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[13px] font-bold text-slate-700">Status</label>
              <input type="text" readOnly value="Active" className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 text-slate-500 font-medium" />
            </div>
          </div>

          <div className="space-y-1.5 mb-8">
            <label className="text-[13px] font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Complete Address" 
              className="w-full h-24 p-4 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 resize-none bg-slate-50"
            ></textarea>
          </div>

          <hr className="border-slate-100 mb-6" />

          {/* SPONSOR DOCUMENTS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-700 tracking-tight">Sponsor Documents (Optional)</h3>
              <button type="button" onClick={addDocument} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                <Plus size={14} />
                Add Document
              </button>
            </div>

            <div className="space-y-4">
              {documents.map((doc, index) => {
                const docConfig = docTypes.find(d => d.type === doc.document_type) || {};
                return (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  
                  <div className="flex-1">
                    <select
                      value={doc.document_type}
                      onChange={(e) => handleDocChange(index, "document_type", e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm focus:border-cyan-500 outline-none bg-white text-slate-700"
                    >
                      <option value="">Document Type</option>
                      {docTypes.map(d => (
                        <option key={d.type} value={d.type}>{d.type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
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
                      placeholder={docConfig.placeholder || "Number"}
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm focus:border-cyan-500 outline-none placeholder:text-slate-400 bg-white"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="relative w-full h-11 rounded-lg border border-slate-200 bg-white flex items-center overflow-hidden">
                       <input 
                          type="file" 
                          onChange={(e) => handleNativeFileUpload(e, index)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       />
                       <div className="flex items-center justify-between w-full px-3 text-sm font-medium text-slate-600">
                          <span className="truncate max-w-[120px]">{doc.document_file || "Choose File"}</span>
                          <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-1 rounded font-bold uppercase tracking-wide">Browse</span>
                       </div>
                    </div>
                  </div>

                </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-5 flex items-center justify-end gap-4 rounded-b-2xl border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-md shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Sponsor
          </button>
        </div>
      </div>
    </div>
  );
}
