import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";
import { TablePagination } from "@/components/ui/TablePagination";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { approvalApi } from "../api/approval.api";
import {
  fetchApprovalQueueThunk,
  updateApprovalStatusInStore
} from "@/app/store/adminSlice";

export default function EventApprovalQueuePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Connect to Redux store
  const { approvalQueue, approvalPagination, approvalLoading } = useSelector((state) => state.admin);

  const initialTab = (searchParams.get("tab") || "all").toUpperCase();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [toast, setToast] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Debounce search input by 350ms
  const debouncedSearch = useDebounce(searchQuery.trim(), 350);

  // Sync tab with URL query parameter
  useEffect(() => {
    const queryTab = (searchParams.get("tab") || "all").toUpperCase();
    setActiveTab(queryTab);
  }, [searchParams]);

  // Reset page to 1 whenever search query or tab changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  // Trigger server-side API search whenever debounced search, status, page, or limit changes
  useEffect(() => {
    dispatch(fetchApprovalQueueThunk({
      search: debouncedSearch,
      status: activeTab,
      page,
      limit,
      force: true
    }));
  }, [dispatch, debouncedSearch, activeTab, page, limit]);

  const handleRefresh = () => {
    dispatch(fetchApprovalQueueThunk({
      search: debouncedSearch,
      status: activeTab,
      page,
      limit,
      force: true
    }));
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    setActionLoadingId(eventId);
    try {
      await approvalApi.updateEventStatus(eventId, newStatus);
      // Immediately update Redux store so the queue reflects changes across views
      dispatch(updateApprovalStatusInStore({ eventId, status: newStatus }));
      showNotification(`Event successfully marked as ${newStatus}!`, "success");
    } catch (err) {
      console.error("Failed to update event status:", err);
      showNotification(err?.response?.data?.detail || "Failed to update event status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const checkMatchesTab = (eventStatus, tab) => {
    const st = (eventStatus || "").toUpperCase();
    if (tab === "ALL") return true;
    if (tab === "LIVE") return ["LIVE", "ACTIVE"].includes(st);
    if (tab === "UPCOMING") return ["UPCOMING", "APPROVED", "PUBLISHED"].includes(st);
    if (tab === "COMPLETED") return ["COMPLETED", "PAST"].includes(st);
    if (tab === "PENDING") return ["PENDING", "PENDING APPROVAL", "SUBMITTED", "DRAFT"].includes(st);
    if (tab === "APPROVED") return ["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"].includes(st);
    if (tab === "REJECTED") return ["REJECTED"].includes(st);
    if (tab === "SUSPENDED") return ["SUSPENDED"].includes(st);
    return true;
  };

  const eventsList = Array.isArray(approvalQueue) ? approvalQueue : [];

  // Compute count for each tab
  const tabCounts = useMemo(() => {
    const counts = {
      ALL: eventsList.length,
      LIVE: 0,
      UPCOMING: 0,
      COMPLETED: 0,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      SUSPENDED: 0,
    };
    eventsList.forEach((e) => {
      const st = (e.status || "PENDING").toUpperCase();
      if (["LIVE", "ACTIVE"].includes(st)) counts.LIVE++;
      if (["UPCOMING", "APPROVED", "PUBLISHED"].includes(st)) counts.UPCOMING++;
      if (["COMPLETED", "PAST"].includes(st)) counts.COMPLETED++;
      if (["PENDING", "PENDING APPROVAL", "SUBMITTED", "DRAFT"].includes(st)) counts.PENDING++;
      if (["APPROVED", "ACTIVE", "LIVE", "PUBLISHED"].includes(st)) counts.APPROVED++;
      if (["REJECTED"].includes(st)) counts.REJECTED++;
      if (["SUSPENDED"].includes(st)) counts.SUSPENDED++;
    });
    return counts;
  }, [eventsList]);

  // Server-side filtered events from API
  const filteredEvents = eventsList;

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams(key === "ALL" ? {} : { tab: key.toLowerCase() });
  };

  const tabList = [
    { key: "ALL", label: "All Events" },
    { key: "PENDING", label: "Pending Approval" },
    { key: "APPROVED", label: "Approved" },
    { key: "SUSPENDED", label: "Suspended" },
    { key: "REJECTED", label: "Rejected" },
    { key: "LIVE", label: "Live Events" },
    { key: "UPCOMING", label: "Upcoming" },
    { key: "COMPLETED", label: "Completed" },
  ];

  // Whether to show skeleton inside the table content
  const showContentSkeleton = approvalLoading && eventsList.length === 0;

  return (
    <div className="space-y-5 pb-12 select-none text-slate-800 font-sans">
      
      {/* ── HEADER TITLE & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Event Approvals & Audit Queue
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Super Admin Verification
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Review event proposals, perform 360° compliance inspection, and publish to live platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={approvalLoading}
            className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer hover:bg-slate-50 border-slate-200"
          >
            <RefreshCw size={14} className={approvalLoading ? "animate-spin text-purple-600" : "text-slate-600"} />
            <span>Refresh Queue</span>
          </Button>
        </div>
      </div>

      {toast && (
        <div className={`p-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg text-white ${
          toast.type === "error" ? "bg-red-600" : "bg-gradient-to-r from-purple-600 to-indigo-600"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ── FILTER TABS ROW ── */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {tabList.map((t) => {
            const count = tabCounts[t.key] || 0;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EVENTS DATA TABLE / MOBILE CARDS ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        {/* Table Toolbar Header with Integrated Search */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              {tabList.find((t) => t.key === activeTab)?.label || "Events"} Directory
            </h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-[11px]">
              {approvalPagination?.total ?? filteredEvents.length} {(approvalPagination?.total ?? filteredEvents.length) === 1 ? "Event" : "Events"}
            </Badge>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search name, code, category, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold border-none bg-transparent cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <ResponsiveTableView
          data={filteredEvents}
          keyField="id"
          loading={showContentSkeleton}
          columnCount={6}
          mobileContainerClassName="p-3 sm:p-4"
          containerClassName="p-0"
          columns={[
            { header: "Event Name", className: "p-3.5 pl-5" },
            { header: "Category", className: "p-3.5" },
            { header: "Venue / City", className: "p-3.5" },
            { header: "Dates", className: "p-3.5" },
            { header: "Status", className: "p-3.5 text-center" },
            { header: "Actions", className: "p-3.5 pr-5 text-right" },
          ]}
          emptyMessage={
            searchQuery
              ? `No matches found for "${searchQuery}" in ${activeTab.toLowerCase()} view.`
              : `No events currently in ${activeTab.toLowerCase()} status.`
          }
          emptyAction={
            searchQuery ? (
              <Button
                size="xs"
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold mt-1 text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                Clear Search Query
              </Button>
            ) : null
          }
          renderDesktopTable={() => (
            <div className="responsive-table-wrap">
              <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 pl-5">Event Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Venue / City</th>
                    <th className="p-3.5">Dates</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredEvents.map((ev) => {
                    const st = (ev.status || "PENDING").toUpperCase();
                    const isApproved = ["APPROVED", "LIVE", "ACTIVE", "PUBLISHED"].includes(st);
                    const isSuspended = st === "SUSPENDED";
                    const isRejected = st === "REJECTED";
                    const isPending = ["PENDING", "PENDING APPROVAL", "SUBMITTED", "DRAFT"].includes(st);
                    const isActionBusy = actionLoadingId === ev.id;

                    return (
                      <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-extrabold text-slate-900 text-sm hover:text-purple-700 transition-colors cursor-pointer" onClick={() => navigate(`/superuser/inspection/${ev.id}`)}>
                            {ev.event_name || ev.name || "Untitled Event"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Code: {ev.event_code || ev.code || `EVT-${ev.id}`}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px]">
                            {ev.category || "General"}
                          </Badge>
                        </td>

                        <td className="p-3.5 text-slate-600 font-semibold">
                          {ev.venue || ev.city || "Venue Setup"}
                        </td>

                        <td className="p-3.5 text-slate-500 text-[11px] font-semibold">
                          {ev.start_date || ev.date || "Date Pending"}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isSuspended
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : isRejected
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? "bg-emerald-500" : isSuspended ? "bg-amber-500 animate-pulse" : isRejected ? "bg-red-500" : "bg-amber-500"
                            }`} />
                            {st}
                          </span>
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => navigate(`/superuser/inspection/${ev.id}`)}
                              className="text-[11px] font-bold gap-1 cursor-pointer hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                            >
                              <Eye size={12} /> Inspect
                            </Button>

                            {isPending && (
                              <>
                                <Button
                                  size="xs"
                                  disabled={isActionBusy}
                                  onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer border-none"
                                >
                                  <Check size={12} /> Approve
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  disabled={isActionBusy}
                                  onClick={() => handleStatusUpdate(ev.id, "REJECTED")}
                                  className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-[11px] cursor-pointer"
                                >
                                  <X size={12} /> Reject
                                </Button>
                              </>
                            )}

                            {isApproved && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={isActionBusy}
                                onClick={() => handleStatusUpdate(ev.id, "SUSPENDED")}
                                className="border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-[11px] cursor-pointer gap-1"
                                title="Temporarily pause public ticket purchases and stall reservations"
                              >
                                <AlertCircle size={12} /> Suspend
                              </Button>
                            )}

                            {isSuspended && (
                              <Button
                                size="xs"
                                disabled={isActionBusy}
                                onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer border-none gap-1"
                                title="Reactivate event back to live approved status"
                              >
                                <RotateCcw size={12} /> Reactivate
                              </Button>
                            )}

                            {isRejected && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={isActionBusy}
                                onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold text-[11px] cursor-pointer gap-1"
                              >
                                <Check size={12} /> Re-Approve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        )}
        renderMobileCard={(ev) => {
          const st = (ev.status || "PENDING").toUpperCase();
          const isApproved = ["APPROVED", "LIVE", "ACTIVE", "PUBLISHED"].includes(st);
          const isSuspended = st === "SUSPENDED";
          const isRejected = st === "REJECTED";
          const isPending = ["PENDING", "PENDING APPROVAL", "SUBMITTED", "DRAFT"].includes(st);
          const isActionBusy = actionLoadingId === ev.id;

          return (
            <MobileDataCard key={ev.id} highlightBorder={isApproved}>
              <MobileDataCard.Header
                badge={
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px]">
                      {ev.category || "General"}
                    </Badge>
                    <span className="font-mono text-[10px] text-slate-400">
                      {ev.event_code || ev.code || `EVT-${ev.id}`}
                    </span>
                  </div>
                }
                title={ev.event_name || ev.name || "Untitled Event"}
                onTitleClick={() => navigate(`/superuser/inspection/${ev.id}`)}
                statusBadge={
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] inline-flex items-center gap-1 ${
                    isApproved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isSuspended
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : isRejected
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isApproved ? "bg-emerald-500" : isSuspended ? "bg-amber-500 animate-pulse" : isRejected ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    {st}
                  </span>
                }
              />

              <MobileDataCard.Grid
                columns={2}
                items={[
                  { label: "Venue / City", value: ev.venue || ev.city || "Venue Setup" },
                  { label: "Dates", value: ev.start_date || ev.date || "Date Pending" },
                ]}
              />

              <MobileDataCard.Actions>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate(`/superuser/inspection/${ev.id}`)}
                  className="text-[11px] font-extrabold gap-1 cursor-pointer hover:bg-purple-50 hover:text-purple-700"
                >
                  <Eye size={12} /> Inspect
                </Button>

                {isPending && (
                  <>
                    <Button
                      size="xs"
                      disabled={isActionBusy}
                      onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] cursor-pointer border-none"
                    >
                      <Check size={12} /> Approve
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isActionBusy}
                      onClick={() => handleStatusUpdate(ev.id, "REJECTED")}
                      className="text-red-600 border-red-200 hover:bg-red-50 font-extrabold text-[11px] cursor-pointer"
                    >
                      <X size={12} /> Reject
                    </Button>
                  </>
                )}

                {isApproved && (
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isActionBusy}
                    onClick={() => handleStatusUpdate(ev.id, "SUSPENDED")}
                    className="border-amber-300 text-amber-800 hover:bg-amber-50 font-extrabold text-[11px] cursor-pointer gap-1"
                  >
                    <AlertCircle size={12} /> Suspend
                  </Button>
                )}

                {isSuspended && (
                  <Button
                    size="xs"
                    disabled={isActionBusy}
                    onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] cursor-pointer border-none gap-1"
                  >
                    <RotateCcw size={12} /> Reactivate
                  </Button>
                )}

                {isRejected && (
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={isActionBusy}
                    onClick={() => handleStatusUpdate(ev.id, "APPROVED")}
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-extrabold text-[11px] cursor-pointer gap-1"
                  >
                    <Check size={12} /> Re-Approve
                  </Button>
                )}
              </MobileDataCard.Actions>
            </MobileDataCard>
          );
        }}
      />
        <TablePagination
          pagination={approvalPagination || { page, limit, total: filteredEvents.length, total_pages: 1, has_next: false, has_prev: false }}
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        />
      </Card>

    </div>
  );
}
