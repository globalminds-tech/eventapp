import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Calendar, LayoutGrid, Grid, LayoutList, List, Menu,
  ChevronLeft, ChevronRight, ArrowRight, Store, Search, Filter, Sparkles
} from "lucide-react";
import MediaRenderer from "@/components/MediaRenderer";
import { getHomeEventshow } from "@/Services/api";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const UpcomingEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getHomeEventshow();
      const rawList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.events) ? data.events : []));

      const formatted = rawList.map((e) => ({
        id: e.id,
        title: e.event_name || e.name || "Exhibition Show",
        location: `${e.venue || 'Exhibition Center'}, ${e.address || e.city || 'Chennai'}`,
        date: e.start_date || "2026-09-15",
        endDate: e.end_date || "2026-09-18",
        image: e.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        banner_type: e.banner_type,
        category: e.category || "Trade Fair",
        stallsAvailable: 15,
        totalStalls: 60
      }));

      setEvents(formatted);
    } catch (err) {
      console.log("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookStall = (event) => {
    navigate(`/book-stall/${event.id}`, { state: { event } });
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = searchTerm === "" || e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Upcoming Expos & Trade Fairs
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              Exhibitor Booth Reservation Catalog
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Browse upcoming major expos, view hall floor plans, and reserve your exhibition booth space.
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            {["all", "Tech", "Business", "Fashion", "Food"].map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer capitalize ${
                  selectedCategory === cat ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search expo title, city, venue..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEvents.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-semibold text-sm">
            No upcoming expos found matching your search.
          </div>
        ) : (
          paginatedEvents.map((event) => (
            <Card key={event.id} className="border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 bg-white rounded-2xl overflow-hidden flex flex-col justify-between group">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <MediaRenderer
                  src={event.image}
                  type={event.banner_type}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 shadow-md">
                    Booths Open
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[10px]">
                      {event.category}
                    </Badge>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="text-xs text-slate-500 space-y-1 mt-2">
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin size={14} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Calendar size={14} className="text-emerald-600 shrink-0" />
                      <span>{new Date(event.date).toDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Available Stalls</span>
                    <p className="text-xs font-extrabold text-emerald-700">{event.stallsAvailable} / {event.totalStalls} Open</p>
                  </div>

                  <Button
                    onClick={() => handleBookStall(event)}
                    className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs border-none cursor-pointer gap-1.5"
                  >
                    <span>Reserve Booth</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="rounded-xl font-bold text-xs cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-xs font-bold text-slate-600 px-3">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="rounded-xl font-bold text-xs cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsPage;
