import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Plus,
  Loader2,
  MapPin,
  Image as ImageIcon,
  Compass,
  FileText,
  CheckCircle2,
  UploadCloud,
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

export default function AddVenueModal({ isOpen, onClose, onSuccess, editData = null }) {
  const isEditMode = !!editData;
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const venueImageInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFileName, setImageFileName] = useState("");
  const [uploadingDocIndex, setUploadingDocIndex] = useState(null);

  const blankForm = {
    venue_name: "",
    address: "",
    country_name: "",
    state_name: "",
    city_name: "",
    pin_code: "",
    status: "Active",
    latitude: "",
    longitude: "",
    location_details: "",
    venue_image: "",
  };

  const [formData, setFormData] = useState(blankForm);
  const [documents, setDocuments] = useState([
    { document_type: "", document_number: "", document_file: "", file_name: "" }
  ]);
  const [docTypes, setDocTypes] = useState([]);

  // Pre-fill form when opening in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        venue_name: editData.venue_name || editData.name || "",
        address: editData.address || "",
        country_name: editData.country_name || editData.country || "",
        state_name: editData.state_name || editData.state || "",
        city_name: editData.city_name || editData.city || "",
        pin_code: editData.pin_code || "",
        status: editData.status || "Active",
        latitude: editData.latitude || "",
        longitude: editData.longitude || "",
        location_details: editData.google_place_id || editData.location_details || "",
        venue_image: editData.venue_image || "",
      });
      if (editData.venue_image) setImageFileName("Existing image");
      
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
      setImageFileName("");
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

  // Real Venue Image Upload
  const handleVenueImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Image must be under 15MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await axios.post(`${ENV.API_BASE_URL}/superadmin/upload/all-docs`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.url || res.data?.file_path || "";
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, venue_image: uploadedUrl }));
        setImageFileName(file.name);
      } else {
        throw new Error("Upload did not return a valid URL.");
      }
    } catch (err) {
      console.error("Venue image upload failed:", err);
      alert("Failed to upload venue image: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  // Real Venue Document Upload
  const handleDocFileUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      console.error("Venue document upload failed:", err);
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
    if (!formData.venue_name || !formData.address || !formData.city_name) {
      alert("Please fill in the required venue details (Venue Name, Address, City).");
      return;
    }

    if (isUploadingImage || uploadingDocIndex !== null) {
      alert("Please wait for file upload to complete before saving.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`${ENV.API_BASE_URL}/superadmin/api/update-venue/${editData.id}`, formData);
      } else {
        const payload = {
          ...formData,
          organizer_id: organizerId,
          documents: documents.filter((d) => d.document_type || d.document_number || d.document_file),
        };
        await axios.post(`${ENV.API_BASE_URL}/superadmin/api/create_venue`, payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving venue:", error);
      alert("Failed to save venue: " + (error.response?.data?.detail || error.message));
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
            <MapPin size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isEditMode ? "Edit Venue Details" : "New Venue Details"}
              </DialogTitle>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold text-[10px]">
                Master Catalog
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Register convention halls, exhibition centers, and grounds for 1-click event assignment
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* ── CONTENT ── */}
      <DialogContent className="p-5 max-h-[calc(88vh-140px)] overflow-y-auto space-y-5 bg-slate-50/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* SECTION 1: VENUE IDENTIFICATION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
                  <MapPin size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Venue Information
                </h3>
              </div>
              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                {formData.status || "Active"}
              </Badge>
            </div>

            {/* Venue Image Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Venue Photo / Cover Image</label>
              <input
                type="file"
                ref={venueImageInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleVenueImageUpload}
              />

              {isUploadingImage ? (
                <div className="w-full h-24 border-2 border-dashed border-cyan-300 rounded-xl bg-cyan-50/50 flex flex-col items-center justify-center gap-1.5 text-cyan-700">
                  <Loader2 size={20} className="animate-spin text-cyan-600" />
                  <span className="text-xs font-bold">Uploading venue photo...</span>
                </div>
              ) : formData.venue_image ? (
                <div className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                        <CheckCircle2 size={15} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate" title={imageFileName || "Venue Image"}>
                          {imageFileName || "Venue Image"}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold">Image Uploaded & Saved</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, venue_image: "" }));
                        setImageFileName("");
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
                      title="Remove image"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
                    <a
                      href={getFullUrl(formData.venue_image)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs"
                    >
                      <ExternalLink size={11} />
                      <span>View Image</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => venueImageInputRef.current?.click()}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => venueImageInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 transition-all rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-cyan-700 cursor-pointer bg-slate-50/50 group"
                >
                  <UploadCloud size={20} className="mb-1 text-cyan-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">Upload Venue Photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG up to 15MB</span>
                </button>
              )}
            </div>

            <Input
              label="Venue Name *"
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              placeholder="e.g. Pragati Maidan Hall 14"
            />

            <Input
              label="Location Landmark / Google Place ID"
              name="location_details"
              value={formData.location_details}
              onChange={handleChange}
              placeholder="e.g. Near Gate No. 4, Metro Station"
            />

            <Textarea
              label="Complete Street Address *"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Street name, landmark, colony, area..."
            />
          </div>

          {/* SECTION 2: LOCATION & GEOGRAPHY */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                <Compass size={15} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                City, State & Coordinates
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Country *"
                name="country_name"
                value={formData.country_name}
                onChange={handleChange}
                placeholder="India"
              />
              <Input
                label="State *"
                name="state_name"
                value={formData.state_name}
                onChange={handleChange}
                placeholder="e.g. Delhi NCR"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City *"
                name="city_name"
                value={formData.city_name}
                onChange={handleChange}
                placeholder="e.g. New Delhi"
              />
              <Input
                label="PIN / Postal Code"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                placeholder="e.g. 110001"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 28.6139"
              />
              <Input
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 77.2090"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 font-medium">
              💡 Coordinates allow attendees to navigate directly via Google Maps on digital pass confirmation screens.
            </div>
          </div>

          {/* SECTION 3: VENUE DOCUMENTS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <FileText size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Venue Permits & Layout
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
                    label="Document Number / Permit No"
                    value={doc.document_number}
                    onChange={(e) => handleDocChange(index, "document_number", e.target.value.toUpperCase())}
                    placeholder="e.g. NOC-2026-Delhi"
                  />

                  {/* Hidden Input for Venue Document */}
                  <input
                    type="file"
                    id={`venue-doc-input-${index}`}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleDocFileUpload(e, index)}
                  />

                  {isUploadingThis ? (
                    <div className="w-full h-14 border-2 border-dashed border-cyan-300 rounded-xl bg-cyan-50/50 flex items-center justify-center gap-2 text-cyan-700">
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
                          onClick={() => document.getElementById(`venue-doc-input-${index}`)?.click()}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs cursor-pointer"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById(`venue-doc-input-${index}`)?.click()}
                      className="w-full h-14 border-2 border-dashed border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 transition-all rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-cyan-700 cursor-pointer bg-white group"
                    >
                      <Plus size={14} className="text-cyan-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Upload NOC / Blueprint</span>
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
          disabled={loading || isUploadingImage || uploadingDocIndex !== null}
          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs border-none cursor-pointer flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{isEditMode ? "Update Venue" : "Save Venue"}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
