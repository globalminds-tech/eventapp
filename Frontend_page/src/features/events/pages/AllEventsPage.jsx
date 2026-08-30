import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Calendar, Filter, RefreshCw, ChevronLeft } from "lucide-react";
import { getHomeEventshow, getFullEventDetails } from "@/Services/api";

const CATEGORIES = ["All", "Music", "Business", "Technology", "Education", "Sports"];

export default function AllEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTitle, setSearchTitle] = useState(location.state?.title || "");
  const [searchLocation, setSearchLocation] = useState(location.state?.location || "");
  const [searchCategory, setSearchCategory] = useState(location.state?.category || "All");
  const [searchDate, setSearchDate] = useState("");

  // Details Modal States
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [fullData, setFullData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getHomeEventshow();
      if (!data || data.length === 0) {
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      const formatted = data.map((e) => {
        const isDonation = e.entry_type === "Donation" || String(e.pass_fee).toLowerCase() === "donation";
        const isFree = e.entry_type === "Free" || (!isDonation && (!e.pass_fee || Number(e.pass_fee) === 0));
        return {
          id: e.id,
          title: e.event_name,
          category: e.category || "General",
          entry_type: isDonation ? "Donation" : isFree ? "Free" : "Paid",
          price: isDonation || isFree ? 0 : (Number(e.pass_fee) || 0),
          location: e.venue || "Chennai",
          fullLocation: `${e.venue}, ${e.address}`,
          date: e.start_date || "Today",
          endDate: e.end_date,
          image: e.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
        };
      });

      const sorted = [...formatted].sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
      setFilteredEvents(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindEvents = useCallback(() => {
    let result = [...events];

    if (searchTitle.trim()) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
          e.fullLocation.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }
    if (searchLocation.trim()) {
      result = result.filter((e) =>
        e.fullLocation.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
    if (searchCategory && searchCategory !== "All") {
      result = result.filter(
        (e) => e.category.trim().toLowerCase() === searchCategory.trim().toLowerCase()
      );
    }
    if (searchDate) {
      result = result.filter(
        (e) => new Date(e.date).toISOString().split("T")[0] === searchDate
      );
    }
    setFilteredEvents(result);
  }, [events, searchTitle, searchLocation, searchCategory, searchDate]);

  useEffect(() => {
    handleFindEvents();
  }, [handleFindEvents]);

  const handleResetFilters = () => {
    setSearchTitle("");
    setSearchLocation("");
    setSearchCategory("All");
    setSearchDate("");
    setFilteredEvents(events);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col font-sans select-none pb-24">
      {/* Top Header Row with Back navigation */}
      <div className="h-14 px-4 border-b border-[#1e293b] flex items-center gap-3 bg-[#0f172a] sticky top-0 z-30">
        <button
          onClick={() => navigate("/")}
          className="p-1 hover:bg-slate-800 rounded-full cursor-pointer text-slate-400 hover:text-white border-none bg-transparent"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-base font-bold tracking-tight">Search Events</span>
      </div>

      {/* Hero Backdrop */}
      <div
        className="relative py-8 px-5 bg-cover bg-center flex flex-col items-center justify-center text-center overflow-hidden border-b border-[#1e293b]"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800')",
        }}
      >
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">Event Search</h1>
        <p className="text-xs text-slate-400 max-w-xs font-medium">
          Browse, filter, and discover your next unforgettable experience.
        </p>
      </div>

      {/* Mobile Filter Card */}
      <div className="mx-4 -mt-6 bg-[#1e293b] rounded-2xl p-5 border border-[#334155] shadow-xl relative z-10 flex flex-col gap-4">
        {/* Name input */}
        <div className="flex items-center bg-[#0f172a] rounded-xl px-4 py-2 border border-[#334155]">
          <Search size={18} className="text-slate-500 mr-3" />
          <input
            type="text"
            placeholder="Search by event name..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 font-semibold"
          />
        </div>

        {/* Location input */}
        <div className="flex items-center bg-[#0f172a] rounded-xl px-4 py-2 border border-[#334155]">
          <MapPin size={18} className="text-slate-500 mr-3" />
          <input
            type="text"
            placeholder="Location (e.g. Grand Square)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 font-semibold"
          />
        </div>

        {/* Category horizontal scroll bar */}
        <div className="overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = searchCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                    isActive ? "bg-[#38bdf8] text-[#0f172a]" : "bg-[#334155] text-slate-300 hover:bg-[#475569]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex gap-3">
          <button
            onClick={handleResetFilters}
            className="p-3 bg-[#0f172a] rounded-xl border border-[#334155] flex items-center justify-center cursor-pointer text-slate-400 hover:text-white"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleFindEvents}
            className="flex-1 bg-[#2563eb] text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider cursor-pointer border-none shadow-md shadow-blue-500/10"
          >
            Find Events
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3 border-b border-[#1e293b] mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#f97316]" />
          <span className="text-sm font-black tracking-tight">{filteredEvents.length} Events Found</span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-[#38bdf8] rounded-full animate-spin mb-3"></div>
          <p className="text-slate-400 text-xs font-medium">Fetching events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Empty Fallback */
        <div className="mx-4 mt-2 p-8 rounded-2xl bg-[#1e293b]/50 border border-[#334155] flex flex-col items-center justify-center text-center">
          <Search size={32} className="text-slate-500 mb-4" />
          <h3 className="text-sm font-black text-white mb-1">No Events Found</h3>
          <p className="text-xs text-slate-500 mb-5">Try adjusting your filters or clearing them.</p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#334155] text-white rounded-lg text-xs font-bold border-none cursor-pointer hover:bg-[#475569]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Cards List - Exact mobile layout */
        <div className="flex flex-col gap-4 px-4">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = event.date ? eventDate < today : false;

            return (
              <div
                key={event.id}
                onClick={() => navigate(`/event-detail/${event.id}`)}
                className="w-full h-56 rounded-2xl overflow-hidden relative cursor-pointer group shadow-lg border border-[#1e293b]"
              >
                {/* Background image */}
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                {/* Top Price Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
                  <span className="text-[11px] font-black text-[#f8fafc]">
                    {event.entry_type === "Paid" ? `₹${event.price}` : event.entry_type}
                  </span>
                </div>

                {/* Bottom details content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
                  <span className="text-[10px] font-bold text-[#fb923c] uppercase tracking-wider mb-1">
                    {event.category}
                  </span>
                  <h3 className="text-sm font-black text-white leading-tight line-clamp-2 mb-3">
                    {event.title}
                  </h3>

                  {/* Info row */}
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex flex-col gap-1 text-[11px] text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    {/* Book button */}
                    <button
                      disabled={isPast}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/usersbooking/${event.id}`);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-none cursor-pointer ${
                        isPast
                          ? "bg-[#334155] text-slate-400 cursor-not-allowed"
                          : "bg-[#2563eb] text-white hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-500/20"
                      }`}
                    >
                      {isPast ? "Closed" : "Book"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
