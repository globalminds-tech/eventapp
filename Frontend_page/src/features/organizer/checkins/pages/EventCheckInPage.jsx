import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  getEventscheckin,
  getEventAttendees,
  verifyCheckinTicket,
  getEventCheckinLogs,
  getGatePresets,
  addGatePreset,
  deleteGatePreset
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
import { Select } from "@/components/ui/Select";
import QRScanner, { playScanSound } from "@/components/QRScanner";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";

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
  const [gatePresets, setGatePresets] = useState([]);
  const [gateName, setGateName] = useState("");
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
    fetchEvents();
    fetchGatePresets();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getEventscheckin();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setEvents(list);
      setEvents(list);
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
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

  if (!selectedEventId) {
    return (
      <div className="space-y-6 pb-12 select-none font-sans text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Gate Access Control & Live Turnstile Hub
              </h1>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-[11px] border-none px-2.5 py-0.5 shadow-sm">
                EVENTS
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Select an event to manage gate scanners and check-ins.
            </p>
          </div>
          <Button
            onClick={fetchEvents}
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
          <ResponsiveTableView
            data={events}
            keyField="id"
            loading={loading}
            columnCount={3}
            columns={[
              { header: "Event Name", className: "py-3.5 px-4" },
              { header: "Start & End Date", className: "py-3.5 px-4" },
              { header: "Action", className: "py-3.5 px-4 text-right" },
            ]}
            emptyMessage="You haven't created any events yet."
            renderDesktopTable={() => (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Event Name</th>
                      <th className="py-3.5 px-4">Start &amp; End Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {events.map((ev) => {
                      const startDate = ev.start_date || ev.event_date;
                      const endDate = ev.end_date || ev.start_date || ev.event_date;
                      const formattedStart = startDate ? new Date(startDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : "-";
                      const formattedEnd = endDate ? new Date(endDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : "-";

                      return (
                        <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">{ev.event_code ? `[${ev.event_code}] ` : ""}{ev.event_name || ev.name || "Event"}</td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{formattedStart} - {formattedEnd}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedEventId(ev.id)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition cursor-pointer border border-cyan-200 text-xs font-bold inline-flex items-center gap-1.5"
                            >
                              <ArrowRight size={14} />
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            renderMobileCard={(ev) => {
              const startDate = ev.start_date || ev.event_date;
              const endDate = ev.end_date || ev.start_date || ev.event_date;
              const formattedStart = startDate ? new Date(startDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : "-";
              const formattedEnd = endDate ? new Date(endDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : "-";

              return (
                <MobileDataCard key={ev.id} onClick={() => setSelectedEventId(ev.id)}>
                  <MobileDataCard.Header
                    title={`${ev.event_code ? `[${ev.event_code}] ` : ""}${ev.event_name || ev.name || "Event"}`}
                    subtitle={`${formattedStart} - ${formattedEnd}`}
                    statusBadge={
                      <button
                        onClick={() => setSelectedEventId(ev.id)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-extrabold inline-flex items-center gap-1 border border-cyan-200 cursor-pointer"
                      >
                        <span>Manage</span>
                        <ArrowRight size={13} />
                      </button>
                    }
                  />
                </MobileDataCard>
              );
            }}
          />
        </Card>
      </div>
    );

  }

  const verificationCardJSX = verificationResult ? (
    <div className="select-none flex flex-col h-full bg-white">
      {/* Modal Header Banner */}
      <div className={`p-6 text-white text-center space-y-1 relative shrink-0 ${verificationResult.status === "ACCESS_GRANTED"
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
      <div className="p-6 bg-white space-y-4 flex-1 flex flex-col">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 flex-1">
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

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200/60 mt-auto">
            <span>Gate: {verificationResult.gateName}</span>
            <span>Scanned: {verificationResult.timestamp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 shrink-0">
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
  ) : null;

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
                  onClick={() => setScanMode("CHECK_IN")}
                  className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${scanMode === "CHECK_IN"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                    }`}
                >
                  <LogIn size={15} />
                  <span>Entry Check-In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("CHECK_OUT")}
                  className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${scanMode === "CHECK_OUT"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-400/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                    }`}
                >
                  <LogOutIcon size={15} />
                  <span>Exit Check-Out</span>
                </button>
              </div>
            </div>

            {/* Gate Point Selector */}
            <div className="space-y-2 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gate / Checkpoint Assignment</span>
              <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2 h-10.5">
                <div className="relative flex-1 min-w-[150px]">
                  <DoorOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Select
                    value={gateName}
                    onValueChange={(val) => {
                      setGateName(val);
                      setCustomGate("");
                    }}
                    placeholder={gatePresets.length === 0 ? "No Presets Saved" : "Select Gate..."}
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
                onClick={() => setShowCameraScanner(true)}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs px-4 rounded-xl border-none cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 whitespace-nowrap transition-all"
              >
                <QrCode size={16} />
                <span className="hidden sm:inline">Camera</span>
              </Button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute Turnstile Audio" : "Enable Turnstile Audio"}
                className="h-full px-3.5 bg-slate-950/50 hover:bg-slate-800 text-slate-300 rounded-xl transition border border-slate-800 cursor-pointer flex items-center justify-center"
              >
                {soundEnabled ? <Volume2 size={16} className="text-cyan-400" /> : <VolumeX size={16} className="text-slate-500" />}
              </button>
            </div>
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
                className={`shrink-0 p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition ${log.action === "CHECK_OUT"
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

      {/* ── HIGH-IMPACT VERIFICATION RESULT POPUP MODAL (For manual / barcode gun entries) ── */}
      <Dialog
        open={Boolean(verificationResult) && !showCameraScanner}
        onClose={() => setVerificationResult(null)}
        maxWidth="max-w-lg"
        className="p-0 overflow-hidden rounded-3xl"
      >
        {verificationResult && !showCameraScanner && verificationCardJSX}
      </Dialog>

      {/* ── CAMERA SCANNER MODAL ── */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full transition-all duration-300 ease-in-out ${verificationResult ? 'max-w-5xl flex flex-col md:flex-row items-stretch gap-4' : 'max-w-lg'}`}>

            <div className={`w-full transition-all duration-300 ease-in-out flex flex-col justify-center ${verificationResult ? 'md:w-1/2' : ''}`}>
              <QRScanner
                title={`Gate Scanner: ${selectedEvent?.event_name || "Event"}`}
                scanMode={scanMode}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onScan={(code) => handleVerify(code, scanMode)}
                onClose={() => {
                  setShowCameraScanner(false);
                  setVerificationResult(null);
                }}
              />
            </div>

            {/* Verification Result Section (Shows up side-by-side on desktop, stacked on mobile) */}
            {verificationResult && (
              <div className="w-full md:w-1/2 bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 border border-slate-200 shrink-0">
                {verificationCardJSX}
              </div>
            )}
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
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${statusFilter === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Attendees Data Table / Mobile Cards */}
        <ResponsiveTableView
          data={filteredAttendees}
          keyField="id"
          loading={entriesLoading}
          columnCount={5}
          columns={[
            { header: "Pass Code", className: "py-3.5 px-4" },
            { header: "Attendee Name & Contact", className: "py-3.5 px-4" },
            { header: "Meal Option", className: "py-3.5 px-4" },
            { header: "Status & Times", className: "py-3.5 px-4" },
            { header: "Desk Action", className: "py-3.5 px-4 text-right" },
          ]}
          emptyMessage="No attendee passes found matching your filter criteria."
          renderDesktopTable={() => (
            <div className="overflow-x-auto responsive-table-wrap">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Pass Code</th>
                    <th className="py-3.5 px-4">Attendee Name &amp; Contact</th>
                    <th className="py-3.5 px-4">Meal Option</th>
                    <th className="py-3.5 px-4">Status &amp; Times</th>
                    <th className="py-3.5 px-4 text-right">Desk Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {filteredAttendees.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-600">
                        {v.visitor_code || v.ticket_code}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{v.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                          {v.email || v.phone || "No contact info"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {v.food_preference && v.food_preference !== "None" ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-extrabold px-2 py-0.5">
                            {v.food_preference}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">None</span>
                        )}
                      </td>

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
                  ))}
                </tbody>
              </table>
            </div>
          )}
          renderMobileCard={(v) => (
            <MobileDataCard key={v.id} highlightBorder={v.is_checked_in}>
              <MobileDataCard.Header
                badge={
                  <span className="font-mono text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {v.visitor_code || v.ticket_code}
                  </span>
                }
                title={v.name}
                subtitle={v.email || v.phone || "No contact info"}
                statusBadge={
                  v.is_checked_in ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-black px-2 py-0.5">
                      ● Inside
                    </Badge>
                  ) : v.is_checked_out ? (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] font-bold px-2 py-0.5">
                      Checked Out
                    </Badge>
                  ) : (
                    <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[9px] font-bold px-2 py-0.5">
                      Not Arrived
                    </Badge>
                  )
                }
              />

              <MobileDataCard.Grid
                columns={2}
                items={[
                  { label: "Meal Option", value: v.food_preference && v.food_preference !== "None" ? v.food_preference : "None" },
                  { label: "Entry Time", value: v.checkin_time || v.checkout_time || "Pending" },
                ]}
              />

              <MobileDataCard.Actions>
                {!v.is_checked_in ? (
                  <Button
                    size="sm"
                    onClick={() => handleVerify(v.visitor_code || v.ticket_code || v.id, "CHECK_IN")}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2 rounded-xl border-none cursor-pointer shadow-xs gap-1.5 flex items-center justify-center"
                  >
                    <LogIn size={14} />
                    <span>Confirm Gate Check-In</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleVerify(v.visitor_code || v.ticket_code || v.id, "CHECK_OUT")}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xs py-2 rounded-xl border-none cursor-pointer shadow-xs gap-1.5 flex items-center justify-center"
                  >
                    <LogOutIcon size={14} />
                    <span>Record Gate Check-Out</span>
                  </Button>
                )}
              </MobileDataCard.Actions>
            </MobileDataCard>
          )}
        />
      </Card>

    </div>
  );
}