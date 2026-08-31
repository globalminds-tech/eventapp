import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Calendar, Filter, RefreshCw, ChevronLeft, ArrowRight, ThumbsUp, Star } from "lucide-react";
import { getHomeEventshow } from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const CATEGORIES = ["All", "Music", "Comedy", "Expos", "Sports", "Festivals"];

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getHomeEventshow();
      const rawList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      if (!rawList || rawList.length === 0) {
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      const formatted = rawList.map((e, index) => {
        const isDonation = e.entry_type === "Donation" || String(e.pass_fee).toLowerCase() === "donation";
        const isFree = e.entry_type === "Free" || (!isDonation && (!e.pass_fee || Number(e.pass_fee) === 0));
        return {
          id: e.id,
          title: e.event_name || e.name || "Live Event",
          category: e.category || "General",
          entry_type: isDonation ? "Donation" : isFree ? "Free" : "Paid",
          price: isDonation || isFree ? "Free" : `₹${Number(e.pass_fee) || 0}`,
          location: e.venue || "Chennai",
          fullLocation: `${e.venue || ''}, ${e.address || e.city || ''}`,
          date: e.start_date || "Upcoming",
          likes: `${(120 + index * 18).toFixed(1)}K+`,
          rating: (8.6 + (index % 12) * 0.1).toFixed(1),
          image: e.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800",
        };
      });

      setEvents(formatted);
      setFilteredEvents(formatted);
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
        (e) => e.category.trim().toLowerCase().includes(searchCategory.trim().toLowerCase())
      );
    }
    setFilteredEvents(result);
  }, [events, searchTitle, searchLocation, searchCategory]);

  useEffect(() => {
    handleFindEvents();
  }, [handleFindEvents]);

  const handleResetFilters = () => {
    setSearchTitle("");
    setSearchLocation("");
    setSearchCategory("All");
    setFilteredEvents(events);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-24">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 transition border-none bg-transparent"
              title="Go Back"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Explore Live Events &amp; Shows
            </h1>
          </div>

          <Badge className="bg-orange-50 text-orange-600 border-orange-200 font-bold text-[11px]">
            {filteredEvents.length} Events Available
          </Badge>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-8 px-5">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">✦ LIVE TICKET SHOWCASE ✦</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Find Your Next Unforgettable Experience</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto">
            Book verified tickets instantly for concerts, standup comedy, tech expos, and sports tournaments.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="max-w-6xl mx-auto px-4 w-full -mt-6 z-20">
        <Card className="bg-white border-slate-200/80 shadow-md rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search event title, artist..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter by city or venue..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    searchCategory === cat
                      ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="text-xs font-bold rounded-xl border-slate-200 text-slate-600 gap-1.5 cursor-pointer ml-auto"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="max-w-6xl mx-auto px-4 w-full pt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Card key={n} className="bg-white border-slate-200/80 shadow-xs rounded-2xl overflow-hidden p-4 space-y-3">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-semibold text-sm">
            No events found matching your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredEvents.map((ev) => (
              <Card
                key={ev.id}
                onClick={() => navigate(`/event-detail/${ev.id}`)}
                className="bg-white border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <Badge className="bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-[10px] px-2.5 py-0.5 border border-white/20">
                      {ev.price}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black mb-1">
                      <span className="text-orange-600 uppercase tracking-wider">{ev.category}</span>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star size={11} className="fill-amber-500 text-amber-500" />
                        <span>{ev.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {ev.title}
                    </h3>

                    <div className="text-xs text-slate-500 space-y-1 mt-2">
                      <p className="flex items-center gap-1.5 font-medium">
                        <MapPin size={13} className="text-orange-500 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-orange-500 shrink-0" />
                        <span>{ev.date}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400">Entry Pass</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/event-detail/${ev.id}`);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl border-none cursor-pointer gap-1 shadow-xs"
                    >
                      <span>Book</span>
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
