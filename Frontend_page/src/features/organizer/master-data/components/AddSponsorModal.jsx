import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Loader2,
  Award,
  FileText,
  CheckCircle2,
  Building2,
  ExternalLink,
  Trash2,
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

export default function AddSponsorModal({ isOpen, onClose, onSuccess, editData = null }) {
  const isEditMode = !!editData;
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const [loading, setLoading] = useState(false);
  const [uploadingDocIndex, setUploadingDocIndex] = useState(null);

  const blankForm = {
    sponsor_name: "",
    mail_id: "",
    primary_contact: "",
    secondary_contact: "",
    status: "Active",
    address: "",
  };

  const [formData, setFormData] = useState(blankForm);
  const [documents, setDocuments] = useState([
    { document_type: "", document_number: "", document_file: "", file_name: "" }
  ]);
  const [docTypes, setDocTypes] = useState([]);

  // Pre-fill when opening in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        sponsor_name: editData.sponsor_name || "",
        mail_id: editData.mail_id || "",
        primary_contact: editData.primary_contact || "",
        secondary_contact: editData.secondary_contact || "",
        status: editData.status || "Active",
        address: editData.address || "",
      });
      
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
      setDocuments([{ document_type: "", document_number: "", document_file: "", file_name: "" }]);
    }
  }, [isOpen]);

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
    setDocuments([...documents, { document_type: "", document_number: "", document_file: "", file_name: "" }]);
  };

  const removeDocument = (index) => {
    if (documents.length <= 1) {
      setDocuments([{ document_type: "", document_number: "", document_file: "", file_name: "" }]);
    } else {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  // Real Sponsor Document Upload
  const handleDocFileUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Document must be under 15MB");
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
      }
    } catch (err) {
      console.error("Sponsor document upload failed:", err);
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
    if (!formData.sponsor_name || !formData.mail_id || !formData.primary_contact) {
      alert("Please fill in all required fields (Sponsor Name, Mail ID, Primary Contact).");
      return;
    }

    if (uploadingDocIndex !== null) {
      alert("Please wait for document upload to complete before saving.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`${ENV.API_BASE_URL}/superadmin/api/update-sponsor/${editData.id}`, formData);
      } else {
        const payload = {
          ...formData,
          organizer_id: organizerId,
          documents: documents.filter((d) => d.document_type || d.document_number || d.document_file),
        };
        await axios.post(`${ENV.API_BASE_URL}/superadmin/api/sponsorship`, payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving sponsor:", error);
      alert("Failed to save sponsor: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      {/* ── HEADER ── */}
      <DialogHeader className="p-5 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700">
            <Award size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isEditMode ? "Edit Sponsor Details" : "New Sponsor Details"}
              </DialogTitle>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                Brand Partners
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Register title sponsors, co-presenters, and corporate partners for your events
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* ── CONTENT ── */}
      <DialogContent className="p-5 max-h-[calc(88vh-140px)] overflow-y-auto space-y-5 bg-slate-50/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SECTION 1: SPONSOR INFORMATION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
                  <Building2 size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Sponsor Information
                </h3>
              </div>
              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                {formData.status || "Active"}
              </Badge>
            </div>

            <Input
              label="Sponsor / Organization Name *"
              name="sponsor_name"
              value={formData.sponsor_name}
              onChange={handleChange}
              placeholder="e.g. Acme Global Tech"
            />

            <Input
              label="Official Contact Email *"
              type="email"
              name="mail_id"
              value={formData.mail_id}
              onChange={handleChange}
              placeholder="sponsorships@acme.com"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Primary Contact No *"
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

            <Textarea
              label="HQ / Office Address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Corporate headquarters or correspondence address..."
            />
          </div>

          {/* SECTION 2: SPONSOR DOCUMENTS & AGREEMENTS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <FileText size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Agreements & Collateral
                </h3>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {documents.filter((d) => d.document_file).length} Stored
              </Badge>
            </div>

            {documents.map((doc, index) => {
              const isUploadingThis = uploadingDocIndex === index;
              return (
                <div key={index} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 relative">
                  {documents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
                      title="Remove this slot"
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
                    label="Document / Agreement ID"
                    value={doc.document_number}
                    onChange={(e) => handleDocChange(index, "document_number", e.target.value.toUpperCase())}
                    placeholder="e.g. MOU-2026-SPON-01"
                  />

                  {/* Hidden Input for Sponsor Document */}
                  <input
                    type="file"
                    id={`sponsor-doc-input-${index}`}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleDocFileUpload(e, index)}
                  />

                  {isUploadingThis ? (
                    <div className="w-full h-14 border-2 border-dashed border-cyan-300 rounded-xl bg-cyan-50/50 flex items-center justify-center gap-2 text-cyan-700">
                      <Loader2 size={16} className="animate-spin text-cyan-600" />
                      <span className="text-xs font-bold">Uploading agreement...</span>
                    </div>
                  ) : doc.document_file ? (
                    <div className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate" title={doc.file_name || "Agreement Uploaded"}>
                            {doc.file_name || "Agreement Uploaded"}
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
                          <span>View Agreement</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => document.getElementById(`sponsor-doc-input-${index}`)?.click()}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs cursor-pointer"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById(`sponsor-doc-input-${index}`)?.click()}
                      className="w-full h-14 border-2 border-dashed border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 transition-all rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-cyan-700 cursor-pointer bg-white group"
                    >
                      <Plus size={14} className="text-cyan-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Upload MOU / Brand Asset</span>
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
          disabled={loading || uploadingDocIndex !== null}
          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs border-none cursor-pointer flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{isEditMode ? "Update Sponsor" : "Save Sponsor"}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
