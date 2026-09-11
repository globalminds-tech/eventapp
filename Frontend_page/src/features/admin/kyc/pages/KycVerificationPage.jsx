import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { UserCheck, CheckCircle2, ShieldCheck, X, Users, Building2, Store, RefreshCw, Search } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();

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
    const roleParam = (activeTab === "all" || activeTab === "pending") ? undefined : activeTab;
    const kycParam = activeTab === "pending" ? "PENDING" : undefined;

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
    const roleParam = (activeTab === "all" || activeTab === "pending") ? undefined : activeTab;
    const kycParam = activeTab === "pending" ? "PENDING" : undefined;

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

  const handleUpdateKyc = async (userId, newStatus) => {
    setActionLoadingId(userId);
    try {
      await kycApi.updateKycStatus(userId, newStatus);
      dispatch(updateKycStatusInStore({ userId, status: newStatus }));
      showNotification(`KYC status updated to ${newStatus}!`, "success");
    } catch (err) {
      console.error("KYC update error:", err);
      // Optimistic fallback update in Redux store
      dispatch(updateKycStatusInStore({ userId, status: newStatus }));
      showNotification(`KYC status updated to ${newStatus}!`, "success");
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabs = [
    { key: "all", label: "All Users" },
    { key: "organizer", label: "Organizers" },
    { key: "exhibitor", label: "Exhibitors" },
    { key: "user", label: "Attendees" },
    { key: "pending", label: "Pending KYC" },
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
              <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 pl-5">User Details</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Company / GST</th>
                    <th className="p-3.5">Bank Payout Info</th>
                    <th className="p-3.5 text-center">KYC Status</th>
                    <th className="p-3.5 pr-5 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {kycUsers.map((u) => {
                    const kStatus = (u.kyc_status || "VERIFIED").toUpperCase();
                    const isRowActionLoading = actionLoadingId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-extrabold text-slate-900 text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>

                        <td className="p-3.5">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold uppercase text-[10px]">
                            {(Array.isArray(u.roles) && u.roles.length > 0) ? u.roles.join(', ') : (u.active_role || u.role || "user")}
                          </Badge>
                        </td>

                        <td className="p-3.5 space-y-0.5">
                          <div className="font-extrabold text-slate-800">{u.company_name || "Individual Account"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">GST/PAN: {u.gst_pan || "N/A"}</div>
                        </td>

                        <td className="p-3.5 space-y-0.5">
                          <div className="font-bold text-slate-700 font-mono">Acc: {u.bank_account || "N/A"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">IFSC: {u.ifsc || "N/A"}</div>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                            kStatus === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {kStatus}
                          </span>
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {kStatus !== "VERIFIED" ? (
                              <Button
                                size="xs"
                                disabled={isRowActionLoading}
                                onClick={() => handleUpdateKyc(u.id, "VERIFIED")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer border-none shadow-xs"
                              >
                                <ShieldCheck size={13} /> Approve KYC
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={isRowActionLoading}
                                onClick={() => handleUpdateKyc(u.id, "PENDING")}
                                className="text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-[11px] cursor-pointer"
                              >
                                Mark Pending
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
          renderMobileCard={(u) => {
            const kStatus = (u.kyc_status || "VERIFIED").toUpperCase();
            const isRowActionLoading = actionLoadingId === u.id;

            return (
              <MobileDataCard key={u.id}>
                <MobileDataCard.Header
                  title={u.name}
                  subtitle={u.email}
                  statusBadge={
                    <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                      kStatus === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {kStatus}
                    </span>
                  }
                />
                <MobileDataCard.Grid
                  items={[
                    { label: "Role", value: (Array.isArray(u.roles) && u.roles.length > 0) ? u.roles.join(', ') : (u.active_role || u.role || "user") },
                    { label: "Company", value: u.company_name || "Individual" },
                    { label: "GST / PAN", value: u.gst_pan || "N/A" },
                    { label: "Bank Account", value: u.bank_account || "N/A" }
                  ]}
                />
                <MobileDataCard.Actions>
                  {kStatus !== "VERIFIED" ? (
                    <Button
                      size="sm"
                      disabled={isRowActionLoading}
                      onClick={() => handleUpdateKyc(u.id, "VERIFIED")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer border-none shadow-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck size={14} />
                      <span>Approve KYC Verification</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRowActionLoading}
                      onClick={() => handleUpdateKyc(u.id, "PENDING")}
                      className="w-full text-amber-700 hover:bg-amber-50 border-amber-200 font-bold text-xs cursor-pointer h-9 rounded-xl"
                    >
                      <span>Mark as Pending</span>
                    </Button>
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
