import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  MapPin,
  Compass,
  CheckCircle2,
  UploadCloud,
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

export default function AddVenueModal({ isOpen, onClose, onSuccess, editData = null }) {
  const isEditMode = !!editData;
  const reduxUser = useSelector((state) => state.user);
  const organizerId = reduxUser?.id || sessionStorage.getItem("userId") || localStorage.getItem("id") || "";

  const venueImageInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFileName, setImageFileName] = useState("");

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
    } else if (isOpen && !isEditMode) {
      setFormData(blankForm);
      setImageFileName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pin_code") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (isUploadingImage) {
      alert("Please wait for image upload to complete before saving.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        const payload = {
          ...formData,
          organizer_id: organizerId,
          updated_by: organizerId,
        };
        await axios.put(`${ENV.API_BASE_URL}/superadmin/api/update-venue/${editData.id}`, payload);
      } else {
        const payload = {
          ...formData,
          organizer_id: organizerId,
          created_by: organizerId,
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
    <Dialog open={isOpen} onClose={onClose} maxWidth="max-w-4xl">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          disabled={loading || isUploadingImage}
          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-xs border-none cursor-pointer flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{isEditMode ? "Update Venue" : "Save Venue"}</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
