import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchEventsThunk } from "@/app/store/eventSlice";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Plus,
  User,
  Rocket,
  Calendar,
  Clock,
  Ticket,
  Users,
  MapPin,
  Grid,
  List,
  Search,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Trash2
} from "lucide-react";

import CreateEvent from "./CreateEvent";
import MediaRenderer from "@/components/MediaRenderer";
import { deleteEvent, getEventFullDetails } from "@/Services/api";

/* 🔥 CONTINUOUS IMAGE SLIDER */
const ImageSlider = ({ images = [], className = "w-28 h-20" }) => {
  const sliderImages =
    images.length === 0
      ? [null, null]
      : images.length === 1
        ? [...images, ...images]
        : [...images, ...images];

  return (
    <div className={`${className} overflow-hidden rounded-lg relative`}>
      <div className="flex animate-scroll w-max">
        {sliderImages.map((img, i) => {
          const srcUrl = typeof img === 'object' && img !== null ? img.url : img;
          const bannerType = typeof img === 'object' && img !== null ? img.banner_type : null;
          return (
            <MediaRenderer
              key={i}
              src={srcUrl}
              type={bannerType}
              className={`${className} flex-shrink-0`}
            />
          );
        })}
      </div>
    </div>
  );
};

const EventsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const isCreateOrEditRoute =
    location.pathname.includes("/CreateEvent") ||
    location.pathname.includes("/EditEvent") ||
    location.pathname.includes("/ViewEvent");

  const [showCreate, setShowCreate] = useState(isCreateOrEditRoute);
  const [editEvent, setEditEvent] = useState(null);
  const [isView, setIsView] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  
  const eventsState = useSelector((state) => state.events?.list);
  const events = Array.isArray(eventsState) ? eventsState : (Array.isArray(eventsState?.data) ? eventsState.data : []);
  const { loading, loaded } = useSelector((state) => state.events);

  const [viewMode, setViewMode] = useState("table"); // table | grid
  const [searchTerm, setSearchTerm] = useState("");
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoadingFullData, setIsLoadingFullData] = useState(false);

  const Redexorganizer = useSelector((state) => state.user);
  const organizerId =
    Redexorganizer?.id ||
    sessionStorage.getItem("id") ||
    localStorage.getItem("id") ||
    sessionStorage.getItem("userId");

  useEffect(() => {
    if (organizerId) {
      dispatch(fetchEventsThunk(organizerId));
    }
  }, [dispatch, organizerId]);

  useEffect(() => {
    if (location.pathname.includes("/ViewEvent")) {
      setShowCreate(true);
      setIsView(true);
      if (location.state?.eventData) {
        setEditEvent(location.state.eventData);
      }
    } else if (location.pathname.includes("/EditEvent")) {
      setShowCreate(true);
      setIsView(false);
      if (location.state?.eventData) {
        setEditEvent(location.state.eventData);
      }
    } else if (location.state?.mode === "create") {
      setShowCreate(true);
      setIsView(false);
      setEditEvent(null);
    } else if (location.state?.mode === "view" || location.state?.isReadOnly) {
      setShowCreate(true);
      setIsView(true);
      if (location.state?.eventData) {
        setEditEvent(location.state.eventData);
      }
    } else if (location.state?.reset) {
      setShowCreate(false);
      setEditEvent(null);
      setIsView(false);
      window.history.replaceState({}, document.title);
    } else if (!isCreateOrEditRoute) {
      setShowCreate(false);
      setEditEvent(null);
      setIsView(false);
    }
  }, [location.state, location.pathname, isCreateOrEditRoute]);

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour}:${m} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = (id) => {
    setEventToDelete(id);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete);
      setEventToDelete(null);
      setShowSuccess(true);
      if (organizerId) dispatch(fetchEventsThunk(organizerId));
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to delete event", err);
      alert("Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (event) => {
    setIsLoadingFullData(true);
    try {
      const fullData = await getEventFullDetails(event.id);
      if (fullData) {
        setEditEvent(fullData);
        setIsView(false);
        setShowCreate(true);
        const eventCode = event.event_code || event.code || event.eventCode || event.id;
        navigate(`/OrganizerHome/EditEvent/${eventCode}`, { state: { eventData: fullData, eventId: event.id }, replace: true });
      }
    } catch (err) {
      console.error("Failed to fetch full event details", err);
      alert("Error loading event data.");
    } finally {
      setIsLoadingFullData(false);
    }
  };

  const handleView = async (event) => {
    setIsLoadingFullData(true);
    try {
      const fullData = await getEventFullDetails(event.id);
      if (fullData) {
        setEditEvent(fullData);
        setIsView(true);
        setShowCreate(true);
        const eventCode = event.event_code || event.code || event.eventCode || event.id;
        navigate(`/OrganizerHome/ViewEvent/${eventCode}`, { state: { mode: "view", isReadOnly: true, eventData: fullData, eventId: event.id }, replace: true });
      }
    } catch (err) {
      console.error("Failed to fetch full event details", err);
      alert("Error loading event data.");
    } finally {
      setIsLoadingFullData(false);
    }
  };

  const getEventTabStatus = (e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sDate = e.event_date ? new Date(e.event_date) : (e.start_date ? new Date(e.start_date) : null);
    const eDate = e.end_date ? new Date(e.end_date) : (sDate ? new Date(sDate) : null);

    if (sDate) sDate.setHours(0, 0, 0, 0);
    if (eDate) eDate.setHours(23, 59, 59, 999);

    if (eDate && today > eDate) return "Past";
    if (sDate && today < sDate) return "Upcoming";
    return "Active";
  };

  const filteredEvents = (events || []).filter((e) => {
    const text = (
      (e.event_name || e.name || "") + " " +
      (e.event_code || e.code || "") + " " +
      (e.city || "") + " " +
      (e.venue || "")
    ).toLowerCase();

    const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
    const eventStatus = getEventTabStatus(e);
    const matchesStatus = statusFilter === "All" ? true : eventStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // PAGINATION LOGIC
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

  if (showCreate) {
    return (
      <CreateEvent
        editData={editEvent}
        isView={isView}
        onBack={() => {
          navigate("/OrganizerHome");
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Events</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage, edit, and track your organized events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative group flex-1 sm:w-64 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search event name, code, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-xs font-medium transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List size={14} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid size={14} />
              <span>Grid</span>
            </button>
          </div>

          {/* Create Event Button */}
          <button
            onClick={() => {
              setEditEvent(null);
              setIsView(false);
              setShowCreate(true);
              navigate("/OrganizerHome/CreateEvent");
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {[
          { label: "All Events", value: "All", count: events.length },
          { label: "Active Events", value: "Active", count: events.filter(e => getEventTabStatus(e) === "Active").length },
          { label: "Upcoming Events", value: "Upcoming", count: events.filter(e => getEventTabStatus(e) === "Upcoming").length },
          { label: "Past Events", value: "Past", count: events.filter(e => getEventTabStatus(e) === "Past").length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              statusFilter === tab.value
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              statusFilter === tab.value ? "bg-slate-700 text-cyan-300" : "bg-slate-100 text-slate-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      {loading && !loaded ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Search size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-extrabold text-slate-900">No events found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? `No events match "${searchTerm}" in ${statusFilter} tab.` : `You have no ${statusFilter !== "All" ? statusFilter.toLowerCase() : ""} events yet.`}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs font-bold text-cyan-600 hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={() => {
                setEditEvent(null);
                setIsView(false);
                setShowCreate(true);
                navigate("/OrganizerHome/CreateEvent");
              }}
              className="text-xs font-bold text-cyan-600 hover:underline cursor-pointer"
            >
              + Create New Event
            </button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE STRUCTURE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Event Info</th>
                  <th className="py-3.5 px-4">Category & Venue</th>
                  <th className="py-3.5 px-4">Dates & Time</th>
                  <th className="py-3.5 px-4">Price & Passes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {currentEvents.map((e) => {
                  const eventStatus = getEventTabStatus(e);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ImageSlider images={e.images || [{ url: e.banner_url }]} className="w-16 h-12 rounded-lg shrink-0" />
                          <div>
                            <h3
                              className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-cyan-600 transition-colors cursor-pointer line-clamp-1"
                              onClick={() => handleView(e)}
                            >
                              {e.event_name || e.name || "Untitled Event"}
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-block mt-0.5">
                              {e.event_code || e.code || `EVT-${e.id}`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">{e.main_category_name || e.category || "General"}</span>
                          <span className="text-slate-500 flex items-center gap-1 mt-0.5 text-[11px]">
                            <MapPin size={12} className="text-cyan-600 shrink-0" />
                            {e.city || e.venue || "Venue TBD"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-semibold text-slate-900 flex items-center gap-1 text-[11px]">
                            <Calendar size={12} className="text-cyan-600 shrink-0" />
                            {formatDate(e.event_date || e.start_date)}
                          </span>
                          {e.time && (
                            <span className="text-slate-500 flex items-center gap-1 mt-0.5 text-[10px]">
                              <Clock size={11} className="shrink-0" />
                              {formatTime(e.time)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 block">₹{e.price || e.pass_fee || 0}</span>
                          <span className="text-slate-500 font-medium text-[11px]">
                            {e.passes_sold || 0} / {e.total_capacity || e.capacity || 500} Sold
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          eventStatus === "Active"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : eventStatus === "Upcoming"
                            ? "bg-cyan-100 text-cyan-700 border border-cyan-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${eventStatus === "Active" ? "bg-emerald-500 animate-pulse" : eventStatus === "Upcoming" ? "bg-cyan-500" : "bg-slate-400"}`} />
                          {eventStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleView(e)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 transition-colors cursor-pointer border border-slate-200"
                            title="View Event Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(e)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer border border-slate-200"
                            title="Edit Event"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer border border-slate-200"
                            title="Delete Event"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW FALLBACK */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentEvents.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <ImageSlider images={e.images || [{ url: e.banner_url }]} className="w-full h-32 rounded-xl" />
                <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">{e.event_name || e.name}</h3>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  <MapPin size={12} className="text-cyan-600 shrink-0" />
                  {e.city || e.venue || "Venue TBD"}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">₹{e.price || e.pass_fee || 0}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleView(e)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-600" title="View">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => handleEdit(e)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {filteredEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-xs font-medium">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-medium">Records per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-1.5">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">Delete Event?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
