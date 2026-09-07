import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  getEventscheckin,
  getEventAttendees,
  verifyCheckinTicket,
  getEventCheckinLogs
} from "@/Services/miscService";
import {
  QrCode,
  Users,
  CheckCircle2,
  LogOut as LogOutIcon,
  Search,
  RefreshCw,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Download,
  Utensils,
  LogIn,
  RotateCcw,
  Sparkles,
  Radio,
  DoorOpen,
  Calendar,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Dialog } from "@/components/ui/Dialog";
import QRScanner, { playScanSound } from "@/components/QRScanner";

const GATE_PRESETS = [
  "Main Turnstile 1",
  "VIP Gate A",
  "North Entrance",
  "East Gate",
  "Exit Turnstile 1"
];

export default function EventCheckIn() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(false);

  // Turnstile Station Controls
  const [scanMode, setScanMode] = useState("CHECK_IN"); // "CHECK_IN" | "CHECK_OUT"
  const [gateName, setGateName] = useState(GATE_PRESETS[0]);
  const [customGate, setCustomGate] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousScan, setContinuousScan] = useState(true);

  // Modals & Inputs
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [rapidCodeInput, setRapidCodeInput] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Attendee Roster Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "INSIDE" | "NOT_ARRIVED" | "DEPARTED"

  const autoDismissTimerRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEventscheckin();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setEvents(list);
      if (list.length > 0 && !selectedEventId) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = useMemo(() => {
    return events.find((e) => String(e.id) === String(selectedEventId)) || events[0] || null;
  }, [events, selectedEventId]);

  useEffect(() => {
    if (selectedEvent?.id) {
      loadEventData(selectedEvent.id);
    }
  }, [selectedEvent?.id]);

  const loadEventData = async (eventId) => {
    setEntriesLoading(true);
    try {
      const [attRes, logsRes] = await Promise.allSettled([
        getEventAttendees(eventId),
        getEventCheckinLogs(eventId)
      ]);

      if (attRes.status === "fulfilled") {
        const list = Array.isArray(attRes.value) ? attRes.value : attRes.value?.data || [];
        setAttendees(list);
      }
      if (logsRes.status === "fulfilled") {
        const logs = Array.isArray(logsRes.value) ? logsRes.value : logsRes.value?.data || [];
        setRecentLogs(logs);
      }
    } catch (err) {
      console.error("Failed to load event attendee entries:", err);
    } finally {
      setEntriesLoading(false);
    }
  };

  const effectiveGateName = customGate.trim() || gateName;

  /**
   * Core Verification Handler
   */
  const handleVerify = async (codeOrId, action = scanMode, overrideDuplicate = false) => {
    if (!codeOrId || !codeOrId.trim()) return;
    const cleanCode = codeOrId.trim();

    setIsVerifying(true);
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }

    try {
      const res = await verifyCheckinTicket({
        ticket_code: cleanCode,
        action: action,
        gate_name: effectiveGateName,
        event_id: selectedEvent?.id,
        override_duplicate: overrideDuplicate
      });

      const data = res?.data || res || {};
      const status = data.status || "ACCESS_GRANTED";
      playScanSound(status === "CHECKED_OUT" ? "success" : "success", soundEnabled);

      setVerificationResult({
        success: true,
        status: status,
        message: data.message || "Access Granted",
        action: data.action || action,
        attendee: data.attendee,
        event: data.event,
        gateName: effectiveGateName,
        timestamp: new Date().toLocaleTimeString()
      });

      // Refresh attendee list and recent logs
      if (selectedEvent?.id) {
        loadEventData(selectedEvent.id);
        fetchEvents();
      }

      // Auto dismiss after 3.5s if continuous mode is enabled and scanner is open
      if (continuousScan && showCameraScanner) {
        autoDismissTimerRef.current = setTimeout(() => {
          setVerificationResult(null);
        }, 3500);
      }
    } catch (err) {
      const errResponse = err?.response?.data || {};
      const errData = errResponse.data || {};
      const status = errData.status || (errResponse.message?.includes("already") ? "ALREADY_CHECKED_IN" : "ERROR");
      const message = errResponse.message || err?.message || "Verification Failed";

      playScanSound(status === "ALREADY_CHECKED_IN" ? "warning" : "error", soundEnabled);

      setVerificationResult({
        success: false,
        status: status,
        message: message,
        action: action,
        attendee: errData.attendee || { ticket_code: cleanCode },
        event: errData.event,
        gateName: effectiveGateName,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsVerifying(false);
      setRapidCodeInput("");
    }
  };

  // Barcode Gun Form Submit
  const handleRapidGunSubmit = (e) => {
    e.preventDefault();
    if (!rapidCodeInput.trim()) return;
    handleVerify(rapidCodeInput, scanMode);
  };

  // CSV Attendance Roster Export
  const handleExportCSV = () => {
    if (!attendees.length) return;
    const headers = [
      "Ticket Pass Code",
      "Attendee Name",
      "Email",
      "Phone",
      "Food Preference",
      "Inside Venue",
      "Check-In Time",
      "Check-Out Time",
      "Total Check-Ins"
    ];

    const rows = attendees.map((a) => [
      `"${a.visitor_code || a.ticket_code || ""}"`,
      `"${a.name || ""}"`,
      `"${a.email || ""}"`,
      `"${a.phone || ""}"`,
      `"${a.food_preference || "None"}"`,
      a.is_checked_in ? "YES" : "NO",
      `"${a.checkin_time || ""}"`,
      `"${a.checkout_time || ""}"`,
      a.total_checkins || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Gate_Attendance_${selectedEvent?.event_code || "Event"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchSearch =
        !searchQuery ||
        (a.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.visitor_code || a.ticket_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.phone || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "INSIDE") return a.is_checked_in;
      if (statusFilter === "NOT_ARRIVED") return !a.is_checked_in && !a.is_checked_out;
      if (statusFilter === "DEPARTED") return a.is_checked_out;
      return true;
    });
  }, [attendees, searchQuery, statusFilter]);

  // Turnstile Live KPI Calculations
  const totalRegistered = attendees.length;
  const arrivedCount = attendees.filter((a) => a.is_checked_in || a.total_checkins > 0).length;
  const insideCount = attendees.filter((a) => a.is_checked_in).length;
  const departedCount = attendees.filter((a) => a.is_checked_out).length;

  return (
    <div className="space-y-6 pb-16 select-none font-sans">
      
      {/* ── TOP HEADER & EVENT SELECTOR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Gate Access Control & Live Turnstile Hub
            </h1>
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-[11px] border-none px-2.5 py-0.5 shadow-sm">
              LIVE GATE POINT
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time ticket pass verification, anti-fraud turnstile control, and venue capacity monitoring.
          </p>
        </div>

        {/* Event Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <Calendar size={15} className="text-cyan-600 shrink-0" />
            <span className="text-xs font-bold text-slate-500">Active Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-900 outline-none cursor-pointer max-w-[200px] truncate"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.event_code ? `[${e.event_code}] ` : ""}{e.event_name || "Event"}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => {
              if (selectedEvent?.id) {
                loadEventData(selectedEvent.id);
                fetchEvents();
              }
            }}
            variant="outline"
            className="h-10 px-3.5 border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer gap-2 rounded-xl"
          >
            <RefreshCw size={14} className={entriesLoading || loading ? "animate-spin" : ""} />
            <span className="text-xs font-bold">Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── TURNSTILE STATION CONTROL BAR ── */}
      <Card className="border-slate-200/90 shadow-sm bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Mode Switch & Gate Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Turnstile Station Mode:</span>
              <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setScanMode("CHECK_IN")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    scanMode === "CHECK_IN"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LogIn size={13} />
                  <span>Entry Gate (Check-In)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("CHECK_OUT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    scanMode === "CHECK_OUT"
                      ? "bg-slate-700 text-amber-300 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LogOutIcon size={13} />
                  <span>Exit Gate (Check-Out)</span>
                </button>
              </div>
            </div>

            {/* Gate Point Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">Gate Point:</span>
              <select
                value={gateName}
                onChange={(e) => setGateName(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg outline-none cursor-pointer"
              >
                {GATE_PRESETS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or custom gate..."
                value={customGate}
                onChange={(e) => setCustomGate(e.target.value)}
                className="bg-slate-800/80 border border-slate-700 text-white text-xs font-medium px-2.5 py-1 rounded-lg outline-none placeholder:text-slate-500 w-32 focus:w-44 transition-all"
              />
            </div>
          </div>

          {/* Rapid Barcode Gun Input & Scanner Launcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Barcode Gun / Manual Quick Input */}
            <form onSubmit={handleRapidGunSubmit} className="relative flex-1 sm:w-80">
              <input
                type="text"
                placeholder="Scan / Type Pass Code (Enter ↵)..."
                value={rapidCodeInput}
                onChange={(e) => setRapidCodeInput(e.target.value)}
                className="w-full pl-3 pr-20 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-500 placeholder:font-sans"
              />
              <button
                type="submit"
                disabled={isVerifying || !rapidCodeInput.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-lg border-none cursor-pointer disabled:opacity-50 transition"
              >
                Verify
              </button>
            </form>

            {/* Camera Scanner Button */}
            <Button
              onClick={() => setShowCameraScanner(true)}
              className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:opacity-95 text-white font-black text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 h-10"
            >
              <QrCode size={16} />
              <span>Launch Camera Scanner</span>
            </Button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Turnstile Audio" : "Enable Turnstile Audio"}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer self-center"
            >
              {soundEnabled ? <Volume2 size={16} className="text-cyan-400" /> : <VolumeX size={16} className="text-slate-500" />}
            </button>
          </div>
        </div>
      </Card>

      {/* ── LIVE TURNSTILE OCCUPANCY KPI STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Registered */}
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Passes Registered</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{totalRegistered.toLocaleString()}</h3>
              <p className="text-xs font-semibold text-slate-500">Database Tickets Issued</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Layers size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Total Scanned / Arrived */}
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">Total Scanned (Arrived)</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{arrivedCount.toLocaleString()}</h3>
              <p className="text-xs font-semibold text-cyan-700">
                {totalRegistered > 0 ? `${Math.round((arrivedCount / totalRegistered) * 100)}% Turnout Rate` : "Turnstile Ready"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-200">
              <QrCode size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Present Inside Venue (Live Net Occupancy) */}
        <Card className="border-emerald-200/80 shadow-sm bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20 rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Present Inside Venue</p>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">{insideCount.toLocaleString()}</h3>
              <p className="text-xs font-semibold text-emerald-700">Live Net Occupancy</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Departed / Checked Out */}
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Departed / Checked Out</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-700">{departedCount.toLocaleString()}</h3>
              <p className="text-xs font-semibold text-slate-500">Exit Gates Logged</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
              <LogOutIcon size={20} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── LIVE RECENT SCANS ACTIVITY FEED (STREAM STRIP) ── */}
      {recentLogs.length > 0 && (
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-cyan-600 animate-pulse" />
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Recent Gate Scans (Live Stream)</h4>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">Real-time gate activity</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {recentLogs.slice(0, 8).map((log, idx) => (
              <div
                key={log.id || idx}
                className={`shrink-0 p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition ${
                  log.action === "CHECK_OUT"
                    ? "bg-slate-50 border-slate-200 text-slate-700"
                    : "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${log.action === "CHECK_OUT" ? "bg-slate-200 text-slate-700" : "bg-emerald-200 text-emerald-800"}`}>
                  {log.action === "CHECK_OUT" ? <LogOutIcon size={12} /> : <CheckCircle2 size={12} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900">{log.attendee_name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{log.ticket_code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                    <span>{log.gate_name}</span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── HIGH-IMPACT VERIFICATION RESULT POPUP MODAL ── */}
      <Dialog
        open={Boolean(verificationResult)}
        onClose={() => setVerificationResult(null)}
        maxWidth="max-w-lg"
        className="p-0 overflow-hidden rounded-3xl"
      >
        {verificationResult && (
          <div className="select-none">
            {/* Modal Header Banner */}
            <div className={`p-6 text-white text-center space-y-1 relative ${
              verificationResult.status === "ACCESS_GRANTED"
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600"
                : verificationResult.status === "ALREADY_CHECKED_IN"
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
                : verificationResult.status === "CHECKED_OUT"
                ? "bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800"
                : "bg-gradient-to-r from-rose-600 via-red-600 to-rose-600"
            }`}>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2 shadow-inner">
                {verificationResult.status === "ACCESS_GRANTED" && <CheckCircle2 size={32} className="text-white" />}
                {verificationResult.status === "ALREADY_CHECKED_IN" && <AlertTriangle size={32} className="text-white animate-bounce" />}
                {verificationResult.status === "CHECKED_OUT" && <LogOutIcon size={32} className="text-white" />}
                {(verificationResult.status === "WRONG_EVENT" || verificationResult.status === "ERROR" || !verificationResult.success) && (
                  <ShieldAlert size={32} className="text-white" />
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                {verificationResult.status === "ACCESS_GRANTED" && "ACCESS GRANTED"}
                {verificationResult.status === "ALREADY_CHECKED_IN" && "ALREADY CHECKED IN (DUPLICATE)"}
                {verificationResult.status === "CHECKED_OUT" && "CHECK-OUT RECORDED"}
                {verificationResult.status === "WRONG_EVENT" && "WRONG EVENT PASS"}
                {verificationResult.status === "ERROR" && "ACCESS DENIED"}
              </h2>

              <p className="text-xs font-semibold text-white/90 max-w-sm mx-auto">
                {verificationResult.message}
              </p>
            </div>

            {/* Attendee Details Card */}
            <div className="p-6 bg-white space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Attendee Name</span>
                    <h3 className="text-base font-black text-slate-900">{verificationResult.attendee?.name || "Unknown Attendee"}</h3>
                  </div>
                  <span className="font-mono text-xs font-extrabold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-indigo-600">
                    {verificationResult.attendee?.ticket_code || "PASS"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Registered Contact</span>
                    <p className="text-slate-700 truncate">{verificationResult.attendee?.email || "N/A"}</p>
                    <p className="text-slate-500 text-[11px]">{verificationResult.attendee?.phone || ""}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Meal Entitlement</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Utensils size={13} className="text-emerald-600" />
                      <span className="font-extrabold text-emerald-700">
                        {verificationResult.attendee?.food_preference && verificationResult.attendee?.food_preference !== "None"
                          ? `${verificationResult.attendee.food_preference} Included`
                          : "No Meal Pass"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Gate: {verificationResult.gateName}</span>
                  <span>Scanned: {verificationResult.timestamp}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                {verificationResult.status === "ALREADY_CHECKED_IN" && (
                  <Button
                    onClick={() => {
                      const code = verificationResult.attendee?.ticket_code || verificationResult.attendee?.id;
                      handleVerify(code, "CHECK_IN", true);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl py-2.5 border-none cursor-pointer gap-2"
                  >
                    <RotateCcw size={14} />
                    <span>Allow Re-Entry (Override)</span>
                  </Button>
                )}

                {verificationResult.status === "ACCESS_GRANTED" && (
                  <Button
                    onClick={() => {
                      const code = verificationResult.attendee?.ticket_code || verificationResult.attendee?.id;
                      handleVerify(code, "CHECK_OUT");
                    }}
                    variant="outline"
                    className="w-full sm:w-auto border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl cursor-pointer"
                  >
                    Check Out Attendee
                  </Button>
                )}

                <Button
                  onClick={() => setVerificationResult(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl py-2.5 border-none cursor-pointer ml-auto"
                >
                  Done / Next Scan
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── CAMERA SCANNER MODAL ── */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <QRScanner
              title={`Gate Scanner: ${selectedEvent?.event_name || "Event"}`}
              scanMode={scanMode}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onScan={(code) => handleVerify(code, scanMode)}
              onClose={() => setShowCameraScanner(false)}
            />
          </div>
        </div>
      )}

      {/* ── ATTENDEE ROSTER & DESK CHECK-IN ── */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-3xl overflow-hidden space-y-4 p-5 sm:p-6">
        
        {/* Table Filter & Search Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              Attendee Roster & Gate Check-In Desk
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Search attendees by name, email, or ticket code to manually verify gate entry or pass-out exit.
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
            { key: "INSIDE", label: `Inside Venue (${insideCount})` },
            { key: "NOT_ARRIVED", label: `Not Arrived (${Math.max(0, totalRegistered - arrivedCount)})` },
            { key: "DEPARTED", label: `Departed (${departedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                statusFilter === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Attendees Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                filteredAttendees.map((v) => (
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
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold px-2 py-0.5">
                          {v.food_preference}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">None</span>
                      )}
                    </td>

                    {/* Status & Times */}
                    <td className="py-3.5 px-4">
                      {v.is_checked_in ? (
                        <div>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black px-2 py-0.5">
                            ● Inside Venue
                          </Badge>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            In: {v.checkin_time || "Earlier"}
                          </p>
                        </div>
                      ) : v.is_checked_out ? (
                        <div>
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold px-2 py-0.5">
                            Checked Out
                          </Badge>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Out: {v.checkout_time || "Earlier"}
                          </p>
                        </div>
                      ) : (
                        <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-bold px-2 py-0.5">
                          Not Arrived
                        </Badge>
                      )}
                    </td>

                    {/* Desk Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      {!v.is_checked_in ? (
                        <Button
                          size="sm"
                          onClick={() => handleVerify(v.visitor_code || v.ticket_code || v.id, "CHECK_IN")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl border-none cursor-pointer shadow-xs gap-1"
                        >
                          <LogIn size={13} />
                          <span>Check In</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleVerify(v.visitor_code || v.ticket_code || v.id, "CHECK_OUT")}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs px-3 py-1.5 rounded-xl border-none cursor-pointer shadow-xs gap-1"
                        >
                          <LogOutIcon size={13} />
                          <span>Check Out</span>
                        </Button>
                      )}
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