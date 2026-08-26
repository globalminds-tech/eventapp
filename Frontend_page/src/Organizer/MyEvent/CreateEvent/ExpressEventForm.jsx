import React from "react";
import { Sparkles, Calendar, MapPin, Ticket, Layers, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ExpressEventForm({ formData, setFormData, onSubmit, isSubmitting }) {
  const details = formData.eventDetails || {};
  const booking = formData.bookingDetails || {};

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      eventDetails: {
        ...prev.eventDetails,
        [name]: value,
      },
    }));
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bookingDetails: {
        ...prev.bookingDetails,
        [name]: value,
      },
    }));
  };

  return (
    <div className="space-y-4 text-xs font-semibold text-slate-700">
      <div className="bg-cyan-50/60 border border-cyan-200/80 rounded-xl p-3 flex items-center justify-between text-cyan-900">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-600 animate-pulse" />
          <span className="font-extrabold">🚀 Express Creation Mode Active</span>
        </div>
        <span className="text-[11px] font-medium text-cyan-800">
          Fill essential fields below & publish in 1 click!
        </span>
      </div>

      {/* Row 1: Event Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-slate-800 font-bold">
            Event Name / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="eventName"
            value={details.eventName || ""}
            onChange={handleDetailsChange}
            placeholder="e.g. MRC Grand Music Fest 2026"
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-800 font-bold">
            Main Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="mainCategory"
            value={details.mainCategory || "Music & Concerts"}
            onChange={handleDetailsChange}
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="Music & Concerts">Music & Concerts</option>
            <option value="Expo & Exhibition">Expo & Exhibition</option>
            <option value="Tech & Corporate">Tech & Corporate</option>
            <option value="Food & Cultural">Food & Cultural</option>
            <option value="Sports & Fitness">Sports & Fitness</option>
          </select>
        </div>
      </div>

      {/* Row 2: Date, Time & Venue */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-slate-800 font-bold flex items-center gap-1">
            <Calendar size={13} className="text-cyan-600" /> Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={details.startDate || ""}
            onChange={handleDetailsChange}
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-800 font-bold flex items-center gap-1">
            <Calendar size={13} className="text-cyan-600" /> Time
          </label>
          <input
            type="text"
            name="startTime"
            value={details.startTime || "06:00 PM"}
            onChange={handleDetailsChange}
            placeholder="06:00 PM"
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-800 font-bold flex items-center gap-1">
            <MapPin size={13} className="text-cyan-600" /> Venue / Location
          </label>
          <input
            type="text"
            name="venueName"
            value={details.venueName || "MRC Center, Chennai"}
            onChange={handleDetailsChange}
            placeholder="e.g. MRC Center, Chennai"
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Row 3: Ticket Pricing & Capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-slate-800 font-bold flex items-center gap-1">
            <Ticket size={13} className="text-cyan-600" /> General Pass Price
          </label>
          <input
            type="text"
            name="generalPrice"
            value={booking.generalPrice || "₹499"}
            onChange={handleBookingChange}
            placeholder="e.g. ₹499"
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-800 font-bold">
            Max Attendance Capacity
          </label>
          <input
            type="number"
            name="maxCapacity"
            value={booking.maxCapacity || 500}
            onChange={handleBookingChange}
            placeholder="500"
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-800 font-bold flex items-center gap-1">
            <ImageIcon size={13} className="text-cyan-600" /> Banner Image URL
          </label>
          <input
            type="text"
            name="bannerImage"
            value={details.bannerImage || ""}
            onChange={handleDetailsChange}
            placeholder="https://images.unsplash.com/..."
            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
