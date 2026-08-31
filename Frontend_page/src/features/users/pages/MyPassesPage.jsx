import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket, MapPin, Calendar, Clock, ArrowLeft, QrCode, Search,
  Download, Printer, Sparkles, AlertCircle, CheckCircle2, User
} from "lucide-react";
import apiClient from "@/shared/api/axiosClient";
import { getUserProfile } from "@/Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MyPassesPage() {
  const navigate = useNavigate();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        setLoading(true);
        // 1. Get logged-in user profile
        const profRes = await getUserProfile();
        const userData = profRes?.data || profRes || {};
        setUser(userData);

        const userId = userData.id || userData.user_id || "";
        const email = userData.email || localStorage.getItem("user_email") || "";
        const queryParams = [];
        if (userId) queryParams.push(`user_id=${userId}`);
        if (email) queryParams.push(`email=${encodeURIComponent(email)}`);
        const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

        if (queryString) {
          // 2. Fetch user's booked passes from backend by user_id & email
          const res = await apiClient.get(`/user/my-bookings${queryString}`);
          const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
          setPasses(list);
        }
      } catch (err) {
        console.error("Failed to fetch passes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();
  }, []);

  const filteredPasses = passes.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.event_name || p.eventName || "").toLowerCase().includes(term) ||
      (p.venue || "").toLowerCase().includes(term) ||
      (p.category || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-24">
      
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-600 border-none bg-transparent transition flex items-center gap-2 font-bold text-xs"
            >
              <ArrowLeft size={18} />
              <span>Back to Profile</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket className="text-orange-500" size={20} />
              <span>My Ticket Passes</span>
            </h1>
          </div>

          {user && (
            <Badge className="bg-orange-50 text-orange-700 border-orange-200 font-extrabold text-xs px-3.5 py-1 gap-1">
              <User size={13} />
              <span>{user.full_name || user.name || user.email}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full px-6 pt-8 space-y-6">
        
        {/* Header Banner & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl">
          <div className="space-y-1">
            <Badge className="bg-orange-500 text-white font-extrabold text-[10px] border-none">
              Verified Digital Passes
            </Badge>
            <h2 className="text-2xl font-black text-white">Your Confirmed Entry Passes</h2>
            <p className="text-xs text-slate-300 font-medium">
              Present your QR code at the venue gate for instant entry check-in.
            </p>
          </div>

          <div className="relative shrink-0 w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search your passes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 bg-white/10 border border-white/20 rounded-2xl pl-10 pr-4 text-xs text-white placeholder-slate-400 font-medium outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Skeleton Loaders */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-white border-slate-200/80 rounded-3xl p-6 space-y-4">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPasses.length === 0 && (
          <Card className="bg-white border-slate-200/90 shadow-sm rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Ticket size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Entry Passes Found</h3>
            <p className="text-xs text-slate-500 font-medium">
              You haven't booked any event passes yet. Browse upcoming music shows, expos, and carnivals!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md border-none cursor-pointer gap-1.5"
            >
              <Sparkles size={16} />
              <span>Discover Events</span>
            </Button>
          </Card>
        )}

        {/* Passes Grid */}
        {!loading && filteredPasses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPasses.map((pass) => {
              const qrSrc = pass.qr_code
                ? (pass.qr_code.startsWith("data:") ? pass.qr_code : `data:image/png;base64,${pass.qr_code}`)
                : null;
              const banner = pass.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800";

              return (
                <Card key={pass.id} className="bg-white border-slate-200/90 shadow-md rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                  
                  {/* Top Banner Header */}
                  <div className="relative h-32 bg-slate-900">
                    <img
                      src={banner}
                      alt={pass.event_name}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                      <div>
                        <Badge className="bg-orange-500 text-white font-black text-[10px] border-none mb-1">
                          {pass.category || "Live Event"}
                        </Badge>
                        <h3 className="text-base font-black text-white line-clamp-1">{pass.event_name || pass.eventName}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-orange-300 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10">
                        BKG-#{pass.id}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <CardContent className="p-6 space-y-5">
                    
                    {/* Event Details */}
                    <div className="space-y-2 text-xs font-semibold text-slate-600 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 text-slate-800">
                        <MapPin size={15} className="text-orange-500 shrink-0" />
                        <span className="line-clamp-1">{pass.venue || "Venue Details"}, {pass.address || ""}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{pass.start_date || "Confirmed"}</span>
                        </span>
                        {pass.start_time && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" />
                            <span>{pass.start_time}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* QR Code & Attendee Info */}
                    <div className="flex items-center gap-5">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs shrink-0 flex items-center justify-center">
                        {qrSrc ? (
                          <img
                            src={qrSrc}
                            alt="QR Ticket Code"
                            className="w-28 h-28 block object-contain"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-1">
                            <QrCode size={32} />
                            <span className="text-[9px] font-bold">QR Code</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Attendee Name</span>
                          <p className="font-extrabold text-slate-900">{pass.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Registered Email</span>
                          <p className="text-slate-600 font-medium line-clamp-1">{pass.email}</p>
                        </div>
                        {pass.food_preference && pass.food_preference !== "None" && (
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Meal Option</span>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 ml-1">
                              {pass.food_preference}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="flex-1 rounded-xl text-xs font-bold py-2.5 border-slate-200 text-slate-700 cursor-pointer gap-1.5"
                      >
                        <Printer size={14} />
                        <span>Print Ticket</span>
                      </Button>
                      <Button
                        onClick={() => navigate(`/event-detail/${pass.event_id}`)}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold py-2.5 border-none cursor-pointer"
                      >
                        Event Details
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
