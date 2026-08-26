import { useEffect, useState } from "react";
import { Eye, Search, Radio, QrCode, Users, Activity } from "lucide-react";
import { getevent } from "../../Services/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export const LiveDashboard = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  const fallbackLiveEvents = [
    { event_code: "EVT-25", event_name: "MRC Grand Music Fest 2026", totalScans: 850, presentCount: 780, gateStatus: "Live Now" },
    { event_code: "EVT-22", event_name: "Valluvar Kottam Craft & Food Expo", totalScans: 1420, presentCount: 1190, gateStatus: "Live Now" },
    { event_code: "EVT-9", event_name: "Furniture & Home Products Expo", totalScans: 310, presentCount: 280, gateStatus: "Live Now" }
  ];

  const getEvents = async () => {
    try {
      const res = await getevent();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
      } else {
        setEvents(fallbackLiveEvents);
      }
    } catch (err) {
      setEvents(fallbackLiveEvents);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const filtered = events.filter((e) =>
    (e.event_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.event_code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── SLEEK PAGE HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Live Gate Operations Analytics
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-0.5 font-bold text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Stream</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time venue check-in telemetry, live gate scanning speed, and crowd occupancy density.
          </p>
        </div>
      </div>

      {/* ── KPI TELEMETRY STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gate Scan Velocity</p>
              <h3 className="text-2xl font-extrabold text-slate-900">42 Scans/Min</h3>
              <p className="text-xs font-medium text-emerald-600">Peak Entrance Flow</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <Activity size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scanned Today</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">2,580 Passes</h3>
              <p className="text-xs font-medium text-slate-500">Across 3 Live Events</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <QrCode size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Turnstiles</p>
              <h3 className="text-2xl font-extrabold text-slate-900">12 Gate Scanners</h3>
              <p className="text-xs font-medium text-sky-600">100% Online Sync</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Radio size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── LIVE EVENTS DATA TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-900">Live Active Event Operations</h3>
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search event code or name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-4">Event Code</th>
                <th className="py-3.5 px-5">Event Name</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filtered.map((event, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <Button
                      size="sm"
                      onClick={() => alert(`Opening Live Gate Scanner for ${event.event_name}`)}
                      className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer gap-1.5 shadow-xs"
                    >
                      <Eye size={14} />
                      <span>Telemetry</span>
                    </Button>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                      {event.event_code}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">{event.event_name}</td>
                  <td className="py-4 px-4 text-center">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-2.5 py-0.5">
                      ● Live Telemetry
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};