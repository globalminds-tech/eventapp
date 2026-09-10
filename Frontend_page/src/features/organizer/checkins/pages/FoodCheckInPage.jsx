import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Utensils, QrCode, CheckCircle2, RefreshCw, X, LogIn,
  DoorOpen, Sparkles, Volume2, VolumeX, AlertTriangle, ShieldAlert,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import QRScanner, { playScanSound } from "@/components/QRScanner";
import { getFoodCheckinSummary, redeemFoodTokenApi, getEventAttendees, getGatePresets, addGatePreset, deleteGatePreset } from "@/Services/miscService";
import { Download, Check, Trash2 } from "lucide-react";



export default function FoodCheckIn() {
  const [search, setSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [scanResultAlert, setScanResultAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const [attendees, setAttendees] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, REDEEMED, PENDING

  const [foodEvents, setFoodEvents] = useState([]);
  const [stats, setStats] = useState({
    totalFoodTokens: 0,
    mealsServed: 0,
    pendingRedemptions: 0
  });

  // Food Stall Controls
  const [gatePresets, setGatePresets] = useState([]);
  const [gateName, setGateName] = useState("");
  const [customGate, setCustomGate] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rapidCodeInput, setRapidCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchGatePresets = async () => {
    try {
      const res = await getGatePresets();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setGatePresets(list);
      if (list.length > 0 && !gateName) {
        setGateName(list[0].name);
      }
    } catch (err) {
      console.error("Failed to load gates", err);
    }
  };

  useEffect(() => {
    fetchFoodData();
    fetchGatePresets();
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

  const handleSaveGate = async () => {
    if (!customGate.trim()) return;
    try {
      const res = await addGatePreset(customGate.trim());
      await fetchGatePresets();
      setGateName(customGate.trim());
      setCustomGate("");
    } catch (err) {
      console.error("Failed to save gate", err);
    }
  };

  const handleDeleteGate = async () => {
    const targetName = customGate.trim() || gateName;
    if (!targetName) return;
    const gateObj = gatePresets.find(g => g.name === targetName);
    if (!gateObj) return;
    
    try {
      await deleteGatePreset(gateObj.id);
      await fetchGatePresets();
      if (customGate) setCustomGate("");
      setGateName(gatePresets.length > 1 ? gatePresets.find(g => g.id !== gateObj.id)?.name : "");
    } catch (err) {
      console.error("Failed to delete gate", err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadEventData(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEventData = async (eventId) => {
    setEntriesLoading(true);
    try {
      const res = await getEventAttendees(eventId);
      const list = Array.isArray(res) ? res : res?.data || [];
      setAttendees(list);
    } catch (err) {
      console.error("Failed to load event attendees:", err);
    } finally {
      setEntriesLoading(false);
    }
  };

  const selectedEvent = useMemo(() => {
    return foodEvents.find((e) => String(e.id || e.code) === String(selectedEventId)) || null;
  }, [foodEvents, selectedEventId]);

  const effectiveGateName = customGate.trim() || gateName;

  const handleVerify = async (code) => {
    if (!code || !code.trim()) return;
    const cleanCode = code.trim().toUpperCase();

    setIsVerifying(true);

    try {
      const res = await redeemFoodTokenApi({ token: cleanCode, event_id: selectedEventId });
      const data = res?.data || res || {};
      const attendeeName = data.name || "Attendee";
      const mealType = data.food_preference || "Meal";
      const timeNow = new Date().toLocaleTimeString();

      if (playScanSound) playScanSound("success", soundEnabled);

      setScanResultAlert({
        type: "success",
        status: "ACCESS_GRANTED",
        message: data.message || `Meal Token Redeemed Successfully`,
        attendee: {
          name: attendeeName,
          ticket_code: cleanCode,
          food_preference: mealType
        },
        timestamp: timeNow,
        stall: effectiveGateName
      });
      fetchFoodData();
      if (selectedEventId) loadEventData(selectedEventId);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Invalid or already redeemed food token";
      const timeNow = new Date().toLocaleTimeString();

      if (playScanSound) playScanSound("error", soundEnabled);

      setScanResultAlert({
        type: "error",
        status: "ERROR",
        message: `⚠️ ${errMsg}`,
        attendee: {
          ticket_code: cleanCode
        },
        timestamp: timeNow,
        stall: effectiveGateName
      });
    } finally {
      setIsVerifying(false);
      setRapidCodeInput("");
    }
  };

  const handleRapidGunSubmit = (e) => {
    e.preventDefault();
    if (!rapidCodeInput.trim()) return;
    handleVerify(rapidCodeInput);
  };

  const filtered = foodEvents.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchSearch =
        !searchQuery ||
        (a.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.visitor_code || a.ticket_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.phone || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      // In this backend implementation, food checkin increases total_checkins or sets is_checked_in
      const hasRedeemed = a.is_checked_in || a.total_checkins > 0;

      if (statusFilter === "REDEEMED") return hasRedeemed;
      if (statusFilter === "PENDING") return !hasRedeemed;
      return true;
    });
  }, [attendees, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    if (!attendees.length) return;
    const headers = [
      "Ticket Pass Code",
      "Attendee Name",
      "Email",
      "Phone",
      "Food Preference",
      "Meal Redeemed",
      "Scan Time"
    ];

    const rows = attendees.map((a) => [
      `"${a.visitor_code || a.ticket_code || ""}"`,
      `"${a.name || ""}"`,
      `"${a.email || ""}"`,
      `"${a.phone || ""}"`,
      `"${a.food_preference || "None"}"`,
      a.is_checked_in || a.total_checkins > 0 ? "YES" : "NO",
      `"${a.checkin_time || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Food_CheckIn_Roster_${selectedEvent?.code || "Event"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRegistered = attendees.length;
  const redeemedCount = attendees.filter((a) => a.is_checked_in || a.total_checkins > 0).length;

  const verificationCardJSX = scanResultAlert ? (
    <div className="select-none flex flex-col h-full bg-white">
      {/* Modal Header Banner */}
      <div className={`p-6 text-white text-center space-y-1 relative shrink-0 ${scanResultAlert.status === "ACCESS_GRANTED"
          ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600"
          : "bg-gradient-to-r from-rose-600 via-red-600 to-rose-600"
        }`}>
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2 shadow-inner">
          {scanResultAlert.status === "ACCESS_GRANTED" ? <CheckCircle2 size={32} className="text-white" /> : <ShieldAlert size={32} className="text-white" />}
        </div>

        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
          {scanResultAlert.status === "ACCESS_GRANTED" ? "MEAL REDEEMED" : "ACCESS DENIED"}
        </h2>

        <p className="text-xs font-semibold text-white/90 max-w-sm mx-auto">
          {scanResultAlert.message}
        </p>
      </div>

      {/* Attendee Details Card */}
      <div className="p-6 bg-white space-y-4 flex-1 flex flex-col">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 flex-1">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Attendee Name</span>
              <h3 className="text-base font-black text-slate-900">{scanResultAlert.attendee?.name || "Unknown Attendee"}</h3>
            </div>
            <span className="font-mono text-xs font-extrabold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-indigo-600">
              {scanResultAlert.attendee?.ticket_code || "PASS"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs font-semibold">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Meal Entitlement</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Utensils size={13} className="text-cyan-600" />
                <span className="font-extrabold text-cyan-700">
                  {scanResultAlert.attendee?.food_preference && scanResultAlert.attendee?.food_preference !== "None"
                    ? `${scanResultAlert.attendee.food_preference}`
                    : "No Meal Pass"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200/60 mt-auto">
            <span>Food Stall: {scanResultAlert.stall || "Main Counter"}</span>
            <span>Scanned: {scanResultAlert.timestamp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 shrink-0">
          <Button
            onClick={() => setScanResultAlert(null)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl py-2.5 border-none cursor-pointer"
          >
            Done / Next Scan
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  if (!selectedEventId) {
    return (
      <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Food Token Scanner & Check-In
              </h1>
              <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200 px-2.5 py-0.5 font-bold text-[11px]">
                CATERING OPERATIONS
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Select an event to manage food stalls and meal token redemptions.
            </p>
          </div>
          <Button
            onClick={fetchFoodData}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2 rounded-xl"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="text-xs font-bold">Refresh</span>
          </Button>
        </div>

        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Events</h2>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
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
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-5 space-y-1.5">
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-4 w-36 rounded" />
                      </td>
                      <td className="py-4 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="py-4 px-4"><Skeleton className="h-6 w-32 rounded-lg mx-auto" /></td>
                      <td className="py-4 px-5 text-right"><Skeleton className="h-8 w-24 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No food provisioning events found in database.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || item.code || idx} className="hover:bg-slate-50/80 transition-colors">
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
                            <span className="text-cyan-700">{item.scannedTokens || 0} redeemed</span>
                            <span className="text-slate-400">/{item.totalFoodTokens || 0}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-full"
                              style={{
                                width: `${item.totalFoodTokens > 0
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
                          onClick={() => setSelectedEventId(item.id || item.code)}
                          className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 text-white font-black text-xs px-4 py-1.5 rounded-lg border-none cursor-pointer gap-2 transition-all"
                        >
                          <Settings size={14} />
                          <span>Manage</span>
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

  // Calculate event-specific stats
  const eventStats = {
    totalFoodTokens: selectedEvent?.totalFoodTokens || 0,
    mealsServed: selectedEvent?.scannedTokens || 0,
    pendingRedemptions: Math.max(0, (selectedEvent?.totalFoodTokens || 0) - (selectedEvent?.scannedTokens || 0))
  };
  const percentageRedeemed = eventStats.totalFoodTokens > 0
    ? Math.round((eventStats.mealsServed / eventStats.totalFoodTokens) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-16 select-none font-sans">

      {/* ── TOP HEADER & EVENT SELECTOR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Food Token Scanner & Check-In
            </h1>
            <Badge className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black text-[11px] border-none px-2.5 py-0.5 shadow-sm">
              LIVE FOOD STALL
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time meal token verification and catering redemptions.
          </p>
        </div>

        {/* Event Actions & Back Button */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setSelectedEventId("")}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2 rounded-xl"
          >
            <span className="text-xs font-bold">Back to Events</span>
          </Button>

          <Button
            onClick={fetchFoodData}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2 rounded-xl"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="text-xs font-bold">Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── FOOD STALL CONTROL BAR ── */}
      <Card className="border-slate-800 shadow-xl bg-slate-900 text-white rounded-3xl p-5 sm:p-6 relative">
        {/* Background glow effect wrapper */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">

          {/* Left Side: Settings */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 flex-1">

            {/* Mode Switch */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Operation Mode</span>
              <div className="bg-slate-950/50 p-1 rounded-xl flex items-center gap-1 border border-slate-800 backdrop-blur-md">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/20"
                >
                  <Utensils size={15} />
                  <span>Redeem Token</span>
                </button>
              </div>
            </div>

            {/* Stall Selector */}
            <div className="space-y-2 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Stall Assignment</span>
              <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2 h-10.5">
                <div className="relative flex-1 min-w-[150px]">
                  <DoorOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Select
                    value={gateName}
                    onValueChange={(val) => {
                      setGateName(val);
                      setCustomGate("");
                    }}
                    placeholder={gatePresets.length === 0 ? "No Presets Saved" : "Select Stall..."}
                    options={gatePresets.map((p) => ({ value: p.name, label: p.name }))}
                    triggerClassName="w-full h-full bg-slate-950/50 border-slate-800 text-white text-xs font-bold pl-9 rounded-xl outline-none focus:border-cyan-500 transition-colors"
                    contentClassName="bg-slate-900 border-slate-800 text-white"
                  />
                </div>
                <div className="relative flex-1 min-w-[150px] flex items-center bg-slate-950/50 border border-slate-800 rounded-xl focus-within:border-cyan-500 transition-colors">
                  <Sparkles size={14} className="absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Custom gate name..."
                    value={customGate}
                    onChange={(e) => setCustomGate(e.target.value)}
                    className="w-full h-full bg-transparent border-none text-white text-xs font-medium pl-9 pr-14 outline-none placeholder:text-slate-600"
                  />
                  <div className="absolute right-1 flex items-center gap-1">
                    <button 
                      type="button" 
                      onClick={handleSaveGate}
                      disabled={!customGate.trim()}
                      className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Save Gate Preset"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      type="button" 
                      onClick={handleDeleteGate}
                      disabled={!(customGate.trim() ? gatePresets.some(g => g.name === customGate.trim()) : gatePresets.some(g => g.name === gateName))}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Delete Gate Preset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1 xl:max-w-md">
            {/* Barcode Gun / Manual Quick Input */}
            <div className="space-y-2 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quick Verification</span>
              <form onSubmit={handleRapidGunSubmit} className="relative h-10.5">
                <input
                  type="text"
                  placeholder="Scan pass code..."
                  value={rapidCodeInput}
                  onChange={(e) => setRapidCodeInput(e.target.value)}
                  className="w-full h-full pl-4 pr-24 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600 placeholder:font-sans transition-all"
                />
                <button
                  type="submit"
                  disabled={isVerifying || !rapidCodeInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-white text-slate-900 hover:bg-slate-200 font-black text-xs rounded-lg border-none cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Verify
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 h-10.5">
              {/* Camera Scanner Button */}
              <Button
                onClick={() => setShowScanner(true)}
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs px-4 rounded-xl border-none cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 whitespace-nowrap transition-all"
              >
                <QrCode size={16} />
                <span className="hidden sm:inline">Camera</span>
              </Button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute Scanner Audio" : "Enable Scanner Audio"}
                className="h-full px-3.5 bg-slate-950/50 hover:bg-slate-800 text-slate-300 rounded-xl transition border border-slate-800 cursor-pointer flex items-center justify-center"
              >
                {soundEnabled ? <Volume2 size={16} className="text-cyan-400" /> : <VolumeX size={16} className="text-slate-500" />}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── LIVE STALL KPI STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Food Tokens</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{eventStats.totalFoodTokens.toLocaleString()}</h3>
              <p className="text-xs font-medium text-slate-500">Issued for Event</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
              <Utensils size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Served</p>
              <h3 className="text-2xl font-extrabold text-cyan-600">{eventStats.mealsServed.toLocaleString()}</h3>
              <p className="text-xs font-medium text-cyan-600">{percentageRedeemed}% Tokens Redeemed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <CheckCircle2 size={22} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Redemptions</p>
              <h3 className="text-2xl font-extrabold text-slate-700">{eventStats.pendingRedemptions.toLocaleString()}</h3>
              <p className="text-xs font-medium text-slate-400">Tokens Remaining</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <QrCode size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── HIGH-IMPACT VERIFICATION RESULT POPUP MODAL (For manual / barcode gun entries) ── */}
      <Dialog
        open={Boolean(scanResultAlert) && !showScanner}
        onClose={() => setScanResultAlert(null)}
        maxWidth="max-w-lg"
        className="p-0 overflow-hidden rounded-3xl"
      >
        {scanResultAlert && !showScanner && verificationCardJSX}
      </Dialog>

      {/* ── FOOD SCANNER MODAL ── */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full transition-all duration-300 ease-in-out ${scanResultAlert ? 'max-w-5xl flex flex-col md:flex-row items-stretch gap-4' : 'max-w-lg'}`}>

            <div className={`w-full transition-all duration-300 ease-in-out flex flex-col justify-center ${scanResultAlert ? 'md:w-1/2' : ''}`}>
              <QRScanner
                title={`Food Token Scanner (${selectedEvent?.name || "Event"})`}
                onScan={handleVerify}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onClose={() => {
                  setShowScanner(false);
                  setScanResultAlert(null);
                }}
              />
            </div>

            {/* Verification Result Section */}
            {scanResultAlert && (
              <div className="w-full md:w-1/2 bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 border border-slate-200 shrink-0">
                {verificationCardJSX}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ATTENDEE ROSTER & FOOD DESK ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-3xl overflow-hidden space-y-4 p-5 sm:p-6 mt-8">

        {/* Table Filter & Search Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              Attendee Roster & Food Check-In Desk
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Search attendees by name, email, or ticket code to manually verify food redemptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name, code, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Export CSV Button */}
            <Button
              onClick={handleExportCSV}
              variant="outline"
              disabled={attendees.length === 0}
              className="h-9 px-3 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-1.5 rounded-xl text-xs font-bold"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "ALL", label: `All Passes (${totalRegistered})` },
            { key: "REDEEMED", label: `Food Redeemed (${redeemedCount})` },
            { key: "PENDING", label: `Not Redeemed (${Math.max(0, totalRegistered - redeemedCount)})` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${statusFilter === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Attendees Data Table */}
        <div className="overflow-x-auto responsive-table-wrap">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Pass Code</th>
                <th className="py-3.5 px-4">Attendee Name & Contact</th>
                <th className="py-3.5 px-4">Meal Option</th>
                <th className="py-3.5 px-4">Status & Times</th>
                <th className="py-3.5 px-4 text-right">Desk Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {entriesLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28 rounded" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-8 w-24 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No attendee passes found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((v) => {
                  const isRedeemed = v.is_checked_in || v.total_checkins > 0;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Pass Code */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-600">
                        {v.visitor_code || v.ticket_code}
                      </td>

                      {/* Attendee Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{v.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                          {v.email || v.phone || "No contact info"}
                        </div>
                      </td>

                      {/* Meal Option */}
                      <td className="py-3.5 px-4">
                        {v.food_preference && v.food_preference !== "None" ? (
                          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px] font-extrabold px-2 py-0.5">
                            {v.food_preference}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">None</span>
                        )}
                      </td>

                      {/* Status & Times */}
                      <td className="py-3.5 px-4">
                        {isRedeemed ? (
                          <div>
                            <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px] font-black px-2 py-0.5">
                              ● Meal Redeemed
                            </Badge>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              At: {v.checkin_time || "Earlier"}
                            </p>
                          </div>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold px-2 py-0.5">
                            Pending
                          </Badge>
                        )}
                      </td>

                      {/* Desk Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        {!isRedeemed ? (
                          <Button
                            size="sm"
                            onClick={() => handleVerify(v.visitor_code || v.ticket_code || v.id)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-3 py-1.5 rounded-xl border-none cursor-pointer shadow-xs gap-1"
                          >
                            <Utensils size={13} />
                            <span>Redeem Token</span>
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Already Served
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}