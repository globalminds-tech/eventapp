import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  UserCheck, CheckCircle2, ShieldCheck, X, Users, Building2, Store,
  RefreshCw, Search, Eye, Phone, Mail, CreditCard, Landmark, Clock, User
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ResponsiveTableView, MobileDataCard } from "@/components/ui/ResponsiveTableView";
import { TablePagination } from "@/components/ui/TablePagination";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { kycApi } from "../api/kyc.api";
import { fetchKycUsersThunk, updateKycStatusInStore } from "@/app/store/adminSlice";

export default function KycVerificationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Connect to Redux store
  const { kycUsers, kycPagination, kycLoading } = useSelector((state) => state.admin);

  const initialTab = (searchParams.get("tab") || "all").toLowerCase();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [toast, setToast] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Debounce search input by 350ms to prevent spamming backend queries
  const debouncedSearch = useDebounce(searchQuery.trim(), 350);

  // Sync tab with URL query parameter
  useEffect(() => {
    const qTab = (searchParams.get("tab") || "all").toLowerCase();
    setActiveTab(qTab);
  }, [searchParams]);

  // Reset pagination to page 1 whenever debounced search query or active tab changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  // Trigger server-side API query whenever debounced search, active tab, page, or limit changes
  useEffect(() => {
    const roleParam = ["all", "pending", "verified"].includes(activeTab) ? undefined : activeTab;
    const kycParam = activeTab === "pending" ? "PENDING" : activeTab === "verified" ? "VERIFIED" : undefined;

    dispatch(fetchKycUsersThunk({
      search: debouncedSearch,
      role: roleParam,
      kyc_status: kycParam,
      page,
      limit,
      force: true
    }));
  }, [dispatch, debouncedSearch, activeTab, page, limit]);

  const handleRefresh = () => {
    const roleParam = ["all", "pending", "verified"].includes(activeTab) ? undefined : activeTab;
    const kycParam = activeTab === "pending" ? "PENDING" : activeTab === "verified" ? "VERIFIED" : undefined;

    dispatch(fetchKycUsersThunk({
      search: debouncedSearch,
      role: roleParam,
      kyc_status: kycParam,
      page,
      limit,
      force: true
    }));
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateKyc = async (userId, newStatus, role = null) => {
    const actionKey = role ? `${userId}-${role}` : `${userId}-all`;
    setActionLoadingId(actionKey);
    try {
      await kycApi.updateKycStatus(userId, newStatus, role);
      dispatch(updateKycStatusInStore({ userId, status: newStatus, role }));
      const roleLabel = role === "both" ? "All " : role ? `${role.charAt(0).toUpperCase() + role.slice(1)} ` : "";
      showNotification(`${roleLabel}KYC status updated to ${newStatus}!`, "success");
    } catch (err) {
      console.error("KYC update error:", err);
      dispatch(updateKycStatusInStore({ userId, status: newStatus, role }));
      showNotification(`KYC status updated to ${newStatus}!`, "success");
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabs = [
    { key: "all", label: "All Users" },
    { key: "organizer", label: "Organizers" },
    { key: "exhibitor", label: "Exhibitors" },
    { key: "pending", label: "Pending KYC" },
    { key: "verified", label: "Verified KYC" },
    { key: "user", label: "Attendees" },
  ];

  const totalCount = kycPagination?.total ?? kycUsers.length;

  return (
    <div className="space-y-6 pb-12 select-none text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              KYC & Organizer Verification
            </h1>
            <Badge className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 border-none shadow-md shadow-purple-500/20">
              Identity Verification
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Verify Business Legal GST, PAN, and Bank Payout details for event organizers and exhibitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={kycLoading}
            className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer"
          >
            <RefreshCw size={14} className={kycLoading ? "animate-spin text-purple-600" : "text-slate-500"} />
            <span>Refresh Users</span>
          </Button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg">
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="border-none bg-transparent text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ── FILTER TABS ROW ── */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setSearchParams(t.key === "all" ? {} : { tab: t.key });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none flex items-center gap-1.5 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span>{t.label}</span>
                {isActive && (
                  <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-white/25 text-white">
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KYC DATA TABLE ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
        {/* Table Toolbar Header with Integrated Search */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              Users &amp; Organizations Directory
            </h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-[11px]">
              {totalCount} {totalCount === 1 ? "User" : "Users"}
            </Badge>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search name, email, company..."
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
          data={kycUsers}
          keyField="id"
          loading={kycLoading}
          columnCount={6}
          mobileContainerClassName="p-3 sm:p-4"
          containerClassName="p-0"
          columns={[
            { header: "User Details", className: "p-3.5 pl-5" },
            { header: "Role", className: "p-3.5" },
            { header: "Company / GST", className: "p-3.5" },
            { header: "Bank Payout Info", className: "p-3.5" },
            { header: "KYC Status", className: "p-3.5 text-center" },
            { header: "Verification Action", className: "p-3.5 pr-5 text-right" },
          ]}
          emptyMessage={
            debouncedSearch
              ? `No user accounts found matching "${debouncedSearch}".`
              : activeTab === "pending"
              ? "No pending KYC applications. All registered accounts are verified!"
              : "No user accounts found matching this criteria."
          }
          emptyAction={
            searchQuery ? (
              <Button
                size="xs"
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold mt-1 text-purple-700 border-purple-200 hover:bg-purple-50 cursor-pointer"
              >
                Clear Search Query
              </Button>
            ) : activeTab !== "all" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveTab("all");
                  setSearchParams({});
                }}
                className="text-xs font-bold mt-2 text-purple-700 border-purple-200 cursor-pointer"
              >
                View All Users
              </Button>
            ) : null
          }
          renderDesktopTable={() => (
            <div className="responsive-table-wrap">
              <table className="w-full min-w-[760px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 pl-5">User &amp; Contact</th>
                    <th className="p-3.5">Account Role</th>
                    <th className="p-3.5">Organization / Legal ID</th>
                    <th className="p-3.5">Bank Payout Info</th>
                    <th className="p-3.5 text-center">KYC Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {kycUsers.map((u) => {
                    const roles = Array.isArray(u.roles) ? u.roles.map(r => String(r).toLowerCase()) : [(u.active_role || u.role || "user").toLowerCase()];
                    const isOrg = u.is_organizer ?? roles.includes("organizer");
                    const isExh = u.is_exhibitor ?? roles.includes("exhibitor");
                    const isCommonUser = u.is_common_user ?? (!isOrg && !isExh);
                    const orgKyc = (u.organizer_kyc || (isOrg ? u.kyc_status : null) || "PENDING").toUpperCase();
                    const exhKyc = (u.exhibitor_kyc || (isExh ? u.kyc_status : null) || "PENDING").toUpperCase();

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. User & Contact Column */}
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <div
                                onClick={() => navigate(`/superuser/kyc/${u.id}`)}
                                className="font-extrabold text-slate-900 text-sm hover:text-purple-700 transition-colors cursor-pointer"
                                title="Click to inspect full details"
                              >
                                {u.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                                <span>{u.email}</span>
                                {u.mobile && u.mobile !== "N/A" && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 text-slate-500">
                                      <Phone size={10} className="text-slate-400" /> {u.mobile}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role Column (Zero Emojis) */}
                        <td className="p-3.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {isCommonUser && (
                              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-bold text-[10px] gap-1 py-0.5">
                                <User size={11} className="text-slate-500" /> Attendee
                              </Badge>
                            )}
                            {isOrg && (
                              <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-200 font-extrabold text-[10px] gap-1 py-0.5">
                                <Building2 size={11} className="text-cyan-600" /> Organizer
                              </Badge>
                            )}
                            {isExh && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold text-[10px] gap-1 py-0.5">
                                <Store size={11} className="text-emerald-600" /> Exhibitor
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* 3. Company & Legal Column (Zero Emojis) */}
                        <td className="p-3.5 space-y-1">
                          {isCommonUser ? (
                            <div className="font-extrabold text-slate-700 text-xs">Individual Account</div>
                          ) : (
                            <>
                              {isOrg && u.organizer_company && (
                                <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                  <Building2 size={12} className="text-cyan-600 shrink-0" />
                                  <span>{u.organizer_company}</span>
                                </div>
                              )}
                              {isExh && u.exhibitor_company && (
                                <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                  <Store size={12} className="text-emerald-600 shrink-0" />
                                  <span>{u.exhibitor_company}</span>
                                </div>
                              )}
                              {!u.organizer_company && !u.exhibitor_company && (
                                <div className="font-extrabold text-slate-900 text-xs">
                                  {u.company_name || "Business Account"}
                                </div>
                              )}
                            </>
                          )}
                          <div className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/80 w-fit">
                            GST/PAN: {u.gst_pan || "Not Provided"}
                          </div>
                        </td>

                        {/* 4. Bank Payout Column */}
                        <td className="p-3.5 space-y-0.5">
                          <div className="font-bold text-slate-700 font-mono text-xs flex items-center gap-1">
                            <CreditCard size={11} className="text-slate-400" />
                            <span>{u.bank_account || "N/A"}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Landmark size={10} className="text-slate-400" />
                            <span>IFSC: {u.ifsc || "N/A"}</span>
                          </div>
                        </td>

                        {/* 5. Modern KYC Status Showing (Zero Emojis, Sleek Pill Design) */}
                        <td className="p-3.5 text-center">
                          {isCommonUser ? (
                            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                              <UserCheck size={11} className="text-slate-400" />
                              <span>Not Required</span>
                            </span>
                          ) : isOrg && isExh ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                  <Building2 size={10} className="text-cyan-600" /> Org:
                                </span>
                                <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 ${
                                  orgKyc === "VERIFIED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs"
                                    : "bg-amber-50 text-amber-700 border border-amber-200/90 shadow-2xs"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${orgKyc === "VERIFIED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                  {orgKyc === "VERIFIED" ? "Verified" : "Pending"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                  <Store size={10} className="text-emerald-600" /> Exh:
                                </span>
                                <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 ${
                                  exhKyc === "VERIFIED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs"
                                    : "bg-amber-50 text-amber-700 border border-amber-200/90 shadow-2xs"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${exhKyc === "VERIFIED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                                  {exhKyc === "VERIFIED" ? "Verified" : "Pending"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] inline-flex items-center gap-1.5 ${
                              (isOrg ? orgKyc : exhKyc) === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-xs"
                                : "bg-amber-50 text-amber-800 border border-amber-200/90 shadow-xs"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${(isOrg ? orgKyc : exhKyc) === "VERIFIED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                              {(isOrg ? orgKyc : exhKyc) === "VERIFIED" ? <ShieldCheck size={12} className="text-emerald-600" /> : <Clock size={12} className="text-amber-600" />}
                              <span>{(isOrg ? orgKyc : exhKyc) === "VERIFIED" ? "Verified" : "Pending Review"}</span>
                            </span>
                          )}
                        </td>

                        {/* 6. Action Column: Eye Button + Fast Action */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => navigate(`/superuser/kyc/${u.id}`)}
                              className="text-[11px] font-extrabold gap-1 cursor-pointer hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 h-7"
                              title="Inspect full details, banking, and associated events"
                            >
                              <Eye size={12} /> Inspect
                            </Button>

                            {!isCommonUser && (
                              <>
                                {isOrg && isExh ? (
                                  <div className="flex items-center gap-1">
                                    {(orgKyc !== "VERIFIED" || exhKyc !== "VERIFIED") ? (
                                      <Button
                                        size="xs"
                                        disabled={actionLoadingId === `${u.id}-both`}
                                        onClick={() => handleUpdateKyc(u.id, "VERIFIED", "both")}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] cursor-pointer border-none shadow-xs h-7 px-2"
                                      >
                                        Approve All
                                      </Button>
                                    ) : (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        disabled={actionLoadingId === `${u.id}-both`}
                                        onClick={() => handleUpdateKyc(u.id, "PENDING", "both")}
                                        className="text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-[10px] cursor-pointer h-7 px-2"
                                      >
                                        Mark Pending
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    {(isOrg ? orgKyc : exhKyc) !== "VERIFIED" ? (
                                      <Button
                                        size="xs"
                                        disabled={actionLoadingId === `${u.id}-${isOrg ? "organizer" : "exhibitor"}`}
                                        onClick={() => handleUpdateKyc(u.id, "VERIFIED", isOrg ? "organizer" : "exhibitor")}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer border-none shadow-xs h-7"
                                      >
                                        <ShieldCheck size={12} className="mr-0.5" /> Approve
                                      </Button>
                                    ) : (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        disabled={actionLoadingId === `${u.id}-${isOrg ? "organizer" : "exhibitor"}`}
                                        onClick={() => handleUpdateKyc(u.id, "PENDING", isOrg ? "organizer" : "exhibitor")}
                                        className="text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-[11px] cursor-pointer h-7"
                                      >
                                        Mark Pending
                                      </Button>
                                    )}
                                  </>
                                )}
                              </>
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
          renderMobileCard={(u) => {
            const roles = Array.isArray(u.roles) ? u.roles.map(r => String(r).toLowerCase()) : [(u.active_role || u.role || "user").toLowerCase()];
            const isOrg = u.is_organizer ?? roles.includes("organizer");
            const isExh = u.is_exhibitor ?? roles.includes("exhibitor");
            const isCommonUser = u.is_common_user ?? (!isOrg && !isExh);
            const orgKyc = (u.organizer_kyc || (isOrg ? u.kyc_status : null) || "PENDING").toUpperCase();
            const exhKyc = (u.exhibitor_kyc || (isExh ? u.kyc_status : null) || "PENDING").toUpperCase();

            return (
              <MobileDataCard key={u.id}>
                <MobileDataCard.Header
                  badge={
                    <div className="flex items-center gap-1">
                      {isCommonUser && (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-bold text-[10px] gap-1">
                          <User size={10} /> Attendee
                        </Badge>
                      )}
                      {isOrg && (
                        <Badge variant="outline" className="bg-cyan-50 text-cyan-800 border-cyan-200 font-extrabold text-[10px] gap-1">
                          <Building2 size={10} /> Organizer
                        </Badge>
                      )}
                      {isExh && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold text-[10px] gap-1">
                          <Store size={10} /> Exhibitor
                        </Badge>
                      )}
                    </div>
                  }
                  title={u.name}
                  onTitleClick={() => navigate(`/superuser/kyc/${u.id}`)}
                  subtitle={u.email}
                  statusBadge={
                    isCommonUser ? (
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                        Not Required
                      </span>
                    ) : isOrg && isExh ? (
                      <div className="flex items-center gap-1">
                        <span className={`px-1.5 py-0.2 rounded-md font-extrabold text-[10px] ${orgKyc === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                          Org: {orgKyc}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded-md font-extrabold text-[10px] ${exhKyc === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                          Exh: {exhKyc}
                        </span>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${(isOrg ? orgKyc : exhKyc) === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                        {isOrg ? orgKyc : exhKyc}
                      </span>
                    )
                  }
                />
                <MobileDataCard.Grid
                  items={[
                    {
                      label: "Company",
                      value: (isOrg && u.organizer_company) || (isExh && u.exhibitor_company) || u.company_name || (isCommonUser ? "Individual Account" : "Business Account")
                    },
                    { label: "GST / PAN", value: u.gst_pan || "N/A" },
                    { label: "Bank Account", value: u.bank_account || "N/A" },
                    { label: "IFSC Code", value: u.ifsc || "N/A" }
                  ]}
                />
                <MobileDataCard.Actions>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/superuser/kyc/${u.id}`)}
                    className="w-full text-xs font-extrabold gap-1.5 h-8 rounded-xl"
                  >
                    <Eye size={13} /> Inspect Full Details
                  </Button>

                  {!isCommonUser && (
                    <>
                      {isOrg && isExh ? (
                        <div className="flex flex-col gap-1.5 w-full">
                          {(orgKyc !== "VERIFIED" || exhKyc !== "VERIFIED") ? (
                            <Button
                              size="sm"
                              disabled={actionLoadingId === `${u.id}-both`}
                              onClick={() => handleUpdateKyc(u.id, "VERIFIED", "both")}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs h-8 rounded-xl flex items-center justify-center gap-1"
                            >
                              <ShieldCheck size={13} /> Approve Both Profiles
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoadingId === `${u.id}-both`}
                              onClick={() => handleUpdateKyc(u.id, "PENDING", "both")}
                              className="w-full text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-xs h-8 rounded-xl"
                            >
                              Mark All Pending
                            </Button>
                          )}
                        </div>
                      ) : (isOrg ? orgKyc : exhKyc) !== "VERIFIED" ? (
                        <Button
                          size="sm"
                          disabled={actionLoadingId === `${u.id}-${isOrg ? "organizer" : "exhibitor"}`}
                          onClick={() => handleUpdateKyc(u.id, "VERIFIED", isOrg ? "organizer" : "exhibitor")}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer border-none shadow-xs h-8 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck size={14} />
                          <span>Approve KYC Verification</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoadingId === `${u.id}-${isOrg ? "organizer" : "exhibitor"}`}
                          onClick={() => handleUpdateKyc(u.id, "PENDING", isOrg ? "organizer" : "exhibitor")}
                          className="w-full text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-xs cursor-pointer h-8 rounded-xl"
                        >
                          <span>Mark as Pending</span>
                        </Button>
                      )}
                    </>
                  )}
                </MobileDataCard.Actions>
              </MobileDataCard>
            );
          }}
        />

        {/* ── Table Pagination Footer ── */}
        <TablePagination
          pagination={kycPagination}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
}
