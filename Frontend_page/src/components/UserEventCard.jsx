import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, ThumbsUp, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Helper to extract simple city name from full location strings
 */
const extractCity = (loc) => {
  if (!loc) return "Venue TBD";
  const parts = loc.split(",").map((p) => p.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
};

/**
 * UserEventCard
 * Reusable user-side event card tailored for mobile viewports:
 * - Compact scaling on small mobile screens (< 640px)
 * - 2-column grid compatibility on mobile
 * - Compact horizontal carousel card compatibility
 */
export const UserEventCard = ({
  event,
  variant = "grid", // "grid" | "carousel"
  className = "",
  onClick,
  onBookClick,
}) => {
  const navigate = useNavigate();

  if (!event) return null;

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    } else {
      navigate(`/event-detail/${event.id}`);
    }
  };

  const handleBook = (e) => {
    e.stopPropagation();
    if (onBookClick) {
      onBookClick(event);
    } else {
      navigate(`/usersbooking/${event.id}`, { state: { event } });
    }
  };

  const isSuspended =
    event.status === "SUSPENDED" ||
    event.approval_status === "SUSPENDED" ||
    Boolean(event.is_suspended);

  const priceFormatted =
    event.entry_type === "Donation"
      ? "Donation"
      : event.entry_type === "Free" || event.price === 0 || event.price === "₹0" || event.price === "Free"
      ? "Free"
      : typeof event.price === "number"
      ? `₹${event.price.toLocaleString("en-IN")}`
      : event.price || "₹199";

  const cityDisplay = extractCity(event.fullLocation || event.location || event.city || event.venue);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group select-none bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-lg hover:border-orange-300/80 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden",
        variant === "carousel"
          ? "w-[calc((100vw-56px)/2.5)] min-w-[calc((100vw-56px)/2.5)] sm:w-[220px] sm:min-w-[220px] md:w-[260px] shrink-0"
          : "w-full",
        className
      )}
    >
      {/* ── IMAGE BANNER ── */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"}
          alt={event.title || event.name || "Event"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Chip (Top Left) */}
        <span className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 px-1.5 py-0.5 sm:px-2 rounded-md bg-slate-900/85 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
          {event.category || event.main_category_name || "Event"}
        </span>

        {/* Status Badge (Top Right) */}
        {isSuspended ? (
          <span className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5 px-1.5 py-0.5 sm:px-2 rounded-md bg-amber-500 text-white text-[7.5px] sm:text-[9px] font-black uppercase tracking-wider shadow-sm">
            Paused
          </span>
        ) : (
          <span className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5 px-1.5 py-0.5 sm:px-2 rounded-md bg-slate-900/75 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-extrabold border border-white/20">
            {priceFormatted}
          </span>
        )}
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-2 sm:p-3.5 flex flex-col justify-between flex-1 gap-1.5 sm:gap-2">
        <div className="space-y-1">
          {/* Rating & Likes Micro Strip */}
          <div className="flex items-center justify-between text-[8.5px] sm:text-[10px] font-black text-slate-500">
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500">
              <Star size={10} className="fill-amber-500 text-amber-500 shrink-0" />
              <span>{event.rating || "4.8"}</span>
            </div>
            {event.likes && (
              <div className="flex items-center gap-0.5 sm:gap-1 text-emerald-600">
                <ThumbsUp size={9} className="shrink-0" />
                <span>{event.likes}</span>
              </div>
            )}
          </div>

          {/* Event Title */}
          <h3 className="text-[11px] sm:text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {event.title || event.name || event.event_name || "Untitled Event"}
          </h3>

          {/* Location & Date */}
          <div className="space-y-0.5 text-[9px] sm:text-[11px] text-slate-500 font-medium">
            <p className="flex items-center gap-1 truncate">
              <MapPin size={10} className="text-orange-500 shrink-0" />
              <span className="truncate">{cityDisplay}</span>
            </p>
            {event.date && (
              <p className="flex items-center gap-1 truncate text-slate-400">
                <Calendar size={10} className="text-orange-500 shrink-0" />
                <span className="truncate">{event.date}</span>
              </p>
            )}
          </div>
        </div>

        {/* ── CARD FOOTER ── */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase leading-none">Entry</span>
            <span className="text-[11px] sm:text-sm font-black text-slate-900 leading-tight truncate">
              {priceFormatted}
            </span>
          </div>

          {isSuspended ? (
            <span className="bg-amber-50 text-amber-800 border border-amber-200 font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded uppercase shrink-0">
              Paused
            </span>
          ) : (
            <button
              type="button"
              onClick={handleBook}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border-none cursor-pointer transition-all shadow-xs hover:shadow-orange-500/25 active:scale-95 flex items-center gap-1 shrink-0"
            >
              <span>Book</span>
              <ArrowRight size={10} className="hidden sm:inline" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEventCard;
