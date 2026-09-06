import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Loader2,
  ChevronDown,
  Check,
  Store,
  CreditCard,
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { ENV } from "@/config/env";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectItem } from "@/components/ui/Select";

export default function AddVendorModal({ isOpen, onClose, onSuccess, editData = null }) {
  const isEditMode = !!editData;
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const bankFileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isUploadingBank, setIsUploadingBank] = useState(false);
  const [bankFileName, setBankFileName] = useState("");
  const [uploadingDocIndex, setUploadingDocIndex] = useState(null);

  const blankForm = {
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
  };

  const [formData, setFormData] = useState(blankForm);
  const [documents, setDocuments] = useState([
    { document_type: "", document_number: "", document_file: "", file_name: "" }
  ]);

  const [vendorTypes, setVendorTypes] = useState(["Catering", "Audio Visual", "Decoration", "Logistics"]);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newType, setNewType] = useState("");
  const [docTypes, setDocTypes] = useState([]);

  // Pre-fill form when opening in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        vendor_type: editData.vendor_type || "",
        vendor_name: editData.vendor_name || "",
        company_name: editData.company_name || "",
        primary_contact: editData.primary_contact || "",
        secondary_contact: editData.secondary_contact || "",
        mail_id: editData.mail_id || "",
        country: editData.country || "",
        state: editData.state || "",
        city: editData.city || "",
        address: editData.address || "",
        status: editData.status || "Active",
        account_holder: editData.account_holder || "",
        bank_name: editData.bank_name || "",
        account_number: editData.account_number || "",
        ifsc_code: editData.ifsc_code || "",
        bank_passbook: editData.bank_passbook || "",
      });
      if (editData.bank_passbook) setBankFileName("Existing passbook");
      
      if (editData.documents && editData.documents.length > 0) {
        setDocuments(editData.documents.map(doc => ({
          document_type: doc.document_type || "",
          document_number: doc.document_number || "",
          document_file: doc.document_file || "",
          file_name: doc.document_file ? "Existing document" : ""
        })));
      } else {
        setDocuments([{ document_type: "", document_number: "", document_file: "", file_name: "" }]);
      }
    } else if (isOpen && !isEditMode) {
      setFormData(blankForm);
      setBankFileName("");
      setDocuments([{ document_type: "", document_number: "", document_file: "", file_name: "" }]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchVendorTypes = async () => {
      try {
        const res = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-vendor-types`);
        if (res.data && res.data.length > 0) {
          const fetchedTypes = res.data.map((item) => item.vendor_type).filter(Boolean);
          setVendorTypes((prev) => Array.from(new Set([...prev, ...fetchedTypes])));
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
    setDocuments([...documents, { document_type: "", document_number: "", document_file: "", file_name: "" }]);
  };

  const removeDocument = (index) => {
    if (documents.length <= 1) {
      setDocuments([{ document_type: "", document_number: "", document_file: "", file_name: "" }]);
    } else {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  // Real Upload Handler for Bank Passbook / Cheque
  const handleBankFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Passbook document must be under 15MB");
      return;
    }

    setIsUploadingBank(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await axios.post(`${ENV.API_BASE_URL}/superadmin/upload/all-docs`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.url || res.data?.file_path || "";
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, bank_passbook: uploadedUrl }));
        setBankFileName(file.name);
      } else {
        throw new Error("Server did not return a valid file URL.");
      }
    } catch (err) {
      console.error("Bank passbook upload failed:", err);
      alert("Failed to upload passbook document: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploadingBank(false);
      if (e.target) e.target.value = "";
    }
  };

  // Real Upload Handler for Vendor KYC Documents
  const handleDocFileUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Document file must be under 15MB");
      return;
    }

    setUploadingDocIndex(index);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await axios.post(`${ENV.API_BASE_URL}/superadmin/upload/all-docs`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.url || res.data?.file_path || "";
      if (uploadedUrl) {
        handleDocChange(index, "document_file", uploadedUrl);
        handleDocChange(index, "file_name", file.name);
      } else {
        throw new Error("Server did not return a valid file URL.");
      }
    } catch (err) {
      console.error("KYC document upload failed:", err);
      alert("Failed to upload document: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingDocIndex(null);
      if (e.target) e.target.value = "";
    }
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${ENV.API_BASE_URL}${path}`;
  };

  const handleSubmit = async () => {
    if (!formData.vendor_name || !formData.company_name || !formData.primary_contact || !formData.mail_id) {
      alert("Please fill in the required vendor details (Name, Company, Contact, Mail).");
      return;
    }

    if (isUploadingBank || uploadingDocIndex !== null) {
      alert("Please wait for your document upload to complete before saving.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`${ENV.API_BASE_URL}/superadmin/api/update-vendor/${editData.id}`, formData);
      } else {
        const payload = {
          ...formData,
          organizer_id: organizerId,
          documents: documents.filter((d) => d.document_type || d.document_number || d.document_file),
        };
        await axios.post(`${ENV.API_BASE_URL}/superadmin/api/create_vendor`, payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving vendor:", error);
      alert("Failed to save vendor. Please try again: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="max-w-5xl">
      {/* ── HEADER ── */}
      <DialogHeader className="p-5 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700">
            <Store size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isEditMode ? "Edit Vendor Details" : "New Vendor Details"}
              </DialogTitle>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                Master Catalog
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Register suppliers, contractors, and service providers for event assignments
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* ── CONTENT (Spacious 3-column layout) ── */}
      <DialogContent className="p-5 max-h-[calc(88vh-140px)] overflow-y-auto space-y-5 bg-slate-50/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* SECTION 1: VENDOR INFORMATION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
                  <Store size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Vendor Information
                </h3>
              </div>
              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                {formData.status || "Active"}
              </Badge>
            </div>

            {/* Vendor Type */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Vendor Type <span className="text-rose-500">*</span>
                </label>
                {!isAddingNewType && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewType(true)}
                    className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md transition-all flex items-center gap-1 border-none cursor-pointer"
                  >
                    + New Type
                  </button>
                )}
              </div>

              {isAddingNewType ? (
                <div className="relative flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Enter type..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newType.trim()) {
                          setVendorTypes((prev) => Array.from(new Set([...prev, newType.trim()])));
                          setFormData((prev) => ({ ...prev, vendor_type: newType.trim() }));
                        }
                        setNewType("");
                        setIsAddingNewType(false);
                      } else if (e.key === "Escape") {
                        setIsAddingNewType(false);
                        setNewType("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newType.trim()) {
                        setVendorTypes((prev) => Array.from(new Set([...prev, newType.trim()])));
                        setFormData((prev) => ({ ...prev, vendor_type: newType.trim() }));
                      }
                      setNewType("");
                      setIsAddingNewType(false);
                    }}
                    className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    <Check size={15} />
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.vendor_type}
                  placeholder="Select Vendor Type"
                  options={vendorTypes.map((t) => ({ value: t, label: t }))}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, vendor_type: val }))}
                />
              )}
            </div>

            <Input
              label="Vendor Name *"
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleChange}
              placeholder="e.g. Acme Sound Systems"
            />

            <Input
              label="Company Name *"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g. Acme Enterprises Pvt Ltd"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Primary Contact *"
                name="primary_contact"
                value={formData.primary_contact}
                onChange={handleChange}
                placeholder="10-digit mobile"
              />
              <Input
                label="Secondary Contact"
                name="secondary_contact"
                value={formData.secondary_contact}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <Input
              label="Mail ID *"
              type="email"
              name="mail_id"
              value={formData.mail_id}
              onChange={handleChange}
              placeholder="vendor@company.com"
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Country *"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
              />
              <Input
                label="State *"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
              <Input
                label="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </div>

            <Textarea
              label="Full Address *"
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, locality, landmarks..."
            />
          </div>

          {/* SECTION 2: ACCOUNT & SETTLEMENT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                <CreditCard size={15} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                Bank & Payout Details
              </h3>
            </div>

            <Input
              label="Account Holder Name *"
              name="account_holder"
              value={formData.account_holder}
              onChange={handleChange}
              placeholder="Full name as in passbook"
            />

            <Input
              label="Bank Name *"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              placeholder="e.g. HDFC Bank"
            />

            <Input
              label="Account Number *"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              placeholder="Account number"
            />

            <Input
              label="IFSC / SWIFT Code *"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
              placeholder="e.g. HDFC0001234"
            />

            {/* REAL PASSBOOK / CHEQUE FILE UPLOAD */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700">
                Passbook / Cancelled Cheque
              </label>

              {/* Hidden Native File Input */}
              <input
                type="file"
                ref={bankFileInputRef}
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleBankFileUpload}
              />

              {isUploadingBank ? (
                <div className="w-full h-24 border-2 border-dashed border-cyan-300 rounded-xl bg-cyan-50/50 flex flex-col items-center justify-center gap-1.5 text-cyan-700">
                  <Loader2 size={22} className="animate-spin text-cyan-600" />
                  <span className="text-xs font-bold">Uploading document to storage...</span>
                </div>
              ) : formData.bank_passbook ? (
                <div className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                        <CheckCircle2 size={15} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate" title={bankFileName || "Passbook Attached"}>
                          {bankFileName || "Passbook Attached"}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold">Stored & Connected to Vendor</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, bank_passbook: "" }));
                        setBankFileName("");
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
                      title="Remove file"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                    <a
                      href={getFullUrl(formData.bank_passbook)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs"
                    >
                      <ExternalLink size={11} />
                      <span>View Uploaded File</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => bankFileInputRef.current?.click()}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                    >
                      Replace File
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bankFileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 transition-all rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-cyan-700 cursor-pointer bg-slate-50/50 group"
                >
                  <UploadCloud size={20} className="mb-1 text-cyan-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">Upload Cheque / Passbook</span>
                  <span className="text-[10px] text-slate-400">PDF, PNG, JPG up to 15MB</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 3: DOCUMENTS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <FileText size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  KYC & Documents (Optional)
                </h3>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {documents.filter((d) => d.document_file).length} Stored
              </Badge>
            </div>

            {documents.map((doc, index) => {
              const docConfig = docTypes.find((d) => d.type === doc.document_type) || {};
              const isUploadingThis = uploadingDocIndex === index;

              return (
                <div key={index} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 relative">
                  {documents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
                      title="Remove this document slot"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Document Type</label>
                    <Select
                      value={doc.document_type}
                      placeholder="Select Document Type"
                      options={docTypes.map((d) => ({ value: d.type, label: d.type }))}
                      onValueChange={(val) => handleDocChange(index, "document_type", val)}
                    />
                  </div>

                  <Input
                    label="Document Number"
                    value={doc.document_number}
                    onChange={(e) => {
                      let val = e.target.value.toUpperCase();
                      if (docConfig.type === "Aadhar") val = val.replace(/\D/g, "");
                      else val = val.replace(/[^A-Z0-9]/g, "");
                      handleDocChange(index, "document_number", val);
                    }}
                    maxLength={docConfig.maxLength || 50}
                    placeholder={docConfig.placeholder || "Enter Registration / ID Number"}
                  />

                  {/* Hidden Native File Input for Document */}
                  <input
                    type="file"
                    id={`doc-upload-input-${index}`}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleDocFileUpload(e, index)}
                  />

                  {isUploadingThis ? (
                    <div className="w-full h-16 border-2 border-dashed border-cyan-300 rounded-xl bg-cyan-50/50 flex items-center justify-center gap-2 text-cyan-700">
                      <Loader2 size={16} className="animate-spin text-cyan-600" />
                      <span className="text-xs font-bold">Uploading document...</span>
                    </div>
                  ) : doc.document_file ? (
                    <div className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate" title={doc.file_name || "Document Uploaded"}>
                            {doc.file_name || "Document Uploaded"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleDocChange(index, "document_file", "");
                            handleDocChange(index, "file_name", "");
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                        <a
                          href={getFullUrl(doc.document_file)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs"
                        >
                          <ExternalLink size={10} />
                          <span>View Document</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => document.getElementById(`doc-upload-input-${index}`)?.click()}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs cursor-pointer"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById(`doc-upload-input-${index}`)?.click()}
                      className="w-full h-16 border-2 border-dashed border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 transition-all rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-cyan-700 cursor-pointer bg-white group"
                    >
                      <Plus size={14} className="text-cyan-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Select & Upload File</span>
                      <span className="text-[10px] text-slate-400">(PDF, JPG, PNG)</span>
                    </button>
                  )}
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={addDocument}
              className="w-full h-9 border-dashed border-cyan-300 text-cyan-700 hover:bg-cyan-50 font-bold text-xs cursor-pointer rounded-xl"
            >
              <Plus size={13} className="mr-1" />
              <span>Add Another Document</span>
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* ── FOOTER ── */}
      <DialogFooter className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-9 px-4 font-bold text-xs rounded-xl border-slate-200 text-slate-700 hover:text-slate-900"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || isUploadingBank || uploadingDocIndex !== null}
          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs border-none cursor-pointer flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{isEditMode ? "Update Vendor" : "Save Vendor"}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
