import React, { useState } from "react";
import { X, Search, Plus, Loader2, ChevronDown, Check } from "lucide-react";
import axios from "axios";
import { ENV } from "@/config/env";
import { useSelector } from "react-redux";

export default function AddVendorModal({ isOpen, onClose, onSuccess }) {
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vendor_type: "",
    vendor_name: "",
    company_name: "",
    primary_contact: "",
    secondary_contact: "",
    mail_id: "",
    country: "",
    state: "",
    city: "",
    address: "",
    status: "Active",
    account_holder: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    bank_passbook: "",
  });

  const [documents, setDocuments] = useState([
    { document_type: "", document_number: "", document_file: "" }
  ]);

  const [vendorTypes, setVendorTypes] = useState(["Catering", "Audio Visual", "Decoration", "Logistics"]);
  const [vendorTypeOpen, setVendorTypeOpen] = useState(false);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newType, setNewType] = useState("");
  
  const [docTypes, setDocTypes] = useState([]);

  React.useEffect(() => {
    const fetchVendorTypes = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-vendor-types`);
        if (res.data && res.data.length > 0) {
          const fetchedTypes = res.data.map(item => item.vendor_type).filter(Boolean);
          setVendorTypes(prev => Array.from(new Set([...prev, ...fetchedTypes])));
        }
      } catch (err) {
        console.error("Error fetching vendor types", err);
      }
    };
    const fetchDocTypes = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/document-types`);
        setDocTypes(res.data || []);
      } catch (err) {
        console.error("Error fetching doc types", err);
      }
    };
    if (isOpen) {
      fetchVendorTypes();
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

  // Mock file upload trigger
  const handleFileUpload = (type, index = null) => {
    // In reality, this would open a file picker and upload to storage.
    // For now we just simulate setting a file path/name.
    const mockFile = "uploaded_file.pdf";
    if (type === "bank") {
      setFormData(prev => ({ ...prev, bank_passbook: mockFile }));
    } else if (type === "doc" && index !== null) {
      handleDocChange(index, "document_file", mockFile);
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
      await axios.post(`${ENV.API_BASE_URL}/superadmin/api/create_vendor`, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating vendor:", error);
      alert("Failed to create vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-cyan-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">New Vendor Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* VENDOR INFORMATION */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                <h3 className="font-bold text-cyan-800 text-sm tracking-wide">VENDOR INFORMATION</h3>
              </div>

              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Vendor Type <span className="text-red-500">*</span></label>
                  {!isAddingNewType && (
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewType(true)} 
                      className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md transition-all flex items-center gap-1"
                    >
                      + New Vendor Type
                    </button>
                  )}
                </div>
                
                {isAddingNewType ? (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      autoFocus
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      placeholder="Enter new type..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newType.trim()) {
                            setVendorTypes(prev => Array.from(new Set([...prev, newType.trim()])));
                            setFormData(prev => ({ ...prev, vendor_type: newType.trim() }));
                          }
                          setNewType("");
                          setIsAddingNewType(false);
                        } else if (e.key === 'Escape') {
                          setIsAddingNewType(false);
                          setNewType("");
                        }
                      }}
                      className="w-full h-10 pl-3 pr-10 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newType.trim()) {
                          setVendorTypes(prev => Array.from(new Set([...prev, newType.trim()])));
                          setFormData(prev => ({ ...prev, vendor_type: newType.trim() }));
                        }
                        setNewType("");
                        setIsAddingNewType(false);
                      }}
                      className="absolute right-2 p-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      onClick={() => setVendorTypeOpen(!vendorTypeOpen)}
                      className="w-full h-10 px-3 bg-white rounded-lg border border-slate-300 text-sm flex items-center justify-between cursor-pointer focus:border-cyan-500 outline-none"
                    >
                      <span className={formData.vendor_type ? "text-slate-800" : "text-slate-400"}>
                        {formData.vendor_type || "Select Vendor Type"}
                      </span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${vendorTypeOpen ? "rotate-180" : ""}`} />
                    </div>
                    {vendorTypeOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {vendorTypes.map((type, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, vendor_type: type }));
                              setVendorTypeOpen(false);
                            }}
                            className="px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-cyan-600 hover:text-white cursor-pointer transition-colors"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Vendor Name <span className="text-red-500">*</span></label>
                <input type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange} placeholder="Vendor Name" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Company Name <span className="text-red-500">*</span></label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Enter Company Name" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Primary Contact No <span className="text-red-500">*</span></label>
                <input type="text" name="primary_contact" value={formData.primary_contact} onChange={handleChange} placeholder="Enter Primary Contact" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Secondary Contact No (Optional)</label>
                <input type="text" name="secondary_contact" value={formData.secondary_contact} onChange={handleChange} placeholder="Enter Secondary Contact" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mail ID <span className="text-red-500">*</span></label>
                <input type="email" name="mail_id" value={formData.mail_id} onChange={handleChange} placeholder="Enter Mail ID" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Country <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
                  <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Search Country" className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="Search State" className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Search City" className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter Full Address" className="w-full h-20 p-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 resize-none"></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <div className="w-full h-10 px-3 rounded-lg border border-cyan-200 bg-cyan-50 text-sm flex items-center font-bold text-cyan-600">
                  Active
                </div>
              </div>
            </div>

            {/* ACCOUNT DETAILS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                <h3 className="font-bold text-cyan-800 text-sm tracking-wide">ACCOUNT DETAILS</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Holder Name <span className="text-red-500">*</span></label>
                <input type="text" name="account_holder" value={formData.account_holder} onChange={handleChange} placeholder="Enter Account Holder Name" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Bank Name <span className="text-red-500">*</span></label>
                <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="Enter Bank Name" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Number <span className="text-red-500">*</span></label>
                <input type="text" name="account_number" value={formData.account_number} onChange={handleChange} placeholder="Enter Account Number" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">IFSC / SWIFT Code <span className="text-red-500">*</span></label>
                <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} placeholder="Enter IFSC Code" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none placeholder:text-slate-400 bg-white" />
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-cyan-600 mb-2 block">Upload Document</label>
                <button type="button" onClick={() => handleFileUpload("bank")} className="w-full h-24 border-2 border-dashed border-cyan-200 hover:border-cyan-600 hover:bg-cyan-50 transition-colors rounded-xl flex flex-col items-center justify-center text-cyan-600 cursor-pointer bg-white">
                  {formData.bank_passbook ? (
                    <span className="text-xs font-bold text-emerald-600">Document Uploaded</span>
                  ) : (
                    <>
                      <Plus size={20} className="mb-1" />
                      <span className="text-sm font-bold">Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* DOCUMENTS DETAILS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                <h3 className="font-bold text-cyan-800 text-sm tracking-wide">DOCUMENTS DETAILS (Optional)</h3>
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

                    <div className="pt-1 space-y-1">
                      <label className="text-[11px] font-bold text-cyan-600">Upload Document</label>
                      <button type="button" onClick={() => handleFileUpload("doc", index)} className="w-full h-20 border-2 border-dashed border-cyan-200 hover:border-cyan-600 hover:bg-cyan-50 transition-colors rounded-xl flex flex-col items-center justify-center text-cyan-600 cursor-pointer bg-slate-50">
                        {doc.document_file ? (
                           <span className="text-xs font-bold text-emerald-600">Document Uploaded</span>
                        ) : (
                          <>
                            <Plus size={18} className="mb-1" />
                            <span className="text-[13px] font-bold">Upload Document</span>
                          </>
                        )}
                      </button>
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
            Save Vendor
          </button>
        </div>
      </div>

    </div>
  );
}
