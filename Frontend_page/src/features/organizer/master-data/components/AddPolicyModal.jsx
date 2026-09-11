import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Loader2,
  ScrollText,
  FileText,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Check,
  Building2,
  ShieldCheck,
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
import { Select } from "@/components/ui/Select";

export default function AddPolicyModal({ isOpen, onClose, onSuccess, editData = null }) {
  const isEditMode = !!editData;
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const blankForm = {
    policy_name: "",
    policy_type: "",
    policy_group: "",
    status: "Active",
    description: "",
  };
  const [formData, setFormData] = useState(blankForm);

  const [policyTypes, setPolicyTypes] = useState([]);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newType, setNewType] = useState("");

  const [policyGroups, setPolicyGroups] = useState([]);
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [newGroup, setNewGroup] = useState("");

  const [documentFile, setDocumentFile] = useState("");
  const [documentFileName, setDocumentFileName] = useState("");

  // Pre-fill when opening in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        policy_name: editData.policy_name || "",
        policy_type: editData.policy_type || "",
        policy_group: editData.policy_group || "",
        status: editData.status || "Active",
        description: editData.description || "",
      });

      const fileUrl =
        editData.document_file ||
        editData.file_path ||
        editData.documents?.[0]?.document_file ||
        editData.documents?.[0]?.file_path ||
        "";
      setDocumentFile(fileUrl);
      setDocumentFileName(fileUrl ? (fileUrl.split("/").pop() || "Attached Document") : "");
    } else if (isOpen && !isEditMode) {
      setFormData(blankForm);
      setDocumentFile("");
      setDocumentFileName("");
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        const typesRes = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-policy-types`);
        if (typesRes.data && typesRes.data.length > 0) {
          const fetchedTypes = typesRes.data.map((item) => item.policy_type).filter(Boolean);
          setPolicyTypes((prev) => Array.from(new Set([...prev, ...fetchedTypes])));
        }
      } catch (err) {
        console.error("Error fetching policy types", err);
      }
      try {
        const groupsRes = await axios.get(`${ENV.API_BASE_URL}/superadmin/api/get-policy-groups`);
        if (groupsRes.data && groupsRes.data.length > 0) {
          const fetchedGroups = groupsRes.data.map((item) => item.policy_group).filter(Boolean);
          setPolicyGroups((prev) => Array.from(new Set([...prev, ...fetchedGroups])));
        }
      } catch (err) {
        console.error("Error fetching policy groups", err);
      }
    };
    if (isOpen) {
      fetchPolicyData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Additional Document Upload (PDF, JPG, PNG)
  const handleDocFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Document must be under 15MB");
      return;
    }

    setUploadingDoc(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await axios.post(`${ENV.API_BASE_URL}/superadmin/upload/all-docs`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.url || res.data?.file_path || "";
      if (uploadedUrl) {
        setDocumentFile(uploadedUrl);
        setDocumentFileName(file.name);
      }
    } catch (err) {
      console.error("Policy document upload failed:", err);
      alert("Failed to upload document: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingDoc(false);
      if (e.target) e.target.value = "";
    }
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${ENV.API_BASE_URL}${path}`;
  };

  const handleSubmit = async () => {
    if (!formData.policy_name || !formData.policy_type || !formData.policy_group) {
      alert("Please fill in all required fields (Policy Name, Policy Type, Policy Group).");
      return;
    }

    if (uploadingDoc) {
      alert("Please wait for document upload to complete before saving.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        organizer_id: organizerId,
        document_type: "",
        document_number: "",
        document_file: documentFile,
        file_path: documentFile,
        documents: documentFile ? [{ document_file: documentFile, file_path: documentFile }] : [],
      };

      if (isEditMode) {
        await axios.put(`${ENV.API_BASE_URL}/superadmin/api/update-policy/${editData.id}`, payload);
      } else {
        await axios.post(`${ENV.API_BASE_URL}/superadmin/api/create-policy`, payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving policy:", error);
      alert("Failed to save policy: " + (error.response?.data?.detail || error.message));
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
            <ScrollText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isEditMode ? "Edit Policy Details" : "New Policy Details"}
              </DialogTitle>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                Legal & Compliance
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Define reusable event terms, compliance documents, and visitor guidelines
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* ── CONTENT ── */}
      <DialogContent className="p-5 max-h-[calc(88vh-140px)] overflow-y-auto space-y-5 bg-slate-50/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SECTION 1: POLICY INFORMATION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
                  <Building2 size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Policy Information
                </h3>
              </div>
              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                {formData.status || "Active"}
              </Badge>
            </div>

            <Input
              label="Policy Name *"
              name="policy_name"
              value={formData.policy_name}
              onChange={handleChange}
              placeholder="e.g. Standard Pass Refund Policy"
            />

            {/* Policy Type */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Policy Type *</label>
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
                          setPolicyTypes((prev) => Array.from(new Set([...prev, newType.trim()])));
                          setFormData((prev) => ({ ...prev, policy_type: newType.trim() }));
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
                        setPolicyTypes((prev) => Array.from(new Set([...prev, newType.trim()])));
                        setFormData((prev) => ({ ...prev, policy_type: newType.trim() }));
                      }
                      setNewType("");
                      setIsAddingNewType(false);
                    }}
                    className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    <Check size={15} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewType("");
                      setIsAddingNewType(false);
                    }}
                    className="h-10 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl"
                  >
                    <X size={15} />
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.policy_type}
                  placeholder="Select Policy Type"
                  options={policyTypes.map((t) => ({ value: t, label: t }))}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, policy_type: val }))}
                />
              )}
            </div>

            {/* Policy Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Select Group *</label>
                {!isAddingNewGroup && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewGroup(true)}
                    className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md transition-all flex items-center gap-1 border-none cursor-pointer"
                  >
                    + New Group
                  </button>
                )}
              </div>
              {isAddingNewGroup ? (
                <div className="relative flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    placeholder="Enter group..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newGroup.trim()) {
                          setPolicyGroups((prev) => Array.from(new Set([...prev, newGroup.trim()])));
                          setFormData((prev) => ({ ...prev, policy_group: newGroup.trim() }));
                        }
                        setNewGroup("");
                        setIsAddingNewGroup(false);
                      } else if (e.key === "Escape") {
                        setIsAddingNewGroup(false);
                        setNewGroup("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newGroup.trim()) {
                        setPolicyGroups((prev) => Array.from(new Set([...prev, newGroup.trim()])));
                        setFormData((prev) => ({ ...prev, policy_group: newGroup.trim() }));
                      }
                      setNewGroup("");
                      setIsAddingNewGroup(false);
                    }}
                    className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    <Check size={15} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewGroup("");
                      setIsAddingNewGroup(false);
                    }}
                    className="h-10 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl"
                  >
                    <X size={15} />
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.policy_group}
                  placeholder="Select Policy Group"
                  options={policyGroups.map((g) => ({ value: g, label: g }))}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, policy_group: val }))}
                />
              )}
            </div>

            <Textarea
              label="Policy Terms & Description *"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Write or paste comprehensive policy guidelines, clauses, and conditions..."
            />
          </div>

          {/* SECTION 2: ADDITIONAL DOCUMENT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <FileText size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Additional Document
                </h3>
              </div>
              <Badge variant={documentFile ? "success" : "secondary"} className="text-[10px] font-bold">
                {documentFile ? "1 Attached" : "Optional"}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Upload an optional supplementary document, agreement, or detailed terms PDF/image.
            </p>

            {/* Hidden Input for Additional Document */}
            <input
              type="file"
              id="policy-additional-doc-input"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleDocFileUpload}
            />

            {uploadingDoc ? (
              <div className="w-full h-24 border-2 border-dashed border-cyan-300 rounded-xl bg-cyan-50/50 flex flex-col items-center justify-center gap-2 text-cyan-700">
                <Loader2 size={20} className="animate-spin text-cyan-600" />
                <span className="text-xs font-bold">Uploading document...</span>
              </div>
            ) : documentFile ? (
              <div className="w-full p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-800 truncate block" title={documentFileName || "Document Uploaded"}>
                        {documentFileName || "Document Uploaded"}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">Attached to policy</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentFile("");
                      setDocumentFileName("");
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors border-none bg-transparent cursor-pointer"
                    title="Remove document"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60">
                  <a
                    href={getFullUrl(documentFile)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs hover:bg-cyan-50 transition-all"
                  >
                    <ExternalLink size={12} />
                    <span>View Document</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => document.getElementById("policy-additional-doc-input")?.click()}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-50 transition-all"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById("policy-additional-doc-input")?.click()}
                className="w-full py-8 px-4 border-2 border-dashed border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/30 transition-all rounded-xl flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-cyan-700 cursor-pointer bg-white group text-center"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center text-cyan-600 transition-colors">
                  <Plus size={18} className="group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-cyan-700">
                    Upload Additional Document
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports PDF, JPG, PNG (Max 15MB)
                  </p>
                </div>
              </div>
            )}
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
          disabled={loading || uploadingDoc}
          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs border-none cursor-pointer flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{isEditMode ? "Update Policy" : "Save Policy"}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
