import React from "react";
import { Calendar, MapPin, Ticket, Sparkles, Tag, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export default function LiveEventCardPreview({ formData }) {
  const details = formData?.eventDetails || {};
  const booking = formData?.bookingDetails || {};

  const name = details.eventName || "Your Event Title";
  const category = details.mainCategory || details.category || "Music & Concerts";
  const subCategory = details.subCategory || "Live Performance";
  const venue = details.selectedVenue?.name || details.venueName || "MRC Center, Chennai";
  const date = details.startDate || "2026-09-15";
  const price = booking.generalPrice || booking.ticketPrice || "₹499";
  const banner = details.bannerImage || details.banner || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80";

  return (
    <Card className="border-slate-200/80 shadow-md bg-white rounded-2xl overflow-hidden sticky top-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Eye size={15} className="text-cyan-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">Live Public Card Preview</span>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px]">
          Attendee View
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        {/* Banner Image */}
        <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 group border border-slate-100">
          <img
            src={banner}
            alt="Event Thumbnail"
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
              {category}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 bg-emerald-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md">
            {price === "Free" ? "Free" : `${price}`}
          </div>
        </div>

        {/* Details Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Tag size={12} className="text-cyan-600" />
            <span>{subCategory}</span>
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 leading-snug truncate">
            {name}
          </h3>
        </div>

        {/* Date & Venue */}
        <div className="space-y-1 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Calendar size={13} className="text-cyan-600 shrink-0" />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <MapPin size={13} className="text-cyan-600 shrink-0" />
            <span className="truncate">{venue}</span>
          </div>
        </div>

        <div className="pt-1 text-[11px] text-center text-slate-400 font-medium italic">
          ✨ Real-time preview of how your event thumbnail will look on the Attendee Home Screen.
        </div>
      </div>
    </Card>
  );
}
