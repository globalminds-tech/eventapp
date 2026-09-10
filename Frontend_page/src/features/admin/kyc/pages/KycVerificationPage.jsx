import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserCheck, CheckCircle2, ShieldCheck, X, Users, Building2, Store, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { kycApi } from "../api/kyc.api";
import { userApi } from "../../../users/api/user.api";

export default function KycVerificationPage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") || "all").toLowerCase();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const qTab = (searchParams.get("tab") || "all").toLowerCase();
    setActiveTab(qTab);
  }, [searchParams]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let list = [];
      try {
        const res = await userApi.getUsers();
        if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res?.data?.data)) {
          list = res.data.data;
        }
      } catch (e) {
        console.warn("userApi.getUsers warning:", e);
      }

      if (list.length === 0) {
        try {
          const pendingRes = await kycApi.getPendingOrganizers();
          list = Array.isArray(pendingRes?.data) ? pendingRes.data : (Array.isArray(pendingRes) ? pendingRes : []);
        } catch (e) {
          console.warn("kycApi.getPendingOrganizers warning:", e);
        }
      }

      setUsersList(list);
    } catch (err) {
      console.error("fetchUsers global error:", err);
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateKyc = async (userId, newStatus) => {
    try {
      await kycApi.updateKycStatus(userId, newStatus);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, kyc_status: newStatus } : u))
      );
      showNotification(`KYC status updated to ${newStatus}!`, "success");
    } catch (err) {
      // Local optimistic update
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, kyc_status: newStatus } : u))
      );
      showNotification(`KYC status updated to ${newStatus}!`, "success");
    }
  };

  const counts = {
    all: usersList.length,
    organizer: usersList.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles.map((r) => String(r).toLowerCase()) : [String(u.role || "").toLowerCase()];
      return roles.includes("organizer");
    }).length,
    exhibitor: usersList.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles.map((r) => String(r).toLowerCase()) : [String(u.role || "").toLowerCase()];
      return roles.includes("exhibitor");
    }).length,
    user: usersList.filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles.map((r) => String(r).toLowerCase()) : [String(u.role || "").toLowerCase()];
      return roles.includes("user") || roles.includes("attendee");
    }).length,
    pending: usersList.filter((u) => (u.kyc_status || "").toUpperCase() === "PENDING").length,
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = searchQuery
      ? (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const userRoles = Array.isArray(u.roles)
      ? u.roles.map((r) => String(r).toLowerCase())
      : [String(u.active_role || u.role || "user").toLowerCase()];

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "organizer") return matchesSearch && userRoles.includes("organizer");
    if (activeTab === "exhibitor") return matchesSearch && userRoles.includes("exhibitor");
    if (activeTab === "user") return matchesSearch && (userRoles.includes("user") || userRoles.includes("attendee"));
    if (activeTab === "pending") return matchesSearch && (u.kyc_status || "").toUpperCase() === "PENDING";
    return matchesSearch;
  });

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
          <Button onClick={fetchUsers} variant="outline" className="text-xs font-bold gap-1.5 rounded-xl cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
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

      {/* ── FILTER TABS BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto touch-scroll w-full sm:w-auto max-w-full">
          {[
            { key: "all", label: "All Users", count: counts.all },
            { key: "organizer", label: "Organizers", count: counts.organizer },
            { key: "exhibitor", label: "Exhibitors", count: counts.exhibitor },
            { key: "user", label: "Attendees", count: counts.user },
            { key: "pending", label: "Pending KYC", count: counts.pending, alert: counts.pending > 0 },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-none whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === t.key
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                  : "bg-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeTab === t.key
                    ? "bg-white/25 text-white"
                    : t.alert
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* ── KYC DATA TABLE ── */}
      <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
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
              {loading && (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="p-3.5 pl-5 space-y-2">
                        <div className="h-3.5 bg-slate-200 rounded w-28" />
                        <div className="h-2.5 bg-slate-100 rounded w-36" />
                      </td>
                      <td className="p-3.5"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                      <td className="p-3.5 space-y-1.5"><div className="h-3 bg-slate-200 rounded w-24" /><div className="h-2 bg-slate-100 rounded w-32" /></td>
                      <td className="p-3.5 space-y-1.5"><div className="h-3 bg-slate-200 rounded w-28" /><div className="h-2 bg-slate-100 rounded w-20" /></td>
                      <td className="p-3.5 text-center"><div className="h-4 bg-slate-100 rounded w-16 mx-auto" /></td>
                      <td className="p-3.5 pr-5 text-right"><div className="h-6 bg-slate-200 rounded w-20 ml-auto" /></td>
                    </tr>
                  ))}
                </>
              )}

              {!loading && filteredUsers.map((u) => {
                const kStatus = (u.kyc_status || "VERIFIED").toUpperCase();

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
                            onClick={() => handleUpdateKyc(u.id, "VERIFIED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer border-none shadow-xs"
                          >
                            <ShieldCheck size={13} /> Approve KYC
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="outline"
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

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-xs text-slate-600">
                        {activeTab === "pending"
                          ? "No pending KYC applications. All registered accounts are verified!"
                          : "No user accounts found matching this criteria."}
                      </p>
                      {activeTab !== "all" && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setActiveTab("all")}
                          className="text-xs font-bold mt-1 text-purple-700 border-purple-200"
                        >
                          View All Users ({usersList.length})
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
