import React, { useState } from "react";
import { Upload, X, FileText, Trash2, Check, AlertCircle, Plus, Eye } from "lucide-react";
import { Select, SelectItem } from "@/components/ui/Select";

const Step4Documents = ({ formData, setFormData }) => {
  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docPreview, setDocPreview] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [docError, setDocError] = useState("");
  const [previewModal, setPreviewModal] = useState({ open: false, file: null, url: "" });

  const documentsList = formData.documents?.additionalDocs || [];

  const processFile = (file) => {
    if (!file) return;
    setDocError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setDocError("Invalid file type. Supported: JPG, PNG, WEBP, PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocError("File size must be under 10MB");
      return;
    }

    setDocFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setDocPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const addDocument = () => {
    if (!docType) {
      setDocError("Please select document / permit type");
      return;
    }
    if (!docFile && !docPreview) {
      setDocError("Please upload a document file");
      return;
    }

    const newDoc = {
      id: Date.now(),
      type: docType,
      number: docNumber || "N/A",
      file: docFile,
      preview: docPreview,
      name: docFile?.name || `${docType} Permit`,
    };

    const updated = [...documentsList, newDoc];
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, additionalDocs: updated },
    }));

    // Reset inputs
    setDocType("");
    setDocNumber("");
    setDocPreview(null);
    setDocFile(null);
    setDocError("");
  };

  const removeDoc = (index) => {
    const updated = documentsList.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, additionalDocs: updated },
    }));
  };

  return (
    <div className="space-y-4 pt-1">
      <p className="text-[11px] text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
        📌 <strong>Organizer Compliance Upload:</strong> Attach official permits, NOC clearances, and legal licenses required for hosting this event (e.g. Police Permission, Sound License, Safety Clearance, GST/PAN).
      </p>

      {/* Input Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Select
            label="Document / Permit Type"
            value={docType}
            onValueChange={(val) => { setDocType(val); setDocNumber(""); }}
            placeholder="Select Document / Permit"
            triggerClassName="bg-slate-50 border-slate-200 rounded-xl h-9 text-xs focus:ring-cyan-500"
          >
            <SelectItem value="Police Permission NOC">Police Permission NOC</SelectItem>
            <SelectItem value="Sound License">Sound & Loudspeaker License</SelectItem>
            <SelectItem value="Fire & Safety NOC">Fire & Safety Clearance</SelectItem>
            <SelectItem value="Municipal Trade License">Municipal Trade License</SelectItem>
            <SelectItem value="GST Certificate">Organizer GST Certificate</SelectItem>
            <SelectItem value="PAN / Aadhar Card">Organizer PAN / Aadhar Card</SelectItem>
            <SelectItem value="Other Permit">Other License / Certificate</SelectItem>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Document / Permit Number (Optional)
          </label>
          <input
            type="text"
            placeholder="Enter reference # (Optional)"
            maxLength={25}
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Upload Zone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Document File (JPG, PNG, PDF)
          </label>
          <div className="flex items-center gap-2">
            <label
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`flex-1 h-9 border border-dashed rounded-xl px-3 flex items-center justify-between cursor-pointer transition-colors ${
                dragActive ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-slate-50 hover:border-cyan-400"
              }`}
            >
              <span className="text-[11px] text-slate-500 truncate">
                {docFile ? docFile.name : "Choose or drop file..."}
              </span>
              <Upload size={14} className="text-slate-400 shrink-0" />
              <input type="file" accept="image/*,.pdf" onChange={handleDocUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={addDocument}
              className="h-9 px-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:from-cyan-400 hover:to-blue-500 border-none cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {docError && (
        <p className="text-red-500 text-[11px] font-medium flex items-center gap-1">
          <AlertCircle size={12} /> {docError}
        </p>
      )}

      {/* Added Documents List */}
      {documentsList.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-bold text-slate-700">Uploaded Documents ({documentsList.length})</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {documentsList.map((doc, idx) => (
              <div key={doc.id || idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="p-1.5 bg-cyan-100 rounded-lg text-cyan-700">
                    <FileText size={14} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{doc.type}: {doc.number}</p>
                    <p className="text-[10px] text-slate-500 truncate">{doc.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDoc(idx)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4Documents;