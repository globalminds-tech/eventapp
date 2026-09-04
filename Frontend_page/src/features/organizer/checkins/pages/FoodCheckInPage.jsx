import React, { useState, useEffect } from "react";
import { Search, Utensils, QrCode, CheckCircle2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import QRScanner from "@/components/QRScanner";
import { getFoodCheckinSummary, redeemFoodTokenApi } from "@/Services/miscService";

export default function FoodCheckIn() {
  const [search, setSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scanResultAlert, setScanResultAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const [foodEvents, setFoodEvents] = useState([]);
  const [stats, setStats] = useState({
    totalFoodTokens: 0,
    mealsServed: 0,
    pendingRedemptions: 0
  });

  useEffect(() => {
    fetchFoodData();
  }, []);

  const fetchFoodData = async () => {
    setLoading(true);
    try {
      const res = await getFoodCheckinSummary();
      const data = res?.data || res || {};
      const events = Array.isArray(data.events) ? data.events : (Array.isArray(data) ? data : []);
      setFoodEvents(events);
      setStats({
        totalFoodTokens: data.totalFoodTokens || events.reduce((s, e) => s + (Number(e.totalFoodTokens) || 0), 0),
        mealsServed: data.mealsServed || events.reduce((s, e) => s + (Number(e.scannedTokens) || 0), 0),
        pendingRedemptions: data.pendingRedemptions || Math.max(0, (data.totalFoodTokens || 0) - (data.mealsServed || 0))
      });
    } catch {
      setFoodEvents([]);
      setStats({ totalFoodTokens: 0, mealsServed: 0, pendingRedemptions: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFoodScanner = (eventItem) => {
    setSelectedEvent(eventItem);
    setShowScanner(true);
    setScanResultAlert(null);
  };

  const handleScanFoodToken = async (code) => {
    const timeNow = new Date().toLocaleTimeString();
    const cleanCode = code.trim().toUpperCase();

    try {
      const res = await redeemFoodTokenApi(cleanCode);
      const data = res?.data || res || {};
      const attendeeName = data.name || "Attendee";
      const mealType = data.food_preference || "Meal";

      setScanResultAlert({
        type: "success",
        message: `🍱 MEAL TOKEN VERIFIED! Pass #${cleanCode} (${attendeeName} - ${mealType}) Redeemed @ ${timeNow}`
      });
      fetchFoodData();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Invalid or already redeemed food token";
      setScanResultAlert({
        type: "error",
        message: `⚠️ ${errMsg} (#${cleanCode})`
      });
    }
  };

  const filtered = foodEvents.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const percentageRedeemed = stats.totalFoodTokens > 0
    ? Math.round((stats.mealsServed / stats.totalFoodTokens) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 select-none">
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
            Track meal token redemptions, food stall check-ins, and catering validations from database.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={fetchFoodData}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh Food Counters</span>
          </Button>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Food Tokens</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalFoodTokens.toLocaleString()}</h3>
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Served</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">{stats.mealsServed.toLocaleString()}</h3>
              <p className="text-xs font-medium text-emerald-600">{percentageRedeemed}% Tokens Redeemed</p>
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
              <h3 className="text-2xl font-extrabold text-slate-700">{stats.pendingRedemptions.toLocaleString()}</h3>
              <p className="text-xs font-medium text-slate-400">Tokens Remaining</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <QrCode size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── FOOD SCANNER MODAL ── */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl space-y-3">
            <QRScanner
              title={`Food Token Scanner (${selectedEvent?.name || "Event"})`}
              onScan={handleScanFoodToken}
              onClose={() => setShowScanner(false)}
            />

            {/* Scan Output Banner */}
            {scanResultAlert && (
              <div
                className={`p-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg ${
                  scanResultAlert.type === "success"
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                <span>{scanResultAlert.message}</span>
                <button
                  onClick={() => setScanResultAlert(null)}
                  className="p-1 border-none bg-transparent text-white font-extrabold cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {loading ? "Loading catering data from database..." : "No food provisioning events found in database."}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-200 font-bold">
                          {item.code}
                        </Badge>
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{item.startDate || "---"}</td>
                    <td className="py-4 px-4 text-slate-500">{item.endDate || "---"}</td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 w-36 mx-auto">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-emerald-700">{item.scannedTokens || 0} redeemed</span>
                          <span className="text-slate-400">/{item.totalFoodTokens || 0}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${
                                item.totalFoodTokens > 0
                                  ? Math.min(100, Math.round(((item.scannedTokens || 0) / item.totalFoodTokens) * 100))
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenFoodScanner(item)}
                        className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg border-none cursor-pointer gap-1.5 shadow-xs hover:scale-105 transition"
                      >
                        <QrCode size={14} />
                        <span>Scan Food Token</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}