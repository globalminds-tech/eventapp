import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users, TrendingUp, CheckCircle, QrCode, Store, ArrowRight,
  RotateCw, Clock, IndianRupee, Sparkles, Building, Calendar, FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const ExhibitorHome = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const storedUser = {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
  };

  const displayUser = user?.id ? user : storedUser;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Exhibitor Executive Dashboard
            </h1>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px]">
              Governance & Lead Portal
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time booth reservations, visitor lead intelligence, and staff pass governance for {displayUser.name || "Exhibitor"}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="bg-white hover:bg-slate-50 border-slate-200 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-xs"
          >
            <RotateCw size={14} className={loading ? "animate-spin text-emerald-600" : "text-slate-500"} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* ── SECTION 1: ● BOOTH & LEADS OVERVIEW ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-500">
            BOOTH & LEADS OVERVIEW
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Stalls */}
          <Card
            onClick={() => navigate("/exhibitor/my-bookings")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">ACTIVE BOOTHS</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/80">
                  <Store size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  4 Stalls
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Booked exhibition spaces</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Bookings</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Leads */}
          <Card
            onClick={() => navigate("/exhibitor/leads")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">TOTAL LEADS</span>
                <div className="p-1.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100/80">
                  <Users size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  428
                </h3>
                <p className="text-[11px] font-medium text-emerald-600 mt-0.5">↑ 34.6% lead conversion</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Leads</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Hot Leads */}
          <Card
            onClick={() => navigate("/exhibitor/leads")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">HOT LEADS 🔥</span>
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100/80">
                  <Sparkles size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-orange-900 tracking-tight">
                  86
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">High intent buyers</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>Follow Up</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Qualified Inquiries */}
          <Card
            onClick={() => navigate("/exhibitor/leads")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">QUALIFIED</span>
                <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100/80">
                  <CheckCircle size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  186
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Verified booth inquiries</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Inquiries</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── SECTION 2: ● STAFF & FINANCIAL OVERVIEW ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-500">
            STAFF & FINANCIAL OVERVIEW
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Staff Passes */}
          <Card
            onClick={() => navigate("/exhibitor/leads")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">STAFF PASSES</span>
                <div className="p-1.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100/80">
                  <QrCode size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  8 Active
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">QR passes issued</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>Manage Staff</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: 24h Invoices Active */}
          <Card
            onClick={() => navigate("/exhibitor/my-bookings")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">PAYMENT LOCK INVOICES</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/80">
                  <Clock size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
                  1 Active
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">24h payment lock</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Invoices</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Spend */}
          <Card
            onClick={() => navigate("/exhibitor/my-bookings")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">STALL SPEND</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/80">
                  <IndianRupee size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹2.80 L
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Total layout investment</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>View Finance</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Upcoming Expos */}
          <Card
            onClick={() => navigate("/exhibitor/upcoming-events")}
            className="group border border-slate-200/90 shadow-xs hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer rounded-2xl bg-white p-4.5 flex flex-col justify-between h-full"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">UPCOMING EXPOS</span>
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100/80">
                  <Calendar size={16} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  3 Expos Open
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Booths open for reservation</p>
              </div>

              <div className="flex items-center justify-end text-[11px] pt-2 border-t border-slate-100">
                <span className="font-extrabold text-emerald-600 group-hover:translate-x-0.5 flex items-center gap-1 transition">
                  <span>Explore Expos</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorHome;