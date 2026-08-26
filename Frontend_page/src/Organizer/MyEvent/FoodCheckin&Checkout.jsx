import React, { useState } from "react";
import { Search, Utensils, QrCode, CheckCircle2, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

export default function FoodCheckIn() {
  const [search, setSearch] = useState("");

  const sampleEvents = [
    { code: "EVT-25", name: "MRC Grand Music Fest 2026", startDate: "2026-09-15", endDate: "2026-09-16", totalFoodTokens: 500, scannedTokens: 380, status: "Live" },
    { code: "EVT-22", name: "Valluvar Kottam Food & Craft Expo", startDate: "2026-09-20", endDate: "2026-09-22", totalFoodTokens: 1200, scannedTokens: 850, status: "Upcoming" },
    { code: "EVT-11", name: "District Conference 2026", startDate: "2026-10-25", endDate: "2026-10-25", totalFoodTokens: 250, scannedTokens: 210, status: "Upcoming" }
  ];

  const filtered = sampleEvents.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Food Token Scanner & Check-In
            </h1>
            <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
              Catering Operations
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Track meal token redemptions, food stall check-ins, and food pass validations.
          </p>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Food Tokens</p>
              <h3 className="text-2xl font-extrabold text-slate-900">1,950</h3>
              <p className="text-xs font-medium text-slate-500">Issued Across Events</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <Utensils size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Served Today</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">1,440</h3>
              <p className="text-xs font-medium text-emerald-600">73.8% Tokens Redeemed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Redemptions</p>
              <h3 className="text-2xl font-extrabold text-slate-700">510</h3>
              <p className="text-xs font-medium text-slate-400">Tokens Remaining</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <QrCode size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── EVENTS FOOD LOG TABLE ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-900">Event Food Counter Summary</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search event code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Event Details</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">End Date</th>
                <th className="py-3.5 px-4 text-center">Food Pass Redemptions</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div className="space-y-1">
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-200">
                        {item.code}
                      </Badge>
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{item.startDate}</td>
                  <td className="py-4 px-4 text-slate-500">{item.endDate}</td>
                  <td className="py-4 px-4">
                    <div className="space-y-1.5 w-36 mx-auto">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-emerald-700">{item.scannedTokens} redeemed</span>
                        <span className="text-slate-400">/{item.totalFoodTokens}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.round((item.scannedTokens / item.totalFoodTokens) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button
                      size="sm"
                      onClick={() => alert(`Opening Food Scanner for ${item.name}`)}
                      className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg border-none cursor-pointer gap-1.5 shadow-xs"
                    >
                      <QrCode size={14} />
                      <span>Scan Food Token</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}