import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { getFoodCheckinSummary, redeemFoodTokenApi, getEventAttendees, getFoodCounterPresets, addFoodCounterPreset, deleteFoodCounterPreset } from "@/Services/miscService";
import { Download, Check, Trash2 } from "lucide-react";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";

export default function FoodCheckIn() {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(location.state?.eventId || "");
  const [scanResultAlert, setScanResultAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.resetSelection || !location.state?.eventId) {
      setSelectedEventId("");
    } else if (location.state?.eventId) {
      setSelectedEventId(location.state.eventId);
    }
  }, [location.pathname, location.key, location.state]);

  const [attendees, setAttendees] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, REDEEMED, PENDING
  const [isTableFiltering, setIsTableFiltering] = useState(false);
  const [attendeeCounts, setAttendeeCounts] = useState({
    total: 0,
    redeemed: 0,
    pending: 0
  });

  const attendeeRequestIdRef = useRef(0);
  const hasInitialAttendeesLoadedRef = useRef(false);
  const searchTimerRef = useRef(null);

  // 300ms Debounce for Attendee Search Query
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const [foodEvents, setFoodEvents] = useState([]);
  const [stats, setStats] = useState({
    totalFoodTokens: 0,
    mealsServed: 0,
    pendingRedemptions: 0
  });

  // Food Counter / Meal Station Controls (Completely Separate from Gate Presets)
  const [counterPresets, setCounterPresets] = useState([]);
  const [counterName, setCounterName] = useState("");
  const [customCounter, setCustomCounter] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rapidCodeInput, setRapidCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchCounterPresets = async () => {
    try {
      const res = await getFoodCounterPresets();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setCounterPresets(list);
      if (list.length > 0 && !counterName) {
        setCounterName(list[0].name);
      }
    } catch (err) {
      console.error("Failed to load food counter presets", err);
    }
  };

  useEffect(() => {
    fetchFoodData();
    fetchCounterPresets();
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

  const handleSaveCounter = async () => {
    if (!customCounter.trim()) return;
    try {
      await addFoodCounterPreset(customCounter.trim());
      await fetchCounterPresets();
      setCounterName(customCounter.trim());
      setCustomCounter("");
    } catch (err) {
      console.error("Failed to save food counter preset", err);
    }
  };

  const handleDeleteCounter = async () => {
    const targetName = customCounter.trim() || counterName;
    if (!targetName) return;
    const counterObj = counterPresets.find(c => c.name === targetName);
    if (!counterObj) return;
    
    try {
      await deleteFoodCounterPreset(counterObj.id);
      await fetchCounterPresets();
      if (customCounter) setCustomCounter("");
      setCounterName(counterPresets.length > 1 ? counterPresets.find(c => c.id !== counterObj.id)?.name : "");
    } catch (err) {
      console.error("Failed to delete food counter preset", err);
    }
  };

  const fetchAttendees = async (eventId, search = debouncedSearch, status = statusFilter) => {
    if (!eventId) return;
    const currentReqId = ++attendeeRequestIdRef.current;

    if (hasInitialAttendeesLoadedRef.current) {
      setIsTableFiltering(true);
    } else {
      setEntriesLoading(true);
    }

    try {
      const res = await getEventAttendees(eventId, {
        search: search || undefined,
        status: status !== "ALL" ? status : undefined,
      });

      if (currentReqId !== attendeeRequestIdRef.current) return;

      const list = Array.isArray(res) ? res : res?.data || [];
      setAttendees(list);

      if (res?.counts) {
        setAttendeeCounts(res.counts);
      } else {
        const redeemed = list.filter((a) => a.is_checked_in || a.total_checkins > 0).length;
        setAttendeeCounts({
          total: list.length,
          redeemed: redeemed,
          pending: Math.max(0, list.length - redeemed)
        });
      }
      hasInitialAttendeesLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load food attendees:", err);
      if (currentReqId === attendeeRequestIdRef.current) {
        setAttendees([]);
      }
    } finally {
      if (currentReqId === attendeeRequestIdRef.current) {
        setEntriesLoading(false);
        setIsTableFiltering(false);
      }
    }
  };

  useEffect(() => {
    hasInitialAttendeesLoadedRef.current = false;
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendees(selectedEventId, debouncedSearch, statusFilter);
    }
  }, [selectedEventId, debouncedSearch, statusFilter]);

  const selectedEvent = useMemo(() => {
    return foodEvents.find((e) => String(e.id || e.code) === String(selectedEventId)) || null;
  }, [foodEvents, selectedEventId]);

  const effectiveCounterName = customCounter.trim() || counterName;

  const handleVerify = async (code) => {
    if (!code || !code.trim()) return;
    const cleanCode = code.trim().toUpperCase();

    setIsVerifying(true);

    try {
      const res = await redeemFoodTokenApi({
        token: cleanCode,
        event_id: selectedEventId,
        counter_name: effectiveCounterName
      });
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
        stall: effectiveCounterName
      });
      fetchFoodData();
      if (selectedEventId) {
        fetchAttendees(selectedEventId, debouncedSearch, statusFilter);
      }
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
        stall: effectiveCounterName
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

  const totalRegistered = attendeeCounts.total ?? attendees.length;
  const redeemedCount = attendeeCounts.redeemed ?? attendees.filter((a) => a.is_checked_in || a.total_checkins > 0).length;
  const pendingCount = attendeeCounts.pending ?? Math.max(0, totalRegistered - redeemedCount);

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
                    : "Standard Meal"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200/60 mt-auto">
            <span>Counter: {scanResultAlert.stall || effectiveCounterName}</span>
            <span>Redeemed: {scanResultAlert.timestamp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={() => setScanResultAlert(null)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs h-11 rounded-xl cursor-pointer"
          >
            Done / Next Attendee
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
              <Badge className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black text-[11px] border-none px-2.5 py-0.5 shadow-sm">
                EVENTS
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Select an active event to start scanning meal passes and track catering turnout.
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

        {/* Executive Overall Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Catering Passes</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalFoodTokens.toLocaleString()}</h3>
                <p className="text-xs font-medium text-slate-500">All Events Combined</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                <Utensils size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Meals Served</p>
                <h3 className="text-2xl font-extrabold text-cyan-600">{stats.mealsServed.toLocaleString()}</h3>
                <p className="text-xs font-medium text-cyan-600">Redeemed Tokens</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                <CheckCircle2 size={22} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pending</p>
                <h3 className="text-2xl font-extrabold text-slate-700">{stats.pendingRedemptions.toLocaleString()}</h3>
                <p className="text-xs font-medium text-slate-400">Meals Remaining</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <QrCode size={22} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Table Container */}
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Select Event for Food Scan</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search event name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <ResponsiveTableView
            data={filtered}
            keyField="id"
            loading={loading}
            columnCount={5}
            columns={[
              { header: "Event Code & Name", className: "py-4 px-5 font-bold" },
              { header: "Start Date", className: "py-4 px-4 font-bold" },
              { header: "End Date", className: "py-4 px-4 font-bold" },
              { header: "Meals Progress", className: "py-4 px-4 font-bold text-center" },
              { header: "Action", className: "py-4 px-5 font-bold text-right" },
            ]}
            emptyMessage="No events found for food token scanning."
            renderDesktopTable={() => (
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs uppercase tracking-wider font-extrabold">
                      <th className="py-4 px-5 font-bold">Event Code &amp; Name</th>
                      <th className="py-4 px-4 font-bold">Start Date</th>
                      <th className="py-4 px-4 font-bold">End Date</th>
                      <th className="py-4 px-4 font-bold text-center">Meals Progress</th>
                      <th className="py-4 px-5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs">
                    {filtered.map((item) => (
                      <tr key={item.id || item.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-extrabold text-slate-900">{item.name}</div>
                          <span className="font-mono text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100 mt-0.5 inline-block">
                            {item.code || "EVENT"}
                          </span>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            renderMobileCard={(item) => (
              <MobileDataCard key={item.id || item.code}>
                <MobileDataCard.Header
                  badge={
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-200 text-[10px] font-bold">
                      {item.code || "EVENT"}
                    </Badge>
                  }
                  title={item.name}
                  statusBadge={
                    <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                      {item.scannedTokens || 0}/{item.totalFoodTokens || 0} Redeemed
                    </span>
                  }
                />
                <MobileDataCard.Grid
                  columns={2}
                  items={[
                    { label: "Start Date", value: item.startDate || "---" },
                    { label: "End Date", value: item.endDate || "---" },
                  ]}
                />
                <MobileDataCard.Actions>
                  <Button
                    size="sm"
                    onClick={() => setSelectedEventId(item.id || item.code)}
                    className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black text-xs py-2 rounded-xl border-none cursor-pointer shadow-xs gap-1.5 flex items-center justify-center"
                  >
                    <Settings size={14} />
                    <span>Open Food Station</span>
                  </Button>
                </MobileDataCard.Actions>
              </MobileDataCard>
            )}
          />
        </Card>
      </div>
    );
  }

  // Calculate event-specific stats
  const eventStats = {
    totalFoodTokens: selectedEvent?.totalFoodTokens || totalRegistered,
    mealsServed: selectedEvent?.scannedTokens || redeemedCount,
    pendingRedemptions: Math.max(0, (selectedEvent?.totalFoodTokens || totalRegistered) - (selectedEvent?.scannedTokens || redeemedCount))
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
              LIVE FOOD COUNTER
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

      {/* ── FOOD COUNTER CONTROL BAR ── */}
      <Card className="border-slate-800 shadow-xl bg-slate-900 text-white rounded-3xl p-5 sm:p-6 relative overflow-visible z-40">
        {/* Background glow effect wrapper */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-5">

          {/* Left Side: Settings */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 flex-1">

            {/* Mode Switch */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Operation Mode</span>
              <div className="h-11 bg-slate-950/60 p-1 rounded-xl flex items-center gap-1 border border-slate-800 backdrop-blur-md">
                <button
                  type="button"
                  className="h-full px-4 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/20"
                >
                  <Utensils size={15} />
                  <span>Redeem Token</span>
                </button>
              </div>
            </div>

            {/* Food Counter Selector (Separate from Gates) */}
            <div className="space-y-1.5 flex-1 min-w-[280px] relative z-50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Food Counter / Meal Station Assignment</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-auto sm:h-11">
                {/* Counter Select Dropdown */}
                <div className="relative h-11">
                  <DoorOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <Select
                    value={counterName}
                    onValueChange={(val) => {
                      setCounterName(val);
                      setCustomCounter("");
                    }}
                    placeholder={counterPresets.length === 0 ? "No Presets Saved" : "Select Counter..."}
                    options={counterPresets.map((p) => ({ value: p.name, label: p.name }))}
                    position="bottom"
                    className="w-full h-11"
                    triggerClassName="w-full h-11 bg-slate-950/60 border border-slate-800 text-white text-xs font-bold pl-9 pr-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors shadow-2xs"
                    contentClassName="bg-slate-900 border border-slate-700 text-white shadow-2xl z-[100] max-h-44 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-transparent"
                  />
                </div>

                {/* Custom Counter Name Input */}
                <div className="relative h-11 flex items-center bg-slate-950/60 border border-slate-800 rounded-xl focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all shadow-2xs">
                  <Sparkles size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Custom counter name..."
                    value={customCounter}
                    onChange={(e) => setCustomCounter(e.target.value)}
                    className="w-full h-full bg-transparent border-none text-white text-xs font-semibold pl-9 pr-16 outline-none placeholder:text-slate-600"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button 
                      type="button" 
                      onClick={handleSaveCounter}
                      disabled={!customCounter.trim()}
                      className="w-7 h-7 flex items-center justify-center bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Save Counter Preset"
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      type="button" 
                      onClick={handleDeleteCounter}
                      disabled={!(customCounter.trim() ? counterPresets.some(c => c.name === customCounter.trim()) : counterPresets.some(c => c.name === counterName))}
                      className="w-7 h-7 flex items-center justify-center bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Delete Counter Preset"
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
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">Quick Verification</span>
              <form onSubmit={handleRapidGunSubmit} className="relative h-11">
                <input
                  type="text"
                  placeholder="Scan pass code..."
                  value={rapidCodeInput}
                  onChange={(e) => setRapidCodeInput(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-20 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600 placeholder:font-sans transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={isVerifying || !rapidCodeInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-white text-slate-900 hover:bg-slate-200 font-black text-xs rounded-lg border-none cursor-pointer disabled:opacity-40 transition-colors flex items-center justify-center shadow-xs"
                >
                  Verify
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 h-11 shrink-0">
              {/* Camera Scanner Button */}
              <Button
                type="button"
                onClick={() => setShowScanner(true)}
                className="h-11 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs px-4 rounded-xl border-none cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-95"
              >
                <QrCode size={16} />
                <span className="hidden sm:inline">Camera</span>
              </Button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute Turnstile Audio" : "Enable Turnstile Audio"}
                className="h-11 w-11 shrink-0 bg-slate-950/60 hover:bg-slate-800 text-slate-300 rounded-xl transition border border-slate-800 cursor-pointer flex items-center justify-center shadow-2xs"
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
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear Search"
                >
                  <X size={14} />
                </button>
              )}
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
            { key: "PENDING", label: `Not Redeemed (${pendingCount})` }
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

        {/* Attendees Data Table / Mobile Cards with Zero-Flicker Transition */}
        <div className="relative min-h-[320px]">
          {/* Subtle Top Loading Line on Filter Switching / Searching (Zero Flicker) */}
          {isTableFiltering && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 animate-pulse rounded-t-xl z-20" />
          )}

          <div className={`transition-opacity duration-200 ${isTableFiltering ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
            <ResponsiveTableView
              data={attendees}
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
              emptyMessage={searchQuery.trim() ? "No attendees found matching your search." : "No attendee passes found matching this filter."}
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
                      {attendees.map((v) => {
                        const isRedeemed = v.is_checked_in || v.total_checkins > 0;
                        return (
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
                                <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px] font-extrabold px-2 py-0.5">
                                  {v.food_preference}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-xs font-medium">None</span>
                              )}
                            </td>

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
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              renderMobileCard={(v) => {
                const isRedeemed = v.is_checked_in || v.total_checkins > 0;
                return (
                  <MobileDataCard key={v.id} highlightBorder={isRedeemed}>
                    <MobileDataCard.Header
                      badge={
                        <span className="font-mono text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {v.visitor_code || v.ticket_code}
                        </span>
                      }
                      title={v.name}
                      subtitle={v.email || v.phone || "No contact info"}
                      statusBadge={
                        isRedeemed ? (
                          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[9px] font-black px-2 py-0.5">
                            ● Redeemed
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-bold px-2 py-0.5">
                            Pending
                          </Badge>
                        )
                      }
                    />
                    <MobileDataCard.Grid
                      columns={2}
                      items={[
                        { label: "Meal Option", value: v.food_preference && v.food_preference !== "None" ? v.food_preference : "None" },
                        { label: "Redeem Time", value: v.checkin_time || "Pending" },
                      ]}
                    />
                    <MobileDataCard.Actions>
                      {!isRedeemed ? (
                        <Button
                          size="sm"
                          onClick={() => handleVerify(v.visitor_code || v.ticket_code || v.id)}
                          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs py-2 rounded-xl border-none cursor-pointer shadow-xs gap-1.5 flex items-center justify-center"
                        >
                          <Utensils size={14} />
                          <span>Redeem Meal Token</span>
                        </Button>
                      ) : (
                        <div className="w-full text-center py-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                          Meal Already Served
                        </div>
                      )}
                    </MobileDataCard.Actions>
                  </MobileDataCard>
                );
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}